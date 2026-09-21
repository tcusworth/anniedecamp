DROP POLICY IF EXISTS "Authenticated users can read commission requests" ON public.commission_requests;
CREATE POLICY "Admins can read commission requests" ON public.commission_requests FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Authenticated users can read event signups" ON public.event_signups;
CREATE POLICY "Admins can read event signups" ON public.event_signups FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Authenticated users can read subscribers" ON public.newsletter_subscribers;
CREATE POLICY "Admins can read subscribers" ON public.newsletter_subscribers FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Authenticated users can read inquiries" ON public.studio_inquiries;
CREATE POLICY "Admins can read inquiries" ON public.studio_inquiries FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can read orders" ON public.orders FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Customers can read their own orders" ON public.orders FOR SELECT TO authenticated USING (customer_email IS NOT NULL AND lower(customer_email) = lower(coalesce((auth.jwt() ->> 'email'), '')));
GRANT SELECT ON public.orders TO authenticated;

REVOKE ALL ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;