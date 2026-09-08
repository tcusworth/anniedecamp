import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

const title = "About — Annie DeCamp";
const description =
  "Biography and practice of the painter Annie DeCamp: portraiture, memory, collective identity, and exhibitions in institutions worldwide.";

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

const BLOCKS = [
  {
    heading: "Practice",
    body: "Annie DeCamp is a French artist based in Los Angeles. Working primarily in painting, she builds large-scale figures from washes of acrylic laid over saturated grounds, letting colour bleed at the edges so that each portrait holds both presence and disappearance.",
  },
  {
    heading: "Subject",
    body: "Her paintings draw on found photographs, historical archives and personal images. Groups of children, dancers, brides and swimmers recur — figures caught between an assigned role and an inner life that refuses it.",
  },
  {
    heading: "Method",
    body: "Alongside painting she works in sculpture, works on paper and stained glass, including a commission for the doors of Notre-Dame de Paris. Colour is set first, drawing follows, and the figure emerges from what the ground already allows.",
  },
];

const INSTITUTIONS = [
  "Colby College Museum of Art",
  "Yuz Museum, Shanghai",
  "Collection Lambert, Avignon",
  "Museum of Contemporary Art, Long Beach",
  "Kunsthalle Bielefeld",
  "Notre-Dame de Paris",
];

const STATS = [
  { value: "2013", label: "First institutional solo exhibition" },
  { value: "40+", label: "Solo and group exhibitions" },
  { value: "12", label: "Museum collections worldwide" },
  { value: "2026", label: "Notre-Dame de Paris commission" },
];

function AboutPage() {
  return (
    <div className="ct-page">
      <SiteHeader />
      <main className="ct-page-main">
        <h2 className="ct-page-title">About</h2>

        <section className="ct-blocks" aria-label="Mission">
          {BLOCKS.map((b, i) => (
            <article key={b.heading} className="ct-block" style={{ ["--i" as string]: String(i) }}>
              <h3>{b.heading}</h3>
              <p>{b.body}</p>
            </article>
          ))}
        </section>

        <section className="ct-strip" aria-label="Institutions">
          <div className="ct-strip-track">
            {[...INSTITUTIONS, ...INSTITUTIONS].map((name, i) => (
              <span key={`${name}-${i}`}>{name}</span>
            ))}
          </div>
        </section>

        <section className="ct-stats" aria-label="In numbers">
          {STATS.map((s, i) => (
            <div key={s.label} className="ct-stat" style={{ ["--i" as string]: String(i) }}>
              <strong>{s.value}</strong>
              <span>{s.label}</span>
            </div>
          ))}
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
