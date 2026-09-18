import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { submitEventSignup } from "@/lib/events.functions";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import flyerAsset from "@/assets/event-flyer-holiday-art-salon.jpeg.asset.json";

const title = "Holiday Art Salon — RSVP — Annie Decamp Art";
const description =
  "RSVP for the Holiday Art Salon with Annie Decamp & Ben Stanford, November 13–15 at 100 N Gaylord Street, Denver.";

export const Route = createFileRoute("/rsvp-salon")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { property: "og:image", content: `https://anniedecampart.com${flyerAsset.url}` },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: `https://anniedecampart.com${flyerAsset.url}` },
    ],
  }),
  component: RsvpSalonPage,
});

const EVENT_SLUG = "holiday-art-salon-nov-13-15";

const DAYS = [
  { value: "Friday, November 13 · 2:00 – 5:00 pm", label: "Friday, November 13", time: "2:00 – 5:00 pm" },
  { value: "Saturday, November 14 · noon – 9:00 pm", label: "Saturday, November 14", time: "noon – 9:00 pm" },
  { value: "Sunday, November 15 · noon – 4:00 pm", label: "Sunday, November 15", time: "noon – 4:00 pm" },
];

function RsvpSalonForm() {
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
          preferred_day: String(fd.get("preferred_day") ?? ""),
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
          Thank you — your RSVP is confirmed. We look forward to seeing you at the Holiday Art
          Salon. A confirmation has been sent to the email you provided.
        </p>
        <button className="ct-press-btn" type="button" onClick={() => setStatus("idle")}>
          Submit another RSVP
        </button>
      </div>
    );
  }

  return (
    <form className="ct-form" onSubmit={onSubmit} noValidate>
      <fieldset className="ct-field ct-rsvp-days">
        <span>Which day will you attend?</span>
        {DAYS.map((d) => (
          <label key={d.value} className="ct-rsvp-day">
            <input type="radio" name="preferred_day" value={d.value} required />
            <span>
              <strong>{d.label}</strong>
              <em>{d.time}</em>
            </span>
          </label>
        ))}
      </fieldset>
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
          placeholder="Anything you'd like us to know before the salon."
        />
      </label>
      {error ? (
        <p className="ct-form-error" role="alert">
          {error}
        </p>
      ) : null}
      <button className="ct-press-btn" type="submit" disabled={status === "sending"}>
        {status === "sending" ? "Sending…" : "RSVP to the Holiday Art Salon"}
      </button>
    </form>
  );
}

function RsvpSalonPage() {
  return (
    <div className="ct-page">
      <SiteHeader />
      <main className="ct-page-main ct-rsvp">
        <header className="ct-rsvp-head">
          <h2 className="ct-page-title">Holiday Art Salon</h2>
          <p className="ct-rsvp-subtitle">
            Annie Decamp &amp; Ben Stanford · November 13–15 · 100 N Gaylord Street, Denver
          </p>
        </header>

        <div className="ct-rsvp-body">
          <figure className="ct-rsvp-brochure">
            <img
              src={flyerAsset.url}
              alt="Flyer for the Holiday Art Salon with Annie Decamp and Ben Stanford, November 13–15 at 100 N Gaylord Street, Denver, surrounded by paintings."
              loading="eager"
            />
          </figure>

          <section className="ct-rsvp-form-block">
            <div className="ct-rsvp-form-head">
              <span className="ct-press-date">You're invited</span>
              <h3 className="ct-press-wide-title">Reserve your spot</h3>
              <p className="ct-rsvp-details">
                Three days of art with Annie Decamp and Ben Stanford. Choose the day you'd like to
                attend and RSVP below.
              </p>
              <p className="ct-rsvp-where">
                <strong>When:</strong> Nov 13, 2–5 pm · Nov 14, noon–9 pm · Nov 15, noon–4 pm
                <br />
                <strong>Where:</strong> 100 N Gaylord Street, Denver CO 80206
              </p>
            </div>
            <RsvpSalonForm />
          </section>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
