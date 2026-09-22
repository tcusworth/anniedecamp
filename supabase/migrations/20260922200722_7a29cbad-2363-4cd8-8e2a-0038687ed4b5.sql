INSERT INTO public.user_roles (user_id, role)
VALUES ('684af0d6-12fd-4eaf-b44d-20c5dfaeb602', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;