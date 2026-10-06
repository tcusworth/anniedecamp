import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

// Creates a Printify product from a gallery painting by copying the setup
// (blueprint, print provider, variants) of an existing product of the same
// type, then lists it in merch_products.

const CATEGORY_LABEL: Record<string, string> = { scarf: "Scarf", tote: "Tote Bag", notebook: "Notebook" };

const input = z.object({
  artworkId: z.string().uuid(),
  category: z.enum(["scarf", "tote", "notebook"]),
  markupPercent: z.number().min(0).max(1000),
  title: z.string().trim().max(200).optional(),
});

async function pf(path: string, init?: RequestInit) {
  const token = process.env["PRINTIFY_API_TOKEN"];
  if (!token) throw new Error("Printify is not configured");
  const res = await fetch(`https://api.printify.com/v1${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "User-Agent": "anniedecampart-store",
      ...(init?.headers ?? {}),
    },
  });
  const text = await res.text();
  if (!res.ok) {
    console.error("Printify", path, res.status, text);
    throw new Error(`Printify request failed (${res.status})`);
  }
  return text ? JSON.parse(text) : {};
}

function toBase64(buf: ArrayBuffer) {
  const bytes = new Uint8Array(buf);
  let bin = "";
  for (let i = 0; i < bytes.length; i += 0x8000) {
    bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  }
  return btoa(bin);
}

async function loadArtworkImage(imageUrl: string): Promise<ArrayBuffer> {
  const storageMatch = imageUrl.match(/artwork-image\?path=([^&]+)/);
  if (storageMatch) {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin.storage
      .from("artwork-images")
      .download(decodeURIComponent(storageMatch[1]!));
    if (error || !data) throw new Error("Could not read the painting image");
    return data.arrayBuffer();
  }
  const candidates = /^https?:/.test(imageUrl)
    ? [imageUrl]
    : [new URL(imageUrl, getRequest().url).toString(), `https://anniedecampart.com${imageUrl}`];
  for (const url of candidates) {
    try {
      const r = await fetch(url);
      if (r.ok && (r.headers.get("content-type") ?? "").startsWith("image")) return r.arrayBuffer();
    } catch {
      /* try next */
    }
  }
  throw new Error("Could not read the painting image");
}

export const createMerchFromArtwork = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => input.parse(d))
  .handler(async ({ data, context }) => {
    const { data: role } = await context.supabase
      .from("user_roles")
      .select("id")
      .eq("user_id", context.userId)
      .eq("role", "admin")
      .maybeSingle();
    if (!role) throw new Error("Forbidden");

    const shopId = process.env["PRINTIFY_SHOP_ID"];
    if (!shopId) throw new Error("Printify is not configured");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: art, error: artErr } = await supabaseAdmin
      .from("artworks")
      .select("id, title, image_url")
      .eq("id", data.artworkId)
      .single();
    if (artErr || !art) throw new Error("Painting not found");

    // Template: an existing product of the same type.
    const { data: tmplRow } = await supabaseAdmin
      .from("merch_products")
      .select("printify_product_id")
      .eq("category", data.category)
      .limit(1)
      .maybeSingle();
    if (!tmplRow) throw new Error("No existing product of this type in Printify to copy from");
    const tmpl = await pf(`/shops/${shopId}/products/${tmplRow.printify_product_id}.json`);
    const enabled = (tmpl.variants ?? []).filter((v: any) => v.is_enabled !== false);
    if (!enabled.length) throw new Error("Template product has no variants");

    // Placeholder sizes for a cover-fill scale.
    const catalog = await pf(
      `/catalog/blueprints/${tmpl.blueprint_id}/print_providers/${tmpl.print_provider_id}/variants.json`,
    );
    const catVariant = (catalog.variants ?? []).find((v: any) => v.id === enabled[0].id);

    // Upload painting.
    const buf = await loadArtworkImage(art.image_url);
    const upload = await pf(`/uploads/images.json`, {
      method: "POST",
      body: JSON.stringify({ file_name: `${art.title}.jpg`, contents: toBase64(buf) }),
    });
    const imgW = upload.width ?? 1;
    const imgH = upload.height ?? 1;

    const positions: string[] = [
      ...new Set<string>(
        (tmpl.print_areas ?? []).flatMap((a: any) => (a.placeholders ?? []).map((p: any) => p.position)),
      ),
    ];
    const placeholders = positions.map((position) => {
      const ph = catVariant?.placeholders?.find((p: any) => p.position === position);
      const scale = ph ? Math.max(1, (ph.height * imgW) / (ph.width * imgH)) : 1;
      return {
        position,
        images: [{ id: upload.id, x: 0.5, y: 0.5, scale: Math.round(scale * 1000) / 1000, angle: 0 }],
      };
    });

    const priced = enabled.map((v: any) => {
      const cents = Math.ceil((v.cost * (1 + data.markupPercent / 100)) / 100) * 100;
      return { id: v.id, title: v.title as string, price: cents };
    });

    const title = data.title?.trim() || `${art.title} ${CATEGORY_LABEL[data.category]}`;
    const product = await pf(`/shops/${shopId}/products.json`, {
      method: "POST",
      body: JSON.stringify({
        title,
        description: `${art.title} by Annie Decamp.`,
        blueprint_id: tmpl.blueprint_id,
        print_provider_id: tmpl.print_provider_id,
        variants: priced.map((v: any) => ({ id: v.id, price: v.price, is_enabled: true })),
        print_areas: [{ variant_ids: priced.map((v: any) => v.id), placeholders }],
      }),
    });

    try {
      await pf(`/shops/${shopId}/products/${product.id}/publish.json`, {
        method: "POST",
        body: JSON.stringify({ title: true, description: true, images: true, variants: true, tags: true }),
      });
    } catch {
      /* API-only shops may not support publishing; orders still work */
    }

    const mockup =
      product.images?.find((i: any) => i.is_default)?.src ?? product.images?.[0]?.src ?? art.image_url;
    const { data: last } = await supabaseAdmin
      .from("merch_products")
      .select("sort_order")
      .order("sort_order", { ascending: false })
      .limit(1)
      .maybeSingle();
    const base = (last?.sort_order ?? 0) + 1;
    const single = priced.length === 1;
    const { error: insErr } = await supabaseAdmin.from("merch_products").insert(
      priced.map((v: any, i: number) => ({
        printify_product_id: product.id,
        printify_variant_id: v.id,
        title,
        variant_label: single ? null : v.title,
        category: data.category,
        price_cents: v.price,
        image_url: mockup,
        sort_order: base + i,
        active: true,
      })),
    );
    if (insErr) throw new Error(insErr.message);

    return { title, priceCents: priced[0].price, variants: priced.length };
  });
