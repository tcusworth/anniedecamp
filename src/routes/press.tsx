import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import franchesca from "@/assets/Franchesca_at_Night_oil_on_panel_framed_30x30.jpg.asset.json";
import sideEye from "@/assets/17th_Century_Side_Eye_oil_on_canvas_framed_24x18.jpg.asset.json";
import meadow from "@/assets/In_the_Meadow_oil_on_panel_30x24.jpg.asset.json";
import vincent from "@/assets/Vincent_oil_on_paper_24x32.jpg.asset.json";
import pansies from "@/assets/Pansies_oil_on_panel_14x16.jpg.asset.json";

const title = "Press — Annie Decamp";
const description =
  "Selected features, reviews, and interviews on Annie Decamp and her mixed-media practice.";

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

const FEATURED: PressItem = {
  outlet: "Aspen Times",
  headline: "Annie Decamp charts the space between history and now",
  date: "August 2026",
  kind: "Feature",
  excerpt:
    "A profile on the Aspen-based artist whose mixed-media works layer past and present, tracing the stories we tell about belonging, memory, and place.",
  href: "#",
};

const SIDE: PressItem = {
  outlet: "Denver Post",
  headline: "At the Crawford Hotel, a monumental portrait of Dana Crawford",
  date: "Spring 2026",
  kind: "Review",
  excerpt:
    "Decamp's large-scale commission at Denver Union Station honours a pioneering preservationist — a study in public memory and civic portraiture.",
  href: "#",
};

const WIDE: PressItem = {
  outlet: "Sculpture Magazine",
  headline: "Yard Art Contemporary brings the studio to the collector",
  date: "January 2026",
  kind: "Interview",
  excerpt:
    "On co-founding the Denver-based movement that places artists and collectors in intimate settings, and the platform it offers fellow artists.",
  href: "#",
};

const SMALL: PressItem = {
  outlet: "Artforum",
  headline: "Les Créatures at Almine Rech, Gstaad",
  date: "July 2026",
  kind: "Critics' Picks",
  excerpt:
    "A critic's pick of the solo exhibition, noting the way disparate imagery opens onto multiple narratives within a single image.",
  href: "#",
};

const ANCHOR: PressItem = {
  outlet: "5280 Magazine",
  headline: "Teaching, making, and the Colorado landscape",
  date: "October 2025",
  kind: "Profile",
  excerpt:
    "On a longtime arts educator's practice in the Denver area, and how the surrounding landscape continues to inform her exploration of the natural world.",
  href: "#",
};

function ReadLink({ item, label }: { item: PressItem; label?: string }) {
  return (
    <a
      className="ct-press-read"
      href={item.href}
      target={item.href.startsWith("http") ? "_blank" : undefined}
      rel={item.href.startsWith("http") ? "noreferrer" : undefined}
    >
      {label ?? `Read the ${item.kind.toLowerCase()}`} →
    </a>
  );
}

function PressPage() {
  return (
    <div className="ct-page">
      <SiteHeader />
      <main className="ct-page-main ct-press-spread">
        <header className="ct-press-head">
          <h2 className="ct-press-title">Press</h2>
          <p className="ct-press-head-note">
            Selected features, reviews, and interviews on Annie Decamp and her
            mixed-media practice. Links open the original coverage.
          </p>
        </header>

        <div className="ct-press-mag">
          {/* Item 1: featured large */}
          <article className="ct-press-featured" style={{ ["--i" as string]: "0" }}>
            <figure className="ct-press-figure ct-press-figure-lead">
              <img src={franchesca.url} alt="Franchesca at Night, oil on panel, 30 × 30 in." loading="lazy" />
            </figure>
            <span className="ct-press-date">{FEATURED.date}</span>
            <h3 className="ct-press-featured-title">
              {FEATURED.outlet}: <em>{FEATURED.headline}</em>
            </h3>
            <span className="ct-press-rule" aria-hidden="true" />
            <ReadLink item={FEATURED} label="Read the feature" />
          </article>

          {/* Item 2: side item */}
          <article className="ct-press-side" style={{ ["--i" as string]: "1" }}>
            <span className="ct-press-date">{SIDE.date}</span>
            <h3 className="ct-press-side-title">
              {SIDE.outlet}: <em>{SIDE.headline}</em>
            </h3>
            <figure className="ct-press-figure ct-press-figure-tall">
              <img src={sideEye.url} alt="17th Century Side Eye, oil on canvas, 24 × 18 in." loading="lazy" />
            </figure>
            <p className="ct-press-note">{SIDE.excerpt}</p>
          </article>

          {/* Item 3: wide band */}
          <article className="ct-press-wide" style={{ ["--i" as string]: "2" }}>
            <div className="ct-press-wide-text">
              <span className="ct-press-date">{WIDE.date}</span>
              <h3 className="ct-press-wide-title">{WIDE.outlet}</h3>
              <p className="ct-press-wide-lede">
                {WIDE.headline} — {WIDE.excerpt}
              </p>
              <a
                className="ct-press-btn"
                href={WIDE.href}
                target={WIDE.href.startsWith("http") ? "_blank" : undefined}
                rel={WIDE.href.startsWith("http") ? "noreferrer" : undefined}
              >
                Full interview
              </a>
            </div>
            <div className="ct-press-wide-cta">
              <figure className="ct-press-figure ct-press-figure-pair">
                <img src={meadow.url} alt="In the Meadow, oil on panel, 30 × 24 in." loading="lazy" />
                <img src={vincent.url} alt="Vincent, oil on paper, 24 × 32 in." loading="lazy" />
              </figure>
            </div>
          </article>

          {/* Item 4: small text focus */}
          <article className="ct-press-small" style={{ ["--i" as string]: "3" }}>
            <span className="ct-press-date">{SMALL.date}</span>
            <h3 className="ct-press-small-title">{SMALL.outlet}</h3>
            <p className="ct-press-small-line">
              {SMALL.kind}: {SMALL.headline}. {SMALL.excerpt}
            </p>
            <ReadLink item={SMALL} label="Read the review" />
          </article>

          {/* Item 5: offset anchor */}
          <article className="ct-press-anchor" style={{ ["--i" as string]: "4" }}>
            <figure className="ct-press-figure ct-press-figure-thumb">
              <img src={pansies.url} alt="Pansies, oil on panel, 14 × 16 in." loading="lazy" />
            </figure>
            <div className="ct-press-anchor-text">
              <span className="ct-press-date">{ANCHOR.date}</span>
              <h3 className="ct-press-anchor-title">{ANCHOR.outlet}</h3>
              <p className="ct-press-anchor-line">
                {ANCHOR.kind}: {ANCHOR.headline}
              </p>
              <ReadLink item={ANCHOR} label="Read the profile" />
            </div>
          </article>
        </div>

        <div className="ct-press-tail" aria-hidden="true" />

        <p className="ct-page-note">
          Press links are placeholders for now — send me the real article URLs
          and publication dates and I'll set them here.
        </p>
      </main>
      <SiteFooter />
    </div>
  );
}
