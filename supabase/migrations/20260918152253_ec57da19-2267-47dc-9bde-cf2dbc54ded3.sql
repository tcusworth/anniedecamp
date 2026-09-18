DROP INDEX IF EXISTS public.newsletter_subscribers_email_key;
ALTER TABLE public.newsletter_subscribers ADD CONSTRAINT newsletter_subscribers_email_unique UNIQUE (email);