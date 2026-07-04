import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useMyReadinessAttempts, useReadinessTests } from "@/hooks/useReadiness";
import { useMyApplications } from "@/hooks/useData";
import { allTestsSubmitted } from "@/lib/readiness";
import { canAccessMentoring } from "@/lib/candidateJourney";

const MENTORING_PATH = "/candidate/mentoring";

/** Block mentoring until all readiness tests are submitted. */
export function useMentoringAccessLock() {
  const navigate = useNavigate();
  const location = useLocation();
  const { profile, candidate } = useAuth();
  const { data: tests } = useReadinessTests();
  const { data: attempts } = useMyReadinessAttempts();
  const { data: applications } = useMyApplications();

  const submitted = tests && attempts ? allTestsSubmitted(tests, attempts) : false;
  const mentoringOpen = canAccessMentoring(profile, candidate, submitted, applications ?? []);

  useEffect(() => {
    if (!candidate || mentoringOpen) return;
    if (location.pathname !== MENTORING_PATH && !location.pathname.startsWith(`${MENTORING_PATH}/`)) return;
    navigate("/candidate/dashboard", { replace: true });
  }, [candidate, mentoringOpen, location.pathname, navigate]);

  return { mentoringOpen, readinessSubmitted: submitted };
}
