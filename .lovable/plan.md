# Claire Tabouret homepage replication

The reference site is an intentionally minimal artist site. A full read of the live page confirms the homepage contains exactly four things, in this order — there are no hero blocks, stats, testimonials, pricing, or blog previews to build:

1. Fixed white header bar (100px tall, centered): a small hamburger icon followed by the wordmark "CLAIRE TABOURET", 37px, light weight, uppercase.
2. A full-bleed fixed image slideshow filling everything between the header and the bottom caption bar. Three slides, cross-fading, auto-advancing, with numbered controls (1 / 2 / 3).
3. A fixed white caption bar pinned to the bottom (115px tall): the current slide's exhibition caption in uppercase, and a black full-width "More information" button below it.
4. An empty footer element (nothing rendered).

Hidden until opened: a full-screen white menu overlay triggered by the hamburger, listing ABOUT, PRESS, NEWS, PUBLICATIONS, CONTACT — each a 23px uppercase row that inverts to white-on-black on hover.

## Content (from the live site)

Slide captions, in order:
- "Les Créatures, Almine Rech, Gstaad, Switzerland. From July 10 to September 3, 2026."
- "Dimanche Sans Fin, Centre Pompidou-Metz, Metz, France. From May 8th 2025 to February 2nd 2027."
- "Visages d'artistes, Petit Palais, Paris, France. From March 18 to July 19, 2026."

Each caption's "More information" points to the news page. The three artwork images are hosted on the original site and will be referenced by their original URLs so the page shows the real works.

## Look and feel

- Pure black (#000) on pure white (#fff). No other colors anywhere.
- The site uses licensed Futura webfonts hosted on its own server, which cannot be redistributed here. I'll use Jost, a free Futura-derived typeface that matches its geometric proportions closely, at the same sizes, weights (light/book), uppercase transforms, and 1px letter-spacing.
- Exact measurements preserved: 100px header, 40px wordmark offset, 20px icon gap, 115px bottom bar, 20px/30px caption padding, 16px menu row padding, 23px menu type, 37px wordmark, 14px/18px body.
- Images are contained and centered inside the fixed viewport area, never cropped, matching the original's fit-to-frame behavior.

## Motion

Matching what the original actually does (jQuery FlexSlider, fade mode) rather than inventing effects:

- Slides cross-fade — no sliding — on a ~6 second auto loop, continuous and infinite, with a soft ease-out curve. The caption text swaps in sync with a short fade.
- The numbered 1/2/3 controls jump directly to a slide and pause/resume the loop appropriately.
- The original fades the whole page content in from opacity 0 on load; I'll keep that, and give the wordmark a gentle entrance rise.
- The menu overlay fades in with its rows staggering in quickly beneath it.
- All motion is opacity/transform only, layered over fixed-position elements, so nothing shifts, resizes, or reflows.
- Respects reduced-motion preferences by holding the auto-advance to plain cross-fades.

## Responsive

Below 900px the layout stacks as the original's mobile stylesheet does: smaller wordmark, hamburger on the right, full-width menu overlay, caption bar allowed to grow for longer text.

## Technical notes

- Single route rewritten at `src/routes/index.tsx`, with the header, slideshow, caption bar, and menu overlay as components under `src/components/`.
- Jost loaded via a `<link>` in the root route head; design tokens (black/white, Futura-stack fallback) added to `src/styles.css`.
- Slideshow state (index, timer, pause on hover) handled in a small client component; fade transitions via CSS opacity with absolute stacking so all three slides occupy the same box.
- Page title/description/OG tags set on the index route to match the original ("Claire Tabouret - Home").
- Menu links point to placeholder anchors since only the homepage is in scope; say the word and I'll build the inner pages too.
