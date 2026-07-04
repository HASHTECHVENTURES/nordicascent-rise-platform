import { supabase } from "@/lib/supabase";
import { TRACK_META, type Track } from "@/lib/track";

const FAST_TRACK_SKIP_STAGES = ["internship"] as const;

/** After profile + university, mark preparation done. Does NOT open Readiness —
 *  candidates go to Selection (apply to jobs) next. Readiness unlocks after
 *  selection + mentor assignment (Module 2). */
export async function completePreparationStage(candidateId: string, track: Track) {
  const now = new Date().toISOString();
  const { data: progress } = await supabase
    .from("candidate_stage_progress")
    .select("id, stage_id, status")
    .eq("candidate_id", candidateId);

  const rows = progress ?? [];

  const prep = rows.find((p) => p.stage_id === "preparation");
  if (prep && prep.status !== "completed") {
    await supabase
      .from("candidate_stage_progress")
      .update({ status: "completed", completed_at: now })
      .eq("id", prep.id);
  } else if (!prep) {
    await supabase.from("candidate_stage_progress").insert({
      candidate_id: candidateId,
      stage_id: "preparation",
      status: "completed",
      completed_at: now,
    });
  }

  // Activate the next stage in track (Selection after preparation).
  const nextStage = TRACK_META[track].stages.includes("selection")
    ? "selection"
    : TRACK_META[track].stages[1] ?? null;
  if (nextStage) {
    const nextRow = rows.find((p) => p.stage_id === nextStage);
    if (nextRow) {
      if (nextRow.status === "not_started") {
        await supabase
          .from("candidate_stage_progress")
          .update({ status: "active", started_at: now })
          .eq("id", nextRow.id);
      }
    } else {
      await supabase.from("candidate_stage_progress").insert({
        candidate_id: candidateId,
        stage_id: nextStage,
        status: "active",
        started_at: now,
      });
    }
  }

  if (track === "fast") {
    const internship = rows.find((p) => p.stage_id === "internship");
    if (internship && internship.status !== "completed") {
      await supabase
        .from("candidate_stage_progress")
        .update({ status: "completed", completed_at: now })
        .eq("id", internship.id);
    } else if (!internship) {
      await supabase.from("candidate_stage_progress").insert({
        candidate_id: candidateId,
        stage_id: "internship",
        status: "completed",
        completed_at: now,
      });
    }
  }
}

/** Legacy: mark preparation done and open Readiness directly.
 *  Kept for backward compatibility — prefer completePreparationStage for new flow. */
export async function completePreparationAndActivateReadiness(candidateId: string, track: Track) {
  const now = new Date().toISOString();
  const { data: progress } = await supabase
    .from("candidate_stage_progress")
    .select("id, stage_id, status")
    .eq("candidate_id", candidateId);

  const rows = progress ?? [];

  const prep = rows.find((p) => p.stage_id === "preparation");
  if (prep && prep.status !== "completed") {
    await supabase
      .from("candidate_stage_progress")
      .update({ status: "completed", completed_at: now })
      .eq("id", prep.id);
  } else if (!prep) {
    await supabase.from("candidate_stage_progress").insert({
      candidate_id: candidateId,
      stage_id: "preparation",
      status: "completed",
      completed_at: now,
    });
  }

  const readiness = rows.find((p) => p.stage_id === "readiness");
  if (readiness) {
    if (readiness.status === "not_started") {
      await supabase
        .from("candidate_stage_progress")
        .update({ status: "active", started_at: now })
        .eq("id", readiness.id);
    }
  } else {
    await supabase.from("candidate_stage_progress").insert({
      candidate_id: candidateId,
      stage_id: "readiness",
      status: "active",
      started_at: now,
    });
  }

  if (track === "fast") {
    const internship = rows.find((p) => p.stage_id === "internship");
    if (internship && internship.status !== "completed") {
      await supabase
        .from("candidate_stage_progress")
        .update({ status: "completed", completed_at: now })
        .eq("id", internship.id);
    } else if (!internship) {
      await supabase.from("candidate_stage_progress").insert({
        candidate_id: candidateId,
        stage_id: "internship",
        status: "completed",
        completed_at: now,
      });
    }
  }
}

/** After all readiness tests submitted, activate mentoring stage. */
export async function activateMentoringStage(candidateId: string) {
  const now = new Date().toISOString();
  const { data: progress } = await supabase
    .from("candidate_stage_progress")
    .select("id, stage_id, status")
    .eq("candidate_id", candidateId);

  const rows = progress ?? [];
  const readiness = rows.find((p) => p.stage_id === "readiness");
  if (readiness && readiness.status !== "completed") {
    await supabase
      .from("candidate_stage_progress")
      .update({ status: "completed", completed_at: now })
      .eq("id", readiness.id);
  }

  const mentoring = rows.find((p) => p.stage_id === "mentoring");
  if (mentoring) {
    if (mentoring.status !== "active" && mentoring.status !== "completed") {
      await supabase
        .from("candidate_stage_progress")
        .update({ status: "active", started_at: now })
        .eq("id", mentoring.id);
    }
  } else {
    await supabase.from("candidate_stage_progress").insert({
      candidate_id: candidateId,
      stage_id: "mentoring",
      status: "active",
      started_at: now,
    });
  }
}

/** After admin unlocks jobs from Mentoring panel, complete mentoring and open selection. */
export async function activateJobsAfterMentoringUnlock(candidateId: string, track: Track) {
  const now = new Date().toISOString();
  const { data: progress } = await supabase
    .from("candidate_stage_progress")
    .select("id, stage_id, status")
    .eq("candidate_id", candidateId);

  const rows = progress ?? [];

  for (const stageId of ["mentoring", "readiness"] as const) {
    const row = rows.find((p) => p.stage_id === stageId);
    if (row && row.status !== "completed") {
      await supabase
        .from("candidate_stage_progress")
        .update({ status: "completed", completed_at: now })
        .eq("id", row.id);
    }
  }

  const nextStage = TRACK_META[track].stages.includes("selection") ? "selection" : "activation";
  const next = rows.find((p) => p.stage_id === nextStage);
  if (next) {
    if (next.status === "not_started") {
      await supabase
        .from("candidate_stage_progress")
        .update({ status: "active", started_at: now })
        .eq("id", next.id);
    }
  } else {
    await supabase.from("candidate_stage_progress").insert({
      candidate_id: candidateId,
      stage_id: nextStage,
      status: "active",
      started_at: now,
    });
  }
}
