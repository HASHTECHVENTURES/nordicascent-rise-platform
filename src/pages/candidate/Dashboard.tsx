import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useMyReadinessAttempts, useReadinessTests } from "@/hooks/useReadiness";
import { useMyApplications, useMyStageProgress } from "@/hooks/useData";
import PreparationStageCard from "@/components/candidate/PreparationStageCard";
import {
  computeEarlyJourneySteps,
  getEffectiveJourneyStage,
  type StageProgressRow,
} from "@/lib/candidateJourney";
import { allTestsSubmitted } from "@/lib/readiness";

const CandidateDashboard = () => {
  const { profile, candidate } = useAuth();
  const { data: tests, isLoading } = useReadinessTests();
  const { data: attempts } = useMyReadinessAttempts();
  const { data: applications } = useMyApplications();
  const { data: stageProgressRaw } = useMyStageProgress();

  const submitted = tests && attempts ? allTestsSubmitted(tests, attempts) : false;
  const apps = applications ?? [];
  const stageProgress: StageProgressRow[] = (stageProgressRaw ?? []).map((p) => ({
    stage_id: p.stage_id,
    status: p.status,
  }));
  const activeStageId = getEffectiveJourneyStage(
    profile,
    candidate,
    submitted,
    apps,
    stageProgress
  );
  const steps = computeEarlyJourneySteps(
    profile,
    candidate,
    submitted,
    apps,
    stageProgress
  );
  const currentStep = steps.find((s) => s.state === "current");

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-medium">My Journey</h1>
        {currentStep && (
          <p className="text-muted-foreground text-sm mt-1">Current step: {currentStep.label}</p>
        )}
      </div>

      {activeStageId === "preparation" && (
        <Card>
          <CardContent className="pt-6">
            <PreparationStageCard />
          </CardContent>
        </Card>
      )}

      {currentStep && currentStep.href && activeStageId !== "preparation" && (
        <Card>
          <CardContent className="pt-6 flex items-center justify-between gap-4">
            <p className="font-medium">{currentStep.label}</p>
            <Button asChild>
              <Link to={currentStep.href}>
                Continue
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CandidateDashboard;
