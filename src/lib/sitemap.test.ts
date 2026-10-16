import { test } from "node:test";
import { deepStrictEqual, rejects, strictEqual } from "node:assert";
import { collectSitemapPages, sitemapXML } from "./sitemap";

test("public content pagination continues through all batches", async () => {
  const rows = [{ slug: "first" }, { slug: "second" }, { slug: "third" }];
  const offsets: number[] = [];
  const entries = await collectSitemapPages(async (offset, end) => {
    offsets.push(offset);
    return { data: rows.slice(offset, end + 1), error: null };
  }, (row) => `/gallery/${row.slug}`, 2);
  deepStrictEqual(offsets, [0, 2, 3]);
  deepStrictEqual(entries, rows.map((row) => ({ path: `/gallery/${row.slug}` })));
});

test("a later public-content failure cannot produce partial sitemap XML", async () => {
  await rejects(collectSitemapPages(async (offset) => offset === 0
    ? { data: [{ slug: "first" }], error: null }
    : { data: null, error: new Error("later batch failed") },
  (row) => `/gallery/${row.slug}`, 1), /later batch failed/);
});

test("sitemap uses the public domain without invented last-modified dates", () => {
  const xml = sitemapXML("https://anniedecampart.com", [{ path: "/" }, { path: "/gallery" }]);
  strictEqual(xml.includes("<loc>https://anniedecampart.com/gallery</loc>"), true);
  strictEqual(xml.includes("<lastmod>"), false);
});