import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { supabase } from "@/integrations/supabase/client";
import {
  deleteArticle,
  getMyAdminStatus,
  listAllArticles,
  saveArticle,
  type Article,
} from "@/lib/news.functions";

export const Route = createFileRoute("/_authenticated/news-admin")({
  head: () => ({
    meta: [
      { title: "Write news — Annie Decamp Art" },
      { name: "description", content: "Write and publish news articles for the studio site." },
      { property: "og:title", content: "Write news — Annie Decamp Art" },
      { property: "og:description", content: "Write and publish news articles." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: NewsAdmin,
});

const EMPTY = {
  id: undefined as string | undefined,
  title: "",
  slug: "",
  excerpt: "",
  body: "",
  cover_image_url: "",
  published: false,
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
}

function NewsAdmin() {
  const navigate = useNavigate();
  const loadAll = useServerFn(listAllArticles);
  const save = useServerFn(saveArticle);
  const remove = useServerFn(deleteArticle);
  const checkAdmin = useServerFn(getMyAdminStatus);

  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [draft, setDraft] = useState({ ...EMPTY });
  const [slugTouched, setSlugTouched] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  async function refresh() {
    try {
      setArticles(await loadAll());
    } catch {
      setError("Could not load your articles.");
    }
  }

  useEffect(() => {
    void (async () => {
      const status = await checkAdmin();
      setIsAdmin(status.isAdmin);
      if (status.isAdmin) await refresh();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setNotice(null);
    const result = await save({
      data: {
        ...(draft.id ? { id: draft.id } : {}),
        title: draft.title,
        slug: draft.slug || slugify(draft.title),
        excerpt: draft.excerpt,
        body: draft.body,
        cover_image_url: draft.cover_image_url,
        published: draft.published,
      },
    }).catch((err: unknown) => ({
      ok: false as const,
      error: err instanceof Error ? err.message : "Save failed",
    }));
    setBusy(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setNotice(draft.published ? "Article published." : "Draft saved.");
    setDraft({ ...EMPTY });
    setSlugTouched(false);
    await refresh();
  }

  async function onDelete(id: string) {
    setBusy(true);
    await remove({ data: { id } });
    setBusy(false);
    if (draft.id === id) setDraft({ ...EMPTY });
    await refresh();
  }

  function edit(a: Article) {
    setDraft({
      id: a.id,
      title: a.title,
      slug: a.slug,
      excerpt: a.excerpt ?? "",
      body: a.body,
      cover_image_url: a.cover_image_url ?? "",
      published: a.published,
    });
    setSlugTouched(true);
    setNotice(null);
    setError(null);
  }

  if (isAdmin === false) {
    return (
      <div className="ct-page">
        <SiteHeader />
        <main className="ct-page-main">
          <h2 className="ct-page-title">Not authorised</h2>
          <p className="ct-page-lead">
            This account is not a studio admin. <Link to="/news">Back to News</Link>.
          </p>
        </main>
        <SiteFooter />
      </div>
    );
  }

  return (
    <div className="ct-page">
      <SiteHeader />
      <main className="ct-page-main ct-news-layout">
        <div className="ct-news-main">
          <h2 className="ct-page-title">Write news</h2>
          <p className="ct-page-lead">
            Write an article, save it as a draft, or publish it straight to the News page.
          </p>

          <form className="ct-form" onSubmit={onSubmit} noValidate>
            <label className="ct-field">
              <span>Title</span>
              <input
                type="text"
                value={draft.title}
                maxLength={200}
                required
                onChange={(e) => {
                  const title = e.target.value;
                  setDraft((d) => ({
                    ...d,
                    title,
                    slug: slugTouched ? d.slug : slugify(title),
                  }));
                }}
              />
            </label>
            <label className="ct-field">
              <span>Web address (slug)</span>
              <input
                type="text"
                value={draft.slug}
                maxLength={120}
                required
                onChange={(e) => {
                  setSlugTouched(true);
                  setDraft((d) => ({ ...d, slug: slugify(e.target.value) }));
                }}
              />
            </label>
            <label className="ct-field">
              <span>Summary</span>
              <input
                type="text"
                value={draft.excerpt}
                maxLength={400}
                onChange={(e) => setDraft((d) => ({ ...d, excerpt: e.target.value }))}
              />
            </label>
            <label className="ct-field">
              <span>Cover image address (optional)</span>
              <input
                type="url"
                value={draft.cover_image_url}
                maxLength={500}
                onChange={(e) => setDraft((d) => ({ ...d, cover_image_url: e.target.value }))}
              />
            </label>
            <label className="ct-field">
              <span>Article</span>
              <textarea
                rows={14}
                value={draft.body}
                maxLength={40000}
                onChange={(e) => setDraft((d) => ({ ...d, body: e.target.value }))}
              />
            </label>
            <label className="ct-check">
              <input
                type="checkbox"
                checked={draft.published}
                onChange={(e) => setDraft((d) => ({ ...d, published: e.target.checked }))}
              />
              <span>Publish this article</span>
            </label>
            {error ? (
              <p className="ct-form-error" role="alert">
                {error}
              </p>
            ) : null}
            {notice ? <p className="ct-page-note">{notice}</p> : null}
            <div className="ct-admin-actions">
              <button className="ct-press-btn" type="submit" disabled={busy}>
                {busy ? "Saving…" : draft.id ? "Update article" : "Save article"}
              </button>
              {draft.id ? (
                <button
                  className="ct-link-btn"
                  type="button"
                  onClick={() => {
                    setDraft({ ...EMPTY });
                    setSlugTouched(false);
                  }}
                >
                  New article
                </button>
              ) : null}
              <button
                className="ct-link-btn"
                type="button"
                onClick={async () => {
                  await supabase.auth.signOut();
                  await navigate({ to: "/news" });
                }}
              >
                Sign out
              </button>
            </div>
          </form>
        </div>

        <aside className="ct-news-sidebar" aria-label="Your articles">
          <h3 className="ct-news-sidebar-title">Your articles</h3>
          {articles.length === 0 ? (
            <p className="ct-news-empty">Nothing written yet.</p>
          ) : (
            <ul className="ct-news-sidebar-list">
              {articles.map((a) => (
                <li key={a.id}>
                  <button type="button" className="ct-link-btn" onClick={() => edit(a)}>
                    <span className="ct-news-sidebar-date">
                      {a.published ? "Published" : "Draft"}
                    </span>
                    <span className="ct-news-sidebar-link">{a.title}</span>
                  </button>
                  <button
                    type="button"
                    className="ct-link-btn ct-link-danger"
                    onClick={() => onDelete(a.id)}
                    disabled={busy}
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          )}
        </aside>
      </main>
      <SiteFooter />
    </div>
  );
}
