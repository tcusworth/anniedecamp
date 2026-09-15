import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export interface ArticleSummary {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  published: boolean;
  published_at: string | null;
}

export interface Article extends ArticleSummary {
  body: string;
  cover_image_url: string | null;
}

function publicClient() {
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  const url = process.env["SUPABASE_URL"]!;
  return createClient<Database>(url, key, {
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

export const listPublishedArticles = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await publicClient()
    .from("news_articles")
    .select("id, slug, title, excerpt, published, published_at")
    .eq("published", true)
    .order("published_at", { ascending: false });
  if (error) {
    console.error("listPublishedArticles", error.message);
    return [] as ArticleSummary[];
  }
  return (data ?? []) as ArticleSummary[];
});

export const getPublishedArticle = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) => z.object({ slug: z.string().min(1) }).parse(input))
  .handler(async ({ data }) => {
    const { data: row, error } = await publicClient()
      .from("news_articles")
      .select("id, slug, title, excerpt, body, cover_image_url, published, published_at")
      .eq("slug", data.slug)
      .eq("published", true)
      .maybeSingle();
    if (error) {
      console.error("getPublishedArticle", error.message);
      return null;
    }
    return (row as Article | null) ?? null;
  });

export const listAllArticles = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("news_articles")
      .select("id, slug, title, excerpt, body, cover_image_url, published, published_at")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []) as Article[];
  });

const saveSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().trim().min(1).max(200),
  slug: z
    .string()
    .trim()
    .min(1)
    .max(120)
    .regex(/^[a-z0-9-]+$/, "Use lowercase letters, numbers and dashes only"),
  excerpt: z.string().trim().max(400).optional().default(""),
  body: z.string().max(40000).default(""),
  cover_image_url: z.string().trim().max(500).optional().default(""),
  published: z.boolean().default(false),
});

export const saveArticle = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => saveSchema.parse(input))
  .handler(async ({ data, context }) => {
    const row = {
      title: data.title,
      slug: data.slug,
      excerpt: data.excerpt || null,
      body: data.body,
      cover_image_url: data.cover_image_url || null,
      published: data.published,
      published_at: data.published ? new Date().toISOString() : null,
    };

    if (data.id) {
      const existing = await context.supabase
        .from("news_articles")
        .select("published_at")
        .eq("id", data.id)
        .maybeSingle();
      const keep = existing.data?.published_at ?? null;
      const { error } = await context.supabase
        .from("news_articles")
        .update({ ...row, published_at: data.published ? keep ?? row.published_at : null })
        .eq("id", data.id);
      if (error) return { ok: false as const, error: error.message };
      return { ok: true as const };
    }

    const { error } = await context.supabase.from("news_articles").insert(row);
    if (error) return { ok: false as const, error: error.message };
    return { ok: true as const };
  });

export const deleteArticle = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("news_articles").delete().eq("id", data.id);
    if (error) return { ok: false as const, error: error.message };
    return { ok: true as const };
  });

export const getMyAdminStatus = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    return { isAdmin: data === true };
  });
