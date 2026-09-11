import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { HomeSlideshow } from "@/components/HomeSlideshow";

const title = "Annie DeCamp - Home";
const description =
  "Annie DeCamp — official website of the artist. Works, biography, publications, press and news.";

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
        content: "/__l5e/assets-v1/538cd2e7-f081-452f-830f-2b4063a35140/Mexico_oil_on_panel_18x24.jpg",
      },
      {
        name: "twitter:image",
        content: "/__l5e/assets-v1/538cd2e7-f081-452f-830f-2b4063a35140/Mexico_oil_on_panel_18x24.jpg",
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
