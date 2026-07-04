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

/** UI stage when DB progress may still say preparation. */
export function getEffectiveJourneyStage(
  profile: Profile | null,
  candidate: Candidate | null | undefined,
  readinessTestsSubmitted: boolean,
  applications?: ApplicationAccessRow[]
): string {
  if (!isPreparationComplete(profile, candidate)) return "preparation";
  // After preparation → Selection (apply to jobs). Readiness only after selected + mentor.
  if (!hasBeenSelected(applications)) return "selection";
  if (!hasReadinessUnlocked(applications)) return "selection";
  if (!readinessTestsSubmitted) return "readiness";
  if (!isJobsUnlocked(candidate)) return "mentoring";
  return "selection";
}

export function computeEarlyJourneySteps(
  profile: Profile | null,
  candidate: Candidate | null | undefined,
  readinessTestsSubmitted: boolean,
  applications?: ApplicationAccessRow[]
): EarlyJourneyStep[] {
  const profileDone = isJobHuntProfileReady(profile, candidate);
  const waitlist = isOnUniversityWaitlist(candidate);
  const uniDone = isUniversitySelected(candidate);
  const prepDone = isPreparationComplete(profile, candidate);
  const selected = hasBeenSelected(applications);
  const readinessUnlocked = hasReadinessUnlocked(applications);

  const stepState = (id: string): "done" | "current" | "upcoming" => {
    switch (id) {
      case "profile":
        return profileDone ? "done" : "current";
      case "university":
        if (!profileDone) return "upcoming";
        if (waitlist) return "current";
        return uniDone ? "done" : "current";
      case "jobs":
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
      default:
        return "upcoming";
    }
  };

  const allSteps: EarlyJourneyStep[] = [
    {
      id: "profile",
      label: "Profile",
      description: "Details, skills, and CV",
      state: stepState("profile"),
      href: "/candidate/profile",
    },
    {
      id: "university",
      label: "University",
      description: waitlist
        ? "University under admin review"
        : uniDone
          ? "University linked"
          : "Choose your institution",
      state: stepState("university"),
      href: "/candidate/university",
    },
    {
      id: "jobs",
      label: "Jobs",
      description: selected ? "Application submitted" : "Browse roles and apply",
      state: stepState("jobs"),
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

  if (prepDone) {
    return allSteps.filter((s) => !["profile", "university"].includes(s.id));
  }
  return allSteps;
}

/** Stages that require readiness approval before job hunt (legacy pipeline tail). */
export function isJobHuntStage(stageId: string) {
  return ["selection", "internship", "activation", "relocation", "onboarding", "followup"].includes(stageId);
}
