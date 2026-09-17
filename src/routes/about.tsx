import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import portrait from "@/assets/annie-decamp-studio-hat.jpg.asset.json";
import childhoodPortrait from "@/assets/annie-decamp-childhood-cat.jpg.asset.json";

const title = "About — Annie Decamp Art";
const description =
  "Annie Decamp is a mixed-media artist based in Aspen, Colorado, whose work draws upon history, human nature, and the natural world.";

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
  "Annie Decamp is a mixed-media artist whose work draws upon history, human nature, and the natural world. Grounded in historical research and a deep curiosity about the relationship between people, animals, and place, her work moves between past and present, the joyful and the somber.",
  "An astute observer of human nature, Decamp is interested in the stories we tell about ourselves—identity, memory, beauty, belonging, and the ways history continues to inhabit contemporary life. Her paintings and mixed-media works often bring together seemingly disparate imagery, inviting the viewer to discover multiple narratives and emotional truths within a single image.",
  "Decamp's work is collected throughout Colorado, the United States, and internationally and has been exhibited in museums and galleries throughout Colorado.",
  "She has exhibited and curated exhibitions at the Red Brick Center for the Arts in Aspen and has completed commissions for public spaces throughout Colorado. Her large-scale mixed-media portrait of pioneering preservationist Dana Crawford is prominently installed in the Crawford Hotel at Denver Union Station.",
  "A longtime arts educator, Decamp has taught extensively in the Denver area, both from her own studio and through educational institutions.",
  "She is also co-founder of Yard Art Contemporary, a Denver-based art movement created to bring artists and collectors together in intimate settings and to provide a platform for the work of fellow artists.",
  "Decamp lives and works in Aspen, Colorado, where the surrounding landscape continues to inform her exploration of humanity's relationship with the natural world.",
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
              alt="Annie Decamp seated in her studio surrounded by paintings"
            />
            <figcaption>Annie in the studio</figcaption>
            <img
              className="ct-bio-portrait-2"
              src={childhoodPortrait.url}
              alt="A childhood photograph of Annie Decamp holding a cat in a garden"
            />
            <figcaption>Annie age 5</figcaption>
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

        <section className="ct-podcasts" aria-label="Podcasts">
          <h3 className="ct-podcasts-title">Podcasts</h3>
          <div className="ct-podcasts-list">
            <div className="ct-podcast-card">
              <iframe
                title="Ep. 075 — Annie Decamp, Mixed-Media Encaustic Painting"
                src="https://embed.podcasts.apple.com/au/podcast/ep-075-annie-decamp-mixed-media-encaustic-painting/id1488280246?i=1000517232856"
                loading="lazy"
                allow="autoplay *; encrypted-media *; clipboard-write"
                frameBorder="0"
                className="ct-podcast-iframe"
              />
            </div>
            <div className="ct-podcast-card">
              <iframe
                title="Ep. 160 — Annie Decamp, Painting, Mixed Media"
                src="https://www.buzzsprout.com/699271/episodes/13000271-ep-160-annie-decamp-painting-mixed-media?client_source=oembed&iframe=true"
                loading="lazy"
                scrolling="no"
                frameBorder="0"
                className="ct-podcast-iframe"
              />
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
