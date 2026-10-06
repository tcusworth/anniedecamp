import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type PrintifyVariant = { id: number; title: string; price: number };
export type PrintifyProduct = {
  id: string;
  title: string;
  variants: PrintifyVariant[];
  images: { src: string }[];
};

// Admin-only: lists products in the connected Printify store so they can be
// mapped to print_options rows.
export const listPrintifyProducts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: isAdmin } = await context.supabase
      .from("user_roles")
      .select("id")
      .eq("user_id", context.userId)
      .eq("role", "admin")
      .maybeSingle();
    if (!isAdmin) throw new Error("Forbidden");

    const token = process.env["PRINTIFY_API_TOKEN"];
    const shopId = process.env["PRINTIFY_SHOP_ID"];
    if (!token || !shopId) throw new Error("Printify is not configured");

    const response = await fetch(
      `https://api.printify.com/v1/shops/${shopId}/products.json?limit=50`,
      { headers: { Authorization: `Bearer ${token}` } },
    );
    if (!response.ok) {
      throw new Error(`Printify request failed: ${response.status}`);
    }
    const body = (await response.json()) as { data?: any[] };
    return (body.data ?? []).map(
      (p): PrintifyProduct => ({
        id: p.id,
        title: p.title,
        variants: (p.variants ?? [])
          .filter((v: any) => v.is_enabled !== false)
          .map((v: any) => ({ id: v.id, title: v.title, price: v.price })),
        images: (p.images ?? []).slice(0, 1).map((i: any) => ({ src: i.src })),
      }),
    );
  });
