import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import { type StripeEnv, verifyWebhook, createStripeClient } from "@/lib/stripe.server";
import { sendTemplateEmail } from "@/lib/email-templates/send-email";
import { STUDIO_SALES_NOTIFICATION_EMAILS } from "@/lib/email-templates/recipients";
import { submitToPrintify, buildCustomLine, type PrintifyLine } from "@/lib/printify.server";

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

// Public URL Printify can download for a painting image.
async function paintingUrl(supabase: any, imageUrl: string): Promise<string | null> {
  const storage = imageUrl.match(/artwork-image\?path=([^&]+)/);
  if (storage) {
    const { data } = await supabase.storage
      .from("artwork-images")
      .createSignedUrl(decodeURIComponent(storage[1]!), 60 * 60 * 24 * 7);
    return data?.signedUrl ?? null;
  }
  if (/^https?:/.test(imageUrl)) return imageUrl;
  return `https://anniedecampart.com${imageUrl.startsWith("/") ? "" : "/"}${imageUrl}`;
}

async function fulfillSession(session: any, env: StripeEnv) {
  const supabase = getSupabase();
  const shipping = session.collected_information?.shipping_details ?? session.shipping_details;
  const paid = session.payment_status !== "unpaid";

  const stripe = createStripeClient(env);
  const lineItems = await stripe.checkout.sessions.listLineItems(session.id, {
    limit: 100,
    expand: ["data.price.product"],
  });

  // Each line item carries its catalogue ids in the Stripe product metadata.
  const meta = (li: any): Record<string, string> => li.price?.product?.metadata ?? {};
  const optionIds = lineItems.data.map((li: any) => meta(li)["print_option_id"]).filter(Boolean);
  const merchIds = lineItems.data.map((li: any) => meta(li)["merch_product_id"]).filter(Boolean);

  const { data: options } = await supabase
    .from("print_options")
    .select("id, kind, artwork_id, printify_product_id, printify_variant_id")
    .in("id", optionIds.length ? optionIds : ["00000000-0000-0000-0000-000000000000"]);
  const { data: merch } = await supabase
    .from("merch_products")
    .select("id, printify_product_id, printify_variant_id")
    .in("id", merchIds.length ? merchIds : ["00000000-0000-0000-0000-000000000000"]);

  // Rebuild the order rows for this session so repeated webhooks stay idempotent.
  await supabase.from("orders").delete().eq("stripe_session_id", session.id);

  const base = {
    stripe_session_id: session.id,
    stripe_payment_intent_id:
      typeof session.payment_intent === "string" ? session.payment_intent : null,
    environment: env,
    customer_email: session.customer_details?.email ?? null,
    customer_name: shipping?.name ?? session.customer_details?.name ?? null,
    currency: session.currency ?? "usd",
    shipping_address: shipping ?? session.customer_details ?? null,
    status: paid ? "paid" : "pending",
    updated_at: new Date().toISOString(),
  };

  const soldLabels: string[] = [];
  const printifyLines: PrintifyLine[] = [];
  const printifyOrderRowIds: string[] = [];

  for (const li of lineItems.data as any[]) {
    const m = meta(li);
    const merchItem = (merch ?? []).find((x: any) => x.id === m["merch_product_id"]);
    const option = (options ?? []).find((o: any) => o.id === m["print_option_id"]);
    const customArtworkId: string | null = merchItem ? (m["custom_artwork_id"] ?? null) : null;
    const artworkId: string | null = option?.artwork_id ?? m["artwork_id"] ?? null;
    if (!merchItem && !artworkId) continue;

    const kind = merchItem
      ? "merchandise"
      : option
        ? option.kind === "merchandise" ? "merchandise" : "print"
        : "original";
    const quantity = li.quantity ?? 1;
    soldLabels.push(li.description ?? "Artwork");

    const { data: saved } = await supabase
      .from("orders")
      .insert({
        ...base,
        artwork_id: merchItem ? customArtworkId : artworkId,
        print_option_id: option?.id ?? null,
        merch_product_id: merchItem?.id ?? null,
        item_kind: kind,
        item_label: li.description ?? "Artwork",
        quantity,
        amount_cents: li.amount_total ?? 0,
      })
      .select("id")
      .maybeSingle();

    if (!paid || !saved) continue;

    if (kind === "original") {
      await supabase.from("artworks").update({ original_available: false }).eq("id", artworkId);
      await supabase
        .from("orders")
        .update({ fulfillment_status: "awaiting_shipment" })
        .eq("id", saved["id"]);
      continue;
    }

    // Prints and merchandise with a Printify product mapping are batched into
    // a single Printify order for the whole session (submitted after the loop).
    const pf = merchItem ?? option;
    if (merchItem && customArtworkId) {
      const { data: art } = await supabase
        .from("artworks")
        .select("image_url")
        .eq("id", customArtworkId)
        .maybeSingle();
      const url = art ? await paintingUrl(supabase, art.image_url) : null;
      const line = url
        ? await buildCustomLine({
            templateProductId: merchItem.printify_product_id,
            variantId: merchItem.printify_variant_id,
            quantity,
            imageUrl: url,
          })
        : null;
      if (line) {
        printifyLines.push(line);
        printifyOrderRowIds.push(saved["id"]);
      } else {
        await supabase
          .from("orders")
          .update({ fulfillment_status: "awaiting_fulfillment", updated_at: new Date().toISOString() })
          .eq("id", saved["id"]);
      }
      continue;
    }
    if (pf?.printify_product_id && pf?.printify_variant_id) {
      printifyLines.push({
        productId: pf.printify_product_id,
        variantId: pf.printify_variant_id,
        quantity,
      });
      printifyOrderRowIds.push(saved["id"]);
    } else {
      await supabase
        .from("orders")
        .update({ fulfillment_status: "awaiting_fulfillment", updated_at: new Date().toISOString() })
        .eq("id", saved["id"]);
    }
  }

  if (paid && printifyLines.length > 0) {
    const printifyOrderId = await submitToPrintify({
      externalId: session.id,
      lines: printifyLines,
      address: {
        name: shipping?.name ?? session.customer_details?.name,
        email: session.customer_details?.email,
        phone: session.customer_details?.phone,
        line1: shipping?.address?.line1 ?? session.customer_details?.address?.line1,
        line2: shipping?.address?.line2 ?? session.customer_details?.address?.line2,
        city: shipping?.address?.city ?? session.customer_details?.address?.city,
        state: shipping?.address?.state ?? session.customer_details?.address?.state,
        postal_code:
          shipping?.address?.postal_code ?? session.customer_details?.address?.postal_code,
        country: shipping?.address?.country ?? session.customer_details?.address?.country,
      },
    });

    await supabase
      .from("orders")
      .update({
        printify_order_id: printifyOrderId,
        fulfillment_status: printifyOrderId ? "submitted" : "awaiting_fulfillment",
        updated_at: new Date().toISOString(),
      })
      .in("id", printifyOrderRowIds);
  }

  if (paid) {
    const total = ((session.amount_total ?? 0) / 100).toLocaleString("en-US", {
      style: "currency",
      currency: (session.currency ?? "usd").toUpperCase(),
    });
    const notificationData = {
      items:
        soldLabels.join(", ") ||
        session.metadata?.["item_label"] ||
        "Artwork",
      total,
      customer_name: shipping?.name ?? session.customer_details?.name ?? null,
      customer_email: session.customer_details?.email ?? null,
      environment: env,
    };

    for (const recipientEmail of STUDIO_SALES_NOTIFICATION_EMAILS) {
      try {
        await sendTemplateEmail("order-notification", recipientEmail, {
          idempotencyKey: `order-${session.id}-${recipientEmail}`,
          templateData: notificationData,
        });
      } catch (e) {
        console.error("Sale notification email failed:", e);
      }
    }
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
