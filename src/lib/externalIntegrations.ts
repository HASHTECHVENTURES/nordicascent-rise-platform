/**
 * External services not wired in the current MVP.
 * Flip `connected` to true when the client approves integration work.
 */
export const EXTERNAL_INTEGRATIONS = {
  offee: {
    connected: false,
    label: "Offee assessment",
    clientScope:
      "External AI assessment tool — API or automated export/import (currently manual CSV + score entry).",
  },
  transactionalEmail: {
    connected: false,
    label: "Transactional email",
    clientScope:
      "Resend/SMTP + verified domain for Offee invites, session invites, and selection updates.",
  },
} as const;

export function isOffeeConnected() {
  return EXTERNAL_INTEGRATIONS.offee.connected;
}

export function isTransactionalEmailEnabled() {
  return EXTERNAL_INTEGRATIONS.transactionalEmail.connected;
}
