import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

const title = "Where to See the Work — Anne DeCamp";
const description =
  "Current and upcoming exhibitions, museum collections and permanent installations where paintings by Anne DeCamp can be seen.";

export const Route = createFileRoute("/news")({
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
  component: NewsPage,
});

const ON_VIEW = [
  {
    show: "Les Créatures",
    venue: "Almine Rech",
    place: "Gstaad, Switzerland",
    dates: "10 July – 3 September 2026",
    kind: "Solo exhibition",
  },
  {
    show: "Visages d’artistes",
    venue: "Petit Palais",
    place: "Paris, France",
    dates: "18 March – 19 July 2026",
    kind: "Group exhibition",
  },
  {
    show: "Dimanche Sans Fin",
    venue: "Centre Pompidou-Metz",
    place: "Metz, France",
    dates: "8 May 2025 – 2 February 2027",
    kind: "Group exhibition",
  },
];

const UPCOMING = [
  {
    show: "Ground First",
    venue: "Kunsthalle Bielefeld",
    place: "Bielefeld, Germany",
    dates: "Opening 14 November 2026",
    kind: "Solo exhibition",
  },
  {
    show: "Figures of Water",
    venue: "Museum of Contemporary Art",
    place: "Long Beach, California",
    dates: "Opening 6 February 2027",
    kind: "Group exhibition",
  },
];

const PERMANENT = [
  { venue: "Notre-Dame de Paris", place: "Paris, France", note: "Stained glass, permanent installation" },
  { venue: "Colby College Museum of Art", place: "Waterville, Maine", note: "Permanent collection" },
  { venue: "Yuz Museum", place: "Shanghai, China", note: "Permanent collection" },
  { venue: "Collection Lambert", place: "Avignon, France", note: "Permanent collection" },
];

function Listing({
  heading,
  items,
}: {
  heading: string;
  items: { show: string; venue: string; place: string; dates: string; kind: string }[];
}) {
  return (
    <section className="ct-where" aria-label={heading}>
      <h3 className="ct-where-heading">{heading}</h3>
      <ul className="ct-where-list">
        {items.map((it, i) => (
          <li key={it.show} className="ct-where-row" style={{ ["--i" as string]: String(i) }}>
            <span className="ct-where-dates">{it.dates}</span>
            <span className="ct-where-main">
              <strong>{it.show}</strong>
              <span>
                {it.venue}, {it.place}
              </span>
            </span>
            <span className="ct-where-kind">{it.kind}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function NewsPage() {
  return (
    <div className="ct-page">
      <SiteHeader />
      <main className="ct-page-main">
        <h2 className="ct-page-title">Where to see the work</h2>
        <p className="ct-page-lead">
          Exhibitions currently open, shows opening soon, and the institutions holding
          paintings by Anne DeCamp in their permanent collections.
        </p>

        <Listing heading="On view now" items={ON_VIEW} />
        <Listing heading="Upcoming" items={UPCOMING} />

        <section className="ct-where" aria-label="In collections">
          <h3 className="ct-where-heading">In collections</h3>
          <ul className="ct-where-list">
            {PERMANENT.map((p, i) => (
              <li key={p.venue} className="ct-where-row" style={{ ["--i" as string]: String(i) }}>
                <span className="ct-where-dates">Ongoing</span>
                <span className="ct-where-main">
                  <strong>{p.venue}</strong>
                  <span>{p.place}</span>
                </span>
                <span className="ct-where-kind">{p.note}</span>
              </li>
            ))}
          </ul>
        </section>

        <p className="ct-page-note">
          Exhibition dates are placeholders — send me the real schedule and I’ll set it here.
        </p>
      </main>
      <SiteFooter />
    </div>
  );
}
