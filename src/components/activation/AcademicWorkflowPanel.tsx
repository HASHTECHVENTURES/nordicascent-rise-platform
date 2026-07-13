import { useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Loader2 } from "lucide-react";
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
  canAdmin?: boolean;
};

export default function AcademicWorkflowPanel({
  applicationId,
  creditRequired,
  canAdmin = false,
}: Props) {
  const { toast } = useToast();
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

  const list = steps ?? [];
  const progress = academicWorkflowProgress(list);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <p className="text-sm font-medium">University academic workflow (7 steps)</p>
        <Badge variant="outline">
          {progress.done}/{progress.total}
        </Badge>
      </div>
      <p className="text-xs text-muted-foreground">
        Admin coordinates with the university (third party). Internship unlocks after step 7.
        Final Clearance and hiring evaluation are never shared with the university.
      </p>
      <div className="space-y-2">
        {list.map((step) => {
          const done = step.status === "completed";
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
              </div>
              {done ? (
                <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
              ) : canAdmin ? (
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
