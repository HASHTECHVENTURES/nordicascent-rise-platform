import { isPostSelectionJourneyStatus } from "@/lib/applicationStatusFlow";
import {
  getSelectionStepFromStatus,
  isSelectionPipelineStatus,
  SELECTION_STATUSES,
} from "@/lib/selectionModule";

/** Employers see candidates from Technical (step 3) onward — admin cleans data in steps 1–2 first. */
export const EMPLOYER_VISIBILITY_MIN_SELECTION_STEP = 3;

type EmployerVisibleApp = {
  status: string;
  selection_step?: number | null;
};

export function isVisibleToEmployer(app: EmployerVisibleApp): boolean {
  const { status, selection_step } = app;

  if (isPostSelectionJourneyStatus(status)) return true;
  if (
    status === SELECTION_STATUSES.SELECTED_FOR_READINESS ||
    status === SELECTION_STATUSES.SELECTION_HOLD
  ) {
    return true;
  }

  if (isSelectionPipelineStatus(status) || status === "accepted") {
    const step = getSelectionStepFromStatus(status, selection_step);
    return step >= EMPLOYER_VISIBILITY_MIN_SELECTION_STEP;
  }

  return false;
}

export function filterVisibleToEmployer<T extends EmployerVisibleApp>(apps: T[]): T[] {
  return apps.filter(isVisibleToEmployer);
}
