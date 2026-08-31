/** Fallback when RPC is unavailable; must match privacy_notices seed version. */
export const DEFAULT_PRIVACY_NOTICE_VERSION = "2026-01";

/** Suggested retention periods (days from today) by candidate status group. */
export const RETENTION_SUGGESTIONS: Record<string, number> = {
  rejected: 730,
  selection_rejected: 730,
  withdrawn: 730,
  journey_complete: 2555,
  alumni: 2555,
  applied: 365,
  application_complete: 365,
  pool: 365,
  default: 1825,
};

export function suggestRetentionDate(status: string): string {
  const days = RETENTION_SUGGESTIONS[status] ?? RETENTION_SUGGESTIONS.default;
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}
