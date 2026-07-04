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
 * Legacy `jobs_unlocked` candidates keep access for backward compatibility.
 */
export function canAccessReadiness(
  profile: Profile | null,
  candidate: Candidate | null | undefined,
  applications?: ApplicationAccessRow[]
) {
  if (isOnUniversityWaitlist(candidate)) return false;

  if (hasReadinessUnlocked(applications)) return true;

  // Legacy candidates who already had jobs unlocked can still access Readiness.
  if (candidate?.jobs_unlocked) return true;

  return false;
}

export function canAccessMentoring(
  profile: Profile | null,
  candidate: Candidate | null | undefined,
  readinessTestsSubmitted: boolean,
  applications?: ApplicationAccessRow[]
) {
  return (
    canAccessReadiness(profile, candidate, applications) && readinessTestsSubmitted
  );
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

/** Full candidate journey — always visible (done / current / upcoming). */
export function computeEarlyJourneySteps(
  profile: Profile | null,
  candidate: Candidate | null | undefined,
  readinessTestsSubmitted: boolean,
  applications?: ApplicationAccessRow[]
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
      case "mentoring":
        if (!readinessUnlocked || !readinessTestsSubmitted) return "upcoming";
        if (isJobsUnlocked(candidate)) return "done";
        return "current";
      case "internship":
        if (!readinessUnlocked || !readinessTestsSubmitted) return "upcoming";
        if (isJobsUnlocked(candidate)) return "done";
        return "upcoming";
      case "activation":
        if (isJobsUnlocked(candidate)) return "current";
        return "upcoming";
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
      description: selected ? "Application in selection pipeline" : "Browse roles and apply",
      state: stepState("selection"),
      href: "/candidate/jobs",
    },
    {
      id: "readiness",
      label: "Readiness",
      description: "Timed Q&A tests (after selection)",
      state: stepState("readiness"),
      href: "/candidate/readiness",
    },
    {
      id: "mentoring",
      label: "Mentoring",
      description: "Connect with your mentor",
      state: stepState("mentoring"),
      href: "/candidate/mentoring",
    },
  ];

  if (track === "entry") {
    steps.push({
      id: "internship",
      label: "Internship",
      description: "Company internship phase",
      state: stepState("internship"),
      href: "/candidate/internship",
    });
  }

  steps.push({
    id: "activation",
    label: "Activation",
    description: "Pre-arrival and employment activation",
    state: stepState("activation"),
    href: "/candidate/activation",
  });

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
  applications?: ApplicationAccessRow[]
): string {
  if (!isPreparationComplete(profile, candidate)) return "preparation";
  if (!hasBeenSelected(applications)) return "selection";
  if (!hasReadinessUnlocked(applications)) return "selection";
  if (!readinessTestsSubmitted) return "readiness";
  if (!isJobsUnlocked(candidate)) return "mentoring";
  return "activation";
}

/** Stages that require readiness approval before job hunt (legacy pipeline tail). */
export function isJobHuntStage(stageId: string) {
  return ["selection", "internship", "activation", "relocation", "onboarding", "followup"].includes(stageId);
}
