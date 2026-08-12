import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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
  const [step6Notes, setStep6Notes] = useState("");

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
          const needsEvalNotes = step.step_number === 6 && isNext && editable;
          return (
            <div
              key={step.id}
              className="flex flex-col gap-2 rounded-md border px-3 py-2 text-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p>
                    {step.step_number}. {step.title}
                  </p>
                  {done && step.completed_at && (
                    <p className="text-xs text-muted-foreground">
                      Completed {new Date(step.completed_at).toLocaleDateString()}
                    </p>
                  )}
                  {done && step.notes && (
                    <p className="text-xs text-muted-foreground mt-1 whitespace-pre-line">{step.notes}</p>
                  )}
                  {step.step_number === 1 && (
                    <p className="text-xs text-muted-foreground mt-0.5">Unlocks internship start</p>
                  )}
                  {step.step_number === 6 && !done && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Academic evaluation for the university (learning credit only — not hiring).
                    </p>
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
                ) : editable && !needsEvalNotes ? (
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
                ) : !editable ? (
                  <Badge variant="secondary" className="shrink-0">
                    Pending
                  </Badge>
                ) : null}
              </div>
              {needsEvalNotes && (
                <div className="space-y-2 border-t pt-2">
                  <Label htmlFor={`academic-step6-${step.id}`}>Academic evaluation notes</Label>
                  <Textarea
                    id={`academic-step6-${step.id}`}
                    rows={3}
                    value={step6Notes}
                    onChange={(e) => setStep6Notes(e.target.value)}
                    placeholder="Learning outcomes, hours, strengths for university credit…"
                  />
                  <Button
                    type="button"
                    size="sm"
                    disabled={completeStep.isPending || !step6Notes.trim()}
                    onClick={async () => {
                      if (!step6Notes.trim()) {
                        toast({
                          title: "Notes required",
                          description: "Add the company academic evaluation before completing step 6.",
                          variant: "destructive",
                        });
                        return;
                      }
                      try {
                        await completeStep.mutateAsync({
                          stepId: step.id,
                          applicationId,
                          notes: step6Notes.trim(),
                        });
                        setStep6Notes("");
                        toast({ title: "Step 6 marked complete" });
                      } catch (err) {
                        toast({
                          title: "Could not update",
                          description: err instanceof Error ? err.message : "Try again",
                          variant: "destructive",
                        });
                      }
                    }}
                  >
                    {completeStep.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Submit academic evaluation"
                    )}
                  </Button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
