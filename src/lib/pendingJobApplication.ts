export const PENDING_JOB_STORAGE_KEY = "na.pendingJobId";
export const PENDING_JOB_APPLY_FLAG = "na.pendingJobApply";

const JOB_APPLY_PATH_RE = /^\/candidate\/jobs\/([^/]+)\/apply$/;

function readStorage(key: string) {
  return localStorage.getItem(key) ?? sessionStorage.getItem(key);
}

function writeStorage(key: string, value: string) {
  localStorage.setItem(key, value);
  sessionStorage.setItem(key, value);
}

function removeStorage(key: string) {
  localStorage.removeItem(key);
  sessionStorage.removeItem(key);
}

export function parseJobIdFromApplyPath(path: string): string | null {
  const match = path.match(JOB_APPLY_PATH_RE);
  return match?.[1] ?? null;
}

export function setPendingJobApplication(jobId: string) {
  writeStorage(PENDING_JOB_STORAGE_KEY, jobId);
  writeStorage(PENDING_JOB_APPLY_FLAG, "1");
}

export function rememberPendingJobFromPath(path: string | null | undefined) {
  if (!path) return;
  const jobId = parseJobIdFromApplyPath(path);
  if (jobId) setPendingJobApplication(jobId);
}

export function clearPendingJobApplication() {
  removeStorage(PENDING_JOB_STORAGE_KEY);
  removeStorage(PENDING_JOB_APPLY_FLAG);
}

export function getPendingJobId() {
  return readStorage(PENDING_JOB_STORAGE_KEY);
}

export function hasPendingJobApplication() {
  return Boolean(getPendingJobId() && readStorage(PENDING_JOB_APPLY_FLAG));
}

export function pendingJobApplyPath() {
  const jobId = getPendingJobId();
  if (!jobId) return null;
  return jobApplyPath(jobId);
}

export function consumePendingJobApplyPath() {
  const jobId = getPendingJobId();
  clearPendingJobApplication();
  if (!jobId) return null;
  return jobApplyPath(jobId);
}

export function jobApplyPath(jobId: string) {
  return `/candidate/jobs/${jobId}/apply`;
}

export function loginPathForJobApply(jobId: string) {
  return buildLoginPathWithRedirect(jobApplyPath(jobId), { role: "candidate" });
}

export function signupPathForJobApply(jobId: string) {
  return buildLoginPathWithRedirect(jobApplyPath(jobId), { role: "candidate", signup: true });
}

export function signupPathForNetwork() {
  return buildLoginPathWithRedirect("/candidate/profile", { role: "candidate", signup: true });
}

export function buildLoginPathWithRedirect(
  returnPath: string,
  options?: { role?: "candidate" | "employer"; signup?: boolean }
) {
  const params = new URLSearchParams();
  if (options?.role) params.set("role", options.role);
  if (options?.signup) params.set("signup", "1");
  params.set("redirect", returnPath);
  return `/login?${params.toString()}`;
}

/** After signup, new candidates complete registration before applying. */
export function postCandidateSignupPath(redirectPath: string | null) {
  rememberPendingJobFromPath(redirectPath);
  return "/candidate/profile";
}
