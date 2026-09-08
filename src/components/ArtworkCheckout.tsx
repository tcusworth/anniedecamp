import { EmbeddedCheckoutProvider, EmbeddedCheckout } from "@stripe/react-stripe-js";
import { getStripe, getStripeEnvironment } from "@/lib/stripe";
import { createArtworkCheckout } from "@/lib/shop.functions";
import { PaymentTestModeBanner } from "@/components/PaymentTestModeBanner";

type Props = {
  artworkId: string;
  printOptionId: string | null;
  quantity: number;
  title: string;
  onClose: () => void;
};

export function ArtworkCheckout({ artworkId, printOptionId, quantity, title, onClose }: Props) {
  const fetchClientSecret = async (): Promise<string> => {
    const result = await createArtworkCheckout({
      data: {
        artworkId,
        printOptionId,
        quantity,
        returnUrl: `${window.location.origin}/checkout/return?session_id={CHECKOUT_SESSION_ID}`,
        environment: getStripeEnvironment(),
      },
    });
    if ("error" in result) throw new Error(result.error);
    if (!result.clientSecret) throw new Error("Checkout could not be started.");
    return result.clientSecret;
  };

  return (
    <div className="ct-checkout-overlay" role="dialog" aria-modal="true" aria-label={`Purchase ${title}`}>
      <div className="ct-checkout-panel">
        <div className="ct-checkout-bar">
          <span>{title}</span>
          <button type="button" onClick={onClose} aria-label="Close checkout">
            Close
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
