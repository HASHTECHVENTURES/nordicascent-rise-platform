import { useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Loader2, Lock } from "lucide-react";
import {
  useAcademicWorkflowSteps,
  useEnsureAcademicWorkflow,
  useCompleteAcademicWorkflowStep,
} from "@/hooks/useActivation";
import { academicWorkflowProgress } from "@/lib/activationModule";
import { useToast } from "@/hooks/use-toast";

type Props = {
  applicationId: string;
  creditRequired: boolean;
  /** Admin or company can advance the shared academic checklist. */
  canEdit?: boolean;
  canAdmin?: boolean;
};

export default function AcademicWorkflowPanel({
  applicationId,
  creditRequired,
  canEdit = false,
  canAdmin = false,
}: Props) {
  const { toast } = useToast();
  const editable = canEdit || canAdmin;
  const { data: steps, isLoading } = useAcademicWorkflowSteps(applicationId, creditRequired);
  const ensureWorkflow = useEnsureAcademicWorkflow(applicationId, creditRequired);
  const completeStep = useCompleteAcademicWorkflowStep();

  useEffect(() => {
    if (!creditRequired || isLoading) return;
    if ((steps ?? []).length === 0 && !ensureWorkflow.isPending) {
      ensureWorkflow.mutate();
    }
  }, [creditRequired, steps?.length, isLoading, ensureWorkflow]);

  if (!creditRequired) return null;

  if (isLoading || ensureWorkflow.isPending) {
    return (
      <div className="flex justify-center py-4">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
      </div>
    );
  }

  const list = [...(steps ?? [])].sort((a, b) => a.step_number - b.step_number);
  const progress = academicWorkflowProgress(list);
  const nextPending = list.find((s) => s.status !== "completed");

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <p className="text-sm font-medium">University academic workflow (common form)</p>
        <Badge variant="outline">
          {progress.done}/{progress.total}
        </Badge>
      </div>
      <p className="text-xs text-muted-foreground">
        Shared checklist for all universities. Step 1 unlocks internship start. Step 7 is required
        before internship complete when credit is required. Final Clearance and hiring evaluation are
        never shared with the university.
      </p>
      <div className="space-y-2">
        {list.map((step) => {
          const done = step.status === "completed";
          const isNext = nextPending?.id === step.id;
          const locked = !done && !isNext;
          return (
            <div
              key={step.id}
              className="flex items-start justify-between gap-3 rounded-md border px-3 py-2 text-sm"
            >
              <div>
                <p>
                  {step.step_number}. {step.title}
                </p>
                {done && step.completed_at && (
                  <p className="text-xs text-muted-foreground">
                    Completed {new Date(step.completed_at).toLocaleDateString()}
                  </p>
                )}
                {step.step_number === 1 && (
                  <p className="text-xs text-muted-foreground mt-0.5">Unlocks internship start</p>
                )}
                {step.step_number === 7 && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Required before internship complete (credit track)
                  </p>
                )}
              </div>
              {done ? (
                <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
              ) : locked ? (
                <Badge variant="secondary" className="shrink-0 gap-1">
                  <Lock className="h-3 w-3" />
                  Locked
                </Badge>
              ) : editable ? (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={completeStep.isPending}
                  onClick={async () => {
                    try {
                      await completeStep.mutateAsync({
                        stepId: step.id,
                        applicationId,
                      });
                      toast({ title: `Step ${step.step_number} marked complete` });
                    } catch (err) {
                      toast({
                        title: "Could not update",
                        description: err instanceof Error ? err.message : "Try again",
                        variant: "destructive",
                      });
                    }
                  }}
                >
                  Mark done
                </Button>
              ) : (
                <Badge variant="secondary" className="shrink-0">
                  Pending
                </Badge>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
