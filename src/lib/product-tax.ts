// Stripe product tax categories for the physical goods sold by the studio.
export function productTaxCode(category?: string): string {
  switch (category) {
    case "scarf":
      return "txcd_30011034";
    case "tote":
      return "txcd_30060001";
    case "notebook":
      return "txcd_37060012";
    default:
      return "txcd_99999999";
  }
}