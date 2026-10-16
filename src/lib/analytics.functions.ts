import { createServerFn } from "@tanstack/react-start";

// GA4 measurement IDs are public by design; returned so the browser can load gtag.js.
export const getGaMeasurementId = createServerFn({ method: "GET" }).handler(async () => {
  const id = (process.env["GOOGLE_ANALYTICS_MEASUREMENT_ID"] ?? "").trim();
  return /^G-[A-Z0-9]+$/i.test(id) ? id : null;
});
