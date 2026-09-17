import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

const title = "Merchandise — Annie Decamp Art";
const description =
  "Studio merchandise by Annie Decamp — tote bags, scarves, tees, calendars, notebooks and more. Coming soon.";

export const Route = createFileRoute("/shop")({
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
  component: ShopPage,
});

const ITEMS = [
  "Tote bags",
  "Scarves",
  "Tees",
  "Calendars",
  "Notebooks",
  "And other cool stuff",
];

function ShopPage() {
  return (
    <div className="ct-page">
      <SiteHeader />
      <main className="ct-page-main ct-shop-coming-soon">
        <h2 className="ct-page-title">Merchandise</h2>
        <p className="ct-shop-soon-label">Coming Soon!</p>
        <ul className="ct-shop-list">
          {ITEMS.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </main>
      <SiteFooter />
    </div>
  );
}
