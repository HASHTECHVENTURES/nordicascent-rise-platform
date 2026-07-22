import { supabase } from "@/lib/supabase";
import { APPLICATION_JOURNEY_STATUSES } from "@/lib/applicationStatusFlow";
import { initializeRelocationSteps } from "@/lib/relocationModule";
import type { Track } from "@/lib/track";

export type ActivationStatus =
  | "ready_for_activation"
  | "internship_active"
  | "internship_complete"
  | "cleared"
  | "on_hold"
  | "rejected_activation";

export type InternshipCheckpointStatus = "locked" | "available" | "completed";

export type InternshipCheckpoint = {
  id: string;
  application_id: string;
  checkpoint_number: number;
  phase: "onboarding" | "execution" | "review";
  title: string;
  who_confirms: "company" | "system";
  auto_source: "mentor_meeting_4" | "mentor_meeting_5" | "mentor_meeting_6" | null;
  status: InternshipCheckpointStatus;
  event_date: string | null;
  notes: string | null;
  confirmed_by: string | null;
  completed_at: string | null;
  created_at?: string;
  updated_at?: string;
};

export type ActivationRecord = {
  application_id: string;
  status: ActivationStatus;
  university_credit_required: boolean;
  presentation_acknowledged_at: string | null;
  presentation_acknowledged_by: string | null;
  candidate_accepted_at: string | null;
  academic_unlocked_at: string | null;
  academic_unlocked_by: string | null;
  internship_start_date: string | null;
  pre_arrival_completed_at: string | null;
  relocation_completed_at: string | null;
  final_clearance_date: string | null;
  planned_arrival_date: string | null;
  relocation_status:
    | "relocation_active"
    | "relocation_at_risk"
    | "relocation_blocked"
    | "arrived"
    | null;
  arrival_date: string | null;
  onboarding_status:
    | "onboarding_active"
    | "onboarding_flag"
    | "onboarding_complete"
    | null;
  onboarding_completed_at: string | null;
  followup_status:
    | "followup_active"
    | "followup_watch"
    | "followup_flag"
    | "followup_complete"
    | "at_risk_retention"
    | null;
  at_risk_retention: boolean;
  at_risk_retention_at: string | null;
  followup_completed_at: string | null;
  internship_completion_issued_at: string | null;
  internship_completion_doc_path: string | null;
  created_at?: string;
  updated_at?: string;
};

/** CMS key: pre_internship_presentation */
export const PRE_INTERNSHIP_PRESENTATION = `Your internship is about to begin. Review the programme expectations below, then confirm your acceptance to unlock internship checkpoints.

You will work remotely with your company mentor through the internship phase, with Nordic Ascent support throughout.`;

export function isPreInternshipGateComplete(record: ActivationRecord | null | undefined) {
  if (!record) return false;
  return (
    Boolean(record.presentation_acknowledged_at) &&
    Boolean(record.candidate_accepted_at) &&
    (!record.university_credit_required || Boolean(record.academic_unlocked_at))
  );
}

export function preInternshipGateBlockers(record: ActivationRecord | null | undefined) {
  const blockers: string[] = [];
  if (!record) return ["Activation not initialized"];
  if (!record.presentation_acknowledged_at) {
    blockers.push("Candidate must acknowledge the platform presentation");
  }
  if (!record.candidate_accepted_at) {
    blockers.push("Candidate must accept the internship");
  }
  if (record.university_credit_required && !record.academic_unlocked_at) {
    blockers.push("University academic approval required before internship can start");
  }
  return blockers;
}

export async function acknowledgePreInternshipPresentation(input: {
  applicationId: string;
  profileId: string;
}) {
  // SECURITY DEFINER RPC — candidates cannot UPDATE activation_records via RLS
  const { error } = await supabase.rpc("acknowledge_pre_internship_presentation", {
    p_application_id: input.applicationId,
  });
  if (error) throw error;
}

export async function acceptPreInternship(input: {
  applicationId: string;
  internship_start_date?: string | null;
}) {
  // SECURITY DEFINER RPC — candidates cannot UPDATE activation_records via RLS
  const { error } = await supabase.rpc("accept_pre_internship", {
    p_application_id: input.applicationId,
    p_internship_start_date: input.internship_start_date || null,
  });
  if (error) throw error;
}

export async function unlockAcademicInternship(input: {
  applicationId: string;
  profileId: string;
}) {
  const now = new Date().toISOString();
  const { error } = await supabase
    .from("activation_records")
    .update({
      academic_unlocked_at: now,
      academic_unlocked_by: input.profileId,
      updated_at: now,
    })
    .eq("application_id", input.applicationId);
  if (error) throw error;
  await refreshInternshipCheckpointUnlocks(input.applicationId);
}

export async function setUniversityCreditRequired(input: {
  applicationId: string;
  required: boolean;
}) {
  const now = new Date().toISOString();
  const patch: Record<string, unknown> = {
    university_credit_required: input.required,
    updated_at: now,
  };
  if (!input.required) {
    patch.academic_unlocked_at = null;
    patch.academic_unlocked_by = null;
  }
  const { error } = await supabase
    .from("activation_records")
    .update(patch)
    .eq("application_id", input.applicationId);
  if (error) throw error;
  if (input.required) {
    await initializeAcademicWorkflow(input.applicationId);
  }
  await refreshInternshipCheckpointUnlocks(input.applicationId);
}

export type InternshipEvaluation = {
  application_id: string;
  technical_execution: string;
  communication: string;
  collaboration_team_fit: string;
  overall_assessment: string;
  concerns_risks: string;
  submitted_by: string | null;
  submitted_at: string;
  updated_at?: string;
};

export const ACTIVATION_STATUS_LABELS: Record<ActivationStatus, string> = {
  ready_for_activation: "Ready for activation",
  internship_active: "Internship active",
  internship_complete: "Internship complete",
  cleared: "Cleared",
  on_hold: "On hold",
  rejected_activation: "Rejected",
};

export const INTERNSHIP_CHECKPOINT_DEFS = [
  {
    checkpoint_number: 1,
    phase: "onboarding" as const,
    title: "Internship started",
    who_confirms: "company" as const,
    auto_source: null,
    hint: "Confirm kick-off, channels, and tasks. Date + what the candidate is working on.",
  },
  {
    checkpoint_number: 2,
    phase: "onboarding" as const,
    title: "Mentor Meeting 4 done",
    who_confirms: "system" as const,
    auto_source: "mentor_meeting_4" as const,
    hint: "Auto-completed when Meeting 4 is done in the mentor programme (Module 3B).",
  },
  {
    checkpoint_number: 3,
    phase: "execution" as const,
    title: "Mid-internship status check",
    who_confirms: "company" as const,
    auto_source: null,
    hint: "On track? Any adjustments needed?",
  },
  {
    checkpoint_number: 4,
    phase: "execution" as const,
    title: "Mentor Meeting 5 done",
    who_confirms: "system" as const,
    auto_source: "mentor_meeting_5" as const,
    hint: "Auto-completed when Meeting 5 is done in the mentor programme (Module 3B).",
  },
  {
    checkpoint_number: 5,
    phase: "review" as const,
    title: "Candidate presented results",
    who_confirms: "company" as const,
    auto_source: null,
    hint: "Confirm the candidate presented their internship results.",
  },
  {
    checkpoint_number: 6,
    phase: "review" as const,
    title: "Internship evaluation submitted",
    who_confirms: "company" as const,
    auto_source: null,
    hint: "Company internship evaluation form (separate from academic evaluation).",
    evaluationCheckpoint: true,
  },
  {
    checkpoint_number: 7,
    phase: "review" as const,
    title: "Mentor Meeting 6 done",
    who_confirms: "system" as const,
    auto_source: "mentor_meeting_6" as const,
    hint: "Auto-completed when Meeting 6 is done in the mentor programme (Module 3B).",
  },
];

const MENTOR_MEETING_FOR_CHECKPOINT: Record<number, number> = {
  2: 4,
  4: 5,
  7: 6,
};

export function allInternshipCheckpointsComplete(checkpoints: InternshipCheckpoint[]) {
  return checkpoints.length === 7 && checkpoints.every((c) => c.status === "completed");
}

export function internshipCheckpointProgress(checkpoints: InternshipCheckpoint[]) {
  const done = checkpoints.filter((c) => c.status === "completed").length;
  return { done, total: 7, percent: Math.round((done / 7) * 100) };
}

export async function initializeActivationForApplication(
  applicationId: string,
  universityCreditRequired = false
) {
  const { error: recErr } = await supabase.from("activation_records").upsert(
    {
      application_id: applicationId,
      status: "ready_for_activation",
      university_credit_required: universityCreditRequired,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "application_id", ignoreDuplicates: false }
  );
  if (recErr) throw recErr;

  const rows = INTERNSHIP_CHECKPOINT_DEFS.map((d) => ({
    application_id: applicationId,
    checkpoint_number: d.checkpoint_number,
    phase: d.phase,
    title: d.title,
    who_confirms: d.who_confirms,
    auto_source: d.auto_source,
    // Always start locked — refresh_internship_checkpoint_unlocks opens CP1 after the gate
    status: "locked",
  }));

  const { error: cpErr } = await supabase.from("internship_checkpoints").upsert(rows, {
    onConflict: "application_id,checkpoint_number",
    ignoreDuplicates: true,
  });
  if (cpErr) throw cpErr;

  await refreshInternshipCheckpointUnlocks(applicationId);
  await syncAllMentorCheckpoints(applicationId);

  const { data: app } = await supabase
    .from("applications")
    .select("track, candidates(track)")
    .eq("id", applicationId)
    .maybeSingle();
  const track =
    (app?.track as Track | null) ??
    ((app?.candidates as { track?: Track } | null)?.track ?? "entry");
  const { refreshMeetingUnlocks } = await import("@/lib/mentorProgram");
  await refreshMeetingUnlocks(applicationId, track);
}

export async function refreshInternshipCheckpointUnlocks(applicationId: string) {
  const { error } = await supabase.rpc("refresh_internship_checkpoint_unlocks", {
    p_application_id: applicationId,
  });
  if (error) throw error;
}

export async function syncMentorCheckpointFromMeeting(
  applicationId: string,
  meetingNumber: number
) {
  if (![4, 5, 6].includes(meetingNumber)) return;
  const { error } = await supabase.rpc("sync_mentor_internship_checkpoint", {
    p_application_id: applicationId,
    p_meeting_number: meetingNumber,
  });
  if (error) throw error;
}

export async function syncAllMentorCheckpoints(applicationId: string) {
  for (const meetingNumber of [4, 5, 6]) {
    await syncMentorCheckpointFromMeeting(applicationId, meetingNumber);
  }
}

export function getCheckpointLockedReason(
  checkpoint: InternshipCheckpoint,
  checkpoints: InternshipCheckpoint[],
  activationRecord?: ActivationRecord | null
): string | null {
  if (checkpoint.status !== "locked") return null;
  if (
    checkpoint.checkpoint_number === 1 &&
    activationRecord &&
    !isPreInternshipGateComplete(activationRecord)
  ) {
    if (!activationRecord.presentation_acknowledged_at) {
      return "Complete Step 1 above: click “I have read this” on the platform presentation";
    }
    if (!activationRecord.candidate_accepted_at) {
      return "Complete Step 2 above: click “Accept internship” — acknowledging alone does not unlock checkpoints";
    }
    if (activationRecord.university_credit_required && !activationRecord.academic_unlocked_at) {
      return "Academic approval is still required before checkpoint #1 unlocks";
    }
    return "Complete the pre-internship gate above first";
  }
  if (checkpoint.who_confirms === "system") {
    const meetingNum = MENTOR_MEETING_FOR_CHECKPOINT[checkpoint.checkpoint_number];
    return `Completes automatically when Mentor Meeting ${meetingNum} is done`;
  }
  const prev = checkpoints.find((c) => c.checkpoint_number === checkpoint.checkpoint_number - 1);
  if (prev && prev.status !== "completed") {
    return `Complete checkpoint ${checkpoint.checkpoint_number - 1} first`;
  }
  if (checkpoint.checkpoint_number === 6) {
    return "Submit the internship evaluation form";
  }
  return "Not yet available";
}

export async function confirmInternshipCheckpoint(input: {
  checkpointId: string;
  applicationId: string;
  event_date: string;
  notes?: string;
  confirmed_by?: string | null;
}) {
  const { error } = await supabase.rpc("confirm_internship_checkpoint", {
    p_checkpoint_id: input.checkpointId,
    p_application_id: input.applicationId,
    p_event_date: input.event_date,
    p_notes: input.notes?.trim() || null,
  });
  if (error) throw error;
}

export async function submitInternshipEvaluation(input: {
  applicationId: string;
  checkpointId: string;
  event_date: string;
  technical_execution: string;
  communication: string;
  collaboration_team_fit: string;
  overall_assessment: string;
  concerns_risks: string;
  submitted_by?: string | null;
}) {
  const now = new Date().toISOString();
  const payload = {
    application_id: input.applicationId,
    technical_execution: input.technical_execution.trim(),
    communication: input.communication.trim(),
    collaboration_team_fit: input.collaboration_team_fit.trim(),
    overall_assessment: input.overall_assessment.trim(),
    concerns_risks: input.concerns_risks.trim(),
    submitted_by: input.submitted_by ?? null,
    submitted_at: now,
    updated_at: now,
  };

  const { error: evalErr } = await supabase
    .from("internship_evaluations")
    .upsert(payload, { onConflict: "application_id" });
  if (evalErr) throw evalErr;

  const { error: cpErr } = await supabase
    .from("internship_checkpoints")
    .update({
      status: "completed",
      event_date: input.event_date,
      notes: "Internship evaluation submitted",
      confirmed_by: input.submitted_by ?? null,
      completed_at: now,
      updated_at: now,
    })
    .eq("id", input.checkpointId)
    .eq("checkpoint_number", 6);

  if (cpErr) throw cpErr;
  await refreshInternshipCheckpointUnlocks(input.applicationId);
}

export type FinalClearanceDecision = {
  application_id: string;
  decision: "clear" | "hold";
  decision_maker_name: string;
  decision_date: string;
  reasoning: string;
  submitted_by: string | null;
  submitted_at: string;
  updated_at?: string;
};

/** Shown before company chooses — CMS key: clearance_screen_note */
export const CLEARANCE_SCREEN_NOTE =
  "This is a red-flag check, not a new hiring decision. The candidate has already been validated through Selection, Readiness, and (for Entry track) the internship. Proceeding is the expected outcome — choose Hold only for a genuine red flag.";

export type FinalClearanceReadiness = {
  ready: boolean;
  blockers: string[];
};

export function evaluateFinalClearanceReadiness(input: {
  track: "entry" | "fast";
  checkpoints: InternshipCheckpoint[];
  meeting3Complete: boolean;
  meeting6Complete: boolean;
  signalNoteExists: boolean;
  activationNoteExists: boolean;
  evaluationExists: boolean;
}): FinalClearanceReadiness {
  const blockers: string[] = [];

  if (!input.meeting3Complete) {
    blockers.push("Mentor Meeting 3 must be completed");
  }
  if (!input.signalNoteExists) {
    blockers.push("Signal note (after Meeting 3) must be submitted");
  }

  if (input.track === "entry") {
    if (!allInternshipCheckpointsComplete(input.checkpoints)) {
      const done = input.checkpoints.filter((c) => c.status === "completed").length;
      blockers.push(`All 7 internship checkpoints required (${done}/7 complete)`);
    }
    if (!input.evaluationExists) {
      blockers.push("Company internship evaluation must be submitted");
    }
    if (!input.meeting6Complete) {
      blockers.push("Mentor Meeting 6 must be completed");
    }
    if (!input.activationNoteExists) {
      blockers.push("Activation note (after Meeting 6) must be submitted");
    }
  }

  return { ready: blockers.length === 0, blockers };
}

export async function submitFinalClearanceDecision(input: {
  applicationId: string;
  candidateId: string;
  candidateProfileId: string;
  jobTitle: string;
  companyName?: string | null;
  decision: "clear" | "hold";
  decision_maker_name: string;
  decision_date: string;
  reasoning: string;
  submitted_by?: string | null;
  track: "entry" | "fast";
}) {
  const now = new Date().toISOString();
  const cms = await fetchActivationCms();
  const companyName = input.companyName?.trim() || "your company";
  const vars = { companyName, jobTitle: input.jobTitle };

  const { error: decisionErr } = await supabase.from("final_clearance_decisions").upsert(
    {
      application_id: input.applicationId,
      decision: input.decision,
      decision_maker_name: input.decision_maker_name.trim(),
      decision_date: input.decision_date,
      reasoning: input.reasoning.trim(),
      submitted_by: input.submitted_by ?? null,
      submitted_at: now,
      updated_at: now,
    },
    { onConflict: "application_id" }
  );
  if (decisionErr) throw decisionErr;

  const activationStatus = input.decision === "clear" ? "cleared" : "rejected_activation";
  const { error: recErr } = await supabase
    .from("activation_records")
    .update({ status: activationStatus, updated_at: now })
    .eq("application_id", input.applicationId);
  if (recErr) throw recErr;

  if (input.decision === "clear") {
    const clearanceDate = input.decision_date || now.slice(0, 10);

    // Seed relocation + stage progress via SECURITY DEFINER (employer cannot
    // update candidate_stage_progress under RLS; client upserts were stalling).
    await initializeRelocationSteps(input.applicationId, {
      finalClearanceDate: clearanceDate,
    });

    await supabase.from("notifications").insert({
      user_id: input.candidateProfileId,
      title: "You're moving forward",
      body: interpolateActivationCms(cms.clearance_cleared, vars),
      type: "clearance_cleared",
      metadata: { applicationId: input.applicationId, jobTitle: input.jobTitle },
    });

    await initializePreArrivalCheckpoints(input.applicationId);
  } else {
    await supabase
      .from("candidates")
      .update({ pool_category: "alumni", updated_at: now })
      .eq("id", input.candidateId);

    await supabase.from("notifications").insert({
      user_id: input.candidateProfileId,
      title: "Process update",
      body: interpolateActivationCms(cms.clearance_hold, vars),
      type: "clearance_hold",
      metadata: { applicationId: input.applicationId, jobTitle: input.jobTitle },
    });
  }
}

export type PreArrivalCheckpoint = {
  id: string;
  application_id: string;
  checkpoint_number: number;
  title: string;
  who_confirms: "company" | "candidate";
  allow_reconfirm: boolean;
  status: InternshipCheckpointStatus;
  event_date: string | null;
  notes: string | null;
  attachment_path: string | null;
  confirmed_by: string | null;
  completed_at: string | null;
  created_at?: string;
  updated_at?: string;
};

export const PRE_ARRIVAL_CHECKPOINT_DEFS = [
  {
    checkpoint_number: 1,
    title: "Employment contract signed",
    who_confirms: "company" as const,
    hint: "Upload signed contract and confirm date.",
    requiresAttachment: true,
    notesRequired: false,
    notesLabel: "Notes (optional)",
  },
  {
    checkpoint_number: 2,
    title: "Remote work setup confirmed",
    who_confirms: "company" as const,
    hint: "Candidate has equipment, access, and remote setup ready.",
  },
  {
    checkpoint_number: 3,
    title: "Tasks and projects assigned",
    who_confirms: "company" as const,
    hint: "Describe initial tasks and projects.",
    notesRequired: true,
    notesLabel: "Task / project description",
  },
  {
    checkpoint_number: 4,
    title: "A1 Norwegian course started",
    who_confirms: "candidate" as const,
    hint: "Candidate confirms they have started the A1 Norwegian course.",
  },
  {
    checkpoint_number: 5,
    title: "Employer onboarding toolkit received",
    who_confirms: "company" as const,
    hint: "Company confirms the candidate received onboarding materials.",
  },
  {
    checkpoint_number: 6,
    title: "Ongoing work confirmed",
    who_confirms: "company" as const,
    hint: "Recurring check-in — confirm ongoing remote work (repeat as needed).",
    allowReconfirm: true,
  },
];

export function preArrivalCheckpointProgress(checkpoints: PreArrivalCheckpoint[]) {
  const done = checkpoints.filter((c) => c.status === "completed").length;
  return { done, total: 6, percent: Math.round((done / 6) * 100) };
}

export function allPreArrivalCheckpointsComplete(checkpoints: PreArrivalCheckpoint[]) {
  return checkpoints.length === 6 && checkpoints.every((c) => c.status === "completed");
}

export async function initializePreArrivalCheckpoints(applicationId: string) {
  const rows = PRE_ARRIVAL_CHECKPOINT_DEFS.map((d) => ({
    application_id: applicationId,
    checkpoint_number: d.checkpoint_number,
    title: d.title,
    who_confirms: d.who_confirms,
    allow_reconfirm: Boolean(d.allowReconfirm),
    status: d.checkpoint_number === 1 ? "available" : "locked",
  }));

  const { error } = await supabase.from("pre_arrival_checkpoints").upsert(rows, {
    onConflict: "application_id,checkpoint_number",
    ignoreDuplicates: true,
  });
  if (error) throw error;
  await refreshPreArrivalCheckpointUnlocks(applicationId);
}

export async function refreshPreArrivalCheckpointUnlocks(applicationId: string) {
  const { error } = await supabase.rpc("refresh_pre_arrival_checkpoint_unlocks", {
    p_application_id: applicationId,
  });
  if (error) throw error;
}

export function getPreArrivalLockedReason(
  checkpoint: PreArrivalCheckpoint,
  checkpoints: PreArrivalCheckpoint[],
  clearanceCleared: boolean
): string | null {
  if (!clearanceCleared) return "Unlocks after Final Clearance (Clear decision)";
  if (checkpoint.status !== "locked") return null;
  const prev = checkpoints.find((c) => c.checkpoint_number === checkpoint.checkpoint_number - 1);
  if (prev && prev.status !== "completed") {
    return `Complete checkpoint ${checkpoint.checkpoint_number - 1} first`;
  }
  return "Not yet available";
}

export async function uploadPreArrivalContract(applicationId: string, file: File) {
  const ext = file.name.split(".").pop() ?? "pdf";
  const path = `pre-arrival/${applicationId}/employment-contract-${Date.now()}.${ext}`;
  const { error } = await supabase.storage.from("documents").upload(path, file, { upsert: false });
  if (error) throw error;
  return path;
}

export async function confirmPreArrivalCheckpoint(input: {
  checkpointId: string;
  applicationId: string;
  event_date: string;
  notes?: string;
  attachment_path?: string | null;
  confirmed_by?: string | null;
}) {
  const now = new Date().toISOString();
  const { error } = await supabase
    .from("pre_arrival_checkpoints")
    .update({
      status: "completed",
      event_date: input.event_date,
      notes: input.notes?.trim() || null,
      ...(input.attachment_path !== undefined ? { attachment_path: input.attachment_path } : {}),
      confirmed_by: input.confirmed_by ?? null,
      completed_at: now,
      updated_at: now,
    })
    .eq("id", input.checkpointId);

  if (error) throw error;
  await refreshPreArrivalCheckpointUnlocks(input.applicationId);

  const { data: allCps } = await supabase
    .from("pre_arrival_checkpoints")
    .select("status")
    .eq("application_id", input.applicationId);
  const allDone =
    (allCps ?? []).length === 6 && (allCps ?? []).every((c) => c.status === "completed");
  if (allDone) {
    await maybeCompletePreArrivalEmployment(input.applicationId);
  }
}

export async function maybeCompletePreArrivalEmployment(applicationId: string) {
  const { data: record } = await supabase
    .from("activation_records")
    .select("pre_arrival_completed_at, status")
    .eq("application_id", applicationId)
    .maybeSingle();
  if (!record || record.pre_arrival_completed_at || record.status !== "cleared") return;

  const { data: app } = await supabase
    .from("applications")
    .select("id, status, candidate_id, jobs(title, companies(name)), candidates(profile_id)")
    .eq("id", applicationId)
    .maybeSingle();
  // Relocation may already be active (started at Final Clearance in parallel)
  if (
    !app ||
    (app.status !== APPLICATION_JOURNEY_STATUSES.PRE_ARRIVAL &&
      app.status !== APPLICATION_JOURNEY_STATUSES.RELOCATION)
  ) {
    return;
  }

  const profileId = (app.candidates as { profile_id?: string } | null)?.profile_id;
  const jobTitle = (app.jobs as { title?: string } | null)?.title ?? "your role";
  const companyName = (app.jobs as { companies?: { name?: string } | null } | null)?.companies?.name;
  const now = new Date().toISOString();

  await supabase
    .from("activation_records")
    .update({ pre_arrival_completed_at: now, updated_at: now })
    .eq("application_id", applicationId);

  // SECURITY DEFINER: completes activation stage + activates relocation (employer RLS blocks direct updates)
  const clearanceDate =
    (await supabase
      .from("activation_records")
      .select("final_clearance_date")
      .eq("application_id", applicationId)
      .maybeSingle()).data?.final_clearance_date ?? now.slice(0, 10);

  await initializeRelocationSteps(applicationId, {
    finalClearanceDate: clearanceDate,
  });

  if (profileId) {
    await supabase.from("notifications").insert({
      user_id: profileId,
      title: "Pre-arrival complete",
      body: `All pre-arrival employment steps are done${companyName ? ` for ${companyName}` : ""}. Relocation coordination continues.`,
      type: "pre_arrival_complete",
      metadata: { applicationId, jobTitle, companyName },
    });
  }
}

export type ActivationCms = {
  clearance_screen_note: string;
  visit_confirmed: string;
  pre_internship_presentation: string;
  clearance_cleared: string;
  clearance_hold: string;
  clearance_company_cleared: string;
  clearance_company_hold: string;
};

export const DEFAULT_ACTIVATION_CMS: ActivationCms = {
  clearance_screen_note:
    "This is a red-flag check, not a new hiring decision. The candidate has already been validated through Selection, Readiness, and (for Entry track) the internship. Proceeding is the expected outcome — choose Hold only for a genuine red flag.",
  visit_confirmed:
    "Your visit with {companyName} is confirmed for {visitDate}. Format: {visitFormat}. {notes}",
  pre_internship_presentation: `Your internship is about to begin. Review the programme expectations below, then confirm your acceptance to unlock internship checkpoints.

You will work remotely with your company mentor through the internship phase, with Nordic Ascent support throughout.`,
  clearance_cleared:
    "Congratulations — you've been cleared to move forward. You've completed your internship and come through every stage of the process. {companyName} is ready to take the next step with you toward employment in Norway. We'll be in touch shortly about relocation and onboarding.",
  clearance_hold:
    "Thank you for everything you've put into this process. This opportunity will not move forward to employment. That does not take away from what you achieved — your completed internship, and its documentation, remain yours to keep and build on. Decisions at this stage depend on many factors, and we're grateful for your effort. We wish you every success ahead.",
  clearance_company_cleared:
    "Clearance recorded. Pre-arrival employment and relocation coordination are now unlocked for this candidate.",
  clearance_company_hold:
    "Hold recorded. The candidate has been moved to alumni. Their internship completion document remains available.",
};

export function interpolateActivationCms(template: string, vars: Record<string, string>) {
  return Object.entries(vars).reduce((text, [key, value]) => {
    return text.replaceAll(`{${key}}`, value);
  }, template);
}

/** CMS textareas sometimes persist literal `\n` instead of real newlines. */
export function normalizeActivationCmsText(text: string) {
  return text.replace(/\\n/g, "\n");
}

export async function fetchActivationCms(): Promise<ActivationCms> {
  const { data, error } = await supabase.rpc("get_activation_cms");
  if (error) throw error;
  const cms = (data ?? {}) as Partial<ActivationCms>;
  return {
    clearance_screen_note: normalizeActivationCmsText(
      cms.clearance_screen_note ?? DEFAULT_ACTIVATION_CMS.clearance_screen_note
    ),
    visit_confirmed: normalizeActivationCmsText(
      cms.visit_confirmed ?? DEFAULT_ACTIVATION_CMS.visit_confirmed
    ),
    pre_internship_presentation: normalizeActivationCmsText(
      cms.pre_internship_presentation ?? DEFAULT_ACTIVATION_CMS.pre_internship_presentation
    ),
    clearance_cleared: normalizeActivationCmsText(
      cms.clearance_cleared ?? DEFAULT_ACTIVATION_CMS.clearance_cleared
    ),
    clearance_hold: normalizeActivationCmsText(
      cms.clearance_hold ?? DEFAULT_ACTIVATION_CMS.clearance_hold
    ),
    clearance_company_cleared: normalizeActivationCmsText(
      cms.clearance_company_cleared ?? DEFAULT_ACTIVATION_CMS.clearance_company_cleared
    ),
    clearance_company_hold: normalizeActivationCmsText(
      cms.clearance_company_hold ?? DEFAULT_ACTIVATION_CMS.clearance_company_hold
    ),
  };
}

export async function updateActivationCms(cms: ActivationCms) {
  const { data: row, error: readErr } = await supabase
    .from("platform_settings")
    .select("settings")
    .eq("id", "default")
    .maybeSingle();
  if (readErr) throw readErr;
  const settings = (row?.settings as Record<string, unknown> | null) ?? {};
  const next = {
    ...settings,
    activationCms: cms,
  };
  const { error } = await supabase
    .from("platform_settings")
    .update({ settings: next, updated_at: new Date().toISOString() })
    .eq("id", "default");
  if (error) throw error;
}

export type InPersonVisit = {
  application_id: string;
  visit_chosen: boolean | null;
  visit_format: "in_person" | "video" | "none" | null;
  visit_date: string | null;
  notes: string | null;
  confirmed_at: string | null;
  confirmed_by: string | null;
  candidate_notified_at: string | null;
  created_at?: string;
  updated_at?: string;
};

export type AcademicWorkflowStep = {
  id: string;
  application_id: string;
  step_number: number;
  title: string;
  status: "pending" | "completed";
  notes: string | null;
  completed_by: string | null;
  completed_at: string | null;
};

export const ACADEMIC_WORKFLOW_STEP_DEFS = [
  {
    step_number: 1,
    title: "University + company approve internship project; supervisor assigned",
  },
  {
    step_number: 2,
    title: "Learning Agreement signed (objectives, hours, credit)",
  },
  {
    step_number: 3,
    title: "Student logs hours, weekly journal, and deliverables",
  },
  {
    step_number: 4,
    title: "University supervisor monitors (parallel to mentor)",
  },
  {
    step_number: 5,
    title: "Student submits final report and presentation",
  },
  {
    step_number: 6,
    title: "Company academic evaluation sent to university (learning only)",
  },
  {
    step_number: 7,
    title: "University awards credit and certificate",
  },
];

export function canShowInPersonVisitPanel(input: {
  track: "entry" | "fast";
  activationStatus?: ActivationStatus;
  internshipComplete: boolean;
  meeting3Complete: boolean;
  clearanceDecided: boolean;
}) {
  if (input.clearanceDecided) return false;
  if (input.track === "entry") {
    return input.internshipComplete || input.activationStatus === "internship_complete";
  }
  return input.meeting3Complete;
}

export function academicWorkflowProgress(steps: AcademicWorkflowStep[]) {
  const done = steps.filter((s) => s.status === "completed").length;
  return { done, total: 7, percent: Math.round((done / 7) * 100) };
}

export async function initializeAcademicWorkflow(applicationId: string) {
  const rows = ACADEMIC_WORKFLOW_STEP_DEFS.map((d) => ({
    application_id: applicationId,
    step_number: d.step_number,
    title: d.title,
    status: "pending",
  }));
  const { error } = await supabase.from("academic_workflow_steps").upsert(rows, {
    onConflict: "application_id,step_number",
    ignoreDuplicates: true,
  });
  if (error) throw error;
}

export async function completeAcademicWorkflowStep(input: {
  stepId: string;
  applicationId: string;
  notes?: string;
  completed_by?: string | null;
}) {
  const now = new Date().toISOString();
  const { error } = await supabase
    .from("academic_workflow_steps")
    .update({
      status: "completed",
      notes: input.notes?.trim() || null,
      completed_by: input.completed_by ?? null,
      completed_at: now,
      updated_at: now,
    })
    .eq("id", input.stepId);
  if (error) throw error;
  await supabase.rpc("sync_academic_unlock_from_workflow", {
    p_application_id: input.applicationId,
  });
  // Step 7 may unlock internship_complete when all cps done
  await refreshInternshipCheckpointUnlocks(input.applicationId);
}

export async function saveInPersonVisitDraft(input: {
  applicationId: string;
  visit_chosen: boolean;
  visit_format?: "in_person" | "video" | "none" | null;
  visit_date?: string | null;
  notes?: string | null;
}) {
  const now = new Date().toISOString();
  const { error } = await supabase.from("activation_in_person_visits").upsert(
    {
      application_id: input.applicationId,
      visit_chosen: input.visit_chosen,
      visit_format: input.visit_chosen ? input.visit_format ?? null : "none",
      visit_date: input.visit_chosen ? input.visit_date ?? null : null,
      notes: input.notes?.trim() || null,
      updated_at: now,
    },
    { onConflict: "application_id" }
  );
  if (error) throw error;
}

export async function confirmInPersonVisit(input: {
  applicationId: string;
  candidateProfileId: string;
  companyName: string;
  visit_chosen: boolean;
  visit_format?: "in_person" | "video" | "none" | null;
  visit_date?: string | null;
  notes?: string | null;
  confirmed_by?: string | null;
  visitConfirmedTemplate: string;
}) {
  const now = new Date().toISOString();
  const { error } = await supabase.from("activation_in_person_visits").upsert(
    {
      application_id: input.applicationId,
      visit_chosen: input.visit_chosen,
      visit_format: input.visit_chosen ? input.visit_format ?? null : "none",
      visit_date: input.visit_chosen ? input.visit_date ?? null : null,
      notes: input.notes?.trim() || null,
      confirmed_at: now,
      confirmed_by: input.confirmed_by ?? null,
      updated_at: now,
    },
    { onConflict: "application_id" }
  );
  if (error) throw error;

  if (input.visit_chosen && input.visit_date) {
    const formatLabel =
      input.visit_format === "video"
        ? "Video call"
        : input.visit_format === "in_person"
          ? "In person"
          : "Visit";
    const body = interpolateActivationCms(input.visitConfirmedTemplate, {
      companyName: input.companyName,
      visitDate: input.visit_date,
      visitFormat: formatLabel,
      notes: input.notes?.trim() ? input.notes.trim() : "",
    });
    await supabase.from("notifications").insert({
      user_id: input.candidateProfileId,
      title: "Visit confirmed",
      body,
      type: "visit_confirmed",
      metadata: { applicationId: input.applicationId, visitDate: input.visit_date },
    });
    await supabase
      .from("activation_in_person_visits")
      .update({ candidate_notified_at: now, updated_at: now })
      .eq("application_id", input.applicationId);
  } else if (!input.visit_chosen) {
    await supabase
      .from("activation_in_person_visits")
      .update({ candidate_notified_at: null, updated_at: now })
      .eq("application_id", input.applicationId);
  }
}
