import { supabase } from "@/lib/supabase";
import { onSelectionStatusChange } from "@/lib/selectionEffects";
import { SELECTION_STATUSES } from "@/lib/selectionModule";

const HOLD_REJECT_SELECT = `
  id,
  candidate_id,
  job_id,
  status,
  technical_company_participated,
  motivation_company_participated,
  jobs(title, company_id),
  candidates(id, profile_id, profiles(id))
`;

/** When a job is closed, reject all HOLD backup candidates and notify them. */
export async function rejectHoldApplicationsForClosedJob(jobId: string): Promise<number> {
  const { data: apps, error } = await supabase
    .from("applications")
    .select(HOLD_REJECT_SELECT)
    .eq("job_id", jobId)
    .eq("status", SELECTION_STATUSES.SELECTION_HOLD);

  if (error) throw error;
  if (!apps?.length) return 0;

  const now = new Date().toISOString();

  for (const app of apps) {
    const { error: updErr } = await supabase
      .from("applications")
      .update({
        status: SELECTION_STATUSES.SELECTION_REJECTED,
        needs_action: false,
        updated_at: now,
      })
      .eq("id", app.id);
    if (updErr) throw updErr;

    const profile = (app as { candidates?: { profiles?: { id: string } | null } | null }).candidates
      ?.profiles;
    const job = (app as { jobs?: { title?: string; company_id?: string | null } | null }).jobs;
    const jobTitle = job?.title ?? "this role";

    if (profile?.id) {
      await onSelectionStatusChange(
        {
          applicationId: app.id,
          candidateId: app.candidate_id,
          profileId: profile.id,
          jobId: app.job_id,
          jobTitle,
          companyId: job?.company_id ?? null,
          step: 5,
          decision: "reject",
          newStatus: SELECTION_STATUSES.SELECTION_REJECTED,
          companyParticipatedStep3: Boolean(app.technical_company_participated),
          companyParticipatedStep4: Boolean(app.motivation_company_participated),
        },
        null
      );
    }
  }

  return apps.length;
}

export async function countHoldApplicationsForJob(jobId: string): Promise<number> {
  const { count, error } = await supabase
    .from("applications")
    .select("id", { count: "exact", head: true })
    .eq("job_id", jobId)
    .eq("status", SELECTION_STATUSES.SELECTION_HOLD);
  if (error) throw error;
  return count ?? 0;
}
