CREATE SCHEMA IF NOT EXISTS private;
GRANT USAGE ON SCHEMA private TO authenticated, service_role;

CREATE OR REPLACE FUNCTION private.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;
REVOKE ALL ON FUNCTION private.has_role(uuid, public.app_role) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION private.has_role(uuid, public.app_role) TO authenticated, service_role;

DROP POLICY IF EXISTS "Admins can create artworks" ON public.artworks;
CREATE POLICY "Admins can create artworks" ON public.artworks FOR INSERT TO authenticated WITH CHECK (private.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "Admins can update artworks" ON public.artworks;
CREATE POLICY "Admins can update artworks" ON public.artworks FOR UPDATE TO authenticated USING (private.has_role(auth.uid(), 'admin')) WITH CHECK (private.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "Admins can delete artworks" ON public.artworks;
CREATE POLICY "Admins can delete artworks" ON public.artworks FOR DELETE TO authenticated USING (private.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can create print options" ON public.print_options;
CREATE POLICY "Admins can create print options" ON public.print_options FOR INSERT TO authenticated WITH CHECK (private.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "Admins can update print options" ON public.print_options;
CREATE POLICY "Admins can update print options" ON public.print_options FOR UPDATE TO authenticated USING (private.has_role(auth.uid(), 'admin')) WITH CHECK (private.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "Admins can delete print options" ON public.print_options;
CREATE POLICY "Admins can delete print options" ON public.print_options FOR DELETE TO authenticated USING (private.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can create articles" ON public.news_articles;
CREATE POLICY "Admins can create articles" ON public.news_articles FOR INSERT TO authenticated WITH CHECK (private.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "Admins can update articles" ON public.news_articles;
CREATE POLICY "Admins can update articles" ON public.news_articles FOR UPDATE TO authenticated USING (private.has_role(auth.uid(), 'admin')) WITH CHECK (private.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "Admins can delete articles" ON public.news_articles;
CREATE POLICY "Admins can delete articles" ON public.news_articles FOR DELETE TO authenticated USING (private.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "Admins can read all articles" ON public.news_articles;
CREATE POLICY "Admins can read all articles" ON public.news_articles FOR SELECT TO authenticated USING (private.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can read commission requests" ON public.commission_requests;
CREATE POLICY "Admins can read commission requests" ON public.commission_requests FOR SELECT TO authenticated USING (private.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "Admins can read event signups" ON public.event_signups;
CREATE POLICY "Admins can read event signups" ON public.event_signups FOR SELECT TO authenticated USING (private.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "Admins can read subscribers" ON public.newsletter_subscribers;
CREATE POLICY "Admins can read subscribers" ON public.newsletter_subscribers FOR SELECT TO authenticated USING (private.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "Admins can read inquiries" ON public.studio_inquiries;
CREATE POLICY "Admins can read inquiries" ON public.studio_inquiries FOR SELECT TO authenticated USING (private.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "Admins can read orders" ON public.orders;
CREATE POLICY "Admins can read orders" ON public.orders FOR SELECT TO authenticated USING (private.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can upload artwork images" ON storage.objects;
CREATE POLICY "Admins can upload artwork images" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'artwork-images' AND private.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "Admins can read artwork images" ON storage.objects;
CREATE POLICY "Admins can read artwork images" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'artwork-images' AND private.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "Admins can update artwork images" ON storage.objects;
CREATE POLICY "Admins can update artwork images" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'artwork-images' AND private.has_role(auth.uid(), 'admin')) WITH CHECK (bucket_id = 'artwork-images' AND private.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "Admins can delete artwork images" ON storage.objects;
CREATE POLICY "Admins can delete artwork images" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'artwork-images' AND private.has_role(auth.uid(), 'admin'));

DROP FUNCTION IF EXISTS public.has_role(uuid, public.app_role);