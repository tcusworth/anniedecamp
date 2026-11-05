import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { HomeSlideshow } from "@/components/HomeSlideshow";

const title = "Annie Decamp Art";
const description =
  "Annie Decamp — official website of the artist. Works, biography, publications, press and news.";

export const Route = createFileRoute("/")({
  staticData: { sitemap: true },
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { property: "og:image", content: "https://anniedecampart.com/__l5e/assets-v1/ab433e76-743c-4258-90c4-d698b2097ede/home-IMG_3839.jpg" },
      { name: "twitter:image", content: "https://anniedecampart.com/__l5e/assets-v1/ab433e76-743c-4258-90c4-d698b2097ede/home-IMG_3839.jpg" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="ct-container">
      <SiteHeader />
      <div className="ct-content">
        <p className="ct-gallery-promo ct-home-promo">
          Use code ANNIE15 for 15% off original paintings — valid until December 31, 2026.
        </p>
        <HomeSlideshow />
      </div>
      <footer className="ct-footer" />
    </div>
  );
}
