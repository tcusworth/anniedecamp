# Annie Decamp

Read and analyze the entire page at [https://www.clairetabouret.com] from top to bottom before writing any code. Do not skip, skim, or summarize sections — inventory every distinct section on the page first, in the order they appear, then build each one.

Full-Page Replication:

Replicate every section present on the original page, exactly as structured — not a predefined list of sections, but whatever sections actually exist on this specific site (this may include, but is not limited to: navigation, hero, logo/client strip, stats or metric cards, about/mission blocks, service or feature grids, pricing tables, testimonials or review carousels, blog/article previews, CTA banners, and footer). If a section type isn't obvious from a generic template, look closer — dense or unconventional layouts (stacked cards, offset grids, asymmetric splits) must be replicated as-is, not simplified into a standard layout.

Fidelity Rules:

Match font families, weights, sizes, and letter-spacing exactly as used in the reference

Preserve exact color values (hex codes where visible)

Maintain identical spacing, padding, margin, and grid proportions across breakpoints

Keep all element positioning, alignment, layering, and z-index relationships unchanged

Do not simplify, condense, merge, or drop any section, card, or repeated element group — if the original has 4 testimonial cards, build 4, not 3

If content overflows or is cut off in a screenshot, infer the most probable continuation based on layout pattern rather than omitting the element entirely

Motion & Interaction Replication:

Identify and replicate the actual motion behavior used on the original site — do not default to generic fade/slide animations if the source uses something more specific:

If the site is built in Framer, Webflow, or uses scroll-linked/3D transforms (e.g., curved carousel loops, parallax layering, tilted card stacks that rotate or scroll on an arc), reproduce that specific motion behavior and easing, not a simplified substitute

If the hero or any section uses an auto-scrolling or looping carousel, replicate the scroll speed, direction, and loop behavior

Apply a smooth entrance animation to primary heading/title text on page load

Add scroll-triggered animations (fade-in, slide-up, or the specific pattern observed) to repeated elements — cards, testimonials, feature blocks — as the user scrolls them into view

Use easing curves that feel natural, not mechanical (e.g., ease-out, cubic-bezier)

Constraint:

Ensure all animations enhance visual appeal without disrupting the pixel-perfect layout or exact positioning of any element. No animation should shift, resize, or reflow surrounding content. If a motion effect can't be perfectly replicated, approximate it as closely as possible rather than omitting it — never silently drop a visual behavior because it's complex.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://anniedecamp.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/c70bc070-44fa-44b7-923c-4b2f6e345de1).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
