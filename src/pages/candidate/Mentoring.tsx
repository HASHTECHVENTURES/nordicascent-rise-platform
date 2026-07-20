import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useMyApplications } from "@/hooks/useData";
import { canAccessMentoring } from "@/lib/candidateJourney";
import { isJobsUnlocked } from "@/lib/candidateJourney";
import { Loader2 } from "lucide-react";

/** Mentoring is parallel inside Readiness / Activation — keep route as a soft redirect. */
export default function CandidateMentoring() {
  const { profile, candidate } = useAuth();
  const { data: applications, isLoading } = useMyApplications();

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const mentoringOpen = canAccessMentoring(profile, candidate, false, applications ?? []);
  if (!mentoringOpen) {
    return <Navigate to="/candidate/readiness" replace />;
  }

  if (isJobsUnlocked(candidate)) {
    return <Navigate to="/candidate/activation" replace />;
  }

  return <Navigate to="/candidate/readiness" replace />;
}
