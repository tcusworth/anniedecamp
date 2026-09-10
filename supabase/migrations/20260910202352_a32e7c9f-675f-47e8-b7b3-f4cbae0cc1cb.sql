
DELETE FROM public.print_options WHERE artwork_id IS NOT NULL;
DELETE FROM public.artworks WHERE slug IS NOT NULL;

INSERT INTO public.artworks (slug, title, year, medium, dimensions, description, image_url, original_price_cents, original_available, sort_order, stripe_price_key) VALUES
('franchesca-at-night','Franchesca at Night','2024','Oil on panel, framed','30 × 30 in','A night rider and a barn owl move together through a deep blue dark.','/__l5e/assets-v1/84bc4f16-3c31-43db-b4dd-7368704ba84f/Franchesca_at_Night_oil_on_panel_framed_30x30.jpg',480000,true,1,'franchesca-at-night'),
('17th-century-side-eye','17th Century Side Eye','2024','Oil on canvas, framed','24 × 18 in','A ruffed portrait with a red glove and a knowing glance.','/__l5e/assets-v1/1c14c599-7a54-4745-af66-98f9f41d336e/17th_Century_Side_Eye_oil_on_canvas_framed_24x18.jpg',320000,true,2,'17th-century-side-eye'),
('dreamer','Dreamer','2024','Oil on canvas','18 × 22 in','A quiet head study emerging from a pale ground.','/__l5e/assets-v1/0b322a6b-8584-4094-b796-b693d2cb2d0d/Dreamer_oil_on_canvas_18x22.jpg',240000,true,3,'dreamer'),
('bird-study','Bird Study','2024','Oil on canvas','18 × 24 in','A dark-ground still life of flowers, fruit and a nest book.','/__l5e/assets-v1/6b81ed5a-2e28-49f0-bdbf-f93ed5089682/Bird_Study_oil_on_canvas_18x24.jpg',260000,true,4,'bird-study');

INSERT INTO public.print_options (artwork_id, label, kind, price_cents, sort_order, stripe_price_key)
SELECT a.id, o.label, o.kind, o.price_cents, o.sort_order, a.slug || o.suffix
FROM public.artworks a
CROSS JOIN (VALUES
  ('Fine art print — 12 × 16 in','print',12500,1,'_print_12x16'),
  ('Fine art print — 18 × 24 in','print',21500,2,'_print_18x24'),
  ('Framed print — 24 × 32 in','print',39500,3,'_framed_24x32'),
  ('Canvas tote bag','merchandise',4200,4,'_tote')
) AS o(label, kind, price_cents, sort_order, suffix);
