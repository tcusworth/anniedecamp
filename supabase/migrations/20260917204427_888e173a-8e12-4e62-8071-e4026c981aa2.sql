CREATE TABLE public.event_signups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_slug TEXT NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  guests INTEGER NOT NULL DEFAULT 1,
  message TEXT,
  handled BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
GRANT SELECT ON public.event_signups TO authenticated;
GRANT ALL ON public.event_signups TO service_role;
ALTER TABLE public.event_signups ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can read event signups" ON public.event_signups FOR SELECT TO authenticated USING (true);
CREATE INDEX idx_event_signups_created_at ON public.event_signups (created_at DESC);
CREATE INDEX idx_event_signups_event_slug ON public.event_signups (event_slug);