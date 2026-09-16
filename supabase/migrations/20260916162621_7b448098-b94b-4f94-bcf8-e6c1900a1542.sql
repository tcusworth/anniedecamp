CREATE TABLE public.commission_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  subject_matter text NOT NULL,
  preferred_size text,
  preferred_medium text,
  budget_range text,
  deadline text,
  details text NOT NULL,
  handled boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.commission_requests TO service_role;
GRANT SELECT ON public.commission_requests TO authenticated;
ALTER TABLE public.commission_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can read commission requests" ON public.commission_requests FOR SELECT TO authenticated USING (true);