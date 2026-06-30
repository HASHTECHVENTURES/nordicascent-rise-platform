export const PENDING_JOB_STORAGE_KEY = "na.pendingJobId";
export const PENDING_JOB_APPLY_FLAG = "na.pendingJobApply";

export function setPendingJobApplication(jobId: string) {
  sessionStorage.setItem(PENDING_JOB_STORAGE_KEY, jobId);
  sessionStorage.setItem(PENDING_JOB_APPLY_FLAG, "1");
}

export function clearPendingJobApplication() {
  sessionStorage.removeItem(PENDING_JOB_STORAGE_KEY);
  sessionStorage.removeItem(PENDING_JOB_APPLY_FLAG);
}

export function getPendingJobId() {
  return sessionStorage.getItem(PENDING_JOB_STORAGE_KEY);
}

export function consumePendingJobApplyPath() {
  const jobId = getPendingJobId();
  clearPendingJobApplication();
  if (!jobId) return null;
  return `/candidate/jobs/${jobId}/apply`;
}

export function jobApplyPath(jobId: string) {
  return `/candidate/jobs/${jobId}/apply`;
}

export function loginPathForJobApply(jobId: string) {
  return `/login?role=candidate&redirect=${encodeURIComponent(jobApplyPath(jobId))}`;
}

export function signupPathForJobApply(jobId: string) {
  return `/login?role=candidate&signup=1&redirect=${encodeURIComponent(jobApplyPath(jobId))}`;
}

export function signupPathForNetwork() {
  return `/login?role=candidate&signup=1&redirect=${encodeURIComponent("/candidate/profile")}`;
}
