import { useEffect, useRef, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { supabase } from "@/integrations/supabase/client";
import { getMyAdminStatus } from "@/lib/news.functions";
import {
  deleteArtwork,
  listAdminArtworks,
  saveArtwork,
  saveArtworksBulk,
  type AdminArtwork,
  type ArtworkInput,
} from "@/lib/artworks-admin.functions";
import { listEventSignups, type EventSignup } from "@/lib/rsvps-admin.functions";

const EVENT_NAMES: Record<string, string> = {
  "annie-decamp-art-show-sept-24": "Annie Decamp Art Show — Sept 24",
  "holiday-art-salon-nov-13-15": "Holiday Art Salon — Nov 13–15",
};

function formatWhen(value: string) {
  return new Date(value).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function RsvpDashboard({ rsvps }: { rsvps: EventSignup[] }) {
  const groups = new Map<string, EventSignup[]>();
  for (const r of rsvps) {
    const list = groups.get(r.event_slug) ?? [];
    list.push(r);
    groups.set(r.event_slug, list);
  }

  function downloadCsv() {
    const header = ["Event", "Name", "Email", "Phone", "Guests", "Day", "Message", "Received"];
    const rows = rsvps.map((r) => [
      EVENT_NAMES[r.event_slug] ?? r.event_slug,
      r.name,
      r.email,
      r.phone ?? "",
      String(r.guests),
      r.preferred_day ?? "",
      r.message ?? "",
      formatWhen(r.created_at),
    ]);
    const csv = [header, ...rows]
      .map((row) => row.map((c) => `"${c.replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "rsvps.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <section className="ct-admin-panel" aria-label="RSVPs">
      <h3 className="ct-gallery-section-title">RSVPs ({rsvps.length})</h3>
      {rsvps.length === 0 ? (
        <p className="ct-page-note">No RSVPs yet.</p>
      ) : (
        <>
          <p className="ct-page-note">
            <button type="button" className="ct-link-btn" onClick={downloadCsv}>
              Download as spreadsheet
            </button>
          </p>
          {[...groups.entries()].map(([slug, list]) => {
            const guests = list.reduce((sum, r) => sum + r.guests, 0);
            return (
              <div key={slug} className="ct-admin-rsvp-group">
                <h4 className="ct-admin-rsvp-title">
                  {EVENT_NAMES[slug] ?? slug} — {list.length} RSVP
                  {list.length === 1 ? "" : "s"}, {guests} guest{guests === 1 ? "" : "s"}
                </h4>
                <ul className="ct-admin-list">
                  {list.map((r) => (
                    <li key={r.id} className="ct-admin-row">
                      <div className="ct-admin-row-text">
                        <strong>
                          {r.name} · {r.guests} guest{r.guests === 1 ? "" : "s"}
                        </strong>
                        <span>
                          <a href={`mailto:${r.email}`}>{r.email}</a>
                          {r.phone ? ` · ${r.phone}` : ""}
                        </span>
                        {r.preferred_day ? <span>Attending: {r.preferred_day}</span> : null}
                        {r.message ? <span>“{r.message}”</span> : null}
                        <span>{formatWhen(r.created_at)}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </>
      )}
    </section>
  );
}

export const Route = createFileRoute("/_authenticated/artwork-admin")({
  head: () => ({
    meta: [
      { title: "Artwork admin — Annie Decamp Art" },
      { name: "description", content: "Upload and edit paintings for the Annie Decamp gallery." },
      { property: "og:title", content: "Artwork admin — Annie Decamp Art" },
      { property: "og:description", content: "Upload and edit paintings." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ArtworkAdmin,
});

type Draft = {
  id?: string;
  title: string;
  slug: string;
  year: string;
  medium: string;
  dimensions: string;
  description: string;
  image_url: string;
  price: string;
  original_available: boolean;
  sort_order: string;
};

const EMPTY: Draft = {
  title: "",
  slug: "",
  year: "",
  medium: "",
  dimensions: "",
  description: "",
  image_url: "",
  price: "",
  original_available: true,
  sort_order: "0",
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 140);
}

function titleCase(value: string) {
  return value.replace(/\b\w/g, (c) => c.toUpperCase());
}

/** "Bird Study, oil on canvas, 18x24.jpg" -> title / medium / dimensions */
function parseFileName(name: string) {
  const base = name.replace(/\.[^.]+$/, "").replace(/[_]+/g, " ").trim();
  const parts = base.split(",").map((p) => p.trim()).filter(Boolean);
  const title = titleCase((parts[0] ?? base).replace(/-+/g, " ")).trim();
  const rest = parts.slice(1);
  const dimPart = rest.find((p) => /\d\s*[x×]\s*\d/i.test(p)) ?? "";
  const medium = rest.filter((p) => p !== dimPart && !/^framed$/i.test(p)).join(", ");
  const dimensions = dimPart
    ? `${dimPart.replace(/\s*[x×]\s*/i, " × ").replace(/\s*(in|inches)$/i, "")} in`
    : "";
  return { title, medium, dimensions };
}

function centsFromPrice(value: string): number | null {
  const n = Number(value.replace(/[^0-9.]/g, ""));
  if (!value.trim() || Number.isNaN(n) || n <= 0) return null;
  return Math.round(n * 100);
}

function priceFromCents(cents: number | null) {
  return cents ? String(cents / 100) : "";
}

async function uploadFile(file: File, slug: string) {
  const ext = (file.name.split(".").pop() ?? "jpg").toLowerCase();
  const path = `${slug}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}.${ext}`;
  const { error } = await supabase.storage
    .from("artwork-images")
    .upload(path, file, { contentType: file.type || "image/jpeg", upsert: false });
  if (error) throw new Error(error.message);
  return `/api/public/artwork-image?path=${encodeURIComponent(path)}`;
}

function ArtworkAdmin() {
  const loadAll = useServerFn(listAdminArtworks);
  const save = useServerFn(saveArtwork);
  const saveBulk = useServerFn(saveArtworksBulk);
  const remove = useServerFn(deleteArtwork);
  const checkAdmin = useServerFn(getMyAdminStatus);

  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [artworks, setArtworks] = useState<AdminArtwork[]>([]);
  const [draft, setDraft] = useState<Draft>({ ...EMPTY });
  const [slugTouched, setSlugTouched] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [bulkProgress, setBulkProgress] = useState<string | null>(null);
  const [filter, setFilter] = useState("");
  const singleFileRef = useRef<HTMLInputElement>(null);
  const bulkFileRef = useRef<HTMLInputElement>(null);

  async function refresh() {
    try {
      setArtworks(await loadAll());
    } catch {
      setError("Could not load the artwork list.");
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

  async function onSingleFile(file: File) {
    setBusy(true);
    setError(null);
    try {
      const parsed = parseFileName(file.name);
      const slug = draft.slug || slugify(parsed.title || file.name);
      const url = await uploadFile(file, slug);
      setDraft((d) => ({
        ...d,
        image_url: url,
        title: d.title || parsed.title,
        slug: d.slug || slug,
        medium: d.medium || parsed.medium,
        dimensions: d.dimensions || parsed.dimensions,
      }));
      setNotice("Photo uploaded. Check the details, then save.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setBusy(false);
    }
  }

  async function onBulkFiles(files: File[]) {
    setBusy(true);
    setError(null);
    setNotice(null);
    const existing = new Set(artworks.map((a) => a.slug));
    const items: ArtworkInput[] = [];
    let base = Math.max(0, ...artworks.map((a) => a.sort_order)) + 1;
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i]!;
        setBulkProgress(`Uploading ${i + 1} of ${files.length}…`);
        const parsed = parseFileName(file.name);
        let slug = slugify(parsed.title || file.name) || `artwork-${Date.now()}-${i}`;
        while (existing.has(slug)) slug = `${slug}-2`;
        existing.add(slug);
        const image_url = await uploadFile(file, slug);
        items.push({
          title: parsed.title || slug,
          slug,
          year: "",
          medium: parsed.medium,
          dimensions: parsed.dimensions,
          description: "",
          image_url,
          original_price_cents: null,
          original_available: false,
          sort_order: base + i,
        });
      }
      setBulkProgress("Saving…");
      const result = await saveBulk({ data: { items } });
      if (!result.ok) {
        setError(result.error);
      } else {
        setNotice(
          `${result.inserted} painting${result.inserted === 1 ? "" : "s"} added. They start as sold/unavailable — edit any piece below to set a price and make it available.`,
        );
        await refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bulk upload failed.");
    } finally {
      setBulkProgress(null);
      setBusy(false);
      if (bulkFileRef.current) bulkFileRef.current.value = "";
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!draft.image_url) {
      setError("Add a photo (or an image address) before saving.");
      return;
    }
    setBusy(true);
    setError(null);
    setNotice(null);
    const result = await save({
      data: {
        ...(draft.id ? { id: draft.id } : {}),
        title: draft.title,
        slug: draft.slug || slugify(draft.title),
        year: draft.year,
        medium: draft.medium,
        dimensions: draft.dimensions,
        description: draft.description,
        image_url: draft.image_url,
        original_price_cents: centsFromPrice(draft.price),
        original_available: draft.original_available,
        sort_order: Number(draft.sort_order) || 0,
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
    setNotice(draft.id ? "Painting updated." : "Painting added.");
    setDraft({ ...EMPTY });
    setSlugTouched(false);
    if (singleFileRef.current) singleFileRef.current.value = "";
    await refresh();
  }

  function edit(a: AdminArtwork) {
    setDraft({
      id: a.id,
      title: a.title,
      slug: a.slug,
      year: a.year ?? "",
      medium: a.medium ?? "",
      dimensions: a.dimensions ?? "",
      description: a.description ?? "",
      image_url: a.image_url,
      price: priceFromCents(a.original_price_cents),
      original_available: a.original_available,
      sort_order: String(a.sort_order),
    });
    setSlugTouched(true);
    setError(null);
    setNotice(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function onDelete(a: AdminArtwork) {
    if (!window.confirm(`Delete “${a.title}”? This cannot be undone.`)) return;
    setBusy(true);
    const result = await remove({ data: { id: a.id } });
    setBusy(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    if (draft.id === a.id) setDraft({ ...EMPTY });
    await refresh();
  }

  if (isAdmin === false) {
    return (
      <div className="ct-page">
        <SiteHeader />
        <main className="ct-page-main">
          <h2 className="ct-page-title">Not authorised</h2>
          <p className="ct-page-lead">
            This account is not a studio admin. <Link to="/gallery">Back to the gallery</Link>.
          </p>
        </main>
        <SiteFooter />
      </div>
    );
  }

  const visible = artworks.filter((a) =>
    a.title.toLowerCase().includes(filter.trim().toLowerCase()),
  );

  return (
    <div className="ct-page">
      <SiteHeader />
      <main className="ct-page-main">
        <h2 className="ct-page-title">Artwork admin</h2>
        <p className="ct-page-lead">
          Upload one painting at a time with full details, drop a whole folder in at once, or edit
          anything already in the gallery.
        </p>

        <section className="ct-admin-panel" aria-label="Bulk upload">
          <h3 className="ct-gallery-section-title">Bulk upload</h3>
          <p className="ct-page-note">
            Select several photos at once. Titles, medium and size are read from the file names
            where possible (for example <em>Bird Study, oil on canvas, 18x24.jpg</em>). Every piece
            is added as sold/unavailable so nothing goes on sale by accident.
          </p>
          <input
            ref={bulkFileRef}
            type="file"
            accept="image/*"
            multiple
            disabled={busy}
            onChange={(e) => {
              const files = Array.from(e.target.files ?? []);
              if (files.length) void onBulkFiles(files);
            }}
          />
          {bulkProgress ? <p className="ct-page-note">{bulkProgress}</p> : null}
        </section>

        <section className="ct-admin-panel" aria-label="Add or edit a painting">
          <h3 className="ct-gallery-section-title">
            {draft.id ? "Edit painting" : "Add one painting"}
          </h3>
          <form className="ct-form" onSubmit={onSubmit} noValidate>
            <label className="ct-field">
              <span>Photo</span>
              <input
                ref={singleFileRef}
                type="file"
                accept="image/*"
                disabled={busy}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) void onSingleFile(file);
                }}
              />
            </label>
            {draft.image_url ? (
              <div className="ct-admin-preview">
                <img src={draft.image_url} alt="Selected painting" />
                <span>{draft.image_url}</span>
              </div>
            ) : null}
            <label className="ct-field">
              <span>Image address</span>
              <input
                type="text"
                value={draft.image_url}
                maxLength={600}
                onChange={(e) => setDraft((d) => ({ ...d, image_url: e.target.value }))}
              />
            </label>
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
                maxLength={140}
                required
                onChange={(e) => {
                  setSlugTouched(true);
                  setDraft((d) => ({ ...d, slug: slugify(e.target.value) }));
                }}
              />
            </label>
            <label className="ct-field">
              <span>Year</span>
              <input
                type="text"
                value={draft.year}
                maxLength={20}
                onChange={(e) => setDraft((d) => ({ ...d, year: e.target.value }))}
              />
            </label>
            <label className="ct-field">
              <span>Medium</span>
              <input
                type="text"
                value={draft.medium}
                maxLength={200}
                onChange={(e) => setDraft((d) => ({ ...d, medium: e.target.value }))}
              />
            </label>
            <label className="ct-field">
              <span>Size</span>
              <input
                type="text"
                value={draft.dimensions}
                maxLength={120}
                placeholder="18 × 24 in"
                onChange={(e) => setDraft((d) => ({ ...d, dimensions: e.target.value }))}
              />
            </label>
            <label className="ct-field">
              <span>Description</span>
              <textarea
                rows={5}
                value={draft.description}
                maxLength={4000}
                onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))}
              />
            </label>
            <label className="ct-field">
              <span>Price for the original (US dollars)</span>
              <input
                type="text"
                value={draft.price}
                placeholder="4800"
                onChange={(e) => setDraft((d) => ({ ...d, price: e.target.value }))}
              />
            </label>
            <label className="ct-field">
              <span>Order on the page</span>
              <input
                type="number"
                value={draft.sort_order}
                min={0}
                onChange={(e) => setDraft((d) => ({ ...d, sort_order: e.target.value }))}
              />
            </label>
            <label className="ct-check">
              <input
                type="checkbox"
                checked={draft.original_available}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, original_available: e.target.checked }))
                }
              />
              <span>Original is available to buy</span>
            </label>
            {error ? (
              <p className="ct-form-error" role="alert">
                {error}
              </p>
            ) : null}
            {notice ? <p className="ct-page-note">{notice}</p> : null}
            <div className="ct-admin-actions">
              <button className="ct-press-btn" type="submit" disabled={busy}>
                {busy ? "Saving…" : draft.id ? "Update painting" : "Add painting"}
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
                  New painting
                </button>
              ) : null}
            </div>
          </form>
        </section>

        <section className="ct-admin-panel" aria-label="All paintings">
          <h3 className="ct-gallery-section-title">All paintings ({artworks.length})</h3>
          <label className="ct-field">
            <span>Search by title</span>
            <input
              type="search"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Start typing…"
            />
          </label>
          <ul className="ct-admin-list">
            {visible.map((a) => (
              <li key={a.id} className="ct-admin-row">
                <img src={a.image_url} alt="" loading="lazy" />
                <div className="ct-admin-row-text">
                  <strong>{a.title}</strong>
                  <span>{[a.year, a.medium, a.dimensions].filter(Boolean).join(" — ")}</span>
                  <span>
                    {a.original_available
                      ? a.original_price_cents
                        ? `Available · $${(a.original_price_cents / 100).toLocaleString()}`
                        : "Available · no price set"
                      : "Sold"}
                  </span>
                </div>
                <div className="ct-admin-row-actions">
                  <button type="button" className="ct-link-btn" onClick={() => edit(a)}>
                    Edit
                  </button>
                  <button
                    type="button"
                    className="ct-link-btn ct-link-danger"
                    onClick={() => onDelete(a)}
                    disabled={busy}
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
