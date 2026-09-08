import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

const title = "Contact — Claire Tabouret";
const description =
  "Contact the studio of Claire Tabouret: studio and press enquiries, telephone, and social channels.";

export const Route = createFileRoute("/contact")({
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
  component: ContactPage,
});

const ROWS = [
  { label: "Studio", value: "studio@clairetabouret.com", href: "mailto:studio@clairetabouret.com" },
  { label: "Press", value: "press@clairetabouret.com", href: "mailto:press@clairetabouret.com" },
  { label: "Telephone", value: "+1 (323) 555 0142", href: "tel:+13235550142" },
  { label: "Instagram", value: "@clairetabouret", href: "https://www.instagram.com/clairetabouret/" },
];

function ContactPage() {
  return (
    <div className="ct-page">
      <SiteHeader />
      <main className="ct-page-main">
        <h2 className="ct-page-title">Contact</h2>
        <p className="ct-page-lead">
          For studio, exhibition and press enquiries, please write to the studio. Messages are
          answered in the order received.
        </p>
        <dl className="ct-contact">
          {ROWS.map((r, i) => (
            <div key={r.label} className="ct-contact-row" style={{ ["--i" as string]: String(i) }}>
              <dt>{r.label}</dt>
              <dd>
                <a href={r.href}>{r.value}</a>
              </dd>
            </div>
          ))}
        </dl>
        <p className="ct-page-note">
          Studio address and telephone above are placeholders — send me the real details and I will
          put them in.
        </p>
      </main>
      <SiteFooter />
    </div>
  );
}
