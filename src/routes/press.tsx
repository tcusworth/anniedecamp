import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import aspenTimes from "@/assets/press-aspen-times.jpg.asset.json";
import canvasRebel from "@/assets/press-canvas-rebel.jpg.asset.json";
import coloradoHomesSelfLove from "@/assets/press-colorado-homes-self-love.jpg.asset.json";
import coloradoHomesDivineBloom from "@/assets/press-colorado-homes-divine-bloom.jpg.asset.json";
import redBrick from "@/assets/press-red-brick.webp.asset.json";
import urbanLife from "@/assets/press-urban-life-wash-park.jpg.asset.json";
import vailDaily from "@/assets/press-vail-daily.png.asset.json";
import voyageDenver from "@/assets/press-voyage-denver.jpg.asset.json";

const title = "Publications — Annie Decamp";
const description =
  "Selected publications, features, reviews, and interviews on Annie Decamp and her mixed-media practice, with links to the original coverage.";

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
  image: { url: string };
  alt: string;
};

const PRESS_ITEMS: PressItem[] = [
  {
    outlet: "The Aspen Times",
    headline:
      "What They Said: Annie Decamp & Michael Dowling show together at Aspen's Red Brick Center",
    date: "Aspen, CO",
    kind: "Review",
    excerpt:
      "Decamp and Dowling show together at the Red Brick Center for the Arts in Aspen — a two-artist conversation across painting and mixed media.",
    href: "http://www.aspentimes.com/explore-summit/entertainment/what-they-said-annie-decamp-michael-dowling-show-together-at-aspens-red-brick-center/",
    image: aspenTimes,
    alt: "The Aspen Times masthead logo",
  },
  {
    outlet: "Colorado Homes & Lifestyles",
    headline: "Annie Decamp's Path to Self-Love",
    date: "July/Aug 2021",
    kind: "Feature",
    excerpt:
      "A feature on Decamp's studio practice and the journey toward a confident, singular voice — the magazine's Home of the Year issue.",
    href: "http://www.coloradohomesmag.com/annie-decamps-path-to-self-love/",
    image: coloradoHomesSelfLove,
    alt: "Colorado Homes & Lifestyles magazine cover, Home of the Year, July/August 2021",
  },
  {
    outlet: "Colorado Homes & Lifestyles",
    headline: "The Divine Bloom",
    date: "Mar/Apr 2022",
    kind: "Feature",
    excerpt:
      "The Mountain Issue spotlights Decamp's floral still lifes and the Colorado landscape that continues to inform her work.",
    href: "http://www.coloradohomesmag.com/the-divine-bloom/",
    image: coloradoHomesDivineBloom,
    alt: "Colorado Homes & Lifestyles magazine cover, The Mountain Issue, March/April 2022",
  },
  {
    outlet: "CanvasRebel",
    headline: "What if you hadn't pursued a creative path?",
    date: "Interview",
    kind: "Interview",
    excerpt:
      "Decamp speaks with CanvasRebel about the road not taken, creative risk, and a life built around making art.",
    href: "https://www.canvasrebel.com/what-if-you-hadnt-pursued-a-creative-path-27/",
    image: canvasRebel,
    alt: "CanvasRebel logo",
  },
  {
    outlet: "Urban Life Wash Park",
    headline: "Feature: Annie Decamp",
    date: "Denver, CO",
    kind: "Feature",
    excerpt:
      "A neighborhood feature on Decamp as a Denver artist and educator, part of the magazine's Meet Your Neighbor series.",
    href: "https://urbanlifewashpark.com/feature/annie-decamp/",
    image: urbanLife,
    alt: "Urban Life Wash Park magazine covers grid",
  },
  {
    outlet: "VoyageDenver",
    headline: "Annie Decamp, featured by VoyageDenver",
    date: "Denver, CO",
    kind: "Profile",
    excerpt:
      "VoyageDenver's local-creatives series profiles Decamp's practice, teaching, and the Colorado arts community she helps build.",
    href: "http://www.voyagedenver.com/about-voyage-media/",
    image: voyageDenver,
    alt: "VoyageDenver logo over a photo collage",
  },
  {
    outlet: "Vail Daily",
    headline: "Art About People: Annie Decamp at the Colorado Snowsports Museum",
    date: "Vail, CO",
    kind: "Review",
    excerpt:
      "The Vail Daily on Decamp's exhibition at the Colorado Snowsports Museum — work the paper calls 'art about people.'",
    href: "http://www.vaildaily.com/entertainment/art-about-people-annie-decamp-shows-art-at-colorado-snowsports-museum/",
    image: vailDaily,
    alt: "Vail Daily masthead logo",
  },
  {
    outlet: "Red Brick Center for the Arts",
    headline: "Decamp & Dowling — Exhibition at the Red Brick",
    date: "Aspen, CO",
    kind: "Exhibition",
    excerpt:
      "Exhibition listing for the Decamp & Dowling two-person show at the Red Brick Center for the Arts in Aspen.",
    href: "https://www.redbrickaspen.com/events-art-exhibitions-calendar/decampdowling-necz2",
    image: redBrick,
    alt: "Red Brick Center for the Arts logo",
  },
];

const LEAD_INDEX = 0;

function ReadLink({ item }: { item: PressItem }) {
  const isHttp = item.href.startsWith("http");
  return (
    <a
      className="ct-press-read"
      href={item.href}
      target={isHttp ? "_blank" : undefined}
      rel={isHttp ? "noreferrer" : undefined}
    >
      Read the {item.kind.toLowerCase()} →
    </a>
  );
}

function PressPage() {
  const lead = PRESS_ITEMS[LEAD_INDEX]!;
  const rest = PRESS_ITEMS.filter((_, i) => i !== LEAD_INDEX);

  return (
    <div className="ct-page">
      <SiteHeader />
      <main className="ct-page-main ct-press-spread">
        <header className="ct-press-head">
          <h2 className="ct-press-title">Publications</h2>
          <p className="ct-press-head-note">
            Selected features, reviews, and interviews on Annie Decamp and her
            mixed-media practice. Links open the original coverage.
          </p>
        </header>

        {/* Lead featured item */}
        <article className="ct-press-lead" style={{ ["--i" as string]: "0" }}>
          <figure className="ct-press-lead-figure">
            <img src={lead.image.url} alt={lead.alt} loading="lazy" />
          </figure>
          <div className="ct-press-lead-text">
            <span className="ct-press-date">{lead.date}</span>
            <h3 className="ct-press-lead-title">
              {lead.outlet}: <em>{lead.headline}</em>
            </h3>
            <span className="ct-press-rule" aria-hidden="true" />
            <p className="ct-press-note">{lead.excerpt}</p>
            <ReadLink item={lead} />
          </div>
        </article>

        {/* Card grid of remaining items */}
        <div className="ct-press-grid">
          {rest.map((item, i) => (
            <article
              key={item.outlet + i}
              className="ct-press-card"
              style={{ ["--i" as string]: String(i + 1) }}
            >
              <figure className="ct-press-card-figure">
                <img src={item.image.url} alt={item.alt} loading="lazy" />
              </figure>
              <span className="ct-press-date">{item.date}</span>
              <h3 className="ct-press-card-title">
                {item.outlet}: <em>{item.headline}</em>
              </h3>
              <p className="ct-press-note">{item.excerpt}</p>
              <ReadLink item={item} />
            </article>
          ))}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
