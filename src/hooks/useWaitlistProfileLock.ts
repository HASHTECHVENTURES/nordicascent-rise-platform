import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  CANDIDATE_PROFILE_PATH,
  isCandidatePathAllowedWhileOnWaitlist,
  isWaitlistProfileOnly,
} from "@/lib/candidateAccess";

/** Keep waitlisted candidates on My Profile until admin approves their university. */
export function useWaitlistProfileLock() {
  const navigate = useNavigate();
  const location = useLocation();
  const { candidate, loading } = useAuth();
  const locked = isWaitlistProfileOnly(candidate);

  useEffect(() => {
    if (loading || !locked) return;
    if (isCandidatePathAllowedWhileOnWaitlist(location.pathname)) return;
    navigate(CANDIDATE_PROFILE_PATH, { replace: true });
  }, [loading, locked, location.pathname, navigate]);

  return locked;
}
