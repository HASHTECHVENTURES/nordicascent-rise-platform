import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import UniversityPickerDialog from "@/components/candidate/UniversityPickerDialog";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { CANDIDATE_PROFILE_PATH, isOnUniversityWaitlist } from "@/lib/candidateAccess";

export default function CandidateUniversity() {
  const navigate = useNavigate();
  const { candidate, refreshProfile, loading } = useAuth();

  const hasSelectedUniversity = Boolean(candidate?.university_id);
  const onWaitlist = isOnUniversityWaitlist(candidate);

  useEffect(() => {
    if (loading || !candidate) return;
    if (onWaitlist) {
      navigate(CANDIDATE_PROFILE_PATH, { replace: true });
      return;
    }
    if (hasSelectedUniversity) {
      navigate("/candidate/readiness", { replace: true });
    }
  }, [loading, candidate, hasSelectedUniversity, onWaitlist, navigate]);

  if (loading || !candidate?.id) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (hasSelectedUniversity || onWaitlist) return null;

  return (
    <UniversityPickerDialog
      open
      candidateId={candidate.id}
      required
      onComplete={async () => {
        await refreshProfile();
        navigate("/candidate/readiness", { replace: true });
      }}
      onWaitlistComplete={async () => {
        await refreshProfile();
        navigate(CANDIDATE_PROFILE_PATH, { replace: true });
      }}
    />
  );
}
