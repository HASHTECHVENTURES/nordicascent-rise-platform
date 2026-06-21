import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Briefcase, CheckCircle, Circle, User, ClipboardList } from "lucide-react";
import { useMyApplications } from "@/hooks/useData";
import { useAuth } from "@/contexts/AuthContext";
import { computeJourneySteps } from "@/lib/applicationJourney";
import { isJobHuntProfileReady } from "@/lib/profileCompleteness";
import { cn } from "@/lib/utils";

/** Shown instead of the 7-stage pipeline until an employer accepts the candidate. */
export default function JobHuntProgress() {
  const { profile, candidate } = useAuth();
  const { data: applications } = useMyApplications();
  const steps = computeJourneySteps(profile, candidate, applications ?? []);

  return (
    <div className="bg-card border-b px-6 py-4">
      <div className="flex flex-wrap items-center gap-2 md:gap-4">
        {steps.map((step, i) => (
          <div key={step.id} className="flex items-center gap-2">
            <div
              className={cn(
                "flex items-center gap-2 text-sm",
                step.state === "current" && "text-primary font-medium",
                step.state === "done" && "text-muted-foreground",
                step.state === "failed" && "text-destructive",
                step.state === "upcoming" && "text-muted-foreground/60"
              )}
            >
              {step.state === "done" ? (
                <CheckCircle className="h-4 w-4 text-success shrink-0" />
              ) : step.state === "current" ? (
                <Circle className="h-4 w-4 text-primary fill-primary/20 shrink-0" />
              ) : (
                <Circle className="h-4 w-4 shrink-0" />
              )}
              <span>{step.label}</span>
            </div>
            {i < steps.length - 1 && <span className="text-muted-foreground hidden sm:inline">→</span>}
          </div>
        ))}
      </div>
      <div className="flex flex-wrap gap-2 mt-3">
        {!isJobHuntProfileReady(profile, candidate) && (
          <Button size="sm" variant="outline" asChild>
            <Link to="/candidate/profile"><User className="h-3 w-3 mr-1" />My Profile</Link>
          </Button>
        )}
        <Button size="sm" variant="outline" asChild>
          <Link to="/candidate/jobs"><Briefcase className="h-3 w-3 mr-1" />Jobs</Link>
        </Button>
        <Button size="sm" variant="outline" asChild>
          <Link to="/candidate/applications"><ClipboardList className="h-3 w-3 mr-1" />My Applications</Link>
        </Button>
      </div>
    </div>
  );
}
