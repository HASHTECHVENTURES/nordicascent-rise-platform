import type { Candidate, Profile } from "@/types/database";
import { Link } from "react-router-dom";
import { CheckCircle, Circle, Lock } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useMyReadinessAttempts, useReadinessTests } from "@/hooks/useReadiness";
import { useMyApplications } from "@/hooks/useData";
import { allTestsSubmitted } from "@/lib/readiness";
import {
  canAccessJobs,
  canAccessMentoring,
  canAccessReadiness,
  computeEarlyJourneySteps,
  isJobsUnlocked,
  type EarlyJourneyStep,
} from "@/lib/candidateJourney";
import { cn } from "@/lib/utils";

function isStepAccessible(
  step: EarlyJourneyStep,
  profile: Profile | null,
  candidate: Candidate | null | undefined,
  readinessSubmitted: boolean,
  applications: { status: string; assigned_mentor_id: string | null; readiness_unlocked_at: string | null }[]
) {
  switch (step.id) {
    case "preparation":
      return true;
    case "selection":
      return canAccessJobs(profile, candidate, readinessSubmitted);
    case "readiness":
      return canAccessReadiness(profile, candidate, applications);
    case "mentoring":
      return canAccessMentoring(profile, candidate, readinessSubmitted, applications);
    case "internship":
    case "activation":
      return isJobsUnlocked(candidate);
    default:
      return false;
  }
}

export default function JourneyProgress() {
  const { profile, candidate } = useAuth();
  const { data: tests } = useReadinessTests();
  const { data: attempts } = useMyReadinessAttempts();
  const { data: applications } = useMyApplications();

  const submitted = tests && attempts ? allTestsSubmitted(tests, attempts) : false;
  const steps = computeEarlyJourneySteps(profile, candidate, submitted, applications ?? []);

  return (
    <div className="bg-card border-b px-6 py-3 overflow-x-auto">
      <div className="flex flex-wrap items-center gap-2 md:gap-3 min-w-max">
        {steps.map((step, i) => {
          const accessible = isStepAccessible(step, profile, candidate, submitted, applications ?? []);
          const clickable = accessible && step.href && (step.state === "current" || step.state === "done");
          const locked = !accessible;

          const content = (
            <div
              className={cn(
                "flex items-center gap-1.5 text-sm whitespace-nowrap",
                step.state === "current" && "text-primary font-medium",
                step.state === "done" && "text-muted-foreground",
                step.state === "upcoming" && "text-muted-foreground/50",
                clickable && "hover:opacity-80"
              )}
            >
              {step.state === "done" ? (
                <CheckCircle className="h-4 w-4 text-success shrink-0" />
              ) : locked ? (
                <Lock className="h-3.5 w-3.5 shrink-0" />
              ) : step.state === "current" ? (
                <Circle className="h-4 w-4 text-primary fill-primary/20 shrink-0" />
              ) : (
                <Circle className="h-4 w-4 shrink-0" />
              )}
              <span>{step.label}</span>
            </div>
          );

          return (
            <div key={step.id} className="flex items-center gap-2 md:gap-3">
              {clickable ? <Link to={step.href!}>{content}</Link> : content}
              {i < steps.length - 1 && (
                <span className="text-muted-foreground/40 hidden sm:inline">→</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
