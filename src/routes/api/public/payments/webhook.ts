import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import { type StripeEnv, verifyWebhook } from "@/lib/stripe.server";

let _supabase: any = null;
function getSupabase(): any {
  if (!_supabase) {
    _supabase = createClient(
      process.env["SUPABASE_URL"]!,
      process.env["SUPABASE_SERVICE_ROLE_KEY"]!,
    );
  }
  return _supabase;
}

async function submitToProdigi(order: Record<string, any>, session: any) {
  const apiKey = process.env["PRODIGI_API_KEY"];
  if (!apiKey || !order["prodigi_sku"]) return null;
  const shipping = session.collected_information?.shipping_details ?? session.shipping_details;
  const address = shipping?.address ?? session.customer_details?.address;
  if (!address) return null;

  const response = await fetch("https://api.prodigi.com/v4.0/Orders", {
    method: "POST",
    headers: { "X-API-Key": apiKey, "Content-Type": "application/json" },
    body: JSON.stringify({
      merchantReference: order["id"],
      shippingMethod: "Standard",
      recipient: {
        name: shipping?.name ?? session.customer_details?.name ?? "Customer",
        email: session.customer_details?.email,
        address: {
          line1: address.line1,
          line2: address.line2 ?? undefined,
          postalOrZipCode: address.postal_code,
          countryCode: address.country,
          townOrCity: address.city,
          stateOrCounty: address.state ?? undefined,
        },
      },
      items: [
        {
          sku: order["prodigi_sku"],
          copies: order["quantity"] ?? 1,
          sizing: "fillPrintArea",
          assets: [{ printArea: "default", url: order["image_url"] }],
        },
      ],
    }),
  });

  if (!response.ok) {
    console.error("Prodigi order failed:", response.status, await response.text());
    return null;
  }
  const body = (await response.json()) as any;
  return body?.order?.id ?? null;
}

async function fulfillSession(session: any, env: StripeEnv) {
  const supabase = getSupabase();
  const meta = session.metadata ?? {};
  const shipping = session.collected_information?.shipping_details ?? session.shipping_details;

  const { data: existing } = await supabase
    .from("orders")
    .select("id")
    .eq("stripe_session_id", session.id)
    .maybeSingle();

  const record = {
    stripe_session_id: session.id,
    stripe_payment_intent_id:
      typeof session.payment_intent === "string" ? session.payment_intent : null,
    environment: env,
    customer_email: session.customer_details?.email ?? null,
    customer_name: shipping?.name ?? session.customer_details?.name ?? null,
    artwork_id: meta.artwork_id || null,
    print_option_id: meta.print_option_id || null,
    item_kind: meta.item_kind || "original",
    item_label: meta.item_label || "Artwork",
    quantity: Number(meta.quantity ?? 1),
    amount_cents: session.amount_total ?? 0,
    currency: session.currency ?? "usd",
    shipping_address: shipping ?? session.customer_details ?? null,
    status: session.payment_status === "unpaid" ? "pending" : "paid",
    updated_at: new Date().toISOString(),
  };

  const { data: saved } = existing
    ? await supabase.from("orders").update(record).eq("id", existing["id"]).select("id").maybeSingle()
    : await supabase.from("orders").insert(record).select("id").maybeSingle();

  if (record.status !== "paid" || !saved) return;

  if (record.item_kind === "original" && record.artwork_id) {
    await supabase
      .from("artworks")
      .update({ original_available: false })
      .eq("id", record.artwork_id);
    await supabase
      .from("orders")
      .update({ fulfillment_status: "awaiting_shipment" })
      .eq("id", saved["id"]);
    return;
  }

  if (record.print_option_id && record.artwork_id) {
    const { data: option } = await supabase
      .from("print_options")
      .select("prodigi_sku")
      .eq("id", record.print_option_id)
      .maybeSingle();
    const { data: artwork } = await supabase
      .from("artworks")
      .select("image_url")
      .eq("id", record.artwork_id)
      .maybeSingle();

    const prodigiOrderId = await submitToProdigi(
      {
        id: saved["id"],
        prodigi_sku: option?.["prodigi_sku"],
        quantity: record.quantity,
        image_url: artwork?.["image_url"],
      },
      session,
    );

    await supabase
      .from("orders")
      .update({
        prodigi_order_id: prodigiOrderId,
        fulfillment_status: prodigiOrderId ? "submitted" : "awaiting_fulfillment",
        updated_at: new Date().toISOString(),
      })
      .eq("id", saved["id"]);
  }
}

async function handleWebhook(req: Request, env: StripeEnv) {
  const event = await verifyWebhook(req, env);

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      await fulfillSession(session, env);
      break;
    }
    case "checkout.session.async_payment_succeeded":
      await fulfillSession(event.data.object, env);
      break;
    case "checkout.session.async_payment_failed":
      await getSupabase()
        .from("orders")
        .update({ status: "failed", updated_at: new Date().toISOString() })
        .eq("stripe_session_id", event.data.object.id);
      break;
    default:
      console.log("Unhandled event:", event.type);
  }
}

export const Route = createFileRoute("/api/public/payments/webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const rawEnv = new URL(request.url).searchParams.get("env");
        if (rawEnv !== "sandbox" && rawEnv !== "live") {
          console.error("Webhook received with invalid env:", rawEnv);
          return Response.json({ received: true, ignored: "invalid env" });
        }
        try {
          await handleWebhook(request, rawEnv);
          return Response.json({ received: true });
        } catch (e) {
          console.error("Webhook error:", e);
          return new Response("Webhook error", { status: 400 });
        }
      },
    },
  },
});
