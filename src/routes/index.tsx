import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { HomeSlideshow } from "@/components/HomeSlideshow";

const title = "Annie Decamp - Home";
const description =
  "Annie Decamp — official website of the artist. Works, biography, publications, press and news.";

export const Route = createFileRoute("/")({
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
