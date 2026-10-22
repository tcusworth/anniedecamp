import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { unexpectedWest as post } from "@/data/unexpected-west";
import birds from "@/assets/unexpected-west-figure-birds.jpeg.asset.json";
import interior from "@/assets/unexpected-west-interior.jpeg.asset.json";
import share from "@/assets/unexpected-west-share.jpg.asset.json";

export const Route = createFileRoute("/blog_/contemporary-western-art-modern-interiors")({
  staticData: { sitemap: true },
  head: () => ({
    meta: [
      { title: post.seoTitle },
      { name: "description", content: post.description },
      { property: "og:title", content: post.seoTitle },
      { property: "og:description", content: post.description },
      { property: "og:type", content: "article" },
      { property: "og:url", content: post.url },
      { property: "og:image", content: `https://anniedecampart.com${share.url}` },
      { name: "twitter:image", content: `https://anniedecampart.com${share.url}` },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: post.url }],
    scripts: [{
      type: "application/ld+json",
      children: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        headline: post.title,
        description: post.description,
        author: { "@type": "Person", name: "Annie Decamp", url: "https://anniedecampart.com/about" },
        image: `https://anniedecampart.com${share.url}`,
        datePublished: post.date,
        mainEntityOfPage: post.url,
      }),
    }],
  }),
  component: UnexpectedWestArticle,
});

function UnexpectedWestArticle() {
  return (
    <div className="ct-page">
      <SiteHeader />
      <main className="ct-journal">
        <Link to="/blog" className="ct-journal-back">← Back to Blog</Link>
        <article>
          <header className="ct-journal-heading">
            <p className="ct-journal-meta">Annie Decamp · <time dateTime={post.date}>October 22, 2026</time></p>
            <h1>{post.title}</h1>
            <p className="ct-journal-deck">{post.excerpt}</p>
          </header>
          <figure className="ct-journal-figure">
            <img src={post.image} width={1024} height={768} fetchPriority="high" alt="Annie Decamp painting of a seated figure beside a black bear, holding a hawk on a gloved hand." />
            <figcaption>A quiet encounter between a seated figure, a bear, and a hawk. Painting by Annie Decamp.</figcaption>
          </figure>
          <div className="ct-journal-text">
            <p>I've always loved the romance of the American West. The history, the characters, the animals, and perhaps most of all, the stories we tell ourselves about it.</p>
            <p>There is something wonderfully theatrical about the West. The clothing, the hats, the landscapes, and the larger-than-life personalities have become part of our collective imagination.</p>
            <p>But I'm equally interested in the West we remember, even when it never quite existed.</p>
            <p>In my paintings, I enjoy playing with these familiar images, sometimes honoring them, sometimes turning them slightly on their heads.</p>
            <h2>A Different Kind of Contemporary Western Art</h2>
            <p>Western art doesn't have to mean sweeping landscapes, galloping horses, or cowboys riding into the sunset. It can be quiet, curious, humorous, and even a little surreal.</p>
            <p>Lately, I've been exploring a new collection of contemporary Western paintings featuring people sharing intimate spaces with wild animals. A bear, a hawk, a wolf, or a cougar might appear alongside a contemplative figure in an otherwise ordinary room.</p>
            <p>These unlikely encounters interest me because they invite the viewer to create a story of their own.</p>
            <p>Who are these characters? Why are they together? And what exactly is going on between them?</p>
            <p>I rather like leaving those questions unanswered.</p>
            <p>It's interesting to see how the definition of Western art continues to evolve. In <a href="https://www.westernartcollector.com/issues/209/bridging-the-gap" target="_blank" rel="noopener noreferrer">Bridging the Gap</a>, <em>Western Art Collector</em> explores how Denver's Coors Western Art Exhibit &amp; Sale brings traditional and contemporary interpretations of the West together.</p>
            <p>I love that idea. The West has so many stories left to tell, and there is no reason we should all tell them the same way.</p>
            <h2>Bringing Contemporary Western Art Into Modern Homes</h2>
            <p>One of the things I love about contemporary Western art is how beautifully it can live in unexpected interiors. A painting inspired by the West can feel just as comfortable in a modern city apartment as it does in a traditional mountain home.</p>
            <p>In fact, I particularly enjoy the contrast.</p>
            <p>A contemporary Western portrait in a room filled with antiques. A slightly surreal animal painting above a modern sofa. A colorful cowgirl surrounded by elegant fabrics and sophisticated furnishings.</p>
            <p>These combinations create personality and invite conversation.</p>
            <p>I've always believed that art doesn't need to match the furniture. It should bring something to a room that wasn't there before: curiosity, emotion, humor, or perhaps a little mystery.</p>
            <p>Interior designers seem to be embracing that idea as well. In <a href="https://www.elledecor.com/design-decorate/house-interiors/a70423069/telluride-mountain-house-sasha-bikoff-tour/" target="_blank" rel="noopener noreferrer">A Telluride Retreat Ditches the Mountain House Playbook</a>, <em>ELLE DECOR</em> explores a contemporary Colorado mountain home where an Indigenous art collection takes center stage, offering a refreshing departure from conventional mountain décor.</p>
            <p>It's a wonderful reminder that art can help define a space rather than simply decorate it.</p>
          </div>
          <figure className="ct-journal-figure ct-journal-interior">
            <img src={interior.url} width={807} height={768} loading="lazy" alt="A painting above a white fireplace in an interior with blue upholstered seating and framed artwork on the adjoining wall." />
            <figcaption>Art brings its own character to the spaces we call home.</figcaption>
          </figure>
          <div className="ct-journal-text">
            <h2>Choosing Art That Tells a Story</h2>
            <p>I think some of the most interesting interiors are the ones that reveal something about the people who live there.</p>
            <p>A painting doesn't have to coordinate perfectly with a room. Sometimes the unexpected piece is the one that makes everything feel more personal.</p>
            <p>Perhaps it's the expression on a character's face, the humor in an unusual encounter, or a color that catches your attention every time you walk past.</p>
            <p>I love the idea of someone discovering one of my paintings and feeling an immediate connection to it, even if they can't quite explain why.</p>
            <p>That's the wonderful thing about original art. We don't all have to see the same thing.</p>
            <p>And sometimes, the paintings that make us a little curious are the ones we enjoy living with the longest.</p>
          </div>
          <figure className="ct-journal-figure ct-journal-portrait">
            <img src={birds.url} width={768} height={1043} loading="lazy" alt="Annie Decamp painting in progress showing a seated figure in a brown suit beside a dog and a dark bird perched on a wooden chair." />
            <figcaption>A work in progress: a figure, a dog, and a bird share an imagined room. Painting by Annie Decamp.</figcaption>
          </figure>
          <div className="ct-journal-text">
            <h2>The Stories We Bring Home</h2>
            <p>For me, painting has always been about observing the world and trying to understand our place within it.</p>
            <p>The American West offers endless possibilities for exploring identity, history, nature, and our relationship with animals.</p>
            <p>As this new collection develops, I'm finding myself drawn to quieter scenes, limited palettes, and characters who seem to exist somewhere between the familiar and the imagined.</p>
            <p>Some paintings are finished. Others are still finding their way.</p>
            <p>And that's part of the pleasure.</p>
            <p>I love the idea that these contemporary Western paintings might eventually find their way into someone's home, whether that's a modern Denver loft, a mountain retreat, or a place far removed from the landscapes that inspired them.</p>
            <p>There, their stories will continue to unfold in an entirely different setting.</p>
            <p>After all, isn't that one of the wonderful things about living with art?</p>
            <p>We bring our own histories and imaginations to it, and somehow the work becomes part of our lives.</p>
            <p>I'd love to invite you to explore my artwork and discover the stories that speak to you.</p>
            <Link to="/gallery" className="ct-journal-gallery">Explore My Paintings <span aria-hidden="true">→</span></Link>
            <p className="ct-journal-signoff">Warmly,<br />Annie Decamp<br />Contemporary Artist</p>
          </div>
        </article>
      </main>
      <SiteFooter />
    </div>
  );
}