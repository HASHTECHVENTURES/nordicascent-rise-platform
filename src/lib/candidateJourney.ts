import type { Candidate, Profile } from "@/types/database";
import { isOnUniversityWaitlist } from "@/lib/candidateAccess";
import { isJobHuntProfileReady } from "@/lib/profileCompleteness";
import { isRegistrationDetailsComplete } from "@/lib/candidateRegistration";

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

/** Readiness unlocks after selection + mentor assignment (Module 2), or legacy prep-complete path. */
export function canAccessReadiness(
  profile: Profile | null,
  candidate: Candidate | null | undefined,
  applications?: { status: string; assigned_mentor_id: string | null; readiness_unlocked_at: string | null }[]
) {
  if (isOnUniversityWaitlist(candidate)) return false;

  const selectedUnlocked = (applications ?? []).some(
    (a) =>
      a.status === "selected_for_readiness" &&
      a.assigned_mentor_id &&
      a.readiness_unlocked_at
  );
  if (selectedUnlocked) return true;

  const inSelection = (applications ?? []).some(
    (a) =>
      a.status !== "rejected" &&
      a.status !== "selection_rejected" &&
      !["applied", "reviewing", "interview", "offer", "accepted"].includes(a.status)
  );
  if (inSelection) return false;

  return isPreparationComplete(profile, candidate);
}

export function canAccessMentoring(
  profile: Profile | null,
  candidate: Candidate | null | undefined,
  readinessTestsSubmitted: boolean
) {
  return canAccessReadiness(profile, candidate) && readinessTestsSubmitted;
}

export function isJobsUnlocked(candidate: Candidate | null | undefined) {
  return Boolean(candidate?.jobs_unlocked);
}

export function canAccessJobs(
  profile: Profile | null,
  candidate: Candidate | null | undefined,
  _readinessTestsSubmitted?: boolean
) {
  if (isOnUniversityWaitlist(candidate)) return false;
  if (candidate?.pool_category === "waitlist" || candidate?.pool_category === "alumni") return false;
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
  readinessTestsSubmitted: boolean
): string {
  if (!isPreparationComplete(profile, candidate)) return "preparation";
  if (!readinessTestsSubmitted) return "readiness";
  if (!isJobsUnlocked(candidate)) return "mentoring";
  return "selection";
}

export function computeEarlyJourneySteps(
  profile: Profile | null,
  candidate: Candidate | null | undefined,
  readinessTestsSubmitted: boolean
): EarlyJourneyStep[] {
  const jobsUnlocked = isJobsUnlocked(candidate);
  const profileDone = isJobHuntProfileReady(profile, candidate);
  const waitlist = isOnUniversityWaitlist(candidate);
  const uniDone = isUniversitySelected(candidate);
  const prepDone = isPreparationComplete(profile, candidate);

  const stepState = (id: string): "done" | "current" | "upcoming" => {
    switch (id) {
      case "profile":
        if (profileDone) return "done";
        return "current";
      case "university":
        if (!profileDone) return "upcoming";
        if (waitlist) return "current";
        if (uniDone) return "done";
        return "current";
      case "readiness":
        if (!prepDone) return "upcoming";
        if (readinessTestsSubmitted) return "done";
        return "current";
      case "mentoring":
        if (!readinessTestsSubmitted) return "upcoming";
        if (jobsUnlocked) return "done";
        return "current";
      case "jobs":
        if (!jobsUnlocked) return "upcoming";
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
      id: "readiness",
      label: "Readiness",
      description: "Timed Q&A tests",
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
    {
      id: "jobs",
      label: "Jobs",
      description: "Browse roles and submit applications",
      state: stepState("jobs"),
      href: "/candidate/jobs",
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
