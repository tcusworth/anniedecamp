import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { PaymentTestModeBanner } from "@/components/PaymentTestModeBanner";
import { listArtworks, type Artwork } from "@/lib/shop.functions";
import { useCart, money } from "@/lib/cart";

const title = "Gallery — Annie Decamp Art";
const description =
  "Selected paintings by Annie Decamp, available as one-of-a-kind originals and fine art prints.";

export const Route = createFileRoute("/gallery")({
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
  loader: () => listArtworks(),
  component: GalleryPage,
});

function GalleryPage() {
  const artworks = Route.useLoaderData();
  const [open, setOpen] = useState<string | null>(null);
  const { add, items } = useCart();

  const inCart = (artworkId: string, optionId: string | null) =>
    items.some((i) => i.artworkId === artworkId && (i.printOptionId ?? null) === optionId);

  return (
    <div className="ct-page">
      <SiteHeader />
      <PaymentTestModeBanner />
      <main className="ct-page-main">
        <h2 className="ct-page-title">Gallery</h2>
        <p className="ct-page-lead">
          Paintings and fine art prints. Originals ship directly from the studio in Aspen; prints
          are produced to order and shipped worldwide. Tote bags and other studio goods live on the{" "}
          <a href="/shop">merchandise page</a>.
        </p>

        {(() => {
          const availableWorks = artworks.filter((w: Artwork) => w.original_available);
          const purchasedWorks = artworks.filter((w: Artwork) => !w.original_available);
          const renderWork = (w: Artwork, i: number) => {
            const prints = w.print_options.filter((p) => p.kind !== "merchandise");
            return (
              <figure key={w.id} className="ct-work" style={{ ["--i" as string]: String(i) }}>
                <div className="ct-work-frame">
                  <img
                    src={w.image_url}
                    alt={`${w.title}, ${w.medium ?? "mixed media"} by Annie Decamp`}
                    loading="lazy"
                    width={1200}
                    height={900}
                  />
                  {!w.original_available && (
                    <span className="ct-work-sold" aria-label="Original sold">
                      Sold
                    </span>
                  )}
                </div>
                <figcaption>
                  <span className="ct-work-title">{w.title}</span>
                  <span className="ct-work-meta">
                    {[w.year, w.medium, w.dimensions].filter(Boolean).join(" — ")}
                  </span>
                  <span className="ct-work-price">
                    {w.original_available && w.original_price_cents
                      ? `Original ${money(w.original_price_cents)}`
                      : "Original sold"}
                    {prints.length > 0 &&
                      ` · Prints from ${money(Math.min(...prints.map((p) => p.price_cents)))}`}
                  </span>
                  <button
                    type="button"
                    className="ct-buy-toggle"
                    aria-expanded={open === w.id}
                    onClick={() => setOpen(open === w.id ? null : w.id)}
                  >
                    {open === w.id ? "Hide options" : "Purchase"}
                  </button>

                  {open === w.id && (
                    <div className="ct-buy-panel">
                      <div className="ct-buy-row">
                        <span className="ct-buy-label">Original — {w.dimensions}</span>
                        {w.original_available && w.original_price_cents ? (
                          <button
                            type="button"
                            disabled={inCart(w.id, null)}
                            onClick={() =>
                              add({
                                artworkId: w.id,
                                printOptionId: null,
                                kind: "original",
                                label: `${w.title} (original)`,
                                priceCents: w.original_price_cents!,
                                imageUrl: w.image_url,
                                quantity: 1,
                              })
                            }
                          >
                            {inCart(w.id, null)
                              ? "In cart"
                              : `${money(w.original_price_cents)} · Add`}
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
                            onClick={() =>
                              add({
                                artworkId: w.id,
                                printOptionId: p.id,
                                kind: "print",
                                label: `${w.title} — ${p.label}`,
                                priceCents: p.price_cents,
                                imageUrl: w.image_url,
                                quantity: 1,
                              })
                            }
                          >
                            {money(p.price_cents)} · Add
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </figcaption>
              </figure>
            );
          };
          return (
            <>
              {availableWorks.length > 0 && (
                <section className="ct-gallery" aria-label="Available Works">
                  <h3 className="ct-gallery-section-title">Available Works</h3>
                  <div className="ct-gallery-grid">
                    {availableWorks.map((w: Artwork, i: number) => renderWork(w, i))}
                  </div>
                </section>
              )}
              {purchasedWorks.length > 0 && (
                <section className="ct-gallery" aria-label="Purchased Works">
                  <h3 className="ct-gallery-section-title">Purchased Works</h3>
                  <div className="ct-gallery-grid">
                    {purchasedWorks.map((w: Artwork, i: number) => renderWork(w, i))}
                  </div>
                </section>
              )}
            </>
          );
        })()}

        <p className="ct-page-note">
          Shipping and any applicable sales tax are calculated at checkout. For viewing requests or
          commissions, please get in touch through the contact page.
        </p>
      </main>

      <SiteFooter />
    </div>
  );
}
