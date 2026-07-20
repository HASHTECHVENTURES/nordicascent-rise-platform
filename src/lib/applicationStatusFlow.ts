import { supabase } from "@/lib/supabase";
import { isSelectionPipelineStatus, isTerminalSelectionStatus, SELECTION_STATUSES } from "@/lib/selectionModule";

/** Statuses after selection board — stored on applications.status per spec. */
export const APPLICATION_JOURNEY_STATUSES = {
  MENTOR_ASSIGNED: "mentor_assigned",
  READINESS_ACTIVE: "readiness_active",
  READINESS_COMPLETE: "readiness_complete",
  INTERNSHIP: "internship",
  GO_NO_GO: "go_no_go",
  PRE_ARRIVAL: "pre_arrival",
  RELOCATION: "relocation",
  ONBOARDING: "onboarding",
  FOLLOWUP: "followup",
  JOURNEY_COMPLETE: "journey_complete",
} as const;

export const POST_SELECTION_JOURNEY_STATUSES = Object.values(APPLICATION_JOURNEY_STATUSES);

export function isPostSelectionJourneyStatus(status: string) {
  return POST_SELECTION_JOURNEY_STATUSES.includes(
    status as (typeof POST_SELECTION_JOURNEY_STATUSES)[number]
  );
}

/** Candidate still in Module 2 selection (not yet selected / on journey). */
export function isSelectionInProgress(status: string) {
  if (status === SELECTION_STATUSES.SELECTED_FOR_READINESS) return false;
  if (status === SELECTION_STATUSES.SELECTION_HOLD) return false;
  if (isPostSelectionJourneyStatus(status)) return false;
  return isSelectionPipelineStatus(status) && !isTerminalSelectionStatus(status);
}

export function applicationJourneyStatusLabel(status: string) {
  switch (status) {
    case APPLICATION_JOURNEY_STATUSES.MENTOR_ASSIGNED:
      return "Mentor assigned";
    case APPLICATION_JOURNEY_STATUSES.READINESS_ACTIVE:
      return "Readiness in progress";
    case APPLICATION_JOURNEY_STATUSES.READINESS_COMPLETE:
      return "Readiness complete";
    case APPLICATION_JOURNEY_STATUSES.INTERNSHIP:
      return "Internship";
    case APPLICATION_JOURNEY_STATUSES.GO_NO_GO:
      return "Final Clearance";
    case APPLICATION_JOURNEY_STATUSES.PRE_ARRIVAL:
      return "Pre-arrival";
    case APPLICATION_JOURNEY_STATUSES.RELOCATION:
      return "Relocation";
    case APPLICATION_JOURNEY_STATUSES.ONBOARDING:
      return "Onboarding";
    case APPLICATION_JOURNEY_STATUSES.FOLLOWUP:
      return "Follow-up";
    case APPLICATION_JOURNEY_STATUSES.JOURNEY_COMPLETE:
      return "Journey complete";
    default:
      return null;
  }
}

const JOURNEY_PRIORITY = [
  APPLICATION_JOURNEY_STATUSES.JOURNEY_COMPLETE,
  APPLICATION_JOURNEY_STATUSES.FOLLOWUP,
  APPLICATION_JOURNEY_STATUSES.ONBOARDING,
  APPLICATION_JOURNEY_STATUSES.RELOCATION,
  APPLICATION_JOURNEY_STATUSES.PRE_ARRIVAL,
  APPLICATION_JOURNEY_STATUSES.GO_NO_GO,
  APPLICATION_JOURNEY_STATUSES.INTERNSHIP,
  APPLICATION_JOURNEY_STATUSES.READINESS_COMPLETE,
  APPLICATION_JOURNEY_STATUSES.READINESS_ACTIVE,
  APPLICATION_JOURNEY_STATUSES.MENTOR_ASSIGNED,
  SELECTION_STATUSES.SELECTED_FOR_READINESS,
  SELECTION_STATUSES.SELECTION_HOLD,
] as const;

export async function getPrimaryJourneyApplicationId(candidateId: string): Promise<string | null> {
  const { data, error } = await supabase
    .from("applications")
    .select("id, status, applied_at")
    .eq("candidate_id", candidateId)
    .order("applied_at", { ascending: false });
  if (error || !data?.length) return null;

  for (const status of JOURNEY_PRIORITY) {
    const match = data.find((a) => a.status === status);
    if (match) return match.id;
  }

  const post = data.find(
    (a) => isPostSelectionJourneyStatus(a.status) || a.status === SELECTION_STATUSES.SELECTED_FOR_READINESS
  );
  return post?.id ?? null;
}

export async function syncPrimaryApplicationStatus(candidateId: string, status: string) {
  const appId = await getPrimaryJourneyApplicationId(candidateId);
  if (!appId) return;
  await supabase
    .from("applications")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", appId);
}

export function applicationStatusForStageActivation(stageId: string): string | null {
  switch (stageId) {
    case "readiness":
      return APPLICATION_JOURNEY_STATUSES.READINESS_ACTIVE;
    case "internship":
      return APPLICATION_JOURNEY_STATUSES.INTERNSHIP;
    case "activation":
      return APPLICATION_JOURNEY_STATUSES.GO_NO_GO;
    case "relocation":
      return APPLICATION_JOURNEY_STATUSES.RELOCATION;
    case "onboarding":
      return APPLICATION_JOURNEY_STATUSES.ONBOARDING;
    case "followup":
      return APPLICATION_JOURNEY_STATUSES.FOLLOWUP;
    default:
      return null;
  }
}

export function applicationStatusForStageCompletion(stageId: string): string | null {
  switch (stageId) {
    case "readiness":
      return APPLICATION_JOURNEY_STATUSES.READINESS_COMPLETE;
    case "activation":
      return APPLICATION_JOURNEY_STATUSES.PRE_ARRIVAL;
    case "relocation":
      return APPLICATION_JOURNEY_STATUSES.RELOCATION;
    case "onboarding":
      return APPLICATION_JOURNEY_STATUSES.ONBOARDING;
    case "followup":
      return APPLICATION_JOURNEY_STATUSES.JOURNEY_COMPLETE;
    default:
      return null;
  }
}
