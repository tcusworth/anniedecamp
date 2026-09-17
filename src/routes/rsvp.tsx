import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { submitEventSignup } from "@/lib/events.functions";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import brochureAsset from "@/assets/event-brochure-annie-decamp-art-show.jpeg.asset.json";

const title = "Annie Decamp Art Show — RSVP — Annie Decamp Art";
const description =
  "RSVP for the Annie Decamp Art Show, September 24, 4–7 pm at Rogala Design, Denver. New works by Annie Decamp with jewelry and textiles by Cornelia Lively.";

export const Route = createFileRoute("/rsvp")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { property: "og:image", content: `https://anniedecamp.lovable.app${brochureAsset.url}` },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: `https://anniedecamp.lovable.app${brochureAsset.url}` },
    ],
  }),
  component: RsvpPage,
});

const EVENT_SLUG = "annie-decamp-art-show-sept-24";

function RsvpForm() {
  const send = useServerFn(submitEventSignup);
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
          event_slug: EVENT_SLUG,
          name: String(fd.get("name") ?? ""),
          email: String(fd.get("email") ?? ""),
          phone: String(fd.get("phone") ?? ""),
          guests: Number(fd.get("guests") ?? 1),
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
          Thank you — your RSVP is confirmed. We look forward to seeing you on September 24th at
          Rogala Design. A confirmation has been sent to the email you provided.
        </p>
        <button className="ct-press-btn" type="button" onClick={() => setStatus("idle")}>
          Submit another RSVP
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
      <div className="ct-form-row">
        <label className="ct-field">
          <span>Telephone (optional)</span>
          <input name="phone" type="tel" maxLength={40} autoComplete="tel" />
        </label>
        <label className="ct-field">
          <span>Number of guests</span>
          <input name="guests" type="number" min={1} max={20} defaultValue={1} required />
        </label>
      </div>
      <label className="ct-field">
        <span>Message (optional)</span>
        <textarea
          name="message"
          rows={4}
          maxLength={2000}
          placeholder="Anything you'd like Annie to know before the show."
        />
      </label>
      {error ? (
        <p className="ct-form-error" role="alert">
          {error}
        </p>
      ) : null}
      <button className="ct-press-btn" type="submit" disabled={status === "sending"}>
        {status === "sending" ? "Sending…" : "RSVP to the Art Show"}
      </button>
    </form>
  );
}

function RsvpPage() {
  return (
    <div className="ct-page">
      <SiteHeader />
      <main className="ct-page-main ct-rsvp">
        <header className="ct-rsvp-head">
          <h2 className="ct-page-title">Annie Decamp Art Show</h2>
          <p className="ct-rsvp-subtitle">September 24 · 4–7 pm · Rogala Design, Denver</p>
        </header>

        <div className="ct-rsvp-body">
          <figure className="ct-rsvp-brochure">
            <img
              src={brochureAsset.url}
              alt="Invitation flyer for the Annie Decamp Art Show on September 24, featuring new works by Annie Decamp and jewelry and textiles by Cornelia Lively, at Rogala Design, Denver."
              loading="eager"
            />
          </figure>

          <section className="ct-rsvp-form-block">
            <div className="ct-rsvp-form-head">
              <span className="ct-press-date">You're invited</span>
              <h3 className="ct-press-wide-title">Reserve your spot</h3>
              <p className="ct-rsvp-details">
                New works by Annie Decamp, with jewelry and textiles by Cornelia Lively.
                Mocktails from Cool Cucumber will be provided. RSVP below to let us know you're
                coming.
              </p>
              <p className="ct-rsvp-where">
                <strong>When:</strong> September 24, 4–7 pm<br />
                <strong>Where:</strong> Rogala Design, 395 S. Broadway, Denver, Suite #118w
              </p>
            </div>
            <RsvpForm />
          </section>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
