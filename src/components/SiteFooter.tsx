import { useState } from "react";
import { subscribeToNewsletter } from "@/lib/newsletter.functions";

const LINKS = [
  { label: "About", href: "/about" },
  { label: "Gallery", href: "/gallery" },
  { label: "Merchandise", href: "/shop" },
  { label: "Events & Exhibitions", href: "/where-to-see" },
  { label: "Studio", href: "/studio" },
  { label: "Press", href: "/press" },
  { label: "Commissions", href: "/commissions" },
  { label: "Contact", href: "/contact" },
];

const SOCIALS = [
  {
    label: "Instagram",
    href: "https://www.instagram.com/anniedecampart/",
    path: "M12 2.2c3.2 0 3.6 0 4.9.07 1.2.05 1.8.25 2.2.42.6.22 1 .48 1.4.9.42.4.68.8.9 1.4.17.4.37 1 .42 2.2.07 1.3.07 1.7.07 4.9s0 3.6-.07 4.9c-.05 1.2-.25 1.8-.42 2.2a3.6 3.6 0 0 1-.9 1.4c-.4.42-.8.68-1.4.9-.4.17-1 .37-2.2.42-1.3.07-1.7.07-4.9.07s-3.6 0-4.9-.07c-1.2-.05-1.8-.25-2.2-.42a3.6 3.6 0 0 1-1.4-.9 3.6 3.6 0 0 1-.9-1.4c-.17-.4-.37-1-.42-2.2C2.2 15.6 2.2 15.2 2.2 12s0-3.6.07-4.9c.05-1.2.25-1.8.42-2.2.22-.6.48-1 .9-1.4.4-.42.8-.68 1.4-.9.4-.17 1-.37 2.2-.42C8.4 2.2 8.8 2.2 12 2.2Zm0 3.4a6.4 6.4 0 1 0 0 12.8 6.4 6.4 0 0 0 0-12.8Zm0 2.2a4.2 4.2 0 1 1 0 8.4 4.2 4.2 0 0 1 0-8.4Zm6.6-2.4a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z",
  },
  {
    label: "Facebook",
    href: "https://www.facebook.com/",
    path: "M13.5 21v-8h2.7l.4-3.1h-3.1V7.9c0-.9.25-1.5 1.55-1.5H16.7V3.6c-.3-.04-1.3-.13-2.45-.13-2.43 0-4.1 1.48-4.1 4.2v2.23H7.4V13h2.75v8h3.35Z",
  },
  {
    label: "Email",
    href: "mailto:studio@anniedecampart.com",
    path: "M3 5h18a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Zm9 8.1 8-5.1H4l8 5.1ZM4 17h16V9.6l-8 5.1-8-5.1V17Z",
  },
];

export function SiteFooter() {
  return (
    <footer className="ct-sitefooter">
      <div className="ct-sitefooter-inner">
        <nav className="ct-sitefooter-links" aria-label="Footer">
          {LINKS.map((l) => (
            <a key={l.label} href={l.href}>
              {l.label}
            </a>
          ))}
        </nav>

        <ul className="ct-sitefooter-social">
          {SOCIALS.map((s) => (
            <li key={s.label}>
              <a href={s.href} aria-label={s.label} rel="noreferrer">
                <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                  <path d={s.path} fill="currentColor" />
                </svg>
              </a>
            </li>
          ))}
        </ul>

        <NewsletterSignup />

        <p className="ct-sitefooter-copy">
          © {new Date().getFullYear()} Annie Decamp. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setState("sending");
    const result = await subscribeToNewsletter({ data: { email, source: "footer" } });
    if ("error" in result) {
      setState("error");
      setMessage(result.error);
      return;
    }
    setState("done");
    setEmail("");
  }

  if (state === "done") {
    return (
      <p className="ct-newsletter-done">Thank you — you are on the studio mailing list.</p>
    );
  }

  return (
    <form className="ct-newsletter" onSubmit={onSubmit}>
      <label htmlFor="ct-newsletter-email">Studio mailing list</label>
      <div className="ct-newsletter-row">
        <input
          id="ct-newsletter-email"
          type="email"
          required
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button type="submit" disabled={state === "sending"}>
          {state === "sending" ? "Joining…" : "Join"}
        </button>
      </div>
      {state === "error" && <p className="ct-newsletter-error">{message}</p>}
    </form>
  );
}
