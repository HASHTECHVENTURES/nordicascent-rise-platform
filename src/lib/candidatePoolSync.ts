import { supabase } from "@/lib/supabase";
import type { Profile } from "@/types/database";
import { computeCandidatePoolCategory } from "@/lib/candidatePool";

/** Recompute and persist pool_category from profile + candidate state. */
export async function syncCandidatePoolCategory(
  candidateId: string,
  profile: Profile | null
) {
  const { data: candidate, error } = await supabase
    .from("candidates")
    .select("*")
    .eq("id", candidateId)
    .single();
  if (error || !candidate) return;

  // Alumni stays alumni until they apply again (handled on apply).
  if (candidate.pool_category === "alumni") return;

  const next = computeCandidatePoolCategory(profile, candidate);
  if (next === candidate.pool_category) return;

  await supabase
    .from("candidates")
    .update({ pool_category: next, updated_at: new Date().toISOString() })
    .eq("id", candidateId);
}
