import { supabase } from "@/lib/supabase";
import {
  APPLICATION_JOURNEY_STATUSES,
  syncPrimaryApplicationStatus,
} from "@/lib/applicationStatusFlow";

export type RelocationCheckpointStatus = "locked" | "available" | "completed";

export type RelocationCheckpoint = {
  id: string;
  application_id: string;
  checkpoint_number: number;
  title: string;
  who_confirms: "company" | "candidate";
  status: RelocationCheckpointStatus;
  event_date: string | null;
  notes: string | null;
  confirmed_by: string | null;
  completed_at: string | null;
  created_at?: string;
  updated_at?: string;
};

export const RELOCATION_CHECKPOINT_DEFS = [
  {
    checkpoint_number: 1,
    title: "Visa & documentation complete",
    who_confirms: "candidate" as const,
    hint: "Work permit approved and any visa steps finished.",
  },
  {
    checkpoint_number: 2,
    title: "Housing secured",
    who_confirms: "candidate" as const,
    hint: "Temporary or permanent accommodation booked.",
    notesRequired: true,
    notesLabel: "Address / housing details",
  },
  {
    checkpoint_number: 3,
    title: "Travel booked",
    who_confirms: "candidate" as const,
    hint: "Flights or travel to the Nordics arranged.",
  },
  {
    checkpoint_number: 4,
    title: "Arrival confirmed",
    who_confirms: "candidate" as const,
    hint: "Confirm your arrival date in the Nordics.",
  },
  {
    checkpoint_number: 5,
    title: "Settling-in essentials",
    who_confirms: "candidate" as const,
    hint: "Bank account, SIM, and local registration as needed.",
    notesRequired: true,
    notesLabel: "What you completed (bank, SIM, registration…)",
  },
  {
    checkpoint_number: 6,
    title: "Employer relocation support confirmed",
    who_confirms: "company" as const,
    hint: "Company confirms relocation support was provided (housing leads, travel, welcome pack, etc.).",
  },
];

export function relocationCheckpointProgress(checkpoints: RelocationCheckpoint[]) {
  const done = checkpoints.filter((c) => c.status === "completed").length;
  return { done, total: 6, percent: Math.round((done / 6) * 100) };
}

export function allRelocationCheckpointsComplete(checkpoints: RelocationCheckpoint[]) {
  return checkpoints.length === 6 && checkpoints.every((c) => c.status === "completed");
}

export function isRelocationUnlocked(input: {
  preArrivalCompletedAt: string | null | undefined;
  applicationStatus: string | null | undefined;
}) {
  if (!input.preArrivalCompletedAt) return false;
  return (
    input.applicationStatus === APPLICATION_JOURNEY_STATUSES.RELOCATION ||
    input.applicationStatus === APPLICATION_JOURNEY_STATUSES.ONBOARDING ||
    input.applicationStatus === APPLICATION_JOURNEY_STATUSES.FOLLOWUP ||
    input.applicationStatus === APPLICATION_JOURNEY_STATUSES.JOURNEY_COMPLETE
  );
}

export function getRelocationLockedReason(
  checkpoint: RelocationCheckpoint,
  checkpoints: RelocationCheckpoint[],
  unlocked: boolean
): string | null {
  if (!unlocked) return "Unlocks after pre-arrival employment is complete";
  if (checkpoint.status !== "locked") return null;
  const prev = checkpoints.find((c) => c.checkpoint_number === checkpoint.checkpoint_number - 1);
  if (prev && prev.status !== "completed") {
    return `Complete checkpoint ${checkpoint.checkpoint_number - 1} first`;
  }
  return "Not yet available";
}

export async function initializeRelocationCheckpoints(applicationId: string) {
  const rows = RELOCATION_CHECKPOINT_DEFS.map((d) => ({
    application_id: applicationId,
    checkpoint_number: d.checkpoint_number,
    title: d.title,
    who_confirms: d.who_confirms,
    status: d.checkpoint_number === 1 ? "available" : "locked",
  }));

  const { error } = await supabase.from("relocation_checkpoints").upsert(rows, {
    onConflict: "application_id,checkpoint_number",
    ignoreDuplicates: true,
  });
  if (error) throw error;
  await refreshRelocationCheckpointUnlocks(applicationId);
}

export async function refreshRelocationCheckpointUnlocks(applicationId: string) {
  const { error } = await supabase.rpc("refresh_relocation_checkpoint_unlocks", {
    p_application_id: applicationId,
  });
  if (error) throw error;
}

export async function confirmRelocationCheckpoint(input: {
  checkpointId: string;
  applicationId: string;
  event_date: string;
  notes?: string;
  confirmed_by?: string | null;
}) {
  const now = new Date().toISOString();
  const { error } = await supabase
    .from("relocation_checkpoints")
    .update({
      status: "completed",
      event_date: input.event_date,
      notes: input.notes?.trim() || null,
      confirmed_by: input.confirmed_by ?? null,
      completed_at: now,
      updated_at: now,
    })
    .eq("id", input.checkpointId);

  if (error) throw error;
  await refreshRelocationCheckpointUnlocks(input.applicationId);

  const { data: completed, error: completeErr } = await supabase.rpc(
    "complete_relocation_if_ready",
    { p_application_id: input.applicationId }
  );
  if (completeErr) throw completeErr;
  if (completed) return;
}

export async function maybeCompleteRelocation(applicationId: string) {
  const { data: record } = await supabase
    .from("activation_records")
    .select("relocation_completed_at, pre_arrival_completed_at")
    .eq("application_id", applicationId)
    .maybeSingle();
  if (!record?.pre_arrival_completed_at || record.relocation_completed_at) return;

  const { data: app } = await supabase
    .from("applications")
    .select("id, status, candidate_id, jobs(title, companies(name)), candidates(profile_id)")
    .eq("id", applicationId)
    .maybeSingle();
  if (!app || app.status !== APPLICATION_JOURNEY_STATUSES.RELOCATION) return;

  const candidateId = app.candidate_id as string;
  const profileId = (app.candidates as { profile_id?: string } | null)?.profile_id;
  const jobTitle = (app.jobs as { title?: string } | null)?.title ?? "your role";
  const companyName = (app.jobs as { companies?: { name?: string } | null } | null)?.companies?.name;
  const now = new Date().toISOString();

  await supabase
    .from("activation_records")
    .update({ relocation_completed_at: now, updated_at: now })
    .eq("application_id", applicationId);

  const { data: progress } = await supabase
    .from("candidate_stage_progress")
    .select("id, stage_id, status")
    .eq("candidate_id", candidateId);

  const relocationRow = progress?.find((p) => p.stage_id === "relocation");
  if (relocationRow && relocationRow.status !== "completed") {
    await supabase
      .from("candidate_stage_progress")
      .update({ status: "completed", completed_at: now })
      .eq("id", relocationRow.id);
  }

  await syncPrimaryApplicationStatus(candidateId, APPLICATION_JOURNEY_STATUSES.ONBOARDING);

  const onboardingRow = progress?.find((p) => p.stage_id === "onboarding");
  if (onboardingRow) {
    await supabase
      .from("candidate_stage_progress")
      .update({ status: "active", started_at: now })
      .eq("id", onboardingRow.id);
  } else {
    await supabase.from("candidate_stage_progress").insert({
      candidate_id: candidateId,
      stage_id: "onboarding",
      status: "active",
      started_at: now,
    });
  }

  if (profileId) {
    await supabase.from("notifications").insert({
      user_id: profileId,
      title: "Relocation complete",
      body: `All relocation steps are done${companyName ? ` for ${companyName}` : ""}. Onboarding is next.`,
      type: "relocation_complete",
      metadata: { applicationId, jobTitle, companyName },
    });
  }
}
