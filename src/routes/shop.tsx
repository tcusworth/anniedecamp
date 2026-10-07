import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { PaymentTestModeBanner } from "@/components/PaymentTestModeBanner";
import {
  listMerchandise,
  listArtworks,
  listMerchImages,
  type MerchProduct,
  type Artwork,
  type MerchImage,
} from "@/lib/shop.functions";
import { useCart, money } from "@/lib/cart";

const title = "Merchandise — Annie Decamp Art";
const description =
  "Scarves, tote bags and notebooks featuring paintings by Annie Decamp, printed and shipped to order.";

export const Route = createFileRoute("/shop")({
  loader: async () => {
    const [merch, artworks] = await Promise.all([listMerchandise(), listArtworks()]);
    const productIds = [...new Set(merch.map((m) => m.printify_product_id))];
    const photos = await listMerchImages({ data: { productIds } }).catch(() => ({}));
    return { merch, artworks, photos };
  },
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ShopPage,
});

const CATEGORIES: { key: string; label: string }[] = [
  { key: "scarf", label: "Scarves" },
  { key: "tote", label: "Tote bags" },
  { key: "notebook", label: "Notebooks" },
];

type Group = { productId: string; title: string; category: string; image: string; variants: MerchProduct[] };

function groupProducts(rows: MerchProduct[]): Group[] {
  const map = new Map<string, Group>();
  for (const r of rows) {
    const g = map.get(r.printify_product_id);
    if (g) g.variants.push(r);
    else
      map.set(r.printify_product_id, {
        productId: r.printify_product_id,
        title: r.title,
        category: r.category,
        image: r.image_url,
        variants: [r],
      });
  }
  return [...map.values()];
}

function ProductCard({ group, photos }: { group: Group; photos: MerchImage[] }) {
  const { add } = useCart();
  const [variantId, setVariantId] = useState(group.variants[0]!.id);
  const v = group.variants.find((x) => x.id === variantId) ?? group.variants[0]!;
  const srcs = photos.length ? photos.map((p) => p.src) : [group.image];
  const [idx, setIdx] = useState(0);
  const main = srcs[idx] ?? srcs[0];
  return (
    <li className="ct-merch-card">
      <div className="ct-merch-image">
        <img src={main} alt={group.title} loading="lazy" width={600} height={600} />
      </div>
      {srcs.length > 1 && (
        <ul className="ct-merch-thumbs">
          {srcs.map((s, i) => (
            <li key={s}>
              <button
                type="button"
                aria-label={`${group.title} photo ${i + 1}`}
                className={i === idx ? "is-active" : undefined}
                onClick={() => setIdx(i)}
              >
                <img src={s} alt="" loading="lazy" width={48} height={48} />
              </button>
            </li>
          ))}
        </ul>
      )}
      <h3 className="ct-merch-title">{group.title}</h3>
      <p className="ct-merch-price">{money(v.price_cents)}</p>
      {group.variants.length > 1 && (
        <label className="ct-merch-variant">
          Color
          <select value={variantId} onChange={(e) => setVariantId(e.target.value)}>
            {group.variants.map((x) => (
              <option key={x.id} value={x.id}>
                {x.variant_label}
              </option>
            ))}
          </select>
        </label>
      )}
      <button
        type="button"
        className="ct-merch-add"
        onClick={() =>
          add({
            artworkId: v.id,
            printOptionId: null,
            kind: "merchandise",
            label: v.variant_label ? `${v.title} — ${v.variant_label}` : v.title,
            priceCents: v.price_cents,
            imageUrl: v.image_url,
            quantity: 1,
          })
        }
      >
        Add to cart
      </button>
    </li>
  );
}

function DesignYourOwn({ groups, artworks }: { groups: Group[]; artworks: Artwork[] }) {
  const { add } = useCart();
  const templates = CATEGORIES.map((c) => ({ ...c, group: groups.find((g) => g.category === c.key) })).filter(
    (c) => c.group,
  );
  const [cat, setCat] = useState(templates[0]?.key ?? "");
  const group = templates.find((t) => t.key === cat)?.group;
  const [variantId, setVariantId] = useState<string>("");
  const [artId, setArtId] = useState<string>(artworks[0]?.id ?? "");
  if (!group || !artworks.length) return null;
  const v = group.variants.find((x) => x.id === variantId) ?? group.variants[0]!;
  const art = artworks.find((a) => a.id === artId) ?? artworks[0]!;
  const SINGULAR: Record<string, string> = { scarf: "Scarf", tote: "Tote bag", notebook: "Notebook" };
  const itemName = SINGULAR[cat] ?? "Item";
  return (
    <section className="ct-merch-section ct-diy">
      <h3 className="ct-merch-heading">Design your own</h3>
      <p className="ct-page-lead">Choose an item and any painting — we print it to order just for you.</p>
      <div className="ct-diy-layout">
        <div className="ct-merch-image ct-diy-preview">
          <img src={art.image_url} alt={art.title} width={600} height={600} />
        </div>
        <div className="ct-diy-controls">
          <label className="ct-merch-variant">
            Item
            <select value={cat} onChange={(e) => { setCat(e.target.value); setVariantId(""); }}>
              {templates.map((t) => (
                <option key={t.key} value={t.key}>{SINGULAR[t.key] ?? t.label}</option>
              ))}
            </select>
          </label>
          {group.variants.length > 1 && (
            <label className="ct-merch-variant">
              Color
              <select value={v.id} onChange={(e) => setVariantId(e.target.value)}>
                {group.variants.map((x) => (
                  <option key={x.id} value={x.id}>{x.variant_label}</option>
                ))}
              </select>
            </label>
          )}
          <label className="ct-merch-variant">
            Painting
            <select value={art.id} onChange={(e) => setArtId(e.target.value)}>
              {artworks.map((a) => (
                <option key={a.id} value={a.id}>{a.title}</option>
              ))}
            </select>
          </label>
          <ul className="ct-diy-thumbs">
            {artworks.map((a) => (
              <li key={a.id}>
                <button
                  type="button"
                  aria-label={a.title}
                  aria-pressed={a.id === art.id}
                  className={a.id === art.id ? "is-active" : undefined}
                  onClick={() => setArtId(a.id)}
                >
                  <img src={a.image_url} alt="" loading="lazy" width={80} height={80} />
                </button>
              </li>
            ))}
          </ul>
          <p className="ct-merch-price">{money(v.price_cents)}</p>
          <button
            type="button"
            className="ct-merch-add"
            onClick={() =>
              add({
                artworkId: v.id,
                printOptionId: art.id,
                kind: "custom",
                label: `${itemName} — ${art.title}${v.variant_label ? ` (${v.variant_label})` : ""}`,
                priceCents: v.price_cents,
                imageUrl: art.image_url,
                quantity: 1,
              })
            }
          >
            Add to cart
          </button>
        </div>
      </div>
    </section>
  );
}

function ShopPage() {
  const loaded = Route.useLoaderData() as unknown;
  // Tolerate the older array-only loader shape (e.g. cached data during reloads).
  const merch: MerchProduct[] = Array.isArray(loaded) ? loaded : ((loaded as any)?.merch ?? []);
  const artworks: Artwork[] = Array.isArray(loaded) ? [] : ((loaded as any)?.artworks ?? []);
  const groups = groupProducts(merch);
  const photos: Record<string, MerchImage[]> = (loaded as any)?.photos ?? {};
  return (
    <div className="ct-page">
      <SiteHeader />
      <PaymentTestModeBanner />
      <main className="ct-page-main">
        <h2 className="ct-page-title">Merchandise</h2>
        <p className="ct-page-lead">Printed to order and shipped directly to you.</p>
        {CATEGORIES.map((c) => {
          const items = groups.filter((g) => g.category === c.key);
          if (!items.length) return null;
          return (
            <section key={c.key} className="ct-merch-section">
              <h3 className="ct-merch-heading">{c.label}</h3>
              <ul className="ct-merch-grid">
                {items.map((g) => (
                  <ProductCard key={g.productId} group={g} photos={photos[g.productId] ?? []} />
                ))}
              </ul>
            </section>
          );
        })}
        <DesignYourOwn groups={groups} artworks={artworks} />
      </main>
      <SiteFooter />
    </div>
  );
}
