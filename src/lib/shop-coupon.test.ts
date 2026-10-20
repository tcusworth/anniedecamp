import { test } from "node:test";
import { strictEqual } from "node:assert";
import { validateShopCoupon, originalCouponDiscount } from "./shop-coupon";

test("annie20 accepts the chosen code case-insensitively", () => {
  strictEqual(validateShopCoupon(" annie20 ", Date.parse("2026-10-20T16:11:00Z")), null);
  strictEqual(validateShopCoupon("another20", Date.parse("2026-10-20T16:11:00Z")), "That coupon code is not valid.");
});
test("20% off original paintings", () => {
  strictEqual(originalCouponDiscount(480000, true), 96000);
});
test("prints and merchandise receive no discount", () => {
  strictEqual(originalCouponDiscount(39500, false), 0);
  strictEqual(originalCouponDiscount(7500, false), 0);
});
test("valid through December 31 2026 in Denver, expires at midnight", () => {
  strictEqual(validateShopCoupon("annie20", Date.parse("2026-12-31T23:59:59-07:00")), null);
  strictEqual(validateShopCoupon("annie20", Date.parse("2027-01-01T00:00:00-07:00")), "This coupon has expired.");
});