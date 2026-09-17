import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const signupSchema = z.object({
  event_slug: z.string().trim().min(1).max(120),
  name: z.string().trim().min(1, "Please enter your name").max(100),
  email: z.string().trim().email("Please enter a valid email address").max(255),
  phone: z.string().trim().max(40).optional().default(""),
  guests: z.number().int().min(1, "At least one guest").max(20, "Max 20 guests").optional().default(1),
  message: z.string().trim().max(2000).optional().default(""),
});

export const submitEventSignup = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => signupSchema.parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { error } = await supabaseAdmin.from("event_signups").insert({
      event_slug: data.event_slug,
      name: data.name,
      email: data.email,
      phone: data.phone || null,
      guests: data.guests,
      message: data.message || null,
    });

    if (error) {
      console.error("event signup insert failed", error.message);
      return { ok: false as const, error: "We could not save your RSVP. Please try again." };
    }

    return { ok: true as const };
  });
