import { createFileRoute } from "@tanstack/react-router";

// Admin-only JSON endpoint listing products in the connected Printify store,
// used to map Printify products/variants to print_options rows.
async function handleGet(request: Request) {
  const auth = request.headers.get("authorization") ?? "";
  const token = auth.replace(/^Bearer\s+/i, "");
  if (!token) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data: userData, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !userData.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { data: role } = await supabaseAdmin
    .from("user_roles")
    .select("id")
    .eq("user_id", userData.user.id)
    .eq("role", "admin")
    .maybeSingle();
  if (!role) return Response.json({ error: "Forbidden" }, { status: 403 });

  const apiToken = process.env["PRINTIFY_API_TOKEN"];
  const shopId = process.env["PRINTIFY_SHOP_ID"];
  if (!apiToken || !shopId) {
    return Response.json({ error: "Printify is not configured" }, { status: 500 });
  }

  const response = await fetch(
    `https://api.printify.com/v1/shops/${shopId}/products.json?limit=50`,
    { headers: { Authorization: `Bearer ${apiToken}` } },
  );
  if (!response.ok) {
    return Response.json({ error: `Printify request failed: ${response.status}` }, { status: 502 });
  }
  const body = (await response.json()) as { data?: any[] };
  const products = (body.data ?? []).map((p) => ({
    id: p.id,
    title: p.title,
    image: p.images?.[0]?.src ?? null,
    variants: (p.variants ?? [])
      .filter((v: any) => v.is_enabled !== false)
      .map((v: any) => ({ id: v.id, title: v.title, price_cents: v.price })),
  }));
  return Response.json({ products });
}

export const Route = createFileRoute("/api/printify-products")({
  server: { handlers: { GET: ({ request }) => handleGet(request) } },
});
