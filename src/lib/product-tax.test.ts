import { describe, test } from "node:test";
import { strictEqual } from "node:assert";
import { productTaxCode } from "./product-tax";

describe("physical product tax categories", () => {
  test("scarves use Stripe's scarf tax code", () => {
    strictEqual(productTaxCode("scarf"), "txcd_30011034");
  });
  test("totes use Stripe's bag tax code", () => {
    strictEqual(productTaxCode("tote"), "txcd_30060001");
  });
  test("notebooks use Stripe's stationery tax code", () => {
    strictEqual(productTaxCode("notebook"), "txcd_37060012");
  });
  test("artwork and unspecified physical products have a taxable fallback", () => {
    strictEqual(productTaxCode(), "txcd_99999999");
    strictEqual(productTaxCode("original"), "txcd_99999999");
  });
});