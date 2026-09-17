import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

const title = "Events & Exhibitions — Annie Decamp Art";
const description =
  "Current and upcoming exhibitions, museum collections and permanent installations where paintings by Annie Decamp can be seen.";

export const Route = createFileRoute("/where-to-see")({
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

const EVENTS = [
  {
    dates: "Sept 24th",
    show: "Annie Decamp Art Show",
    venue: "Rogala Design, 395 S. Broadway, Denver, Suite # 118w",
    rsvp: "/rsvp",
  },
  {
    dates: "November 13–15",
    show: "Holiday Art Salon with Benjamin Stanford",
    venue: "100 N Gaylord Street, Denver CO 80206",
    rsvp: "/rsvp-salon",
  },
];

function NewsPage() {
  return (
    <div className="ct-page">
      <SiteHeader />
      <main className="ct-page-main">
        <h2 className="ct-page-title">Events & Exhibitions</h2>

        <section className="ct-where" aria-label="Coming up">
          <h3 className="ct-where-heading">Coming up</h3>
          <ul className="ct-where-list">
            {EVENTS.map((it, i) => (
              <li key={it.show} className="ct-where-row" style={{ ["--i" as string]: String(i) }}>
                <span className="ct-where-dates">{it.dates}</span>
                <span className="ct-where-main">
                  <strong>{it.show}</strong>
                  {it.venue ? <span>{it.venue}</span> : null}
                </span>
                {i === 0 ? (
                  <a className="ct-where-rsvp" href="/rsvp">
                    RSVP →
                  </a>
                ) : null}
              </li>
            ))}
          </ul>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
