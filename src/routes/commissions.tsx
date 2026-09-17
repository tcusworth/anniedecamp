import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { submitCommissionRequest } from "@/lib/commissions.functions";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import franchesca from "@/assets/Franchesca_at_Night_oil_on_panel_framed_30x30.jpg.asset.json";

const title = "Commissions — Annie Decamp";
const description =
  "Commission an original painting from Annie Decamp. Share the subject, size, medium, budget and timing, and the studio will be in touch.";

export const Route = createFileRoute("/commissions")({
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
  component: CommissionsPage,
});

const SIZES = [
  "Small — up to 18 × 24 in",
  "Medium — up to 30 × 30 in",
  "Large — up to 48 × 48 in",
  "Oversized / architectural",
  "Not sure yet",
];

const MEDIUMS = ["Oil on panel", "Oil on canvas", "Oil on paper", "Mixed media", "Not sure yet"];

const BUDGETS = [
  "Under $2,500",
  "$2,500 – $5,000",
  "$5,000 – $10,000",
  "$10,000 and above",
  "Prefer to discuss",
];

function CommissionForm() {
  const send = useServerFn(submitCommissionRequest);
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
          phone: String(fd.get("phone") ?? ""),
          subject_matter: String(fd.get("subject_matter") ?? ""),
          preferred_size: String(fd.get("preferred_size") ?? ""),
          preferred_medium: String(fd.get("preferred_medium") ?? ""),
          budget_range: String(fd.get("budget_range") ?? ""),
          deadline: String(fd.get("deadline") ?? ""),
          details: String(fd.get("details") ?? ""),
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
          Thank you — your commission request has reached the studio. Annie will reply at the
          address you provided to discuss the work.
        </p>
        <button className="ct-press-btn" type="button" onClick={() => setStatus("idle")}>
          Send another request
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
          <span>Desired completion date</span>
          <input name="deadline" type="text" maxLength={100} placeholder="e.g. before December" />
        </label>
      </div>
      <label className="ct-field">
        <span>Subject of the commission</span>
        <input
          name="subject_matter"
          type="text"
          required
          maxLength={200}
          placeholder="e.g. portrait of my daughter, floral still life"
        />
      </label>
      <div className="ct-form-row">
        <label className="ct-field">
          <span>Preferred size</span>
          <select name="preferred_size" defaultValue="">
            <option value="">Select a size</option>
            {SIZES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
        <label className="ct-field">
          <span>Preferred medium</span>
          <select name="preferred_medium" defaultValue="">
            <option value="">Select a medium</option>
            {MEDIUMS.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </label>
      </div>
      <label className="ct-field">
        <span>Budget range</span>
        <select name="budget_range" defaultValue="">
          <option value="">Select a range</option>
          {BUDGETS.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </select>
      </label>
      <label className="ct-field">
        <span>Tell Annie about the commission</span>
        <textarea
          name="details"
          required
          rows={6}
          maxLength={2000}
          placeholder="Where the work will hang, colours and mood, reference photographs, anything else that matters."
        />
      </label>
      {error ? (
        <p className="ct-form-error" role="alert">
          {error}
        </p>
      ) : null}
      <button className="ct-press-btn" type="submit" disabled={status === "sending"}>
        {status === "sending" ? "Sending…" : "Send commission request"}
      </button>
    </form>
  );
}

function CommissionsPage() {
  return (
    <div className="ct-page">
      <SiteHeader />
      <main className="ct-page-main ct-press-spread">
        <header className="ct-press-head">
          <h2 className="ct-press-title">Commissions</h2>
          <p className="ct-press-head-note">
            Annie Decamp accepts a limited number of commissioned paintings each year — portraits,
            florals, and works made for a particular room. Share the details below and the studio
            will reply with availability, pricing, and timing.
          </p>
        </header>

        <article className="ct-press-lead" style={{ ["--i" as string]: "0" }}>
          <figure className="ct-press-lead-figure">
            <img
              src={franchesca.url}
              alt="Franchesca at Night, oil on panel, 30 × 30 in."
              loading="lazy"
            />
          </figure>
          <div className="ct-press-lead-text">
            <span className="ct-press-date">How it works</span>
            <h3 className="ct-press-lead-title">
              From conversation to <em>finished painting</em>
            </h3>
            <p className="ct-press-note">
              Every commission begins with a conversation about subject, scale, and setting. Annie
              then shares a proposal with pricing and a timeline. Work begins once a deposit is
              received, with progress images along the way, and the finished painting is delivered
              framed or ready to hang.
            </p>
          </div>
        </article>

        <blockquote className="ct-commission-quote" style={{ ["--i" as string]: "1" }}>
          <p>
            I love working on commissions because they invite me into someone else's world for a
            while.
          </p>
          <p>
            Creating a piece for another person begins with conversation — learning what they are
            drawn to, remember, love, and sometimes want a painting to hold for them.
          </p>
          <p>
            That process reflects something at the heart of my work: my enduring curiosity about
            people and the human experience. I have always been an observer of humanity — our
            histories, relationships, contradictions, tenderness, and humor.
          </p>
          <p>
            By the time a commission is finished, I often feel I have come to know the person in a
            way I might not have otherwise. A relationship develops alongside the artwork.
          </p>
          <p>
            Perhaps that is what I enjoy most. The finished painting belongs to the client, but the
            experience of making it becomes part of my story, too. A thread connects us, and I
            find that deeply meaningful.
          </p>
        </blockquote>

        <article className="ct-press-wide" style={{ ["--i" as string]: "2" }}>
          <span className="ct-press-date">Commission enquiry</span>
          <h3 className="ct-press-wide-title">Start a commission</h3>
          <div className="ct-press-wide-lede">
            <CommissionForm />
          </div>
        </article>

        <div className="ct-press-tail" aria-hidden="true" />
      </main>
      <SiteFooter />
    </div>
  );
}
