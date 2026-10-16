import { describe, expect, test } from "bun:test";
import { productTaxCode } from "./product-tax";

describe("physical product tax categories", () => {
  test("scarves use Stripe's scarf tax code", () => {
    expect(productTaxCode("scarf")).toBe("txcd_30011034");
  });
  test("totes use Stripe's bag tax code", () => {
    expect(productTaxCode("tote")).toBe("txcd_30060001");
  });
  test("notebooks use Stripe's stationery tax code", () => {
    expect(productTaxCode("notebook")).toBe("txcd_37060012");
  });
  test("artwork and unspecified physical products have a taxable fallback", () => {
    expect(productTaxCode()).toBe("txcd_99999999");
    expect(productTaxCode("original")).toBe("txcd_99999999");
  });
});