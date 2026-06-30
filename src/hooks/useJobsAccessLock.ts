import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useMyReadinessAttempts, useReadinessTests } from "@/hooks/useReadiness";
import { allTestsSubmitted } from "@/lib/readiness";
import { canAccessJobs } from "@/lib/candidateJourney";

const JOB_PATHS = ["/candidate/jobs", "/candidate/applications"];

/** Jobs open after preparation complete (Module 2: apply before Readiness). */
export function useJobsAccessLock() {
  const navigate = useNavigate();
  const location = useLocation();
  const { profile, candidate } = useAuth();
  const { data: tests } = useReadinessTests();
  const { data: attempts } = useMyReadinessAttempts();

  const submitted = tests && attempts ? allTestsSubmitted(tests, attempts) : false;
  const jobsOpen = canAccessJobs(profile, candidate, submitted);

  useEffect(() => {
    if (!candidate || jobsOpen) return;
    if (!JOB_PATHS.some((p) => location.pathname === p || location.pathname.startsWith(`${p}/`))) return;
    navigate("/candidate/dashboard", { replace: true });
  }, [candidate, jobsOpen, location.pathname, navigate]);

  return { jobsOpen, readinessSubmitted: submitted };
}
