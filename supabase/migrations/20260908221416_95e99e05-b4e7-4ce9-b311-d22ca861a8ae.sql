CREATE TABLE public.artworks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  year text,
  medium text,
  dimensions text,
  description text,
  image_url text NOT NULL,
  original_price_cents integer,
  original_available boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.print_options (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  artwork_id uuid NOT NULL REFERENCES public.artworks(id) ON DELETE CASCADE,
  label text NOT NULL,
  kind text NOT NULL DEFAULT 'print',
  price_cents integer NOT NULL,
  prodigi_sku text,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_session_id text UNIQUE,
  stripe_payment_intent_id text,
  environment text NOT NULL DEFAULT 'sandbox',
  customer_email text,
  customer_name text,
  artwork_id uuid REFERENCES public.artworks(id) ON DELETE SET NULL,
  print_option_id uuid REFERENCES public.print_options(id) ON DELETE SET NULL,
  item_kind text NOT NULL,
  item_label text NOT NULL,
  quantity integer NOT NULL DEFAULT 1,
  amount_cents integer NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'usd',
  shipping_address jsonb,
  status text NOT NULL DEFAULT 'pending',
  fulfillment_status text NOT NULL DEFAULT 'unfulfilled',
  prodigi_order_id text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_print_options_artwork ON public.print_options(artwork_id);
CREATE INDEX idx_orders_session ON public.orders(stripe_session_id);

GRANT SELECT ON public.artworks TO anon, authenticated;
GRANT ALL ON public.artworks TO service_role;
GRANT SELECT ON public.print_options TO anon, authenticated;
GRANT ALL ON public.print_options TO service_role;
GRANT ALL ON public.orders TO service_role;

ALTER TABLE public.artworks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.print_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Artworks are publicly viewable" ON public.artworks FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Print options are publicly viewable" ON public.print_options FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Service role manages orders" ON public.orders FOR ALL TO service_role USING (true) WITH CHECK (true);

INSERT INTO public.artworks (slug, title, year, medium, dimensions, image_url, original_price_cents, original_available, sort_order) VALUES
('the-assembly', 'The Assembly', '2025', 'Mixed media on canvas', '200 × 300 cm', '/artwork/work-1.jpg', 1450000, true, 1),
('les-creatures', 'Les Créatures', '2026', 'Mixed media on canvas', '180 × 250 cm', 'https://www.clairetabouret.com/files/media_high_953.jpg', 1180000, true, 2),
('seated-figure-orange', 'Seated Figure (Orange)', '2024', 'Mixed media on canvas', '160 × 210 cm', '/artwork/work-2.jpg', 890000, false, 3),
('dimanche-sans-fin', 'Dimanche Sans Fin', '2025', 'Mixed media on canvas', '220 × 320 cm', 'https://www.clairetabouret.com/files/media_high_935.jpg', 1620000, true, 4),
('the-swimmers', 'The Swimmers', '2024', 'Mixed media on canvas', '190 × 290 cm', '/artwork/work-3.jpg', 1050000, true, 5),
('visages', 'Visages', '2026', 'Mixed media on canvas', '170 × 240 cm', 'https://www.clairetabouret.com/files/media_high_952.jpeg', 940000, true, 6);

INSERT INTO public.print_options (artwork_id, label, kind, price_cents, prodigi_sku, sort_order)
SELECT a.id, v.label, v.kind, v.price_cents, v.sku, v.sort_order
FROM public.artworks a
CROSS JOIN (VALUES
  ('Fine art print — 12 × 16 in', 'print', 12500, 'GLOBAL-FAP-12X16', 1),
  ('Fine art print — 18 × 24 in', 'print', 21500, 'GLOBAL-FAP-18X24', 2),
  ('Framed print — 24 × 32 in', 'print', 39500, 'GLOBAL-CFP-24X32', 3),
  ('Canvas tote bag', 'merchandise', 4200, 'GLOBAL-TOTE-16X16', 4)
) AS v(label, kind, price_cents, sku, sort_order);