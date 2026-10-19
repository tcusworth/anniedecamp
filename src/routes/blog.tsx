import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { listPublishedArticles } from "@/lib/news.functions";
import { NewsSidebar, formatDate } from "./news.index";

const title = "Blog — Annie Decamp Art";
const description = "Notes from Annie Decamp’s studio: paintings, exhibitions, and reflections on making art.";

export const Route = createFileRoute("/blog")({
  staticData: { sitemap: true },
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
  errorComponent: BlogUnavailable,
  component: BlogPage,
});

function BlogUnavailable() {
  return (
    <div className="ct-page">
      <SiteHeader />
      <main className="ct-page-main">
        <h2 className="ct-page-title">Blog</h2>
        <p className="ct-page-lead">The blog could not be loaded. Please try again shortly.</p>
      </main>
      <SiteFooter />
    </div>
  );
}

function BlogPage() {
  const articles = Route.useLoaderData();

  return (
    <div className="ct-page">
      <SiteHeader />
      <main className="ct-page-main ct-news-layout">
        <div className="ct-news-main">
          <h2 className="ct-page-title">Blog</h2>
          <p className="ct-page-lead">Notes from the studio.</p>
          {articles.length === 0 ? (
            <p className="ct-news-empty">No posts yet.</p>
          ) : (
            <ul className="ct-news-feed">
              {articles.map((article) => (
                <li key={article.id} className="ct-news-item">
                  <span className="ct-news-date">{formatDate(article.published_at)}</span>
                  <h3 className="ct-news-title">
                    <Link to="/news/$slug" params={{ slug: article.slug }}>{article.title}</Link>
                  </h3>
                  {article.excerpt ? <p className="ct-news-excerpt">{article.excerpt}</p> : null}
                  <Link className="ct-news-more" to="/news/$slug" params={{ slug: article.slug }}>Read article</Link>
                </li>
              ))}
            </ul>
          )}
        </div>
        {articles.length > 0 ? <NewsSidebar articles={articles} /> : null}
      </main>
      <SiteFooter />
    </div>
  );
}