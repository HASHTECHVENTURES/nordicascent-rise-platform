import type { Profile } from "@/types/database";

export type AdminTier = "regular" | "master";

export function getAdminTier(profile: Profile | null | undefined): AdminTier | null {
  if (profile?.role !== "admin") return null;
  const tier = (profile as Profile & { admin_tier?: AdminTier }).admin_tier;
  return tier === "master" ? "master" : "regular";
}

export function isMasterAdmin(profile: Profile | null | undefined): boolean {
  return getAdminTier(profile) === "master";
}
