const PROFILE_SAVED_KEY = "na.profileSaved";

export function markProfileSaved() {
  sessionStorage.setItem(PROFILE_SAVED_KEY, "1");
}

/** Login always lands on My Journey. Profile completeness is prompted on the dashboard. */
export function useCandidateOnboardingRedirect() {
  // No hard redirect away from My Journey after login.
}
