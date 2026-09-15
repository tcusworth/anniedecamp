import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { listPublishedArticles, type ArticleSummary } from "@/lib/news.functions";

const title = "News — Annie Decamp";
const description =
  "Studio news, exhibition announcements and writing from the studio of Annie Decamp in Aspen, Colorado.";

export const Route = createFileRoute("/news/")({
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
  loader: () => listPublishedArticles(),
  errorComponent: () => (
    <div className="ct-page">
      <SiteHeader />
      <main className="ct-page-main">
        <h2 className="ct-page-title">News</h2>
        <p className="ct-page-lead">News could not be loaded. Please try again shortly.</p>
      </main>
      <SiteFooter />
    </div>
  ),
  component: NewsIndex,
});

export function formatDate(value: string | null) {
  if (!value) return "";
  return new Date(value).toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function NewsSidebar({
  articles,
  activeSlug,
}: {
  articles: ArticleSummary[];
  activeSlug?: string;
}) {
  return (
    <aside className="ct-news-sidebar" aria-label="All articles">
      <h3 className="ct-news-sidebar-title">All articles</h3>
      {articles.length === 0 ? (
        <p className="ct-news-empty">No articles yet.</p>
      ) : (
        <ul className="ct-news-sidebar-list">
          {articles.map((a) => (
            <li key={a.id} className={a.slug === activeSlug ? "is-active" : undefined}>
              <Link to="/news/$slug" params={{ slug: a.slug }}>
                <span className="ct-news-sidebar-date">{formatDate(a.published_at)}</span>
                <span className="ct-news-sidebar-link">{a.title}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </aside>
  );
}

function NewsIndex() {
  const articles = Route.useLoaderData();

  return (
    <div className="ct-page">
      <SiteHeader />
      <main className="ct-page-main ct-news-layout">
        <div className="ct-news-main">
          <h2 className="ct-page-title">News</h2>
          <p className="ct-page-lead">
            Writing from the studio: new work, exhibitions, and notes on process.
          </p>

          {articles.length === 0 ? (
            <p className="ct-news-empty">
              No articles have been published yet. Sign in to write the first one.
            </p>
          ) : (
            <ul className="ct-news-feed">
              {articles.map((a, i) => (
                <li key={a.id} className="ct-news-item" style={{ ["--i" as string]: String(i) }}>
                  <span className="ct-news-date">{formatDate(a.published_at)}</span>
                  <h3 className="ct-news-title">
                    <Link to="/news/$slug" params={{ slug: a.slug }}>
                      {a.title}
                    </Link>
                  </h3>
                  {a.excerpt ? <p className="ct-news-excerpt">{a.excerpt}</p> : null}
                  <Link className="ct-news-more" to="/news/$slug" params={{ slug: a.slug }}>
                    Read article
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
        <NewsSidebar articles={articles} />
      </main>
      <SiteFooter />
    </div>
  );
}
