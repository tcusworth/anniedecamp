import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { submitStudioInquiry } from "@/lib/inquiries.functions";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import franchesca from "@/assets/Franchesca_at_Night_oil_on_panel_framed_30x30.jpg.asset.json";
import dreamer from "@/assets/Dreamer_oil_on_canvas_18x22.jpg.asset.json";
import pansies from "@/assets/Pansies_oil_on_panel_14x16.jpg.asset.json";

const title = "Studio — Annie Decamp Art";
const description =
  "Inside the studio of Annie Decamp: biography, working process, and how to contact the studio.";

export const Route = createFileRoute("/studio")({
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
  component: StudioPage,
});

const PROCESS = [
  {
    step: "01",
    title: "Research",
    body: "Every body of work begins in historical research — archives, photographs, and the stories we tell about ourselves.",
  },
  {
    step: "02",
    title: "Layering",
    body: "Seemingly disparate imagery is brought together on the panel, inviting multiple narratives within a single image.",
  },
  {
    step: "03",
    title: "Resolution",
    body: "Each painting is worked until past and present, the joyful and the somber, find their balance.",
  },
];

const CONTACTS = [
  { label: "Studio", value: "studio@annedecamp.com", href: "mailto:studio@annedecamp.com" },
  { label: "Press", value: "press@annedecamp.com", href: "mailto:press@annedecamp.com" },
  { label: "Telephone", value: "+1 (323) 555 0142", href: "tel:+13235550142" },
  { label: "Instagram", value: "@annedecamp", href: "https://www.instagram.com/annedecamp/" },
];

function InquiryForm() {
  const send = useServerFn(submitStudioInquiry);
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const fd = new FormData(form);
    setStatus("sending");
    setError(null);
    try {
      const result = await send({
        data: {
          name: String(fd.get("name") ?? ""),
          email: String(fd.get("email") ?? ""),
          subject: String(fd.get("subject") ?? ""),
          message: String(fd.get("message") ?? ""),
        },
      });
      if (result.ok) {
        setStatus("sent");
        form.reset();
      } else {
        setStatus("idle");
        setError(result.error);
      }
    } catch {
      setStatus("idle");
      setError("Please check the form and try again.");
    }
  }

  if (status === "sent") {
    return (
      <div className="ct-form-done" role="status">
        <p className="ct-press-wide-lede">
          Thank you — your message has reached the studio. You will receive a reply at the
          address you provided.
        </p>
        <button className="ct-press-btn" type="button" onClick={() => setStatus("idle")}>
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form className="ct-form" onSubmit={onSubmit} noValidate>
      <div className="ct-form-row">
        <label className="ct-field">
          <span>Name</span>
          <input name="name" type="text" required maxLength={100} autoComplete="name" />
        </label>
        <label className="ct-field">
          <span>Email</span>
          <input name="email" type="email" required maxLength={255} autoComplete="email" />
        </label>
      </div>
      <label className="ct-field">
        <span>Subject</span>
        <input name="subject" type="text" maxLength={150} />
      </label>
      <label className="ct-field">
        <span>Message</span>
        <textarea name="message" required rows={6} maxLength={2000} />
      </label>
      {error ? (
        <p className="ct-form-error" role="alert">
          {error}
        </p>
      ) : null}
      <button className="ct-press-btn" type="submit" disabled={status === "sending"}>
        {status === "sending" ? "Sending…" : "Send message"}
      </button>
    </form>
  );
}

function StudioPage() {
  return (
    <div className="ct-page">
      <SiteHeader />
      <main className="ct-page-main ct-press-spread">
        <header className="ct-press-head">
          <h2 className="ct-press-title">Studio</h2>
          <p className="ct-press-head-note">
            Biography, working process, and how to reach the studio of Annie Decamp.
          </p>
        </header>

        <div className="ct-press-mag">
          {/* Bio: featured large */}
          <article className="ct-press-featured" style={{ ["--i" as string]: "0" }}>
            <figure className="ct-press-figure ct-press-figure-lead">
              <img src={franchesca.url} alt="Franchesca at Night, oil on panel, 30 × 30 in." loading="lazy" />
            </figure>
            <span className="ct-press-date">Biography</span>
            <h3 className="ct-press-featured-title">
              Annie Decamp, <em>mixed-media artist</em>
            </h3>
            <span className="ct-press-rule" aria-hidden="true" />
            <p className="ct-press-note">
              Annie Decamp is a mixed-media artist whose work draws upon history, human
              nature, and the natural world. Grounded in historical research and a deep
              curiosity about the relationship between people, animals, and place, her
              work moves between past and present, the joyful and the somber. An astute
              observer of human nature, Decamp is interested in the stories we tell about
              ourselves — identity, memory, beauty, belonging, and the ways history
              continues to inhabit contemporary life.
            </p>
            <p className="ct-press-note">
              Her work is collected throughout Colorado, the United States, and
              internationally, and has been exhibited in museums and galleries throughout
              Colorado. She is co-founder of Yard Art Contemporary and lives and works in
              Aspen, Colorado. The full biography is on the <a href="/about">About page</a>.
            </p>
          </article>

          {/* Process: side column */}
          <article className="ct-press-side" style={{ ["--i" as string]: "1" }}>
            <span className="ct-press-date">Process</span>
            <h3 className="ct-press-side-title">
              In the studio: <em>three movements</em>
            </h3>
            <figure className="ct-press-figure ct-press-figure-tall">
              <img src={dreamer.url} alt="Dreamer, oil on canvas, 18 × 22 in." loading="lazy" />
            </figure>
            {PROCESS.map((p) => (
              <p key={p.step} className="ct-press-note">
                <strong>{p.step} — {p.title}.</strong> {p.body}
              </p>
            ))}
          </article>

          {/* Contact: wide band */}
          <article className="ct-press-wide" style={{ ["--i" as string]: "2" }}>
            <div className="ct-press-wide-text">
              <span className="ct-press-date">Contact</span>
              <h3 className="ct-press-wide-title">Reach the studio</h3>
              <p className="ct-press-wide-lede">
                For studio, exhibition, and press enquiries, please write to the studio.
                Messages are answered in the order received.
              </p>
              {CONTACTS.map((c) => (
                <p key={c.label} className="ct-press-wide-lede">
                  <strong>{c.label}:</strong> <a href={c.href}>{c.value}</a>
                </p>
              ))}
              <a className="ct-press-btn" href="/contact">
                Contact page
              </a>
            </div>
            <div className="ct-press-wide-cta">
              <h4 className="ct-form-title">Send an enquiry</h4>
              <InquiryForm />
              <figure className="ct-press-figure ct-press-figure-thumb">
                <img src={pansies.url} alt="Pansies, oil on panel, 14 × 16 in." loading="lazy" />
              </figure>
            </div>
          </article>
        </div>

        <div className="ct-press-tail" aria-hidden="true" />
      </main>
      <SiteFooter />
    </div>
  );
}
