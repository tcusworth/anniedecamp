import { useEffect, useRef, useState } from "react";
import mexicoAsset from "@/assets/Mexico_oil_on_panel_18x24.jpg.asset.json";

type Slide = { src: string; caption: string; url: string; alt: string };

const SLIDES: Slide[] = [
  {
    src: mexicoAsset.url,
    caption: "Mexico, oil on panel, 18 × 24 in.",
    url: "/gallery",
    alt: "Mexico, oil on panel, 18 × 24 in. by Annie DeCamp",
  },
];

const INTERVAL = 6000;

export function HomeSlideshow() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (paused) return;
    timer.current = setInterval(() => {
      setIndex((i) => (i + 1) % SLIDES.length);
    }, INTERVAL);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [paused, index]);

  const active = SLIDES[index] ?? SLIDES[0]!;

  return (
    <section id="home" className="ct-home">
      <h2 className="ct-visually-hidden">Home</h2>

      <div
        className="ct-slideshow"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <ul className="ct-slides">
          {SLIDES.map((slide, i) => (
            <li key={slide.src} className={i === index ? "is-active" : ""} aria-hidden={i !== index}>
              <img src={slide.src} alt={slide.alt} loading={i === 0 ? "eager" : "lazy"} />
            </li>
          ))}
        </ul>

        <ol className="ct-slide-controls">
          {SLIDES.map((slide, i) => (
            <li key={slide.src}>
              <button
                type="button"
                className={i === index ? "is-active" : ""}
                aria-label={`Show slide ${i + 1}`}
                aria-current={i === index}
                onClick={() => setIndex(i)}
              >
                {i + 1}
              </button>
            </li>
          ))}
        </ol>
      </div>

      <div className="ct-description">
        <h3 key={active.caption}>{active.caption}</h3>
        <a href="/contact" className="ct-read-more">
          More information
        </a>
      </div>
    </section>
  );
}
