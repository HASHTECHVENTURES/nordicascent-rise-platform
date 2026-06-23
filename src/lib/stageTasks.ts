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

/** Tasks a candidate should see for a pipeline stage. */
export async function fetchStageTasksForCandidate(
  candidateId: string | undefined,
  stageId: string
) {
  if ((stageId === "internship" || stageId === "activation") && candidateId) {
    const companyId = await getCandidateAcceptedCompanyId(candidateId);
    if (!companyId) return [];

    const { data, error } = await supabase
      .from("stage_tasks")
      .select("*")
      .eq("stage_id", stageId)
      .eq("company_id", companyId)
      .order("sort_order");
    if (error) throw error;
    return data ?? [];
  }

  const { data, error } = await supabase
    .from("stage_tasks")
    .select("*")
    .eq("stage_id", stageId)
    .is("company_id", null)
    .order("sort_order");
  if (error) throw error;
  return data ?? [];
}

export async function fetchStageTaskIdsForCandidate(
  candidateId: string,
  stageId: string
): Promise<string[]> {
  const tasks = await fetchStageTasksForCandidate(candidateId, stageId);
  return tasks.map((t) => t.id);
}
