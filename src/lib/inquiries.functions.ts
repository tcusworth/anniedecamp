import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const inquirySchema = z.object({
  name: z.string().trim().min(1, "Please enter your name").max(100),
  email: z.string().trim().email("Please enter a valid email address").max(255),
  subject: z.string().trim().max(150).optional().default(""),
  message: z.string().trim().min(1, "Please enter a message").max(2000),
});

export const submitStudioInquiry = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => inquirySchema.parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: inserted, error } = await supabaseAdmin
      .from("studio_inquiries")
      .insert({
        name: data.name,
        email: data.email,
        subject: data.subject || null,
        message: data.message,
      })
      .select("id")
      .single();

    if (error) {
      console.error("studio inquiry insert failed", error.message);
      return { ok: false as const, error: "We could not send your message. Please try again." };
    }

    const { sendTemplateEmail } = await import("@/lib/email-templates/send-email");
    const { STUDIO_NOTIFICATION_EMAIL } = await import("@/lib/email-templates/recipients");
    const ref = inserted?.id ?? crypto.randomUUID();

    try {
      await sendTemplateEmail("studio-inquiry-notification", STUDIO_NOTIFICATION_EMAIL, {
        templateData: {
          name: data.name,
          email: data.email,
          subject: data.subject,
          message: data.message,
        },
        idempotencyKey: `studio-inquiry-notification-${ref}`,
        replyTo: data.email,
      });
    } catch (e) {
      console.error("studio inquiry notification failed", e);
    }

    try {
      await sendTemplateEmail("studio-inquiry-confirmation", data.email, {
        templateData: { name: data.name },
        idempotencyKey: `studio-inquiry-confirmation-${ref}`,
      });
    } catch (e) {
      console.error("studio inquiry confirmation failed", e);
    }

    return { ok: true as const };
  });
