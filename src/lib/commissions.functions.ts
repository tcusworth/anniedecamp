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

    const { error } = await supabaseAdmin.from("commission_requests").insert({
      name: data.name,
      email: data.email,
      phone: data.phone || null,
      subject_matter: data.subject_matter,
      preferred_size: data.preferred_size || null,
      preferred_medium: data.preferred_medium || null,
      budget_range: data.budget_range || null,
      deadline: data.deadline || null,
      details: data.details,
    });

    if (error) {
      console.error("commission request insert failed", error.message);
      return { ok: false as const, error: "We could not send your request. Please try again." };
    }

    return { ok: true as const };
  });
