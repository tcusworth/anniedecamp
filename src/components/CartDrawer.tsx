import { useState } from "react";
import { EmbeddedCheckoutProvider, EmbeddedCheckout } from "@stripe/react-stripe-js";
import { getStripe, getStripeEnvironment } from "@/lib/stripe";
import { createCartCheckout } from "@/lib/shop.functions";
import { PaymentTestModeBanner } from "@/components/PaymentTestModeBanner";
import { useCart, money } from "@/lib/cart";

export function CartDrawer() {
  const { items, count, totalCents, open, setOpen, setQuantity, remove } = useCart();
  const [checkingOut, setCheckingOut] = useState(false);

  const fetchClientSecret = async (): Promise<string> => {
    const result = await createCartCheckout({
      data: {
        items: items.map((i) => ({
          artworkId: i.artworkId,
          printOptionId: i.printOptionId,
          quantity: i.quantity,
        })),
        returnUrl: `${window.location.origin}/checkout/return?session_id={CHECKOUT_SESSION_ID}`,
        environment: getStripeEnvironment(),
      },
    });
    if ("error" in result) throw new Error(result.error);
    if (!result.clientSecret) throw new Error("Checkout could not be started.");
    return result.clientSecret;
  };

  if (checkingOut) {
    return (
      <div className="ct-checkout-overlay" role="dialog" aria-modal="true" aria-label="Checkout">
        <div className="ct-checkout-panel">
          <div className="ct-checkout-bar">
            <span>Checkout — {money(totalCents)}</span>
            <button type="button" onClick={() => setCheckingOut(false)} aria-label="Back to cart">
              Back to cart
            </button>
          </div>
          <PaymentTestModeBanner />
          <div className="ct-checkout-body">
            <EmbeddedCheckoutProvider stripe={getStripe()} options={{ fetchClientSecret }}>
              <EmbeddedCheckout />
            </EmbeddedCheckoutProvider>
          </div>
        </div>
      </div>
    );
  }

  if (!open) return null;

  return (
    <div className="ct-cart-overlay" role="dialog" aria-modal="true" aria-label="Shopping cart">
      <button type="button" className="ct-cart-scrim" aria-label="Close cart" onClick={() => setOpen(false)} />
      <aside className="ct-cart-panel">
        <div className="ct-cart-head">
          <span>Cart ({count})</span>
          <button type="button" onClick={() => setOpen(false)}>
            Close
          </button>
        </div>

        {items.length === 0 ? (
          <p className="ct-cart-empty">Your cart is empty.</p>
        ) : (
          <ul className="ct-cart-list">
            {items.map((item) => (
              <li key={`${item.artworkId}-${item.printOptionId ?? "original"}`} className="ct-cart-item">
                <img src={item.imageUrl} alt="" width={64} height={64} loading="lazy" />
                <div className="ct-cart-item-main">
                  <span className="ct-cart-item-label">{item.label}</span>
                  <span className="ct-cart-item-price">{money(item.priceCents)}</span>
                  <div className="ct-cart-item-actions">
                    {item.kind === "original" ? (
                      <span className="ct-cart-unique">One of a kind</span>
                    ) : (
                      <label>
                        Qty
                        <input
                          type="number"
                          min={1}
                          max={10}
                          value={item.quantity}
                          onChange={(e) =>
                            setQuantity(item.artworkId, item.printOptionId, Number(e.target.value) || 1)
                          }
                        />
                      </label>
                    )}
                    <button type="button" onClick={() => remove(item.artworkId, item.printOptionId)}>
                      Remove
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}

        <div className="ct-cart-foot">
          <div className="ct-cart-total">
            <span>Subtotal</span>
            <span>{money(totalCents)}</span>
          </div>
          <p className="ct-cart-note">Shipping and any sales tax are calculated at checkout.</p>
          <button
            type="button"
            className="ct-cart-checkout"
            disabled={items.length === 0}
            onClick={() => setCheckingOut(true)}
          >
            Checkout
          </button>
        </div>
      </aside>
    </div>
  );
}
