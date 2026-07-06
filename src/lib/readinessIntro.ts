const STORAGE_PREFIX = "na.readinessIntroSeen";

export function hasSeenReadinessIntro(candidateId: string | undefined | null) {
  if (!candidateId || typeof window === "undefined") return false;
  return sessionStorage.getItem(`${STORAGE_PREFIX}:${candidateId}`) === "1";
}

export function markReadinessIntroSeen(candidateId: string) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(`${STORAGE_PREFIX}:${candidateId}`, "1");
}

export function clearReadinessIntroSeen(candidateId: string) {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(`${STORAGE_PREFIX}:${candidateId}`);
}
