export const VISIBLE_COMPANY_STATUSES = ["active", "verified"] as const;

type JobWithCompany = {
  status: string;
  companies: { status?: string | null } | null;
};

/** Open jobs from active/verified companies only — hides seed/orphan listings. */
export function isCandidateVisibleJob(job: JobWithCompany) {
  if (job.status !== "open") return false;
  const status = job.companies?.status;
  return Boolean(status && VISIBLE_COMPANY_STATUSES.includes(status as (typeof VISIBLE_COMPANY_STATUSES)[number]));
}
