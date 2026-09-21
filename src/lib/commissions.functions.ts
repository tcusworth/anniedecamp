import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const commissionSchema = z.object({
  name: z.string().trim().min(1, "Please enter your name").max(100),
  email: z.string().trim().email("Please enter a valid email address").max(255),
  phone: z.string().trim().max(40).optional().default(""),
  subject_matter: z.string().trim().min(1, "Please describe the subject").max(200),
  preferred_size: z.string().trim().max(100).optional().default(""),
  preferred_medium: z.string().trim().max(100).optional().default(""),
  budget_range: z.string().trim().max(100).optional().default(""),
  deadline: z.string().trim().max(100).optional().default(""),
  details: z.string().trim().min(1, "Please tell us about the commission").max(2000),
});

export const submitCommissionRequest = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => commissionSchema.parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: inserted, error } = await supabaseAdmin
      .from("commission_requests")
      .insert({
        name: data.name,
        email: data.email,
        phone: data.phone || null,
        subject_matter: data.subject_matter,
        preferred_size: data.preferred_size || null,
        preferred_medium: data.preferred_medium || null,
        budget_range: data.budget_range || null,
        deadline: data.deadline || null,
        details: data.details,
      })
      .select("id")
      .single();

    if (error) {
      console.error("commission request insert failed", error.message);
      return { ok: false as const, error: "We could not send your request. Please try again." };
    }

    const { sendTemplateEmail } = await import("@/lib/email-templates/send-email");
    const { STUDIO_NOTIFICATION_EMAIL } = await import("@/lib/email-templates/recipients");
    const ref = inserted?.id ?? crypto.randomUUID();

    try {
      await sendTemplateEmail("commission-request-notification", STUDIO_NOTIFICATION_EMAIL, {
        templateData: { ...data },
        idempotencyKey: `commission-notification-${ref}`,
        replyTo: data.email,
      });
    } catch (e) {
      console.error("commission notification failed", e);
    }

    try {
      await sendTemplateEmail("commission-request-confirmation", data.email, {
        templateData: { name: data.name, subject_matter: data.subject_matter },
        idempotencyKey: `commission-confirmation-${ref}`,
      });
    } catch (e) {
      console.error("commission confirmation failed", e);
    }

    return { ok: true as const };
  });
