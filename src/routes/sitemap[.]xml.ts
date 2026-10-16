import { createFileRoute } from "@tanstack/react-router";
import { getRouterInstance } from "@tanstack/react-start";
import {
  collectSitemapPages,
  isSitemapRouteIncluded,
  sitemapPathForLocation,
  sitemapStaticPaths,
  sitemapXML,
  type SitemapEntry,
} from "@/lib/sitemap";

const BASE_URL = "https://anniedecampart.com";

export const Route = createFileRoute("/sitemap.xml")({
  staticData: { sitemap: false },
  server: {
    handlers: {
      GET: async () => {
        try {
          const router = await getRouterInstance();
          const entries: SitemapEntry[] = sitemapStaticPaths(router).map((path) => ({ path }));
          const { createClient } = await import("@supabase/supabase-js");
          const key = process.env["SUPABASE_PUBLISHABLE_KEY"] ?? process.env["SUPABASE_ANON_KEY"];
          const url = process.env["SUPABASE_URL"];
          if (!key || !url) throw new Error("Public content access is not configured");
          const supabase = createClient(url, key, {
            auth: { persistSession: false, autoRefreshToken: false },
            global: {
              fetch: (input, init) => {
                const headers = new Headers(init?.headers);
                if (key.startsWith("sb_") && headers.get("Authorization") === `Bearer ${key}`) headers.delete("Authorization");
                headers.set("apikey", key);
                return fetch(input, { ...init, headers });
              },
            },
          });
          const artworkRoute = "/gallery/$slug";
          if (isSitemapRouteIncluded(router.routesById[artworkRoute])) {
            entries.push(...await collectSitemapPages<{ slug: string }>(
              async (offset, end) => await supabase.from("artworks").select("slug").order("id").range(offset, end),
              (row) => sitemapPathForLocation(router, router.buildLocation({
                to: artworkRoute, params: { slug: row.slug }, search: () => ({}), hash: "",
              }), artworkRoute),
            ));
          }
          const articleRoute = "/news/$slug";
          if (isSitemapRouteIncluded(router.routesById[articleRoute])) {
            entries.push(...await collectSitemapPages<{ slug: string }>(
              async (offset, end) => await supabase.from("news_articles").select("slug").eq("published", true).order("id").range(offset, end),
              (row) => sitemapPathForLocation(router, router.buildLocation({
                to: articleRoute, params: { slug: row.slug }, search: () => ({}), hash: "",
              }), articleRoute),
            ));
          }
          if (entries.length === 0) return new Response("No public sitemap pages", { status: 404, headers: { "Cache-Control": "no-store" } });
          return new Response(sitemapXML(BASE_URL, entries), {
            headers: { "Content-Type": "application/xml", "Cache-Control": "public, max-age=3600" },
          });
        } catch (error) {
          console.error("Sitemap generation failed", error);
          return new Response("Sitemap temporarily unavailable", { status: 503, headers: { "Cache-Control": "no-store" } });
        }
      },
    },
  },
});