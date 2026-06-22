/** URL segment ↔ pipeline stage id. */
export const STAGE_PATH_BY_ID: Record<string, string> = {
  preparation: "preparation",
  readiness: "readiness",
  mentoring: "mentoring",
  selection: "selection",
  internship: "internship",
  activation: "activation",
  relocation: "relocation",
  onboarding: "onboarding",
  followup: "followup",
};

export const STAGE_ID_BY_PATH: Record<string, string> = Object.fromEntries(
  Object.entries(STAGE_PATH_BY_ID).map(([id, path]) => [path, id])
);

export const STAGES_WITH_TASK_PAGES = [
  "readiness",
  "internship",
  "activation",
  "relocation",
  "onboarding",
  "followup",
] as const;

export function stageListPath(stageId: string) {
  return `/candidate/${STAGE_PATH_BY_ID[stageId] ?? stageId}`;
}

export function stageTaskPath(stageId: string, taskId: string) {
  return `${stageListPath(stageId)}/tasks/${taskId}`;
}

export function stageIdFromPath(pathSegment: string) {
  return STAGE_ID_BY_PATH[pathSegment] ?? pathSegment;
}
