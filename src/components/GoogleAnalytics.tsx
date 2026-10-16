import { useEffect } from "react";
import { useRouter } from "@tanstack/react-router";
import { getGaMeasurementId } from "@/lib/analytics.functions";

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

export function GoogleAnalytics() {
  const router = useRouter();

  useEffect(() => {
    let unsub: (() => void) | undefined;
    let cancelled = false;
    getGaMeasurementId().then((id) => {
      if (!id || cancelled || window.gtag) return;
      const s = document.createElement("script");
      s.async = true;
      s.src = `https://www.googletagmanager.com/gtag/js?id=${id}`;
      document.head.appendChild(s);
      window.dataLayer = window.dataLayer || [];
      window.gtag = function gtag() {
        // eslint-disable-next-line prefer-rest-params
        window.dataLayer.push(arguments);
      };
      window.gtag("js", new Date());
      window.gtag("config", id, { send_page_view: true });
      unsub = router.subscribe("onResolved", ({ toLocation, fromLocation }) => {
        if (fromLocation && fromLocation.href === toLocation.href) return;
        window.gtag?.("event", "page_view", {
          page_path: toLocation.pathname,
          page_location: window.location.href,
          page_title: document.title,
        });
      });
    });
    return () => {
      cancelled = true;
      unsub?.();
    };
  }, [router]);

  return null;
}
