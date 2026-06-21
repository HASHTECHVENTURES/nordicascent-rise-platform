import { supabase } from "@/lib/supabase";
import type { Candidate, Profile } from "@/types/database";
import { computeStageReadiness, isTaskRequirementMet } from "@/lib/profileCompleteness";
import { completePreparationIfReady } from "@/lib/pipelineProgress";

/** Auto-complete preparation tasks when profile data in DB meets requirements. */
export async function syncEligibleTasks(
  candidateId: string,
  profile: Profile,
  candidate: Candidate
): Promise<boolean> {
  const { data: tasks, error } = await supabase.from("stage_tasks").select("id, title, stage_id");
  if (error || !tasks?.length) return false;

  const { data: completed } = await supabase
    .from("candidate_task_progress")
    .select("task_id")
    .eq("candidate_id", candidateId);

  const completedIds = new Set((completed ?? []).map((c) => c.task_id));
  let changed = false;

  for (const task of tasks) {
    // Only preparation tasks sync from profile — later stages need real actions.
    if (task.stage_id !== "preparation") continue;
    if (completedIds.has(task.id)) continue;
    if (!isTaskRequirementMet(task.title, profile, candidate)) continue;

    const { error: insertError } = await supabase.from("candidate_task_progress").insert({
      candidate_id: candidateId,
      task_id: task.id,
    });
    if (insertError) continue;

    changed = true;
    completedIds.add(task.id);
  }

  if (changed) {
    const prepTasks = tasks.filter((t) => t.stage_id === "preparation");
    const readiness = computeStageReadiness(
      prepTasks.filter((t) => completedIds.has(t.id)).length,
      prepTasks.length
    );
    await supabase.from("candidates").update({ readiness_score: readiness }).eq("id", candidateId);
    await completePreparationIfReady(candidateId);
  }

  return changed;
}
