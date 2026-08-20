import { supabase } from "@/lib/supabase";

export async function getCandidateAcceptedCompanyId(candidateId: string): Promise<string | null> {
  const { data } = await supabase
    .from("applications")
    .select("jobs!inner(company_id)")
    .eq("candidate_id", candidateId)
    .eq("status", "accepted")
    .limit(1)
    .maybeSingle();

  const jobs = data?.jobs as { company_id: string } | { company_id: string }[] | null;
  if (Array.isArray(jobs)) return jobs[0]?.company_id ?? null;
  return jobs?.company_id ?? null;
}

export function isPlatformStageTask(task: { company_id: string | null }) {
  return task.company_id == null;
}

/** Nordic Ascent defaults (admin Program Tasks) plus optional company extras. */
export async function fetchCompanyOrPlatformStageTasks(stageId: string, companyId?: string | null) {
  let query = supabase.from("stage_tasks").select("*").eq("stage_id", stageId);
  if (companyId) {
    query = query.or(`company_id.eq.${companyId},company_id.is.null`);
  } else {
    query = query.is("company_id", null);
  }
  const { data, error } = await query
    .order("company_id", { ascending: true, nullsFirst: true })
    .order("sort_order");
  if (error) throw error;
  return data ?? [];
}

export async function fetchPlatformStageTasks() {
  const { data, error } = await supabase
    .from("stage_tasks")
    .select("*")
    .is("company_id", null)
    .order("stage_id")
    .order("sort_order");
  if (error) throw error;
  return data ?? [];
}

/** Tasks a candidate should see for a pipeline stage. */
export async function fetchStageTasksForCandidate(
  candidateId: string | undefined,
  stageId: string
) {
  if ((stageId === "internship" || stageId === "activation") && candidateId) {
    const companyId = await getCandidateAcceptedCompanyId(candidateId);
    return fetchCompanyOrPlatformStageTasks(stageId, companyId);
  }

  return fetchCompanyOrPlatformStageTasks(stageId, null);
}

export async function fetchStageTaskIdsForCandidate(
  candidateId: string,
  stageId: string
): Promise<string[]> {
  const tasks = await fetchStageTasksForCandidate(candidateId, stageId);
  return tasks.map((t) => t.id);
}
