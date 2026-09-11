import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import portrait from "@/assets/annie-decamp-portrait.webp.asset.json";

const title = "About — Annie DeCamp";
const description =
  "Annie DeCamp is a mixed-media artist based in Aspen, Colorado, whose work draws upon history, human nature, and the natural world.";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "profile" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AboutPage,
});

const PARAGRAPHS = [
  "Annie DeCamp is a mixed-media artist whose work draws upon history, human nature, and the natural world. Grounded in historical research and a deep curiosity about the relationship between people, animals, and place, her work moves between past and present, the joyful and the somber.",
  "An astute observer of human nature, DeCamp is interested in the stories we tell about ourselves—identity, memory, beauty, belonging, and the ways history continues to inhabit contemporary life. Her paintings and mixed-media works often bring together seemingly disparate imagery, inviting the viewer to discover multiple narratives and emotional truths within a single image.",
  "DeCamp's work is collected throughout Colorado, the United States, and internationally and has been exhibited in museums and galleries throughout Colorado.",
  "She has exhibited and curated exhibitions at the Red Brick Center for the Arts in Aspen and has completed commissions for public spaces throughout Colorado. Her large-scale mixed-media portrait of pioneering preservationist Dana Crawford is prominently installed in the Crawford Hotel at Denver Union Station.",
  "A longtime arts educator, DeCamp has taught extensively in the Denver area, both from her own studio and through educational institutions.",
  "She is also co-founder of Yard Art Contemporary, a Denver-based art movement created to bring artists and collectors together in intimate settings and to provide a platform for the work of fellow artists.",
  "DeCamp lives and works in Aspen, Colorado, where the surrounding landscape continues to inform her exploration of humanity's relationship with the natural world.",
];

const VENUES = [
  "Red Brick Center for the Arts, Aspen",
  "Crawford Hotel, Denver Union Station",
  "Yard Art Contemporary, Denver",
  "Museums and galleries throughout Colorado",
];

function AboutPage() {
  return (
    <div className="ct-page">
      <SiteHeader />
      <main className="ct-page-main">
        <h2 className="ct-page-title">About</h2>

        <section className="ct-bio" aria-label="Biography">
          <figure className="ct-bio-portrait">
            <img
              src={portrait.url}
              alt="Annie DeCamp in her Aspen studio, standing before one of her paintings"
            />
            <figcaption>Annie DeCamp in the studio</figcaption>
          </figure>
          <div className="ct-bio-text">
            {PARAGRAPHS.map((p, i) => (
              <p key={i} className="ct-bio-para" style={{ ["--i" as string]: String(i) }}>
                {p}
              </p>
            ))}
          </div>
        </section>

        <section className="ct-strip" aria-label="Venues">
          <div className="ct-strip-track">
            {[...VENUES, ...VENUES].map((name, i) => (
              <span key={`${name}-${i}`}>{name}</span>
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
