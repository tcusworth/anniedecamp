import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export interface AdminArtwork {
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
}

const SELECT =
  "id, slug, title, year, medium, dimensions, description, image_url, original_price_cents, original_available, sort_order";

export const listAdminArtworks = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("artworks")
      .select(SELECT)
      .order("sort_order", { ascending: true });
    if (error) throw new Error(error.message);
    return (data ?? []) as AdminArtwork[];
  });

const artworkSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().trim().min(1).max(200),
  slug: z
    .string()
    .trim()
    .min(1)
    .max(140)
    .regex(/^[a-z0-9-]+$/, "Use lowercase letters, numbers and dashes only"),
  year: z.string().trim().max(20).optional().default(""),
  medium: z.string().trim().max(200).optional().default(""),
  dimensions: z.string().trim().max(120).optional().default(""),
  description: z.string().trim().max(4000).optional().default(""),
  image_url: z.string().trim().min(1).max(600),
  original_price_cents: z.number().int().min(0).max(100000000).nullable().optional(),
  original_available: z.boolean().default(false),
  sort_order: z.number().int().min(0).max(100000).default(0),
});

export type ArtworkInput = z.input<typeof artworkSchema>;

function toRow(data: z.output<typeof artworkSchema>) {
  return {
    title: data.title,
    slug: data.slug,
    year: data.year || null,
    medium: data.medium || null,
    dimensions: data.dimensions || null,
    description: data.description || null,
    image_url: data.image_url,
    original_price_cents: data.original_price_cents ?? null,
    original_available: data.original_available,
    sort_order: data.sort_order,
  };
}

export const saveArtwork = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => artworkSchema.parse(input))
  .handler(async ({ data, context }) => {
    const row = toRow(data);
    if (data.id) {
      const { error } = await context.supabase.from("artworks").update(row).eq("id", data.id);
      if (error) return { ok: false as const, error: error.message };
      return { ok: true as const };
    }
    const { error } = await context.supabase.from("artworks").insert(row);
    if (error) return { ok: false as const, error: error.message };
    return { ok: true as const };
  });

export const saveArtworksBulk = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ items: z.array(artworkSchema).min(1).max(100) }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("artworks").insert(data.items.map(toRow));
    if (error) return { ok: false as const, error: error.message, inserted: 0 };
    return { ok: true as const, inserted: data.items.length };
  });

export const deleteArtwork = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    await context.supabase.from("print_options").delete().eq("artwork_id", data.id);
    const { error } = await context.supabase.from("artworks").delete().eq("id", data.id);
    if (error) return { ok: false as const, error: error.message };
    return { ok: true as const };
  });
