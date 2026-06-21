import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { isJobHuntProfileReady } from "@/lib/profileCompleteness";

const PROFILE_SAVED_KEY = "na.profileSaved";

export function markProfileSaved() {
  sessionStorage.setItem(PROFILE_SAVED_KEY, "1");
}

/** First-time candidates land on My Profile once; after Save they can use the rest of the portal. */
export function useCandidateOnboardingRedirect() {
  const navigate = useNavigate();
  const location = useLocation();
  const { profile, candidate, loading } = useAuth();

  const ready = isJobHuntProfileReady(profile, candidate);

  useEffect(() => {
    if (loading || ready) return;
    if (sessionStorage.getItem(PROFILE_SAVED_KEY) === "1") return;
    if (location.pathname === "/candidate/profile") return;
    navigate("/candidate/profile", { replace: true });
  }, [loading, ready, location.pathname, navigate]);
}
