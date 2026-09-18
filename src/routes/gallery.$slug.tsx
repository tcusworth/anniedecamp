import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { PaymentTestModeBanner } from "@/components/PaymentTestModeBanner";
import { getArtworkBySlug } from "@/lib/shop.functions";
import { useCart, money } from "@/lib/cart";

const SITE = "https://anniedecampart.com";

export const Route = createFileRoute("/gallery/$slug")({
  loader: async ({ params }) => {
    const artwork = await getArtworkBySlug({ data: { slug: params.slug } });
    if (!artwork) throw notFound();
    return { artwork };
  },
  head: ({ params, loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Unavailable — Annie Decamp Art" }, { name: "robots", content: "noindex" }],
      };
    }
    const w = loaderData.artwork;
    const title = `${w.title} — Annie Decamp Art`;
    const description =
      w.description?.slice(0, 180) ||
      `${w.title}${w.medium ? `, ${w.medium}` : ""}${w.dimensions ? `, ${w.dimensions}` : ""} by Annie Decamp.`;
    const url = `${SITE}/gallery/${params.slug}`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "article" },
        { property: "og:url", content: url },
        { name: "twitter:card", content: "summary_large_image" },
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "VisualArtwork",
            name: w.title,
            artform: w.medium ?? undefined,
            dateCreated: w.year ?? undefined,
            creator: { "@type": "Person", name: "Annie Decamp" },
            url,
          }),
        },
      ],
    };
  },
  notFoundComponent: ArtworkNotFound,
  component: ArtworkPage,
});

function ArtworkNotFound() {
  return (
    <div className="ct-page">
      <SiteHeader />
      <main className="ct-page-main">
        <h2 className="ct-page-title">Work not found</h2>
        <p className="ct-page-lead">
          That piece is no longer listed. <Link to="/gallery">Back to the gallery</Link>.
        </p>
      </main>
      <SiteFooter />
    </div>
  );
}

function ArtworkPage() {
  const { artwork: w } = Route.useLoaderData();
  const { add, items } = useCart();
  const [added, setAdded] = useState(false);
  const prints = w.print_options.filter((p) => p.kind !== "merchandise");
  const inCart = (optionId: string | null) =>
    items.some((i) => i.artworkId === w.id && (i.printOptionId ?? null) === optionId);

  return (
    <div className="ct-page">
      <SiteHeader />
      <PaymentTestModeBanner />
      <main className="ct-page-main">
        <p className="ct-work-breadcrumb">
          <Link to="/gallery">Gallery</Link> <span aria-hidden="true">/</span> {w.title}
        </p>

        <div className="ct-work-detail">
          <figure className="ct-work-detail-image">
            <img
              src={w.image_url}
              alt={`${w.title}, ${w.medium ?? "mixed media"} by Annie Decamp`}
              width={1400}
              height={1100}
            />
            {!w.original_available && (
              <span className="ct-work-sold" aria-label="Original sold">
                Sold
              </span>
            )}
          </figure>

          <div className="ct-work-detail-info">
            <h2 className="ct-page-title">{w.title}</h2>
            <p className="ct-work-meta">
              {[w.year, w.medium, w.dimensions].filter(Boolean).join(" — ")}
            </p>
            {w.description && <p className="ct-work-detail-text">{w.description}</p>}

            <div className="ct-buy-panel">
              <div className="ct-buy-row">
                <span className="ct-buy-label">Original{w.dimensions ? ` — ${w.dimensions}` : ""}</span>
                {w.original_available && w.original_price_cents ? (
                  <button
                    type="button"
                    disabled={inCart(null)}
                    onClick={() => {
                      add({
                        artworkId: w.id,
                        printOptionId: null,
                        kind: "original",
                        label: `${w.title} (original)`,
                        priceCents: w.original_price_cents!,
                        imageUrl: w.image_url,
                        quantity: 1,
                      });
                      setAdded(true);
                    }}
                  >
                    {inCart(null) ? "In cart" : `${money(w.original_price_cents)} · Add`}
                  </button>
                ) : (
                  <span className="ct-buy-sold">Sold</span>
                )}
              </div>

              {prints.map((p) => (
                <div key={p.id} className="ct-buy-row">
                  <span className="ct-buy-label">{p.label}</span>
                  <button
                    type="button"
                    onClick={() => {
                      add({
                        artworkId: w.id,
                        printOptionId: p.id,
                        kind: "print",
                        label: `${w.title} — ${p.label}`,
                        priceCents: p.price_cents,
                        imageUrl: w.image_url,
                        quantity: 1,
                      });
                      setAdded(true);
                    }}
                  >
                    {money(p.price_cents)} · Add
                  </button>
                </div>
              ))}
            </div>

            {added && <p className="ct-work-detail-note">Added to your cart.</p>}

            <p className="ct-work-detail-note">
              Enquiries about this piece, or a commission in the same spirit, are welcome through the{" "}
              <Link to="/contact">contact page</Link>.
            </p>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
