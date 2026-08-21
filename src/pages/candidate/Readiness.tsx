import { Link, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CalendarCheck } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import ReadinessModuleHub from "@/components/readiness/ReadinessModuleHub";
import { canAccessReadiness, isPreparationComplete } from "@/lib/candidateJourney";
import { useMyReadinessAttempts, useReadinessTests } from "@/hooks/useReadiness";
import { useMyApplications } from "@/hooks/useData";
import { allTestsSubmitted, getReadinessNextAction } from "@/lib/readiness";
import { isSelectionPipelineStatus } from "@/lib/selectionModule";
import { hasSeenReadinessIntro } from "@/lib/readinessIntro";
import MentorAssignedBanner from "@/components/mentor/MentorAssignedBanner";
import { useMyMentorProgramContext } from "@/hooks/useMentorProgram";

export default function CandidateReadiness() {
  const navigate = useNavigate();
  const { profile, candidate, loading } = useAuth();
  const { data: applications, isLoading: applicationsLoading } = useMyApplications();
  const mentorCtx = useMyMentorProgramContext();
  const ready = canAccessReadiness(profile, candidate, applications ?? []);
  const { data: tests } = useReadinessTests();
  const { data: attempts } = useMyReadinessAttempts();

  const submitted =
    tests && tests.length > 0 && attempts ? allTestsSubmitted(tests, attempts) : false;

  const nextAction =
    tests && attempts
      ? getReadinessNextAction(attempts, tests, mentorCtx.meetings ?? [])
      : null;

  useEffect(() => {
    if (ready) {
      if (candidate?.id && !hasSeenReadinessIntro(candidate.id)) {
        navigate("/candidate/readiness/intro", { replace: true });
      }
      return;
    }
    if (loading || applicationsLoading) return;
    if (isPreparationComplete(profile, candidate)) {
      navigate("/candidate/selection", { replace: true });
    }
  }, [
    ready,
    candidate?.id,
    profile,
    candidate,
    loading,
    applicationsLoading,
    navigate,
  ]);

  if (
    loading ||
    applicationsLoading ||
    (!ready && isPreparationComplete(profile, candidate))
  ) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!ready) {
    const inSelection = (applications ?? []).some((a) => isSelectionPipelineStatus(a.status));
    const awaitingMentor = (applications ?? []).some(
      (a) => a.status === "selected_for_readiness" && !a.readiness_unlocked_at
    );
    return (
      <div className="space-y-6 max-w-lg">
        <h1 className="text-2xl font-medium">Readiness</h1>
        <Card>
          <CardContent className="pt-6 space-y-3">
            {awaitingMentor ? (
              <>
                <p className="text-sm text-muted-foreground">
                  Congratulations — you were selected. Readiness unlocks once your company assigns a mentor.
                </p>
                <Button size="sm" variant="outline" asChild>
                  <Link to="/candidate/selection">View Selection</Link>
                </Button>
              </>
            ) : inSelection ? (
              <>
                <p className="text-sm text-muted-foreground">
                  Readiness opens after you pass selection and a mentor is assigned. Track your application in Selection.
                </p>
                <Button size="sm" variant="outline" asChild>
                  <Link to="/candidate/selection">Selection</Link>
                </Button>
              </>
            ) : (
              <>
                <p className="text-sm text-muted-foreground">Complete registration steps 1–3 first.</p>
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" asChild>
                    <Link to="/candidate/profile">Step 1 — Profile</Link>
                  </Button>
                  <Button size="sm" variant="outline" asChild>
                    <Link to="/candidate/university">Step 2 — University</Link>
                  </Button>
                  <Button size="sm" variant="outline" asChild>
                    <Link to="/candidate/registration-details">Step 3 — Background</Link>
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-medium">Readiness</h1>
        <p className="text-sm text-muted-foreground mt-1">
          You do not start exams first. Attend the mentor meeting; when your mentor marks it
          complete, the next level unlocks.
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          Sequence: Meeting 1 → Level 1 → Level 2 → Meeting 2 → Level 3 → Meeting 3
        </p>
      </div>
      {mentorCtx.mentor && (
        <MentorAssignedBanner
          mentor={mentorCtx.mentor}
          company={mentorCtx.company}
          meetings={mentorCtx.meetings}
          track={mentorCtx.track}
        />
      )}
      {nextAction?.kind === "meeting" && (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="pt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <CalendarCheck className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-medium">
                  Next: Mentor Meeting {nextAction.meetingNumber}
                </p>
                <p className="text-sm text-muted-foreground">
                  Attend this session with your mentor. When they mark it complete, that unlocks{" "}
                  {nextAction.unlocks}. Tests stay locked until then.
                </p>
              </div>
            </div>
            <Button size="sm" asChild className="shrink-0">
              <Link to="/candidate/mentoring">Go to Mentoring</Link>
            </Button>
          </CardContent>
        </Card>
      )}
      {nextAction?.kind === "level" && (
        <Card className="border-primary/20 bg-muted/30">
          <CardContent className="pt-6">
            <p className="text-sm font-medium">Next: Level {nextAction.level} tests</p>
            <p className="text-sm text-muted-foreground mt-1">{nextAction.detail}</p>
          </CardContent>
        </Card>
      )}
      {submitted ? (
        <Card>
          <CardContent className="pt-6 space-y-3">
            {candidate?.jobs_unlocked ? (
              <>
                <p className="text-sm text-muted-foreground">
                  Readiness is complete and Activation is open. Continue in Activation — mentor
                  meetings 4–6 run there during the internship.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" asChild>
                    <Link to="/candidate/activation">Go to Activation</Link>
                  </Button>
                  <Button size="sm" variant="outline" asChild>
                    <Link to="/candidate/mentoring">Mentoring</Link>
                  </Button>
                </div>
              </>
            ) : (
              <>
                <p className="text-sm text-muted-foreground">
                  All Readiness tests are submitted. Finish mentor meetings 1–3 if any remain.
                  Activation opens when Nordic Ascent approves you for the next stage.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" asChild>
                    <Link to="/candidate/mentoring">Go to Mentoring</Link>
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      ) : (
        <ReadinessModuleHub hideHeader />
      )}
    </div>
  );
}
