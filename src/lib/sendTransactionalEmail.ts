import { isTransactionalEmailEnabled } from "@/lib/externalIntegrations";
import { supabase } from "@/lib/supabase";

export type TransactionalEmailPayload = {
  to: string;
  subject: string;
  html: string;
  text?: string;
};

export type SendEmailResult = {
  ok: boolean;
  skipped?: boolean;
  reason?: string;
};

/**
 * Placeholder for client-phase email (Resend/SMTP).
 * When disabled, returns immediately — in-app notifications remain the channel.
 */
export async function sendTransactionalEmail(
  payload: TransactionalEmailPayload
): Promise<SendEmailResult> {
  if (!isTransactionalEmailEnabled()) {
    return { ok: false, skipped: true, reason: "integration_not_connected" };
  }

  const to = payload.to?.trim();
  if (!to) return { ok: false, skipped: true, reason: "no_recipient" };

  try {
    const { data, error } = await supabase.functions.invoke<SendEmailResult>(
      "send-transactional-email",
      { body: payload }
    );
    if (error) {
      console.warn("Transactional email invoke failed:", error.message);
      return { ok: false, skipped: true, reason: error.message };
    }
    return data ?? { ok: true };
  } catch (err) {
    console.warn("Transactional email error:", err);
    return {
      ok: false,
      skipped: true,
      reason: err instanceof Error ? err.message : "unknown",
    };
  }
}

export async function sendEmailToAddress(
  to: string,
  subject: string,
  html: string,
  text?: string
) {
  return sendTransactionalEmail({ to, subject, html, text });
}
