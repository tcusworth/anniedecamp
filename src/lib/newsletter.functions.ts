import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const schema = z.object({
  email: z.string().trim().email().max(320),
  name: z.string().trim().max(120).optional().default(""),
  source: z.string().trim().max(60).optional().default("site"),
});

export const subscribeToNewsletter = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => schema.parse(data))
  .handler(async ({ data }): Promise<{ ok: true } | { error: string }> => {
    try {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const { error } = await supabaseAdmin
        .from("newsletter_subscribers")
        .upsert(
          {
            email: data.email.toLowerCase(),
            name: data.name || null,
            source: data.source || "site",
            active: true,
          },
          { onConflict: "email" },
        );
      if (error && !/duplicate key/i.test(error.message)) throw new Error(error.message);
      return { ok: true };
    } catch (e) {
      return { error: e instanceof Error ? e.message : "Could not sign you up right now." };
    }
  });
