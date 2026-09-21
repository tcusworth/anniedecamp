import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const signupSchema = z.object({
  event_slug: z.string().trim().min(1).max(120),
  name: z.string().trim().min(1, "Please enter your name").max(100),
  email: z.string().trim().email("Please enter a valid email address").max(255),
  phone: z.string().trim().max(40).optional().default(""),
  guests: z.number().int().min(1, "At least one guest").max(20, "Max 20 guests").optional().default(1),
  message: z.string().trim().max(2000).optional().default(""),
  preferred_day: z.string().trim().max(200).optional().default(""),
});

const EVENTS: Record<string, { name: string; when: string; where: string }> = {
  "annie-decamp-art-show-sept-24": {
    name: "Annie Decamp Art Show",
    when: "September 24, 4–7 pm",
    where: "Rogala Design, 395 S. Broadway, Denver, Suite #118w",
  },
  "holiday-art-salon-nov-13-15": {
    name: "Holiday Art Salon",
    when: "Nov 13, 2–5 pm · Nov 14, noon–9 pm · Nov 15, noon–4 pm",
    where: "100 N Gaylord Street, Denver CO 80206",
  },
};

export const submitEventSignup = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => signupSchema.parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: inserted, error } = await supabaseAdmin
      .from("event_signups")
      .insert({
        event_slug: data.event_slug,
        name: data.name,
        email: data.email,
        phone: data.phone || null,
        guests: data.guests,
        message: data.message || null,
        preferred_day: data.preferred_day || null,
      })
      .select("id")
      .single();

    if (error) {
      console.error("event signup insert failed", error.message);
      return { ok: false as const, error: "We could not save your RSVP. Please try again." };
    }

    const event = EVENTS[data.event_slug] ?? {
      name: data.event_slug,
      when: "",
      where: "",
    };
    const { sendTemplateEmail } = await import("@/lib/email-templates/send-email");
    const { STUDIO_NOTIFICATION_EMAIL } = await import("@/lib/email-templates/recipients");
    const ref = inserted?.id ?? crypto.randomUUID();

    try {
      await sendTemplateEmail("event-rsvp-notification", STUDIO_NOTIFICATION_EMAIL, {
        templateData: {
          event_name: event.name,
          name: data.name,
          email: data.email,
          phone: data.phone,
          guests: data.guests,
          preferred_day: data.preferred_day,
          message: data.message,
        },
        idempotencyKey: `rsvp-notification-${ref}`,
        replyTo: data.email,
      });
    } catch (e) {
      console.error("rsvp notification failed", e);
    }

    try {
      await sendTemplateEmail("event-rsvp-confirmation", data.email, {
        templateData: {
          name: data.name,
          event_name: event.name,
          event_when: event.when,
          event_where: event.where,
          preferred_day: data.preferred_day,
          guests: data.guests,
        },
        idempotencyKey: `rsvp-confirmation-${ref}`,
      });
    } catch (e) {
      console.error("rsvp confirmation failed", e);
    }

    return { ok: true as const };
  });
