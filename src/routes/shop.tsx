import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { PaymentTestModeBanner } from "@/components/PaymentTestModeBanner";
import { listMerchandise, type MerchProduct } from "@/lib/shop.functions";
import { useCart, money } from "@/lib/cart";

const title = "Merchandise — Annie Decamp Art";
const description =
  "Scarves, tote bags and notebooks featuring paintings by Annie Decamp, printed and shipped to order.";

export const Route = createFileRoute("/shop")({
  loader: () => listMerchandise(),
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

function ProductCard({ group }: { group: Group }) {
  const { add } = useCart();
  const [variantId, setVariantId] = useState(group.variants[0]!.id);
  const v = group.variants.find((x) => x.id === variantId) ?? group.variants[0]!;
  return (
    <li className="ct-merch-card">
      <div className="ct-merch-image">
        <img src={group.image} alt={group.title} loading="lazy" width={600} height={600} />
      </div>
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

function ShopPage() {
  const groups = groupProducts(Route.useLoaderData());
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
                  <ProductCard key={g.productId} group={g} />
                ))}
              </ul>
            </section>
          );
        })}
      </main>
      <SiteFooter />
    </div>
  );
}
