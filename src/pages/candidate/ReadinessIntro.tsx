import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, BookOpen, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useMyApplications } from "@/hooks/useData";
import { canAccessReadiness } from "@/lib/candidateJourney";
import { markReadinessIntroSeen } from "@/lib/readinessIntro";
import { syncPrimaryApplicationStatus, APPLICATION_JOURNEY_STATUSES } from "@/lib/applicationStatusFlow";
import { useReadinessCms } from "@/hooks/useReadiness";

export default function CandidateReadinessIntro() {
  const navigate = useNavigate();
  const { profile, candidate, loading } = useAuth();
  const { data: applications, isLoading: applicationsLoading } = useMyApplications();
  const { data: cms, isLoading: cmsLoading } = useReadinessCms();
  const ready = canAccessReadiness(profile, candidate, applications ?? []);

  useEffect(() => {
    if (loading || applicationsLoading) return;
    if (!ready || !candidate?.id) {
      navigate("/candidate/readiness", { replace: true });
    }
  }, [loading, applicationsLoading, ready, candidate?.id, navigate]);

  if (loading || applicationsLoading || cmsLoading || !ready || !candidate?.id || !cms) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const handleNext = async () => {
    markReadinessIntroSeen(candidate.id);
    // Only advances mentor_assigned / selected → readiness_active; never regresses later stages.
    await syncPrimaryApplicationStatus(candidate.id, APPLICATION_JOURNEY_STATUSES.READINESS_ACTIVE);
    navigate("/candidate/readiness", { replace: true });
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <p className="text-sm font-medium text-primary">Readiness</p>
        <h1 className="text-2xl font-bold tracking-tight mt-1">Before you begin</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Please read this carefully — then you will enter the Readiness test area.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <BookOpen className="h-5 w-5" />
            Read this first
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm leading-relaxed text-muted-foreground space-y-4 whitespace-pre-wrap">
            {cms.pre_test_note.split("\n\n").map((paragraph) => (
              <p key={paragraph.slice(0, 48)}>{paragraph}</p>
            ))}
          </div>
          <p className="text-sm text-muted-foreground border-t pt-4 whitespace-pre-wrap">
            {cms.timer_soft_note}
          </p>
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">{cms.timer_hard_note}</p>
        </CardContent>
      </Card>

      <div className="flex justify-end pb-8">
        <Button size="lg" className="gap-2 min-w-[140px]" onClick={handleNext}>
          Next
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
