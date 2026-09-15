import { useEffect, useState } from "react";
import { useCart } from "@/lib/cart";

const MENU_ITEMS = [
  { label: "About", href: "/about" },
  { label: "Gallery", href: "/gallery" },
  { label: "Merchandise", href: "/shop" },
  { label: "News", href: "/news" },
  { label: "Where to see", href: "/where-to-see" },
  { label: "Studio", href: "/studio" },
  { label: "Press", href: "/press" },
  { label: "Contact", href: "/contact" },
];

function MenuIcon() {
  return (
    <span className="ct-menu-icon" aria-hidden="true">
      <span />
      <span />
      <span />
    </span>
  );
}

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const { count, setOpen: setCartOpen } = useCart();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <header className="ct-header">
      <div className="ct-header-inner">
        <button
          type="button"
          className="ct-menu-toggle"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <MenuIcon />
        </button>
        <h1 className="ct-wordmark">
          <a href="/">Annie Decamp</a>
        </h1>
      </div>

      <button
        type="button"
        className="ct-cart-toggle"
        aria-label={`Open cart, ${count} item${count === 1 ? "" : "s"}`}
        onClick={() => setCartOpen(true)}
      >
        Cart{count > 0 ? ` (${count})` : ""}
      </button>

      <div className={`ct-menu${open ? " is-open" : ""}`} aria-hidden={!open}>
        <div className="ct-menu-wrapper">
          <nav>
            <ul>
              {MENU_ITEMS.map((item, i) => (
                <li key={item.label} style={{ ["--i" as string]: String(i) }}>
                  <a href={item.href} tabIndex={open ? 0 : -1}>
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </header>
  );
}
