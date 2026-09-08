import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import work1 from "@/assets/work-1.jpg";
import work2 from "@/assets/work-2.jpg";
import work3 from "@/assets/work-3.jpg";

const title = "Gallery — Anne DeCamp";
const description =
  "Selected paintings by Anne DeCamp: large-scale figures built from translucent acrylic washes over saturated grounds.";

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
  component: GalleryPage,
});

const WORKS = [
  {
    src: work1,
    title: "The Assembly",
    meta: "2025 — Acrylic on canvas, 200 × 300 cm",
    alt: "Painting of five children standing frontally against a deep blue ground",
  },
  {
    src: "https://www.clairetabouret.com/files/media_high_953.jpg",
    title: "Les Créatures",
    meta: "2026 — Acrylic on canvas, 180 × 250 cm",
    alt: "Painting shown in Les Créatures at Almine Rech, Gstaad",
  },
  {
    src: work2,
    title: "Seated Figure (Orange)",
    meta: "2024 — Acrylic on canvas, 160 × 210 cm",
    alt: "Painting of a seated figure over a saturated orange ground",
  },
  {
    src: "https://www.clairetabouret.com/files/media_high_935.jpg",
    title: "Dimanche Sans Fin",
    meta: "2025 — Acrylic on canvas, 220 × 320 cm",
    alt: "Painting shown in Dimanche Sans Fin at Centre Pompidou-Metz",
  },
  {
    src: work3,
    title: "The Swimmers",
    meta: "2024 — Acrylic on canvas, 190 × 290 cm",
    alt: "Painting of swimmers in green water",
  },
  {
    src: "https://www.clairetabouret.com/files/media_high_952.jpeg",
    title: "Visages",
    meta: "2026 — Acrylic on canvas, 170 × 240 cm",
    alt: "Painting shown in Visages d’artistes at the Petit Palais, Paris",
  },
];

function GalleryPage() {
  return (
    <div className="ct-page">
      <SiteHeader />
      <main className="ct-page-main">
        <h2 className="ct-page-title">Gallery</h2>
        <p className="ct-page-lead">
          Selected paintings. Figures are laid in translucent washes over a colour ground
          set first, so that each work holds both presence and disappearance.
        </p>

        <section className="ct-gallery" aria-label="Selected works">
          {WORKS.map((w, i) => (
            <figure key={w.title} className="ct-work" style={{ ["--i" as string]: String(i) }}>
              <div className="ct-work-frame">
                <img src={w.src} alt={w.alt} loading="lazy" width={1200} height={900} />
              </div>
              <figcaption>
                <span className="ct-work-title">{w.title}</span>
                <span className="ct-work-meta">{w.meta}</span>
              </figcaption>
            </figure>
          ))}
        </section>

        <p className="ct-page-note">
          For availability and viewing requests, please get in touch through the contact page.
        </p>
      </main>
      <SiteFooter />
    </div>
  );
}
