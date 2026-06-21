import type { Candidate, Profile } from "@/types/database";

export type ProfileFieldKey =
  | "phone"
  | "country"
  | "state"
  | "city"
  | "title"
  | "experience"
  | "education"
  | "cv"
  | "skills";

export const PROFILE_REQUIREMENTS: { key: ProfileFieldKey; label: string }[] = [
  { key: "phone", label: "Phone number" },
  { key: "country", label: "Country" },
  { key: "state", label: "State" },
  { key: "city", label: "City" },
  { key: "title", label: "Professional title" },
  { key: "education", label: "Education" },
  { key: "cv", label: "CV upload" },
  { key: "skills", label: "At least one skill" },
];

function hasValue(value: string | null | undefined) {
  return Boolean(value?.trim());
}

export function isProfileFieldComplete(
  key: ProfileFieldKey,
  profile: Profile | null,
  candidate: Candidate | null
): boolean {
  switch (key) {
    case "phone":
      return hasValue(profile?.phone);
    case "country":
      return hasValue(candidate?.country);
    case "state":
      return hasValue(candidate?.state);
    case "city":
      return hasValue(candidate?.city);
    case "title":
      return hasValue(candidate?.title);
    case "experience":
      return hasValue(candidate?.experience);
    case "education":
      return hasValue(candidate?.education);
    case "cv":
      return hasValue(candidate?.cv_url);
    case "skills":
      return (candidate?.skills?.length ?? 0) > 0;
    default:
      return false;
  }
}

export const PERSONAL_INFO_FIELD_KEYS = [
  "phone",
  "country",
  "state",
  "city",
  "title",
  "education",
] as const satisfies readonly ProfileFieldKey[];

export function isPersonalInfoComplete(profile: Profile | null, candidate: Candidate | null) {
  if (!hasValue(profile?.full_name)) return false;
  return PERSONAL_INFO_FIELD_KEYS.every((key) => isProfileFieldComplete(key, profile, candidate));
}

export function hasSkillsAdded(candidate: Candidate | null) {
  return (candidate?.skills?.length ?? 0) > 0;
}

export function isPersonalInfoFormComplete(
  form: {
    full_name: string;
    phone: string;
    country: string;
    state: string;
    city: string;
    title: string;
    experience: string;
    education: string;
  },
  phoneNormalized: string
) {
  return (
    hasValue(form.full_name) &&
    hasValue(phoneNormalized) &&
    hasValue(form.country) &&
    hasValue(form.state) &&
    hasValue(form.city) &&
    hasValue(form.title) &&
    hasValue(form.education)
  );
}

export function isSkillsFormComplete(skills: string) {
  return skills.split(",").map((s) => s.trim()).filter(Boolean).length > 0;
}

export function getMissingProfileFields(profile: Profile | null, candidate: Candidate | null) {
  return PROFILE_REQUIREMENTS.filter((f) => !isProfileFieldComplete(f.key, profile, candidate));
}

export function getProfileCompletenessPercent(profile: Profile | null, candidate: Candidate | null) {
  const total = PROFILE_REQUIREMENTS.length;
  const done = total - getMissingProfileFields(profile, candidate).length;
  return Math.round((done / total) * 100);
}

export function isProfileComplete(profile: Profile | null, candidate: Candidate | null) {
  return getMissingProfileFields(profile, candidate).length === 0;
}

/** Minimum profile needed to apply for jobs and advance the job-hunt bar. */
export function isJobHuntProfileReady(profile: Profile | null, candidate: Candidate | null) {
  return Boolean(
    profile?.full_name?.trim() &&
      candidate?.cv_url &&
      (candidate?.skills?.length ?? 0) > 0 &&
      candidate?.title?.trim()
  );
}

export function getMissingJobHuntProfileFields(profile: Profile | null, candidate: Candidate | null) {
  const missing: { label: string }[] = [];
  if (!profile?.full_name?.trim()) missing.push({ label: "Full name" });
  if (!candidate?.title?.trim()) missing.push({ label: "Professional title" });
  if (!candidate?.cv_url) missing.push({ label: "CV upload" });
  if ((candidate?.skills?.length ?? 0) === 0) missing.push({ label: "At least one skill" });
  return missing;
}

export function isDocumentUploadComplete(candidate: Candidate | null) {
  return hasValue(candidate?.cv_url);
}

export function isSkillsAssessmentComplete(candidate: Candidate | null) {
  return (candidate?.skills?.length ?? 0) >= 1;
}

export function isTaskRequirementMet(
  taskTitle: string,
  profile: Profile | null,
  candidate: Candidate | null
): boolean {
  const title = taskTitle.toLowerCase();
  if (title.includes("complete profile") || title === "profile") {
    return isJobHuntProfileReady(profile, candidate);
  }
  if (title.includes("document") || title.includes("upload")) {
    return isDocumentUploadComplete(candidate);
  }
  if (title.includes("skills")) {
    return isSkillsAssessmentComplete(candidate);
  }
  // Only preparation tasks auto-complete from profile data — never assume other stages are done.
  return false;
}

export function isTaskManuallyCompletable(taskTitle: string) {
  const title = taskTitle.toLowerCase();
  return !(
    title.includes("profile") ||
    title.includes("document") ||
    title.includes("upload") ||
    title.includes("skills")
  );
}

export function hasCvUploaded(candidate: Candidate | null) {
  return hasValue(candidate?.cv_url);
}

export function getTaskActionLink(taskTitle: string): string {
  const title = taskTitle.toLowerCase();
  if (title.includes("apply") || title.includes("job")) return "/candidate/jobs";
  if (title.includes("matching") || title.includes("employer") || title.includes("screening")) {
    return "/candidate/applications";
  }
  return "/candidate/profile";
}

export function getTaskActionLabel(taskTitle: string, done: boolean) {
  if (done) return null;
  const title = taskTitle.toLowerCase();
  if (title.includes("profile")) return "Go to Profile";
  if (title.includes("document") || title.includes("upload")) return "Upload CV";
  if (title.includes("skills")) return "Add skills";
  if (title.includes("apply") || title.includes("job")) return "Browse jobs";
  if (title.includes("matching") || title.includes("employer")) return "My Applications";
  if (title.includes("screening")) return "My Applications";
  return "View details";
}

export function getTaskActionHint(taskTitle: string) {
  const title = taskTitle.toLowerCase();
  if (title.includes("profile")) return "Fill in My Profile, then Save Changes.";
  if (title.includes("document") || title.includes("upload")) return "Upload your CV in My Profile.";
  if (title.includes("skills")) return "Add skills in My Profile, then Save Changes.";
  if (title.includes("matching") || title.includes("employer")) {
    return "Tracked in My Applications when a company accepts you.";
  }
  if (title.includes("screening")) {
    return "Updates when the employer reviews your application — check My Applications.";
  }
  return "Complete the required action for this step.";
}

export function computeStageReadiness(completedCount: number, total: number) {
  return total ? Math.round((completedCount / total) * 100) : 0;
}
