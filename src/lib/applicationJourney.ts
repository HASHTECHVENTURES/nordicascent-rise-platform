import type { Candidate, Profile } from "@/types/database";
import { isJobHuntProfileReady } from "@/lib/profileCompleteness";

export type ApplicationRow = {
  id: string;
  job_id: string;
  status: string;
  applied_at: string;
  interview_meet_url?: string | null;
  interview_scheduled_at?: string | null;
  interview_notes?: string | null;
  jobs?: {
    title: string;
    location?: string | null;
    companies?: { name: string } | null;
  } | null;
};

export type JourneyStepState = "done" | "current" | "upcoming" | "failed";

export type JourneyStep = {
  id: string;
  label: string;
  description: string;
  state: JourneyStepState;
};

const ACTIVE_STATUSES = ["applied", "reviewing", "interview", "offer"] as const;

export function hasUnlockedPipeline(applications: ApplicationRow[]) {
  return applications.some((a) => a.status === "accepted");
}

export function hasActiveApplication(applications: ApplicationRow[]) {
  return applications.some((a) => ACTIVE_STATUSES.includes(a.status as (typeof ACTIVE_STATUSES)[number]));
}

export function getPrimaryApplication(applications: ApplicationRow[]) {
  const accepted = applications.find((a) => a.status === "accepted");
  if (accepted) return accepted;
  const active = applications.find((a) =>
    ACTIVE_STATUSES.includes(a.status as (typeof ACTIVE_STATUSES)[number])
  );
  if (active) return active;
  return applications[0] ?? null;
}

export function applicationStatusLabel(status: string) {
  switch (status) {
    case "applied":
      return "Submitted — waiting for review";
    case "reviewing":
      return "Under review";
    case "interview":
      return "Interview stage";
    case "offer":
      return "Offer in progress";
    case "accepted":
      return "Accepted — journey started";
    case "rejected":
      return "Not selected";
    default:
      return "Submitted";
  }
}

export function applicationStatusNextStep(status: string) {
  switch (status) {
    case "applied":
      return "The employer will review your profile. You can still apply to other open roles.";
    case "reviewing":
      return "Your application is being reviewed. Check Messages if the employer contacts you.";
    case "interview":
      return "Prepare for your interview. The employer may message you with details.";
    case "offer":
      return "Offer discussions may be in progress. Watch for updates here and in Messages.";
    case "accepted":
      return "Congratulations! Continue your journey in My Journey → Selection.";
    case "rejected":
      return "This role was not a match. Browse Jobs to apply elsewhere.";
    default:
      return "We'll notify you when something changes.";
  }
}

export type ApplicationJob = {
  title: string;
  location?: string | null;
  job_type?: string | null;
  companies?: { name: string; logo_url?: string | null } | null;
};

export function getApplicationJob(app: { jobs?: ApplicationJob | ApplicationJob[] | null }) {
  const raw = app.jobs;
  if (Array.isArray(raw)) return raw[0] ?? null;
  return raw ?? null;
}

export function applicationStatusVariant(status: string): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "accepted":
      return "default";
    case "rejected":
      return "destructive";
    case "reviewing":
    case "interview":
    case "offer":
      return "secondary";
    default:
      return "outline";
  }
}

/** Shorter labels for employer-facing UI */
export function employerApplicationStatusLabel(status: string) {
  switch (status) {
    case "applied":
      return "New application";
    case "reviewing":
      return "Under review";
    case "interview":
      return "Interview scheduled";
    case "offer":
      return "Offer in progress";
    case "accepted":
      return "Accepted";
    case "rejected":
      return "Declined";
    default:
      return "New application";
  }
}

export function isPostPreparationStage(stageId: string) {
  return stageId !== "preparation";
}

export type SelectionStep = {
  id: string;
  taskKey: string;
  title: string;
  description: string;
  done: boolean;
  hint?: string;
};

/** Selection steps driven by job application status — not profile fields. */
export function getSelectionStepState(applications: ApplicationRow[]): SelectionStep[] {
  const primary = getPrimaryApplication(applications);
  const accepted = hasUnlockedPipeline(applications);
  const status = primary?.status ?? "";
  const job = primary ? getApplicationJob(primary) : null;
  const company = job?.companies?.name ?? "the employer";

  const matchedDone = accepted || status === "accepted";
  const screeningDone = ["reviewing", "interview", "offer", "accepted"].includes(status);

  return [
    {
      id: "matching",
      taskKey: "employer matching",
      title: "Matched with an employer",
      description: matchedDone
        ? `You were accepted for ${job?.title ?? "a role"} at ${company}.`
        : "Apply to a job and wait for an employer to accept you.",
      done: matchedDone,
      hint: matchedDone ? undefined : "Go to Jobs → apply → wait for acceptance in My Applications.",
    },
    {
      id: "screening",
      taskKey: "initial screening",
      title: "Employer screening",
      description: screeningDone
        ? `The employer reviewed your application (${applicationStatusLabel(status)}).`
        : "The company reviews your profile after you apply — watch My Applications and Messages.",
      done: screeningDone,
      hint: screeningDone
        ? undefined
        : "Status updates when the employer clicks Review, Interview, or Accept.",
    },
  ];
}

export function computeJourneySteps(
  profile: Profile | null,
  candidate: Candidate | null,
  applications: ApplicationRow[]
): JourneyStep[] {
  const profileDone = isJobHuntProfileReady(profile, candidate);
  const primary = getPrimaryApplication(applications);
  const applied = applications.length > 0;
  const accepted = hasUnlockedPipeline(applications);
  const rejected = primary?.status === "rejected" && !accepted;
  const waiting = hasActiveApplication(applications);

  const jobTitle = primary?.jobs?.title;

  return [
    {
      id: "profile",
      label: "Complete your profile",
      description: "Details, skills, and CV in My Profile",
      state: profileDone ? "done" : "current",
    },
    {
      id: "apply",
      label: "Apply to a job",
      description: "Submit your profile to an open role",
      state: !profileDone ? "upcoming" : applied ? "done" : "current",
    },
    {
      id: "review",
      label: "Employer review",
      description: jobTitle
        ? `Waiting on ${jobTitle}`
        : "The employer reviews your application",
      state: rejected
        ? "failed"
        : accepted
          ? "done"
          : waiting
            ? "current"
            : applied
              ? "current"
              : "upcoming",
    },
    {
      id: "journey",
      label: "Continue your journey",
      description: "Selection, Readiness, and beyond in My Journey",
      state: accepted ? "current" : "upcoming",
    },
  ];
}
