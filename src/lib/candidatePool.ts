import type { Candidate } from "@/types/database";
import { isOnUniversityWaitlist } from "@/lib/candidateAccess";
import { isPreparationComplete } from "@/lib/candidateJourney";
import type { Profile } from "@/types/database";

export type CandidatePoolCategory = "active" | "waitlist" | "network" | "alumni";

export const POOL_CATEGORY_LABELS: Record<CandidatePoolCategory, string> = {
  active: "Active",
  waitlist: "Waitlist",
  network: "Network",
  alumni: "Alumni",
};

export function computeCandidatePoolCategory(
  profile: Profile | null,
  candidate: Candidate | null | undefined
): CandidatePoolCategory {
  if (!candidate) return "network";
  if (candidate.pool_category === "alumni") return "alumni";
  if (isOnUniversityWaitlist(candidate)) return "waitlist";
  if (isPreparationComplete(profile, candidate) && candidate.university_id) return "active";
  if (candidate.university_id || candidate.university_waitlist_name) {
    return isOnUniversityWaitlist(candidate) ? "waitlist" : "network";
  }
  return candidate.pool_category === "network" ? "network" : "network";
}

export function canCandidateApply(profile: Profile | null, candidate: Candidate | null | undefined) {
  if (!candidate) return false;
  if (isOnUniversityWaitlist(candidate)) return false;
  return computeCandidatePoolCategory(profile, candidate) === "active";
}
