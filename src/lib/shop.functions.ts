import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import {
  type StripeEnv,
  createStripeClient,
  getStripeErrorMessage,
} from "@/lib/stripe.server";

export type PrintOption = {
  id: string;
  label: string;
  kind: string;
  price_cents: number;
  sort_order: number;
};

export type Artwork = {
  id: string;
  slug: string;
  title: string;
  year: string | null;
  medium: string | null;
  dimensions: string | null;
  description: string | null;
  image_url: string;
  original_price_cents: number | null;
  original_available: boolean;
  sort_order: number;
  print_options: PrintOption[];
};

function publicClient() {
  const url = process.env["SUPABASE_URL"]!;
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"] ?? process.env["SUPABASE_ANON_KEY"]!;
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) {
          h.delete("Authorization");
        }
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
}

export const listArtworks = createServerFn({ method: "GET" }).handler(
  async (): Promise<Artwork[]> => {
    const supabase = publicClient();
    const { data, error } = await supabase
      .from("artworks")
      .select(
        "id, slug, title, year, medium, dimensions, description, image_url, original_price_cents, original_available, sort_order, print_options(id, label, kind, price_cents, sort_order)",
      )
      .order("sort_order", { ascending: true });
    if (error) throw new Error(error.message);
    return ((data ?? []) as unknown as Artwork[]).map((a) => ({
      ...a,
      print_options: [...(a.print_options ?? [])].sort((x, y) => x.sort_order - y.sort_order),
    }));
  },
);

type CheckoutResult = { clientSecret: string } | { error: string };

export const createArtworkCheckout = createServerFn({ method: "POST" })
  .inputValidator(
    (data: {
      artworkId: string;
      printOptionId?: string | null;
      quantity?: number;
      returnUrl: string;
      environment: StripeEnv;
    }) => {
      if (!/^[0-9a-fA-F-]{36}$/.test(data.artworkId)) throw new Error("Invalid artwork");
      if (data.printOptionId && !/^[0-9a-fA-F-]{36}$/.test(data.printOptionId)) {
        throw new Error("Invalid option");
      }
      return data;
    },
  )
  .handler(async ({ data }): Promise<CheckoutResult> => {
    try {
      const supabase = publicClient();
      const { data: artwork, error } = await supabase
        .from("artworks")
        .select(
          "id, title, year, medium, dimensions, image_url, original_price_cents, original_available",
        )
        .eq("id", data.artworkId)
        .maybeSingle();
      if (error) throw new Error(error.message);
      if (!artwork) return { error: "That work could not be found." };

      let label: string;
      let unitAmount: number;
      let kind: "original" | "print";
      let quantity = 1;

      if (data.printOptionId) {
        const { data: option } = await supabase
          .from("print_options")
          .select("id, label, price_cents, artwork_id")
          .eq("id", data.printOptionId)
          .maybeSingle();
        if (!option || option.artwork_id !== artwork.id) {
          return { error: "That option is no longer available." };
        }
        kind = "print";
        label = `${artwork.title} — ${option.label}`;
        unitAmount = option.price_cents as number;
        quantity = Math.min(Math.max(data.quantity ?? 1, 1), 10);
      } else {
        if (!artwork.original_available || !artwork.original_price_cents) {
          return { error: "This original has already sold." };
        }
        kind = "original";
        label = `${artwork.title} (original)`;
        unitAmount = artwork.original_price_cents as number;
      }

      const stripe = createStripeClient(data.environment);
      const imageUrl = artwork.image_url as string;
      const baseParams = {
        mode: "payment" as const,
        ui_mode: "embedded_page" as const,
        return_url: data.returnUrl,
        line_items: [
          {
            quantity,
            price_data: {
              currency: "usd",
              unit_amount: unitAmount,
              product_data: {
                name: label,
                ...(imageUrl.startsWith("http") ? { images: [imageUrl] } : {}),
                ...(artwork.dimensions
                  ? { description: `${artwork.medium ?? ""} ${artwork.dimensions}`.trim() }
                  : {}),
              },
            },
          },
        ],
        shipping_address_collection: {
          allowed_countries: ["US", "CA", "GB", "IE", "FR", "DE", "IT", "ES", "NL", "AU", "NZ"],
        },
        phone_number_collection: { enabled: true },
        payment_intent_data: { description: label },
        metadata: {
          artwork_id: artwork.id as string,
          print_option_id: data.printOptionId ?? "",
          item_kind: kind,
          item_label: label,
          quantity: String(quantity),
        },
      } as Parameters<typeof stripe.checkout.sessions.create>[0];

      let session;
      try {
        // Tax is calculated and collected at checkout once a business address
        // is on file in the payments account.
        session = await stripe.checkout.sessions.create({
          ...baseParams,
          automatic_tax: { enabled: true },
        });
      } catch (taxError) {
        const message = getStripeErrorMessage(taxError);
        if (!/automatic tax|head office|origin address/i.test(message)) throw taxError;
        console.warn("Automatic tax unavailable, continuing without it:", message);
        session = await stripe.checkout.sessions.create(baseParams);
      }

      return { clientSecret: session.client_secret ?? "" };
    } catch (error) {
      return { error: getStripeErrorMessage(error) };
    }
  });

export type OrderSummary = {
  status: string;
  item_label: string;
  amount_cents: number;
  currency: string;
  customer_email: string | null;
};

export const getOrderStatus = createServerFn({ method: "POST" })
  .inputValidator((data: { sessionId: string; environment: StripeEnv }) => {
    if (!/^[a-zA-Z0-9_-]+$/.test(data.sessionId)) throw new Error("Invalid session");
    return data;
  })
  .handler(async ({ data }): Promise<OrderSummary | { error: string }> => {
    try {
      const stripe = createStripeClient(data.environment);
      const session = await stripe.checkout.sessions.retrieve(data.sessionId);
      return {
        status: session.payment_status === "unpaid" ? "processing" : "paid",
        item_label: session.metadata?.["item_label"] ?? "Your order",
        amount_cents: session.amount_total ?? 0,
        currency: session.currency ?? "usd",
        customer_email: session.customer_details?.email ?? null,
      };
    } catch (error) {
      return { error: getStripeErrorMessage(error) };
    }
  });
