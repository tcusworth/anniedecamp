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

    const { error } = await supabaseAdmin.from("studio_inquiries").insert({
      name: data.name,
      email: data.email,
      subject: data.subject || null,
      message: data.message,
    });

    if (error) {
      console.error("studio inquiry insert failed", error.message);
      return { ok: false as const, error: "We could not send your message. Please try again." };
    }

    return { ok: true as const };
  });
