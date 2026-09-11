import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

const title = "Press — Annie DeCamp";
const description =
  "Selected features, reviews, and interviews on Annie DeCamp and her mixed-media practice.";

export const Route = createFileRoute("/press")({
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
  component: PressPage,
});

type PressItem = {
  outlet: string;
  headline: string;
  date: string;
  kind: string;
  excerpt: string;
  href: string;
};

const PRESS: PressItem[] = [
  {
    outlet: "Aspen Times",
    headline: "Annie DeCamp charts the space between history and now",
    date: "August 2026",
    kind: "Feature",
    excerpt:
      "A profile on the Aspen-based artist whose mixed-media works layer past and present, tracing the stories we tell about belonging, memory, and place.",
    href: "#",
  },
  {
    outlet: "Denver Post",
    headline: "At the Crawford Hotel, a monumental portrait of Dana Crawford",
    date: "Spring 2026",
    kind: "Review",
    excerpt:
      "DeCamp's large-scale commission at Denver Union Station honours a pioneering preservationist — a study in public memory and civic portraiture.",
    href: "#",
  },
  {
    outlet: "Sculpture Magazine",
    headline: "Yard Art Contemporary brings the studio to the collector",
    date: "January 2026",
    kind: "Interview",
    excerpt:
      "On co-founding the Denver-based movement that places artists and collectors in intimate settings, and the platform it offers fellow artists.",
    href: "#",
  },
  {
    outlet: "Artforum Critics' Picks",
    headline: "Les Créatures at Almine Rech, Gstaad",
    date: "July 2026",
    kind: "Review",
    excerpt:
      "A critic's pick of the solo exhibition, noting the way disparate imagery opens onto multiple narratives within a single image.",
    href: "#",
  },
  {
    outlet: "5280 Magazine",
    headline: "Teaching, making, and the Colorado landscape",
    date: "October 2025",
    kind: "Profile",
    excerpt:
      "On a longtime arts educator's practice in the Denver area, and how the surrounding landscape continues to inform her exploration of the natural world.",
    href: "#",
  },
];

function PressPage() {
  return (
    <div className="ct-page">
      <SiteHeader />
      <main className="ct-page-main">
        <h2 className="ct-page-title">Press</h2>
        <p className="ct-page-lead">
          Selected features, reviews, and interviews on Annie DeCamp and her
          mixed-media practice. Links open the original coverage.
        </p>

        <section className="ct-press-section" aria-label="Press features">
          <h3 className="ct-where-heading">Features & reviews</h3>
          <ul className="ct-press-grid">
            {PRESS.map((item, i) => (
              <li
                key={`${item.outlet}-${i}`}
                className="ct-press-card"
                style={{ ["--i" as string]: String(i) }}
              >
                <div className="ct-press-card-meta">
                  <span className="ct-where-dates">{item.date}</span>
                  <span className="ct-where-kind">{item.kind}</span>
                </div>
                <strong className="ct-press-card-title">
                  {item.outlet} — {item.headline}
                </strong>
                <span className="ct-press-excerpt">{item.excerpt}</span>
                <a
                  className="ct-press-link"
                  href={item.href}
                  target={item.href.startsWith("http") ? "_blank" : undefined}
                  rel={item.href.startsWith("http") ? "noreferrer" : undefined}
                >
                  Read the {item.kind.toLowerCase()}
                </a>
              </li>
            ))}
          </ul>
        </section>

        <p className="ct-page-note">
          Press links are placeholders for now — send me the real article URLs
          and publication dates and I'll set them here.
        </p>
      </main>
      <SiteFooter />
    </div>
  );
}
