import { useEffect, useRef, useState } from "react";
import fireplaceAsset from "@/assets/home-living-room-fireplace.jpg.asset.json";
import blueRoomAsset from "@/assets/home-blue-room-portrait.jpg.asset.json";
import hallwayAsset from "@/assets/home-hallway-painting.jpg.asset.json";
import diningAsset from "@/assets/home-dining-room-angel.jpg.asset.json";
import cabinetAsset from "@/assets/home-cabinet-portrait.jpg.asset.json";
import hotelLobbyAsset from "@/assets/home-hotel-lobby-painting.jpg.asset.json";
import bedroomAsset from "@/assets/home-bedroom-portrait.jpg.asset.json";
import shopRosesAsset from "@/assets/home-shop-red-roses.jpg.asset.json";
import fooDogAsset from "@/assets/home-portrait-foo-dog.jpg.asset.json";
import artistDisplayAsset from "@/assets/home-artist-display.jpg.asset.json";
import img3868Asset from "@/assets/home-IMG_3868.jpg.asset.json";
import img3862Asset from "@/assets/home-IMG_3862.jpg.asset.json";
import img3839Asset from "@/assets/home-IMG_3839.jpg.asset.json";
import img3838Asset from "@/assets/home-IMG_3838.jpg.asset.json";
import img3837Asset from "@/assets/home-IMG_3837.jpg.asset.json";
import img3836Asset from "@/assets/home-IMG_3836.jpg.asset.json";
import img3834Asset from "@/assets/home-IMG_3834.jpg.asset.json";
import img3823Asset from "@/assets/home-IMG_3823.jpg.asset.json";

type Slide = { src: string; caption: string; url: string; alt: string };

const SLIDES: Slide[] = [
  {
    src: fireplaceAsset.url,
    caption: "Annie Decamp - works on display",
    url: "/gallery",
    alt: "Annie Decamp painting displayed above a fireplace in a living room",
  },
  {
    src: blueRoomAsset.url,
    caption: "Annie Decamp - works on display",
    url: "/gallery",
    alt: "Annie Decamp portrait painting hung on a deep blue wall above a settee",
  },
  {
    src: hallwayAsset.url,
    caption: "Annie Decamp - works on display",
    url: "/gallery",
    alt: "Annie Decamp colorful painting of a man in a hat displayed in a hallway",
  },
  {
    src: diningAsset.url,
    caption: "Annie Decamp - works on display",
    url: "/gallery",
    alt: "Annie Decamp painting of an angelic figure on a dining room wall",
  },
  {
    src: cabinetAsset.url,
    caption: "Annie Decamp - works on display",
    url: "/gallery",
    alt: "Annie Decamp portrait painting of a woman in a headscarf resting on a cabinet",
  },
  {
    src: hotelLobbyAsset.url,
    caption: "Annie Decamp - works on display",
    url: "/gallery",
    alt: "Annie Decamp mixed-media portrait displayed above a wooden cabinet in a hotel lobby",
  },
  {
    src: bedroomAsset.url,
    caption: "Annie Decamp - works on display",
    url: "/gallery",
    alt: "Annie Decamp portrait painting displayed above a bed with a pink coverlet",
  },
  {
    src: shopRosesAsset.url,
    caption: "Annie Decamp - works on display",
    url: "/gallery",
    alt: "Annie Decamp red floral painting in an ornate frame above a vase of roses",
  },
  {
    src: fooDogAsset.url,
    caption: "Annie Decamp - works on display",
    url: "/gallery",
    alt: "Annie Decamp portrait and floral still life paintings displayed with a blue foo dog",
  },
  {
    src: artistDisplayAsset.url,
    caption: "Annie Decamp - works on display",
    url: "/gallery",
    alt: "Annie Decamp seated among a display of her paintings",
  },
];

const INTERVAL = 5000;

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
