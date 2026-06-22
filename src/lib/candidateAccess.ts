import type { Candidate } from "@/types/database";

export const CANDIDATE_PROFILE_PATH = "/candidate/profile";

/** Candidate submitted a custom university and is waiting for admin approval. */
export function isOnUniversityWaitlist(candidate: Candidate | null | undefined) {
  return Boolean(candidate?.university_waitlist_name?.trim()) && !candidate?.university_id;
}

/** While on waitlist, only the profile page is available. */
export function isWaitlistProfileOnly(candidate: Candidate | null | undefined) {
  return isOnUniversityWaitlist(candidate);
}

export function isCandidatePathAllowedWhileOnWaitlist(pathname: string) {
  return pathname === CANDIDATE_PROFILE_PATH;
}
