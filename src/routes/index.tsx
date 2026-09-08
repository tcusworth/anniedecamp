import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { HomeSlideshow } from "@/components/HomeSlideshow";

const title = "Claire Tabouret - Home";
const description =
  "Claire Tabouret — official website of the artist. Works, biography, publications, press and news.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      {
        property: "og:image",
        content: "https://www.clairetabouret.com/files/media_high_953.jpg",
      },
      {
        name: "twitter:image",
        content: "https://www.clairetabouret.com/files/media_high_953.jpg",
      },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="ct-container">
      <SiteHeader />
      <div className="ct-content">
        <HomeSlideshow />
      </div>
      <footer className="ct-footer" />
    </div>
  );
}
