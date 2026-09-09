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

const UUID = /^[0-9a-fA-F-]{36}$/;

type CartLine = { artworkId: string; printOptionId?: string | null; quantity?: number };

export const createCartCheckout = createServerFn({ method: "POST" })
  .inputValidator(
    (data: { items: CartLine[]; returnUrl: string; environment: StripeEnv }) => {
      if (!Array.isArray(data.items) || data.items.length === 0) throw new Error("Cart is empty");
      if (data.items.length > 20) throw new Error("Too many items");
      for (const item of data.items) {
        if (!UUID.test(item.artworkId)) throw new Error("Invalid artwork");
        if (item.printOptionId && !UUID.test(item.printOptionId)) throw new Error("Invalid option");
      }
      return data;
    },
  )
  .handler(async ({ data }): Promise<CheckoutResult> => {
    try {
      const supabase = publicClient();
      const artworkIds = [...new Set(data.items.map((i) => i.artworkId))];
      const optionIds = data.items.map((i) => i.printOptionId).filter(Boolean) as string[];

      const { data: artworks, error } = await supabase
        .from("artworks")
        .select("id, title, original_price_cents, original_available, stripe_price_key")
        .in("id", artworkIds);
      if (error) throw new Error(error.message);

      let options: any[] = [];
      if (optionIds.length) {
        const { data: opts, error: optError } = await supabase
          .from("print_options")
          .select("id, label, artwork_id, stripe_price_key")
          .in("id", optionIds);
        if (optError) throw new Error(optError.message);
        options = opts ?? [];
      }

      const lineItems: { price: string; quantity: number }[] = [];
      const labels: string[] = [];
      const stripe = createStripeClient(data.environment);

      for (const item of data.items) {
        const artwork = (artworks ?? []).find((a) => a.id === item.artworkId);
        if (!artwork) return { error: "One of the items could not be found." };

        let priceKey: string | null;
        let quantity = 1;
        let label: string;

        if (item.printOptionId) {
          const option = options.find((o) => o.id === item.printOptionId);
          if (!option || option.artwork_id !== artwork.id) {
            return { error: "One of the options is no longer available." };
          }
          priceKey = (option.stripe_price_key as string | null) ?? null;
          label = `${artwork.title} — ${option.label}`;
          quantity = Math.min(Math.max(item.quantity ?? 1, 1), 10);
        } else {
          if (!artwork.original_available || !artwork.original_price_cents) {
            return { error: `${artwork.title} has already sold.` };
          }
          priceKey = (artwork.stripe_price_key as string | null) ?? null;
          label = `${artwork.title} (original)`;
        }

        if (!priceKey) return { error: "One of the items is not available for purchase yet." };
        const prices = await stripe.prices.list({ lookup_keys: [priceKey] });
        if (!prices.data.length) {
          return { error: "One of the items is not available for purchase yet." };
        }
        lineItems.push({ price: prices.data[0]!.id, quantity });
        labels.push(label);
      }

      const summary = labels.join(", ").slice(0, 480);

      const baseParams = {
        mode: "payment" as const,
        ui_mode: "embedded_page" as const,
        return_url: data.returnUrl,
        line_items: lineItems,
        shipping_address_collection: {
          allowed_countries: ["US", "CA", "GB", "IE", "FR", "DE", "IT", "ES", "NL", "AU", "NZ"],
        },
        phone_number_collection: { enabled: true },
        payment_intent_data: { description: summary },
        metadata: {
          item_label: summary,
          item_count: String(lineItems.length),
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
