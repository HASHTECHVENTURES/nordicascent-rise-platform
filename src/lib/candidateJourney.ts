import type { Candidate, Profile } from "@/types/database";
import { isOnUniversityWaitlist } from "@/lib/candidateAccess";
import { isPostSelectionJourneyStatus } from "@/lib/applicationStatusFlow";
import { isJobHuntProfileReady } from "@/lib/profileCompleteness";
import { isRegistrationDetailsComplete } from "@/lib/candidateRegistration";
import { SELECTION_STATUSES } from "@/lib/selectionModule";

export type ApplicationAccessRow = {
  status: string;
  assigned_mentor_id: string | null;
  readiness_unlocked_at: string | null;
};

export function isUniversitySelected(candidate: Candidate | null | undefined) {
  return Boolean(candidate?.university_id);
}

export function isPreparationComplete(profile: Profile | null, candidate: Candidate | null | undefined) {
  return (
    isJobHuntProfileReady(profile, candidate) &&
    isUniversitySelected(candidate) &&
    isRegistrationDetailsComplete(candidate)
  );
}

/** Selected for Readiness AND a mentor has been assigned → Readiness unlocked. */
export function hasReadinessUnlocked(
  applications: ApplicationAccessRow[] | undefined
) {
  return (applications ?? []).some(
    (a) => Boolean(a.assigned_mentor_id) && Boolean(a.readiness_unlocked_at)
  );
}

/** Candidate has been selected at the board (mentor may still be pending). */
export function hasBeenSelected(
  applications: ApplicationAccessRow[] | undefined
) {
  return (applications ?? []).some(
    (a) =>
      a.status === SELECTION_STATUSES.SELECTED_FOR_READINESS ||
      isPostSelectionJourneyStatus(a.status)
  );
}

/**
 * Readiness unlocks ONLY after selection + mentor assignment (Module 2).
 * Applies to Entry Track and Fast Track alike.
 */
export function canAccessReadiness(
  profile: Profile | null,
  candidate: Candidate | null | undefined,
  applications?: ApplicationAccessRow[]
) {
  if (isOnUniversityWaitlist(candidate)) return false;
  return hasReadinessUnlocked(applications);
}

/** Mentoring runs parallel with Readiness once unlocked (Module 3B) — not after all tests. */
export function canAccessMentoring(
  profile: Profile | null,
  candidate: Candidate | null | undefined,
  _readinessTestsSubmitted: boolean,
  applications?: ApplicationAccessRow[]
) {
  return canAccessReadiness(profile, candidate, applications);
}

export function isJobsUnlocked(candidate: Candidate | null | undefined) {
  return Boolean(candidate?.jobs_unlocked);
}

/** Jobs/apply open after preparation (Module 2: apply before Readiness). */
export function canAccessJobs(
  profile: Profile | null,
  candidate: Candidate | null | undefined,
  _readinessTestsSubmitted?: boolean
) {
  if (isOnUniversityWaitlist(candidate)) return false;
  if (candidate?.pool_category === "waitlist") return false;
  return isPreparationComplete(profile, candidate) || isJobsUnlocked(candidate);
}

export type EarlyJourneyStep = {
  id: string;
  label: string;
  description: string;
  state: "done" | "current" | "upcoming";
  href?: string;
};

export type StageProgressRow = {
  stage_id: string;
  status: "not_started" | "active" | "completed";
};

const TAIL_JOURNEY_STAGES = ["activation", "relocation", "onboarding", "followup"] as const;

function tailStageState(
  stageId: (typeof TAIL_JOURNEY_STAGES)[number],
  stageProgress: StageProgressRow[] | undefined,
  jobsUnlocked: boolean
): "done" | "current" | "upcoming" {
  const row = stageProgress?.find((p) => p.stage_id === stageId);
  if (row?.status === "completed") return "done";
  if (row?.status === "active") return "current";

  const idx = TAIL_JOURNEY_STAGES.indexOf(stageId);
  const priorComplete = TAIL_JOURNEY_STAGES.slice(0, idx).every((id) => {
    const prior = stageProgress?.find((p) => p.stage_id === id);
    return prior?.status === "completed";
  });

  if (idx === 0) {
    if (jobsUnlocked) return "current";
    return "upcoming";
  }

  if (priorComplete) {
    const anyLaterActive = TAIL_JOURNEY_STAGES.slice(idx + 1).some((id) => {
      const later = stageProgress?.find((p) => p.stage_id === id);
      return later?.status === "active" || later?.status === "completed";
    });
    if (!anyLaterActive) return "current";
  }

  return "upcoming";
}

/** Full candidate journey — always visible (done / current / upcoming). */
export function computeEarlyJourneySteps(
  profile: Profile | null,
  candidate: Candidate | null | undefined,
  readinessTestsSubmitted: boolean,
  applications?: ApplicationAccessRow[],
  stageProgress?: StageProgressRow[]
): EarlyJourneyStep[] {
  const waitlist = isOnUniversityWaitlist(candidate);
  const prepDone = isPreparationComplete(profile, candidate);
  const selected = hasBeenSelected(applications);
  const readinessUnlocked = hasReadinessUnlocked(applications);
  const track = (candidate?.track ?? "entry") as "entry" | "fast";

  const stepState = (id: string): "done" | "current" | "upcoming" => {
    switch (id) {
      case "preparation":
        return prepDone ? "done" : "current";
      case "selection":
        if (!prepDone) return "upcoming";
        if (selected) return "done";
        return "current";
      case "readiness":
        if (!prepDone || !selected) return "upcoming";
        if (!readinessUnlocked) return "upcoming";
        if (readinessTestsSubmitted) return "done";
        return "current";
      case "activation":
      case "relocation":
      case "onboarding":
      case "followup":
        return tailStageState(id, stageProgress, isJobsUnlocked(candidate));
      default:
        return "upcoming";
    }
  };

  const steps: EarlyJourneyStep[] = [
    {
      id: "preparation",
      label: "Preparation",
      description: prepDone ? "Profile, university, and background complete" : "Profile, university, and background",
      state: stepState("preparation"),
      href: prepDone ? "/candidate/dashboard" : "/candidate/profile",
    },
    {
      id: "selection",
      label: "Selection",
      description: selected ? "Application in selection pipeline" : "Browse job roles and apply",
      state: stepState("selection"),
      href: "/candidate/jobs",
    },
    {
      id: "readiness",
      label: "Readiness",
      description: "Timed Q&A tests + mentor meetings 1–3",
      state: stepState("readiness"),
      href: "/candidate/readiness",
    },
  ];

  steps.push(
    {
      id: "activation",
      label: "Activation",
      description:
        track === "entry"
          ? "Internship and Pre Arrival Employment"
          : "Pre-arrival and employment activation",
      state: stepState("activation"),
      href: "/candidate/activation",
    },
    {
      id: "relocation",
      label: "Relocation",
      description: "Move and settle in the Nordics",
      state: stepState("relocation"),
      href: "/candidate/relocation",
    },
    {
      id: "onboarding",
      label: "Onboarding",
      description: "First weeks at your new company",
      state: stepState("onboarding"),
      href: "/candidate/onboarding",
    },
    {
      id: "followup",
      label: "Follow-up",
      description: "Ongoing check-ins after arrival",
      state: stepState("followup"),
      href: "/candidate/followup",
    }
  );

  if (waitlist && !prepDone) {
    return steps.map((s) =>
      s.id === "preparation" ? { ...s, state: "current" as const } : { ...s, state: "upcoming" as const }
    );
  }

  return steps;
}

/** UI stage when DB progress may still say preparation. */
export function getEffectiveJourneyStage(
  profile: Profile | null,
  candidate: Candidate | null | undefined,
  readinessTestsSubmitted: boolean,
  applications?: ApplicationAccessRow[],
  stageProgress?: StageProgressRow[]
): string {
  if (!isPreparationComplete(profile, candidate)) return "preparation";
  if (!hasBeenSelected(applications)) return "selection";
  if (!hasReadinessUnlocked(applications)) return "selection";
  if (!readinessTestsSubmitted) return "readiness";

  const jobsUnlocked = isJobsUnlocked(candidate);
  for (const id of ["followup", "onboarding", "relocation", "activation"] as const) {
    if (tailStageState(id, stageProgress, jobsUnlocked) === "current") return id;
  }
  return "activation";
}

/** Stages that require readiness approval before job hunt (legacy pipeline tail). */
export function isJobHuntStage(stageId: string) {
  return ["selection", "activation", "relocation", "onboarding", "followup"].includes(stageId);
}
