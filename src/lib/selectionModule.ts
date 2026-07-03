import type { Application, Candidate, Job, Profile } from "@/types/database";

/** Selection pipeline status values (stored on applications.status). */
export const SELECTION_STATUSES = {
  APPLICATION_COMPLETE: "application_complete",
  ELIGIBILITY_REVIEW: "eligibility_review",
  ELIGIBILITY_PASS: "eligibility_pass",
  OFFEE_REVIEW: "offee_review",
  OFFEE_PASS: "offee_pass",
  STEP3_REVIEW: "step3_review",
  STEP3_PASS: "step3_pass",
  STEP4_REVIEW: "step4_review",
  STEP4_PASS: "step4_pass",
  SELECTED_FOR_READINESS: "selected_for_readiness",
  SELECTION_HOLD: "selection_hold",
  SELECTION_REJECTED: "selection_rejected",
  REJECTED: "rejected",
} as const;

export type SelectionStatus = (typeof SELECTION_STATUSES)[keyof typeof SELECTION_STATUSES];

export type SelectionStepId = 1 | 2 | 3 | 4 | 5;

export type StepDecision = "pass" | "reject" | "review";

export type BoardDecision = "selected" | "hold" | "rejected";

export const SELECTION_STEPS: {
  step: SelectionStepId;
  key: string;
  label: string;
  adminOnly: boolean;
  passStatus: SelectionStatus;
  reviewStatus: SelectionStatus;
}[] = [
  {
    step: 1,
    key: "eligibility",
    label: "Eligibility",
    adminOnly: true,
    passStatus: SELECTION_STATUSES.ELIGIBILITY_PASS,
    reviewStatus: SELECTION_STATUSES.ELIGIBILITY_REVIEW,
  },
  {
    step: 2,
    key: "offee",
    label: "Offee",
    adminOnly: true,
    passStatus: SELECTION_STATUSES.OFFEE_PASS,
    reviewStatus: SELECTION_STATUSES.OFFEE_REVIEW,
  },
  {
    step: 3,
    key: "technical",
    label: "Technical",
    adminOnly: false,
    passStatus: SELECTION_STATUSES.STEP3_PASS,
    reviewStatus: SELECTION_STATUSES.STEP3_REVIEW,
  },
  {
    step: 4,
    key: "motivation",
    label: "Motivation",
    adminOnly: false,
    passStatus: SELECTION_STATUSES.STEP4_PASS,
    reviewStatus: SELECTION_STATUSES.STEP4_REVIEW,
  },
  {
    step: 5,
    key: "board",
    label: "Selection board",
    adminOnly: false,
    passStatus: SELECTION_STATUSES.SELECTED_FOR_READINESS,
    reviewStatus: SELECTION_STATUSES.STEP4_PASS,
  },
];

/** SLA targets in business days (approximated as calendar days for MVP). */
export const SELECTION_SLA_DAYS: Record<SelectionStepId, number> = {
  1: 5,
  2: 14,
  3: 21,
  4: 7,
  5: 7,
};

export type EligibilityAutoChecks = {
  university_ok: boolean;
  track_ok: boolean;
  english_ok: boolean;
  documents_ok: boolean;
  university_name: string | null;
  gpa_or_standing: string | null;
  field_of_study: string | null;
  track: string | null;
  job_track: string | null;
};

export type SelectionApplication = Application & {
  jobs?: (Job & { companies?: { id: string; name: string } | null }) | null;
  candidates?: (Candidate & { profiles?: Profile | null }) | null;
};

export function isSelectionPipelineStatus(status: string) {
  return (
    status === SELECTION_STATUSES.APPLICATION_COMPLETE ||
    status.startsWith("eligibility_") ||
    status.startsWith("offee_") ||
    status.startsWith("step3_") ||
    status.startsWith("step4_") ||
    status === SELECTION_STATUSES.SELECTED_FOR_READINESS ||
    status === SELECTION_STATUSES.SELECTION_HOLD ||
    status === SELECTION_STATUSES.SELECTION_REJECTED
  );
}

/**
 * Active selection step for admin/employer actions.
 * Uses `selection_step` when present — pass statuses (e.g. eligibility_pass) alone
 * would otherwise point at the completed step, not the next one.
 */
export function getSelectionStepFromStatus(
  status: string,
  selectionStep?: number | null
): SelectionStepId {
  if (
    status === SELECTION_STATUSES.SELECTED_FOR_READINESS ||
    status === SELECTION_STATUSES.SELECTION_HOLD
  ) {
    return 5;
  }
  if (status === SELECTION_STATUSES.SELECTION_REJECTED || status === SELECTION_STATUSES.REJECTED) {
    if (selectionStep != null && selectionStep >= 1 && selectionStep <= 5) {
      return selectionStep as SelectionStepId;
    }
    return 5;
  }
  if (selectionStep != null && selectionStep >= 1 && selectionStep <= 5) {
    return selectionStep as SelectionStepId;
  }
  if (status === SELECTION_STATUSES.APPLICATION_COMPLETE || status.startsWith("eligibility_")) return 1;
  if (status.startsWith("offee_")) return 2;
  if (status.startsWith("step3_")) return 3;
  if (status.startsWith("step4_")) return 4;
  return 1;
}

export function isReviewStatus(status: string) {
  return status.endsWith("_review");
}

export function isTerminalSelectionStatus(status: string) {
  return (
    status === SELECTION_STATUSES.SELECTION_REJECTED ||
    status === SELECTION_STATUSES.REJECTED ||
    status === SELECTION_STATUSES.SELECTED_FOR_READINESS ||
    status === SELECTION_STATUSES.SELECTION_HOLD
  );
}

export function computeEligibilityAutoChecks(
  candidate: Candidate | null | undefined,
  job: Job | null | undefined,
  application: Pick<
    Application,
    "academic_transcript_path" | "track" | "project_descriptions_text" | "project_descriptions_path" | "work_experience_path"
  >
): EligibilityAutoChecks {
  const hasUniversity = Boolean(candidate?.university_id);
  const jobTrack = job?.target_track ?? null;
  const appTrack = application.track ?? candidate?.track ?? null;
  const trackOk = !jobTrack || !appTrack || jobTrack === appTrack;
  const hasTranscript = Boolean(application.academic_transcript_path);
  const trackDocsOk =
    appTrack === "fast"
      ? Boolean(application.work_experience_path)
      : Boolean(application.project_descriptions_text?.trim() || application.project_descriptions_path);
  const documentsOk = hasTranscript && trackDocsOk;
  const englishOk = Boolean(candidate?.cv_url);

  return {
    university_ok: hasUniversity,
    track_ok: trackOk,
    english_ok: englishOk,
    documents_ok: documentsOk,
    university_name: candidate?.university_id ? "Linked" : candidate?.university_waitlist_name ?? null,
    gpa_or_standing: candidate?.gpa_or_standing ?? null,
    field_of_study: candidate?.field_of_study ?? null,
    track: appTrack,
    job_track: jobTrack,
  };
}

export function getNextStatusAfterDecision(
  step: SelectionStepId,
  decision: StepDecision
): SelectionStatus {
  const meta = SELECTION_STEPS.find((s) => s.step === step);
  if (!meta) throw new Error("Invalid step");

  if (decision === "review") return meta.reviewStatus;
  if (decision === "reject") return SELECTION_STATUSES.SELECTION_REJECTED;
  return meta.passStatus;
}

export function getNextStepAfterPass(step: SelectionStepId): SelectionStepId {
  return Math.min(5, step + 1) as SelectionStepId;
}

export function daysInCurrentStep(enteredAt: string | null | undefined) {
  if (!enteredAt) return 0;
  const start = new Date(enteredAt).getTime();
  const now = Date.now();
  return Math.floor((now - start) / (1000 * 60 * 60 * 24));
}

export function isStepOverdue(step: SelectionStepId, enteredAt: string | null | undefined) {
  if (!enteredAt) return false;
  return daysInCurrentStep(enteredAt) > SELECTION_SLA_DAYS[step];
}

export function selectionStatusLabel(status: string) {
  switch (status) {
    case SELECTION_STATUSES.APPLICATION_COMPLETE:
      return "Application complete";
    case SELECTION_STATUSES.ELIGIBILITY_REVIEW:
      return "Eligibility — under review";
    case SELECTION_STATUSES.ELIGIBILITY_PASS:
      return "Eligibility passed";
    case SELECTION_STATUSES.OFFEE_REVIEW:
      return "Assessment in progress";
    case SELECTION_STATUSES.OFFEE_PASS:
      return "Assessment complete";
    case SELECTION_STATUSES.STEP3_REVIEW:
      return "Technical — under review";
    case SELECTION_STATUSES.STEP3_PASS:
      return "Technical passed";
    case SELECTION_STATUSES.STEP4_REVIEW:
      return "Motivation — under review";
    case SELECTION_STATUSES.STEP4_PASS:
      return "Motivation passed";
    case SELECTION_STATUSES.SELECTED_FOR_READINESS:
      return "Selected for Readiness";
    case SELECTION_STATUSES.SELECTION_HOLD:
      return "On hold (backup)";
    case SELECTION_STATUSES.SELECTION_REJECTED:
    case SELECTION_STATUSES.REJECTED:
      return "Not selected";
    default:
      return status.replace(/_/g, " ");
  }
}

/** Candidate-facing status — no internal labels (e.g. HOLD shows as under review). */
export function candidateSelectionStatusLabel(status: string) {
  if (status === SELECTION_STATUSES.SELECTION_HOLD) {
    return "Under review";
  }
  return selectionStatusLabel(status);
}

/** Max selected + hold-active candidates per job (spec: 2–3 per position). */
export function maxSelectionsForJob(positionsCount: number | null | undefined) {
  const positions = Math.max(1, positionsCount ?? 2);
  return Math.min(3, Math.max(2, positions));
}

export function canSelectMoreForJob(
  applications: Pick<Application, "status" | "board_company_decision">[],
  positionsCount: number | null | undefined
) {
  const selected = countSelectedForJob(applications);
  return selected < maxSelectionsForJob(positionsCount);
}

/** Candidate-facing tracker stages (no scores). */
export type CandidateTrackerStage = {
  id: string;
  label: string;
  state: "done" | "current" | "upcoming" | "failed";
};

export function getCandidateTrackerStages(
  status: string,
  selectionStep?: number | null
): CandidateTrackerStage[] {
  const failed =
    status === SELECTION_STATUSES.SELECTION_REJECTED || status === SELECTION_STATUSES.REJECTED;

  const currentIndex = (() => {
    const step = getSelectionStepFromStatus(status, selectionStep);
    if (failed) {
      if (step <= 1) return 1;
      if (step <= 3) return 2;
      if (step === 4) return 3;
      return 4;
    }
    if (status === SELECTION_STATUSES.SELECTED_FOR_READINESS) return 4;
    if (status === SELECTION_STATUSES.SELECTION_HOLD) return 4;
    if (status === SELECTION_STATUSES.APPLICATION_COMPLETE) return 1;
    if (step === 1) return 1;
    if (step === 2 || step === 3) return 2;
    if (step === 4) return 3;
    if (step === 5) return 4;
    return 0;
  })();

  const stages = [
    { id: "application", label: "Application" },
    { id: "review", label: "Review" },
    { id: "assessment", label: "Assessment" },
    { id: "interview", label: "Interview" },
    { id: "decision", label: "Decision" },
  ];

  return stages.map((s, i) => {
    let state: CandidateTrackerStage["state"] = "upcoming";
    if (failed) {
      state = i < currentIndex ? "done" : i === currentIndex ? "failed" : "upcoming";
    } else if (status === SELECTION_STATUSES.SELECTED_FOR_READINESS && i === 4) {
      state = "done";
    } else if (i < currentIndex) {
      state = "done";
    } else if (i === currentIndex) {
      state = "current";
    }
    return { ...s, state };
  });
}

export function candidateTrackerMessage(status: string, selectionStep?: number | null) {
  if (status === SELECTION_STATUSES.SELECTION_REJECTED || status === SELECTION_STATUSES.REJECTED) {
    return "This application was not selected. You can apply to other open roles.";
  }
  if (status === SELECTION_STATUSES.SELECTED_FOR_READINESS) {
    return "You have been selected for the Nordic Ascent Readiness programme.";
  }
  if (status === SELECTION_STATUSES.SELECTION_HOLD) {
    return "Your application remains under review.";
  }
  if (
    status === SELECTION_STATUSES.ELIGIBILITY_PASS ||
    status === SELECTION_STATUSES.OFFEE_REVIEW ||
    status.startsWith("offee_") ||
    status.startsWith("step3_")
  ) {
    if (status === SELECTION_STATUSES.OFFEE_PASS || status === SELECTION_STATUSES.STEP3_PASS) {
      return "Assessment complete — we'll notify you about next steps.";
    }
    if (isReviewStatus(status)) {
      return "Assessment in progress.";
    }
    return "Assessment in progress. Nordic Ascent will share Offee details with you.";
  }
  if (status.startsWith("step4_")) {
    return isReviewStatus(status)
      ? "Motivation session in progress."
      : "Motivation session complete — the selection board will decide soon.";
  }
  if (status === SELECTION_STATUSES.APPLICATION_COMPLETE || status.startsWith("eligibility_")) {
    return "We're reviewing your application. No action needed — we'll notify you when something changes.";
  }
  return "We're reviewing your application. No action needed — we'll notify you when something changes.";
}

export function countSelectedForJob(
  applications: Pick<Application, "status" | "board_company_decision">[]
) {
  return applications.filter(
    (a) =>
      a.status === SELECTION_STATUSES.SELECTED_FOR_READINESS ||
      a.board_company_decision === "selected"
  ).length;
}

export function canActivateHold(app: SelectionApplication) {
  return app.status === SELECTION_STATUSES.SELECTION_HOLD;
}

export function isReadinessUnlocked(app: Pick<Application, "status" | "assigned_mentor_id" | "readiness_unlocked_at">) {
  const journeyStatuses = [
    "mentor_assigned",
    "readiness_active",
    "readiness_complete",
    "internship",
    "go_no_go",
    "pre_arrival",
    "relocation",
    "onboarding",
    "followup",
    "journey_complete",
  ];
  return (
    Boolean(app.assigned_mentor_id) &&
    Boolean(app.readiness_unlocked_at) &&
    (app.status === SELECTION_STATUSES.SELECTED_FOR_READINESS || journeyStatuses.includes(app.status))
  );
}

export function buildOffeeCsvRows(
  applications: SelectionApplication[]
): string[][] {
  const headers = [
    "Application ID",
    "Candidate",
    "Email",
    "Job",
    "Track",
    "University",
    "GPA",
    "Field",
  ];
  const rows = applications.map((app) => {
    const cand = app.candidates;
    const profile = cand?.profiles;
    const job = app.jobs;
    const checks = app.eligibility_auto_checks as EligibilityAutoChecks | null;
    return [
      app.id,
      profile?.full_name ?? cand?.full_name ?? "",
      profile?.email ?? "",
      job?.title ?? "",
      app.track ?? cand?.track ?? "",
      checks?.university_name ?? "",
      checks?.gpa_or_standing ?? cand?.gpa_or_standing ?? "",
      checks?.field_of_study ?? cand?.field_of_study ?? "",
    ];
  });
  return [headers, ...rows];
}

export function downloadCsv(filename: string, rows: string[][]) {
  const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/** Curated summary for employer board (no raw Offee). */
export function employerBoardSummary(app: SelectionApplication) {
  return {
    eligibility: app.eligibility_auto_checks,
    technical_score: app.technical_score,
    cognitive_score: app.technical_cognitive_score,
    motivation_score: app.motivation_score,
    company_feedback_step3: app.technical_company_feedback,
    company_feedback_step4: app.motivation_company_feedback,
    admin_recommendation: app.board_admin_recommendation,
    admin_reason: app.board_admin_reason,
  };
}
