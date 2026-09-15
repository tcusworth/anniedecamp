import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { PaymentTestModeBanner } from "@/components/PaymentTestModeBanner";
import { listArtworks, type Artwork } from "@/lib/shop.functions";
import { useCart, money } from "@/lib/cart";

const title = "Merchandise — Annie Decamp";
const description =
  "Studio merchandise by Annie Decamp, including canvas tote bags printed with original artwork and shipped worldwide.";

export const Route = createFileRoute("/shop")({
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
  component: ShopPage,
});

function ShopPage() {
  const artworks = Route.useLoaderData();
  const { add } = useCart();

  const products = artworks.flatMap((w: Artwork) =>
    w.print_options
      .filter((p) => p.kind === "merchandise")
      .map((p) => ({ artwork: w, option: p })),
  );

  return (
    <div className="ct-page">
      <SiteHeader />
      <PaymentTestModeBanner />
      <main className="ct-page-main">
        <h2 className="ct-page-title">Merchandise</h2>
        <p className="ct-page-lead">
          Everyday objects printed with details from the paintings. Produced to order and shipped
          worldwide. Looking for a painting or a print? Visit the <a href="/gallery">gallery</a>.
        </p>

        <section className="ct-gallery" aria-label="Merchandise for sale">
          {products.map(({ artwork, option }, i) => (
            <figure key={option.id} className="ct-work" style={{ ["--i" as string]: String(i) }}>
              <div className="ct-work-frame">
                <img
                  src={artwork.image_url}
                  alt={`${option.label} featuring ${artwork.title} by Annie Decamp`}
                  loading="lazy"
                  width={1200}
                  height={900}
                />
              </div>
              <figcaption>
                <span className="ct-work-title">{option.label}</span>
                <span className="ct-work-meta">Featuring {artwork.title}</span>
                <span className="ct-work-price">{money(option.price_cents)}</span>
                <button
                  type="button"
                  className="ct-buy-toggle"
                  onClick={() =>
                    add({
                      artworkId: artwork.id,
                      printOptionId: option.id,
                      kind: "merchandise",
                      label: `${artwork.title} — ${option.label}`,
                      priceCents: option.price_cents,
                      imageUrl: artwork.image_url,
                      quantity: 1,
                    })
                  }
                >
                  Add to cart
                </button>
              </figcaption>
            </figure>
          ))}
        </section>

        <p className="ct-page-note">
          Shipping and any applicable sales tax are calculated at checkout.
        </p>
      </main>
      <SiteFooter />
    </div>
  );
}
