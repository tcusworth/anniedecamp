
CREATE POLICY "Admins can upload artwork images" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'artwork-images' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can read artwork images" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'artwork-images' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update artwork images" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'artwork-images' AND public.has_role(auth.uid(), 'admin'))
  WITH CHECK (bucket_id = 'artwork-images' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete artwork images" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'artwork-images' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can create artworks" ON public.artworks FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update artworks" ON public.artworks FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete artworks" ON public.artworks FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can create print options" ON public.print_options FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update print options" ON public.print_options FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete print options" ON public.print_options FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

GRANT INSERT, UPDATE, DELETE ON public.artworks TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.print_options TO authenticated;
