import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { ArtworkCheckout } from "@/components/ArtworkCheckout";
import { PaymentTestModeBanner } from "@/components/PaymentTestModeBanner";
import { listArtworks, type Artwork } from "@/lib/shop.functions";

const title = "Gallery — Annie DeCamp";
const description =
  "Selected works by Annie DeCamp, available as originals, fine art prints and studio merchandise.";

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

function money(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

type Selection = { artwork: Artwork; printOptionId: string | null; label: string };

function GalleryPage() {
  const artworks = Route.useLoaderData();
  const [open, setOpen] = useState<string | null>(null);
  const [checkout, setCheckout] = useState<Selection | null>(null);
  const [quantity, setQuantity] = useState(1);

  return (
    <div className="ct-page">
      <SiteHeader />
      <PaymentTestModeBanner />
      <main className="ct-page-main">
        <h2 className="ct-page-title">Gallery</h2>
        <p className="ct-page-lead">
          Selected works. Originals ship directly from the studio in Aspen; prints and
          merchandise are produced to order and shipped worldwide.
        </p>

        <section className="ct-gallery" aria-label="Works for sale">
          {artworks.map((w: Artwork, i: number) => (
            <figure key={w.id} className="ct-work" style={{ ["--i" as string]: String(i) }}>
              <div className="ct-work-frame">
                <img
                  src={w.image_url}
                  alt={`${w.title}, ${w.medium ?? "mixed media"} by Annie DeCamp`}
                  loading="lazy"
                  width={1200}
                  height={900}
                />
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
                  {w.print_options.length > 0 &&
                    ` · Prints from ${money(Math.min(...w.print_options.map((p) => p.price_cents)))}`}
                </span>
                <button
                  type="button"
                  className="ct-buy-toggle"
                  aria-expanded={open === w.id}
                  onClick={() => {
                    setOpen(open === w.id ? null : w.id);
                    setQuantity(1);
                  }}
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
                          onClick={() =>
                            setCheckout({
                              artwork: w,
                              printOptionId: null,
                              label: `${w.title} (original)`,
                            })
                          }
                        >
                          {money(w.original_price_cents)}
                        </button>
                      ) : (
                        <span className="ct-buy-sold">Sold</span>
                      )}
                    </div>

                    {w.print_options.map((p) => (
                      <div key={p.id} className="ct-buy-row">
                        <span className="ct-buy-label">{p.label}</span>
                        <button
                          type="button"
                          onClick={() =>
                            setCheckout({
                              artwork: w,
                              printOptionId: p.id,
                              label: `${w.title} — ${p.label}`,
                            })
                          }
                        >
                          {money(p.price_cents)}
                        </button>
                      </div>
                    ))}

                    <label className="ct-buy-qty">
                      Quantity (prints &amp; merchandise)
                      <input
                        type="number"
                        min={1}
                        max={10}
                        value={quantity}
                        onChange={(e) =>
                          setQuantity(Math.min(10, Math.max(1, Number(e.target.value) || 1)))
                        }
                      />
                    </label>
                  </div>
                )}
              </figcaption>
            </figure>
          ))}
        </section>

        <p className="ct-page-note">
          Shipping and any applicable sales tax are calculated at checkout. For viewing requests or
          commissions, please get in touch through the contact page.
        </p>
      </main>

      {checkout && (
        <ArtworkCheckout
          artworkId={checkout.artwork.id}
          printOptionId={checkout.printOptionId}
          quantity={checkout.printOptionId ? quantity : 1}
          title={checkout.label}
          onClose={() => setCheckout(null)}
        />
      )}

      <SiteFooter />
    </div>
  );
}
