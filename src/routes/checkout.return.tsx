import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { getOrderStatus, type OrderSummary } from "@/lib/shop.functions";
import { getStripeEnvironment } from "@/lib/stripe";

const title = "Order confirmation — Annie Decamp";
const description = "Confirmation for your purchase from the studio of Annie Decamp.";

export const Route = createFileRoute("/checkout/return")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  validateSearch: (search: Record<string, unknown>): { session_id?: string | undefined } => ({
    session_id: typeof search["session_id"] === "string" ? search["session_id"] : undefined,
  }),
  component: CheckoutReturn,
});

function formatMoney(cents: number, currency: string) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: currency.toUpperCase() }).format(
    cents / 100,
  );
}

function CheckoutReturn() {
  const { session_id: sessionId } = Route.useSearch();
  const [order, setOrder] = useState<OrderSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) return;
    let active = true;
    getOrderStatus({ data: { sessionId, environment: getStripeEnvironment() } })
      .then((result) => {
        if (!active) return;
        if ("error" in result) setError(result.error);
        else setOrder(result);
      })
      .catch((e: Error) => active && setError(e.message));
    return () => {
      active = false;
    };
  }, [sessionId]);

  return (
    <div className="ct-page">
      <SiteHeader />
      <main className="ct-page-main">
        <h2 className="ct-page-title">Thank you</h2>
        {!sessionId && <p className="ct-page-lead">No order information was found.</p>}
        {sessionId && !order && !error && <p className="ct-page-lead">Confirming your order…</p>}
        {error && <p className="ct-page-lead">{error}</p>}
        {order && (
          <>
            <p className="ct-page-lead">
              {order.status === "paid"
                ? "Your payment is complete."
                : "Your payment is being processed and will confirm shortly."}{" "}
              A receipt has been sent{order.customer_email ? ` to ${order.customer_email}` : ""}.
            </p>
            <dl className="ct-contact">
              <div className="ct-contact-row">
                <dt>Item</dt>
                <dd>{order.item_label}</dd>
              </div>
              <div className="ct-contact-row">
                <dt>Total</dt>
                <dd>{formatMoney(order.amount_cents, order.currency)}</dd>
              </div>
            </dl>
            <p className="ct-page-note">
              Prints and merchandise are produced and shipped by the studio's print partner.
              Originals are packed and shipped directly from the studio — you will hear from us
              with shipping details.
            </p>
          </>
        )}
        <p className="ct-page-note">
          <Link to="/gallery">Return to the gallery</Link>
        </p>
      </main>
      <SiteFooter />
    </div>
  );
}
