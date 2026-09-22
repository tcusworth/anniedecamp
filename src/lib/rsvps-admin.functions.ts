import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export interface EventSignup {
  id: string;
  event_slug: string;
  name: string;
  email: string;
  phone: string | null;
  guests: number;
  preferred_day: string | null;
  message: string | null;
  created_at: string;
}

export const listEventSignups = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("event_signups")
      .select("id, event_slug, name, email, phone, guests, preferred_day, message, created_at")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []) as EventSignup[];
  });
