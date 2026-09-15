CREATE TABLE public.studio_inquiries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT,
  message TEXT NOT NULL,
  handled BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
GRANT SELECT ON public.studio_inquiries TO authenticated;
GRANT ALL ON public.studio_inquiries TO service_role;
ALTER TABLE public.studio_inquiries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can read inquiries" ON public.studio_inquiries FOR SELECT TO authenticated USING (true);
CREATE INDEX idx_studio_inquiries_created_at ON public.studio_inquiries (created_at DESC);