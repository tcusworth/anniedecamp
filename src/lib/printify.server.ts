// Printify order submission. Server-only.
// Docs: https://developers.printify.com/#create-an-order

type PrintifyAddress = {
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  line1?: string | null;
  line2?: string | null;
  city?: string | null;
  state?: string | null;
  postal_code?: string | null;
  country?: string | null;
};

export type PrintifyLine =
  | { productId: string; variantId: number; quantity: number }
  | {
      // Custom design: print a chosen painting on a catalogue product.
      blueprintId: number;
      printProviderId: number;
      variantId: number;
      quantity: number;
      printAreas: Record<string, string>;
    };

function splitName(full: string): { first_name: string; last_name: string } {
  const parts = full.trim().split(/\s+/);
  if (parts.length === 1) return { first_name: parts[0]!, last_name: "-" };
  return { first_name: parts.slice(0, -1).join(" "), last_name: parts[parts.length - 1]! };
}

export async function submitToPrintify(opts: {
  externalId: string;
  lines: PrintifyLine[];
  address: PrintifyAddress;
}): Promise<string | null> {
  const token = process.env["PRINTIFY_API_TOKEN"];
  const shopId = process.env["PRINTIFY_SHOP_ID"];
  if (!token || !shopId || opts.lines.length === 0) return null;
  if (!opts.address.line1 || !opts.address.country) return null;

  const { first_name, last_name } = splitName(opts.address.name ?? "Customer");

  const response = await fetch(`https://api.printify.com/v1/shops/${shopId}/orders.json`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "User-Agent": "anniedecampart-store",
    },
    body: JSON.stringify({
      external_id: opts.externalId,
      label: opts.externalId,
      shipping_method: 1, // Standard
      send_shipping_notification: false,
      address_to: {
        first_name,
        last_name,
        email: opts.address.email ?? undefined,
        phone: opts.address.phone ?? undefined,
        country: opts.address.country,
        region: opts.address.state ?? undefined,
        address1: opts.address.line1,
        address2: opts.address.line2 ?? undefined,
        city: opts.address.city ?? undefined,
        zip: opts.address.postal_code ?? undefined,
      },
      line_items: opts.lines.map((l) =>
        "productId" in l
          ? { product_id: l.productId, variant_id: l.variantId, quantity: Math.min(Math.max(l.quantity, 1), 10) }
          : {
              blueprint_id: l.blueprintId,
              print_provider_id: l.printProviderId,
              variant_id: l.variantId,
              print_areas: l.printAreas,
              quantity: Math.min(Math.max(l.quantity, 1), 10),
            },
      ),
    }),
  });

  if (!response.ok) {
    console.error("Printify order failed:", response.status, await response.text());
    return null;
  }
  const body = (await response.json()) as { id?: string };
  return body?.id ?? null;
}

// Builds a custom-design line from an existing shop product (same blueprint,
// provider, variant and print positions) with a painting image URL.
export async function buildCustomLine(opts: {
  templateProductId: string;
  variantId: number;
  quantity: number;
  imageUrl: string;
}): Promise<PrintifyLine | null> {
  const token = process.env["PRINTIFY_API_TOKEN"];
  const shopId = process.env["PRINTIFY_SHOP_ID"];
  if (!token || !shopId) return null;
  const res = await fetch(
    `https://api.printify.com/v1/shops/${shopId}/products/${opts.templateProductId}.json`,
    { headers: { Authorization: `Bearer ${token}`, "User-Agent": "anniedecampart-store" } },
  );
  if (!res.ok) {
    console.error("Printify template lookup failed:", res.status, await res.text());
    return null;
  }
  const p = (await res.json()) as any;
  const positions = [
    ...new Set<string>(
      (p.print_areas ?? []).flatMap((a: any) => (a.placeholders ?? []).map((x: any) => x.position)),
    ),
  ];
  if (!positions.length) positions.push("front");
  return {
    blueprintId: p.blueprint_id,
    printProviderId: p.print_provider_id,
    variantId: opts.variantId,
    quantity: opts.quantity,
    printAreas: Object.fromEntries(positions.map((pos) => [pos, opts.imageUrl])),
  };
}
