import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Circle, Clock, XCircle, ArrowRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useMyApplications } from "@/hooks/useData";
import {
  applicationStatusLabel,
  computeJourneySteps,
  getPrimaryApplication,
  hasUnlockedPipeline,
  type JourneyStepState,
} from "@/lib/applicationJourney";

function StepIcon({ state }: { state: JourneyStepState }) {
  if (state === "done") return <CheckCircle className="h-5 w-5 text-success shrink-0" />;
  if (state === "current") return <Clock className="h-5 w-5 text-primary shrink-0" />;
  if (state === "failed") return <XCircle className="h-5 w-5 text-destructive shrink-0" />;
  return <Circle className="h-5 w-5 text-muted-foreground shrink-0" />;
}

export default function ApplicationJourneyCard() {
  const { profile, candidate } = useAuth();
  const { data: applications } = useMyApplications();
  const apps = applications ?? [];
  const steps = computeJourneySteps(profile, candidate, apps);
  const primary = getPrimaryApplication(apps);
  const unlocked = hasUnlockedPipeline(apps);

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div>
          <CardTitle className="text-lg font-medium">Your path</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Profile → Apply → Employer review → Journey stages
          </p>
        </div>
        {primary && (
          <Badge variant="outline" className="shrink-0">
            {applicationStatusLabel(primary.status)}
          </Badge>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <ol className="space-y-4">
          {steps.map((step) => (
            <li key={step.id} className="flex gap-3">
              <StepIcon state={step.state} />
              <div className="min-w-0">
                <p
                  className={`text-sm font-medium ${
                    step.state === "upcoming" ? "text-muted-foreground" : "text-foreground"
                  }`}
                >
                  {step.label}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">{step.description}</p>
              </div>
            </li>
          ))}
        </ol>

        <div className="flex flex-wrap gap-2 pt-2 border-t">
          <Button size="sm" variant="outline" asChild>
            <Link to="/candidate/jobs">Browse roles</Link>
          </Button>
          {apps.length > 0 && (
            <Button size="sm" variant="outline" asChild>
              <Link to="/candidate/applications">My Applications</Link>
            </Button>
          )}
          {unlocked && (
            <Button size="sm" asChild>
              <Link to="/candidate/selection">
                Continue journey
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          )}
          {primary?.status === "rejected" && !unlocked && (
            <Button size="sm" asChild>
              <Link to="/candidate/jobs">Apply to another role</Link>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
