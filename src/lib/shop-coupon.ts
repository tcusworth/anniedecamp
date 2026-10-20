export const ORIGINAL_COUPON = {
  code: "ANNIE20",
  percentOff: 20,
  // Valid through December 31 in the studio's Denver time zone (MST).
  expiresAt: Date.parse("2027-01-01T00:00:00-07:00"),
};

export function validateShopCoupon(code: string, now = Date.now()): string | null {
  if (code.trim().toUpperCase() !== ORIGINAL_COUPON.code) return "That coupon code is not valid.";
  if (now >= ORIGINAL_COUPON.expiresAt) return "This coupon has expired.";
  return null;
}

export function originalCouponDiscount(priceCents: number, isOriginal: boolean): number {
  return isOriginal ? Math.round(priceCents * ORIGINAL_COUPON.percentOff / 100) : 0;
}