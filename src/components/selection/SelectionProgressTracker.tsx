import { cn } from "@/lib/utils";
import { CheckCircle, Circle, XCircle } from "lucide-react";
import { getCandidateTrackerStages, type CandidateTrackerStage } from "@/lib/selectionModule";

type Props = {
  status: string;
  className?: string;
};

function StageIcon({ state }: { state: CandidateTrackerStage["state"] }) {
  if (state === "done") return <CheckCircle className="h-4 w-4 text-success shrink-0" />;
  if (state === "failed") return <XCircle className="h-4 w-4 text-destructive shrink-0" />;
  if (state === "current") return <Circle className="h-4 w-4 text-primary fill-primary/20 shrink-0" />;
  return <Circle className="h-4 w-4 text-muted-foreground/40 shrink-0" />;
}

export default function SelectionProgressTracker({ status, className }: Props) {
  const stages = getCandidateTrackerStages(status);

  return (
    <div className={cn("flex flex-wrap gap-2 sm:gap-0 sm:justify-between", className)}>
      {stages.map((stage, i) => (
        <div key={stage.id} className="flex items-center gap-2 min-w-0">
          <div
            className={cn(
              "flex items-center gap-1.5 text-xs sm:text-sm",
              stage.state === "current" && "font-medium text-foreground",
              stage.state === "done" && "text-muted-foreground",
              stage.state === "upcoming" && "text-muted-foreground/60",
              stage.state === "failed" && "text-destructive"
            )}
          >
            <StageIcon state={stage.state} />
            <span className="truncate">{stage.label}</span>
          </div>
          {i < stages.length - 1 && (
            <div className="hidden sm:block w-6 h-px bg-border mx-1 shrink-0" aria-hidden />
          )}
        </div>
      ))}
    </div>
  );
}
