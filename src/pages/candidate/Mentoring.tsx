import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useMyReadinessAttempts, useReadinessTests } from "@/hooks/useReadiness";
import { useMyApplications } from "@/hooks/useData";
import { allTestsSubmitted } from "@/lib/readiness";
import { canAccessMentoring } from "@/lib/candidateJourney";
import { Loader2 } from "lucide-react";
import MentorAssignedBanner from "@/components/mentor/MentorAssignedBanner";
import { useMyMentorProgramContext } from "@/hooks/useMentorProgram";

const CandidateMentoring = () => {
  const { profile, candidate } = useAuth();
  const { data: tests } = useReadinessTests();
  const { data: attempts } = useMyReadinessAttempts();
  const { data: applications } = useMyApplications();
  const mentorCtx = useMyMentorProgramContext();

  const submitted = tests && attempts ? allTestsSubmitted(tests, attempts) : false;
  const mentoringOpen = canAccessMentoring(profile, candidate, submitted, applications ?? []);

  if (!mentoringOpen) {
    return (
      <div className="space-y-6 max-w-lg">
        <h1 className="text-2xl font-medium">Mentoring</h1>
        <Card>
          <CardContent className="pt-6 space-y-3">
            <p className="text-sm text-muted-foreground">Complete Readiness first.</p>
            <Button size="sm" asChild>
              <Link to="/candidate/readiness">Go to Readiness</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (mentorCtx.isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-medium">Mentoring</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Your company mentor follows a standard 3+3 programme. You see progress only — not mentor notes.
        </p>
      </div>

      {mentorCtx.mentor ? (
        <MentorAssignedBanner
          mentor={mentorCtx.mentor}
          company={mentorCtx.company}
          meetings={mentorCtx.meetings}
          track={mentorCtx.track}
        />
      ) : (
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">
              Your mentor will appear here once assigned.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CandidateMentoring;
