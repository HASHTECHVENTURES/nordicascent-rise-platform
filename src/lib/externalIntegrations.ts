/**
 * External services.
 * Transactional email uses the `send-transactional-email` edge function (Resend).
 * Set RESEND_API_KEY (+ optional TRANSACTIONAL_EMAIL_FROM) in Supabase function secrets.
 * Override with VITE_TRANSACTIONAL_EMAIL=false to disable client-side sends.
 */
export const EXTERNAL_INTEGRATIONS = {
  offee: {
    connected: false,
    label: "Offee assessment",
    clientScope:
      "External AI assessment tool — API or automated export/import (currently manual CSV + score entry).",
  },
  transactionalEmail: {
    connected: import.meta.env.VITE_TRANSACTIONAL_EMAIL !== "false",
    label: "Transactional email",
    clientScope:
      "Resend via send-transactional-email edge function — mentor invites, session invites, selection updates.",
  },
} as const;

export function isOffeeConnected() {
  return EXTERNAL_INTEGRATIONS.offee.connected;
}

export function isTransactionalEmailEnabled() {
  return EXTERNAL_INTEGRATIONS.transactionalEmail.connected;
}
