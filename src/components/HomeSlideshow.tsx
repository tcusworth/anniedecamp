import { useEffect, useRef, useState } from "react";
import fireplaceAsset from "@/assets/home-living-room-fireplace.jpg.asset.json";
import blueRoomAsset from "@/assets/home-blue-room-portrait.jpg.asset.json";
import hallwayAsset from "@/assets/home-hallway-painting.jpg.asset.json";
import diningAsset from "@/assets/home-dining-room-angel.jpg.asset.json";
import cabinetAsset from "@/assets/home-cabinet-portrait.jpg.asset.json";

type Slide = { src: string; caption: string; url: string; alt: string };

const SLIDES: Slide[] = [
  {
    src: fireplaceAsset.url,
    caption: "Annie Decamp — works in the home",
    url: "/gallery",
    alt: "Annie Decamp painting displayed above a fireplace in a living room",
  },
  {
    src: blueRoomAsset.url,
    caption: "Annie Decamp — works in the home",
    url: "/gallery",
    alt: "Annie Decamp portrait painting hung on a deep blue wall above a settee",
  },
  {
    src: hallwayAsset.url,
    caption: "Annie Decamp — works in the home",
    url: "/gallery",
    alt: "Annie Decamp colorful painting of a man in a hat displayed in a hallway",
  },
  {
    src: diningAsset.url,
    caption: "Annie Decamp — works in the home",
    url: "/gallery",
    alt: "Annie Decamp painting of an angelic figure on a dining room wall",
  },
  {
    src: cabinetAsset.url,
    caption: "Annie Decamp — works in the home",
    url: "/gallery",
    alt: "Annie Decamp portrait painting of a woman in a headscarf resting on a cabinet",
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
        <a href="/gallery" className="ct-read-more">
          More information
        </a>
      </div>
    </section>
  );
}
