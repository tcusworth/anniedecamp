import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

const title = "Contact — Annie Decamp Art";
const description =
  "Contact the studio of Annie Decamp: studio and press enquiries, telephone, and social channels.";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { property: "og:image", content: "https://anniedecampart.com/__l5e/assets-v1/7e151909-473f-4f4f-b601-7eefb2f7a557/home-IMG_3834.jpg" },
      { name: "twitter:image", content: "https://anniedecampart.com/__l5e/assets-v1/7e151909-473f-4f4f-b601-7eefb2f7a557/home-IMG_3834.jpg" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ContactPage,
});

const ROWS = [
  { label: "Studio", value: "studio@anniedecampart.com", href: "mailto:studio@anniedecampart.com" },
  { label: "Press inquiries", value: "lu@staskoagency.com", href: "mailto:lu@staskoagency.com" },
  { label: "Telephone", value: "650-391-8405", href: "tel:+16503918405" },
  { label: "Instagram", value: "@anniedecampart", href: "https://www.instagram.com/anniedecampart/" },
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
      </main>
      <SiteFooter />
    </div>
  );
}
