ALTER TABLE public.artworks ADD COLUMN stripe_price_key text;
ALTER TABLE public.print_options ADD COLUMN stripe_price_key text;

UPDATE public.artworks SET stripe_price_key = slug || '_original';

UPDATE public.print_options p
SET stripe_price_key = a.slug || CASE p.sort_order
  WHEN 1 THEN '_print_12x16'
  WHEN 2 THEN '_print_18x24'
  WHEN 3 THEN '_framed_24x32'
  WHEN 4 THEN '_tote'
END
FROM public.artworks a
WHERE p.artwork_id = a.id;