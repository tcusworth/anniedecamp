import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { getPublishedArticle, listPublishedArticles } from "@/lib/news.functions";
import { NewsSidebar, formatDate } from "./news.index";

export const Route = createFileRoute("/news/$slug")({
  loader: async ({ params }) => {
    const [article, articles] = await Promise.all([
      getPublishedArticle({ data: { slug: params.slug } }),
      listPublishedArticles(),
    ]);
    if (!article) throw notFound();
    return { article, articles };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Unavailable — Annie Decamp" }, { name: "robots", content: "noindex" }],
      };
    }
    const t = `${loaderData.article.title} — Annie Decamp`;
    const d = loaderData.article.excerpt ?? "News from the studio of Annie Decamp.";
    return {
      meta: [
        { title: t },
        { name: "description", content: d },
        { property: "og:title", content: t },
        { property: "og:description", content: d },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  notFoundComponent: ArticleMissing,
  errorComponent: ArticleMissing,
  component: ArticlePage,
});

function ArticleMissing() {
  return (
    <div className="ct-page">
      <SiteHeader />
      <main className="ct-page-main">
        <h2 className="ct-page-title">Article not found</h2>
        <p className="ct-page-lead">
          That article is not available. <Link to="/news">Back to News</Link>.
        </p>
      </main>
      <SiteFooter />
    </div>
  );
}

function ArticlePage() {
  const { article, articles } = Route.useLoaderData();

  return (
    <div className="ct-page">
      <SiteHeader />
      <main className="ct-page-main ct-news-layout">
        <article className="ct-news-main ct-article">
          <span className="ct-news-date">{formatDate(article.published_at)}</span>
          <h2 className="ct-page-title">{article.title}</h2>
          {article.excerpt ? <p className="ct-page-lead">{article.excerpt}</p> : null}
          {article.cover_image_url ? (
            <figure className="ct-article-cover">
              <img src={article.cover_image_url} alt={article.title} loading="lazy" />
            </figure>
          ) : null}
          <div className="ct-article-body">
            {article.body
              .split(/\n{2,}/)
              .filter((p) => p.trim().length > 0)
              .map((p, i) => (
                <p key={i}>{p}</p>
              ))}
          </div>
          <Link className="ct-news-more" to="/news">
            All news
          </Link>
        </article>
        <NewsSidebar articles={articles} activeSlug={article.slug} />
      </main>
      <SiteFooter />
    </div>
  );
}
