import { supabase } from "@/lib/supabase";
import { fetchStageTaskIdsForCandidate } from "@/lib/stageTasks";
import { TRACK_META, type Track } from "@/lib/track";
import { getSelectionStepState, type ApplicationRow } from "@/lib/applicationJourney";

const FAST_TRACK_SKIP_STAGES = ["internship"] as const;

/** Align pipeline stage progress when a candidate's program track changes. */
export async function syncPipelineForTrack(candidateId: string, track: Track) {
  const now = new Date().toISOString();
  const { data: progress } = await supabase
    .from("candidate_stage_progress")
    .select("id, stage_id, status")
    .eq("candidate_id", candidateId);

  const rows = progress ?? [];
  const firstStage = TRACK_META[track].stages[0];

  if (track === "fast") {
    for (const stageId of FAST_TRACK_SKIP_STAGES) {
      const row = rows.find((p) => p.stage_id === stageId);
      if (row) {
        if (row.status !== "completed") {
          await supabase
            .from("candidate_stage_progress")
            .update({ status: "completed", completed_at: now })
            .eq("id", row.id);
        }
      } else {
        await supabase.from("candidate_stage_progress").insert({
          candidate_id: candidateId,
          stage_id: stageId,
          status: "completed",
          completed_at: now,
        });
      }
    }

    const trackStages = TRACK_META.fast.stages;
    const { data: refreshed } = await supabase
      .from("candidate_stage_progress")
      .select("id, stage_id, status")
      .eq("candidate_id", candidateId);

    const refreshedRows = refreshed ?? [];
    const hasActiveInTrack = refreshedRows.some(
      (p) => trackStages.includes(p.stage_id) && p.status === "active"
    );
    if (hasActiveInTrack) return;

    for (const stageId of trackStages) {
      const row = refreshedRows.find((p) => p.stage_id === stageId);
      if (row?.status === "completed") continue;
      if (row) {
        await supabase
          .from("candidate_stage_progress")
          .update({ status: "active", started_at: now })
          .eq("id", row.id);
      } else {
        await supabase.from("candidate_stage_progress").insert({
          candidate_id: candidateId,
          stage_id: stageId,
          status: "active",
          started_at: now,
        });
      }
      return;
    }
    return;
  }

  if (!rows.length && firstStage) {
    await supabase.from("candidate_stage_progress").insert({
      candidate_id: candidateId,
      stage_id: firstStage,
      status: "active",
      started_at: now,
    });
  }
}

export async function completePreparationIfReady(candidateId: string): Promise<boolean> {
  const { data: tasks } = await supabase.from("stage_tasks").select("id").eq("stage_id", "preparation");
  if (!tasks?.length) return false;

  const { data: completed } = await supabase
    .from("candidate_task_progress")
    .select("task_id")
    .eq("candidate_id", candidateId);

  const done = new Set((completed ?? []).map((c) => c.task_id));
  if (!tasks.every((t) => done.has(t.id))) return false;

  const { data: prepRow } = await supabase
    .from("candidate_stage_progress")
    .select("id, status")
    .eq("candidate_id", candidateId)
    .eq("stage_id", "preparation")
    .maybeSingle();

  if (!prepRow || prepRow.status === "completed") return false;

  const now = new Date().toISOString();
  await supabase
    .from("candidate_stage_progress")
    .update({ status: "completed", completed_at: now })
    .eq("id", prepRow.id);

  return true;
}

/** Mark a stage complete and activate the next when all its tasks are done. */
export async function completeStageIfTasksDone(
  candidateId: string,
  stageId: string
): Promise<boolean> {
  const taskIds = await fetchStageTaskIdsForCandidate(candidateId, stageId);
  if (!taskIds.length) return false;

  const { data: completed } = await supabase
    .from("candidate_task_progress")
    .select("task_id")
    .eq("candidate_id", candidateId);

  const done = new Set((completed ?? []).map((c) => c.task_id));
  if (!taskIds.every((id) => done.has(id))) return false;

  const { data: stageRow } = await supabase
    .from("candidate_stage_progress")
    .select("id, status")
    .eq("candidate_id", candidateId)
    .eq("stage_id", stageId)
    .maybeSingle();

  if (stageRow?.status === "completed") return false;

  if (stageId === "readiness") {
    await ensureSelectionCompleteIfAccepted(candidateId);
  }

  if (!stageRow) {
    const now = new Date().toISOString();
    await supabase.from("candidate_stage_progress").insert({
      candidate_id: candidateId,
      stage_id: stageId,
      status: "active",
      started_at: now,
    });
  }

  await advanceCandidateStage(candidateId, stageId);
  return true;
}

/** Selection is driven by application status — advance when employer steps are complete. */
export async function completeSelectionIfReady(
  candidateId: string,
  applications: ApplicationRow[]
): Promise<boolean> {
  const steps = getSelectionStepState(applications);
  if (!steps.length || !steps.every((s) => s.done)) return false;

  const { data: stageRow } = await supabase
    .from("candidate_stage_progress")
    .select("id, status")
    .eq("candidate_id", candidateId)
    .eq("stage_id", "selection")
    .maybeSingle();

  if (stageRow?.status === "completed") return false;

  await advanceCandidateStage(candidateId, "selection");
  return true;
}

async function ensureSelectionCompleteIfAccepted(candidateId: string) {
  const { data: apps } = await supabase
    .from("applications")
    .select("status")
    .eq("candidate_id", candidateId);
  const accepted = apps?.some((a) => a.status === "accepted");
  if (!accepted) return;

  const { data: selRow } = await supabase
    .from("candidate_stage_progress")
    .select("id, status")
    .eq("candidate_id", candidateId)
    .eq("stage_id", "selection")
    .maybeSingle();

  if (selRow && selRow.status !== "completed") {
    const now = new Date().toISOString();
    await supabase
      .from("candidate_stage_progress")
      .update({ status: "completed", completed_at: now })
      .eq("id", selRow.id);
  }
}

export async function advanceCandidateStage(candidateId: string, currentStageId?: string) {
  const { data: candidate } = await supabase
    .from("candidates")
    .select("track")
    .eq("id", candidateId)
    .maybeSingle();
  const track = (candidate?.track ?? "entry") as Track;
  const allowedStages = new Set(TRACK_META[track].stages);

  const { data: stages } = await supabase
    .from("pipeline_stages")
    .select("id, sort_order")
    .order("sort_order");
  if (!stages?.length) return;

  const { data: progress } = await supabase
    .from("candidate_stage_progress")
    .select("id, stage_id, status")
    .eq("candidate_id", candidateId);

  const active = progress?.find((p) => p.status === "active");
  const stageId = currentStageId ?? active?.stage_id;
  if (!stageId) return;

  const idx = stages.findIndex((s) => s.id === stageId);
  if (idx < 0) return;

  const now = new Date().toISOString();
  const currentRow = progress?.find((p) => p.stage_id === stageId);
  if (currentRow) {
    await supabase
      .from("candidate_stage_progress")
      .update({ status: "completed", completed_at: now })
      .eq("id", currentRow.id);
  }

  let nextIdx = idx + 1;
  while (nextIdx < stages.length && !allowedStages.has(stages[nextIdx].id)) {
    const skipped = stages[nextIdx];
    const skippedRow = progress?.find((p) => p.stage_id === skipped.id);
    if (skippedRow) {
      if (skippedRow.status !== "completed") {
        await supabase
          .from("candidate_stage_progress")
          .update({ status: "completed", completed_at: now })
          .eq("id", skippedRow.id);
      }
    } else {
      await supabase.from("candidate_stage_progress").insert({
        candidate_id: candidateId,
        stage_id: skipped.id,
        status: "completed",
        completed_at: now,
      });
    }
    nextIdx++;
  }

  const next = stages[nextIdx];
  if (next) {
    const nextRow = progress?.find((p) => p.stage_id === next.id);
    if (nextRow) {
      await supabase
        .from("candidate_stage_progress")
        .update({ status: "active", started_at: now })
        .eq("id", nextRow.id);
    } else {
      await supabase.from("candidate_stage_progress").insert({
        candidate_id: candidateId,
        stage_id: next.id,
        status: "active",
        started_at: now,
      });
    }
  }
}
