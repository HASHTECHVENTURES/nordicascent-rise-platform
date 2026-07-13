import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle2, Lock } from "lucide-react";
import CheckpointConfirm from "@/components/activation/CheckpointConfirm";
import InternshipEvaluationForm, {
  InternshipEvaluationReadOnly,
} from "@/components/activation/InternshipEvaluationForm";
import {
  useActivationRecord,
  useEnsureActivationInitialized,
  useInternshipCheckpoints,
  useConfirmInternshipCheckpoint,
  useSyncInternshipCheckpoints,
  useInternshipEvaluation,
  useSubmitInternshipEvaluation,
} from "@/hooks/useActivation";
import {
  ACTIVATION_STATUS_LABELS,
  INTERNSHIP_CHECKPOINT_DEFS,
  getCheckpointLockedReason,
  internshipCheckpointProgress,
} from "@/lib/activationModule";
import { useToast } from "@/hooks/use-toast";

type Props = {
  applicationId: string;
  canEdit?: boolean;
  showStatus?: boolean;
  /** Candidates see checkpoint progress only — not evaluation content. */
  showEvaluation?: boolean;
};

const PHASE_LABELS: Record<string, string> = {
  onboarding: "Phase 1 — Onboarding (Week 1–2)",
  execution: "Phase 2 — Execution (Week 3–5/6)",
  review: "Phase 3 — Review (Final 2 weeks)",
};

export default function InternshipCheckpointsPanel({
  applicationId,
  canEdit = false,
  showStatus = true,
  showEvaluation = canEdit,
}: Props) {
  const { toast } = useToast();
  const { data: record, isLoading: recordLoading } = useActivationRecord(applicationId);
  const { data: checkpoints, isLoading: cpLoading } = useInternshipCheckpoints(applicationId);
  const { data: evaluation } = useInternshipEvaluation(applicationId, showEvaluation);
  const ensureInit = useEnsureActivationInitialized(applicationId);
  const syncCheckpoints = useSyncInternshipCheckpoints(applicationId);
  const confirmCheckpoint = useConfirmInternshipCheckpoint();
  const submitEvaluation = useSubmitInternshipEvaluation();

  const list = checkpoints ?? [];
  const progress = internshipCheckpointProgress(list);

  useEffect(() => {
    if (!applicationId || cpLoading) return;
    if (list.length === 0 && !ensureInit.isPending) {
      ensureInit.mutate();
    }
  }, [applicationId, list.length, cpLoading, ensureInit]);

  useEffect(() => {
    if (!applicationId || list.length === 0) return;
    syncCheckpoints.mutate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [applicationId, list.length]);

  if (recordLoading || cpLoading || ensureInit.isPending) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  const phases = ["onboarding", "execution", "review"] as const;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div>
          <h3 className="text-base font-medium">Internship checkpoints (7)</h3>
          <p className="text-sm text-muted-foreground">
            Entry track — all 7 must be complete before Final Clearance unlocks. Meetings 4–6
            auto-complete from Module 3B.
          </p>
        </div>
        {showStatus && record && (
          <Badge variant="secondary">{ACTIVATION_STATUS_LABELS[record.status]}</Badge>
        )}
        <Badge variant="outline">
          {progress.done}/{progress.total} complete
        </Badge>
      </div>

      {phases.map((phase) => {
        const phaseCheckpoints = list.filter((c) => c.phase === phase);
        const phaseDefs = INTERNSHIP_CHECKPOINT_DEFS.filter((d) => d.phase === phase);
        if (phaseCheckpoints.length === 0 && phaseDefs.length === 0) return null;

        return (
          <Card key={phase}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                {PHASE_LABELS[phase]}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {(phaseCheckpoints.length ? phaseCheckpoints : []).map((cp) => {
                const def = INTERNSHIP_CHECKPOINT_DEFS.find(
                  (d) => d.checkpoint_number === cp.checkpoint_number
                );
                const done = cp.status === "completed";
                const locked = cp.status === "locked";
                const isEval = cp.checkpoint_number === 6;
                const lockedReason = getCheckpointLockedReason(cp, list, record);

                return (
                  <div key={cp.id} className="rounded-lg border p-4 space-y-2">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-medium text-sm">
                          #{cp.checkpoint_number}: {cp.title}
                        </p>
                        {def?.hint && (
                          <p className="text-xs text-muted-foreground mt-0.5">{def.hint}</p>
                        )}
                      </div>
                      {done ? (
                        <Badge className="bg-success text-success-foreground shrink-0 gap-1">
                          <CheckCircle2 className="h-3 w-3" />
                          Completed
                        </Badge>
                      ) : locked ? (
                        <Badge variant="secondary" className="shrink-0 gap-1">
                          <Lock className="h-3 w-3" />
                          Locked
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="shrink-0">
                          Available
                        </Badge>
                      )}
                    </div>

                    {done && (
                      <div className="text-sm bg-muted/50 rounded-md p-3 space-y-1">
                        {cp.event_date && (
                          <p>
                            <span className="text-muted-foreground">Date:</span> {cp.event_date}
                          </p>
                        )}
                        {cp.notes && !isEval && (
                          <p>
                            <span className="text-muted-foreground">Notes:</span> {cp.notes}
                          </p>
                        )}
                        {isEval && done && showEvaluation && evaluation && (
                          <InternshipEvaluationReadOnly evaluation={evaluation} />
                        )}
                        {isEval && done && !showEvaluation && (
                          <p className="text-xs text-muted-foreground">
                            Evaluation submitted by your company.
                          </p>
                        )}
                        {cp.who_confirms === "system" && (
                          <p className="text-xs text-muted-foreground">
                            Auto-completed from mentor programme
                          </p>
                        )}
                      </div>
                    )}

                    {locked && lockedReason && (
                      <p className="text-xs text-muted-foreground">{lockedReason}</p>
                    )}

                    {!done && !locked && cp.who_confirms === "company" && canEdit && !isEval && (
                      <CheckpointConfirm
                        notesLabel={
                          cp.checkpoint_number === 1
                            ? "What is the candidate working on?"
                            : "Notes"
                        }
                        notesRequired={cp.checkpoint_number === 1}
                        notesPlaceholder={
                          cp.checkpoint_number === 3
                            ? "On track? Any adjustments?"
                            : undefined
                        }
                        isPending={confirmCheckpoint.isPending}
                        onConfirm={async (data) => {
                          try {
                            await confirmCheckpoint.mutateAsync({
                              checkpointId: cp.id,
                              applicationId,
                              ...data,
                            });
                            toast({ title: `Checkpoint ${cp.checkpoint_number} confirmed` });
                          } catch (err) {
                            toast({
                              title: "Could not confirm",
                              description: err instanceof Error ? err.message : "Try again",
                              variant: "destructive",
                            });
                          }
                        }}
                      />
                    )}

                    {!done && !locked && isEval && showEvaluation && (
                      <InternshipEvaluationForm
                        canEdit={canEdit}
                        evaluation={evaluation}
                        isPending={submitEvaluation.isPending}
                        onSubmit={async (data) => {
                          try {
                            await submitEvaluation.mutateAsync({
                              applicationId,
                              checkpointId: cp.id,
                              event_date: data.event_date,
                              technical_execution: data.technical_execution,
                              communication: data.communication,
                              collaboration_team_fit: data.collaboration_team_fit,
                              overall_assessment: data.overall_assessment,
                              concerns_risks: data.concerns_risks,
                            });
                            toast({ title: "Internship evaluation submitted" });
                          } catch (err) {
                            toast({
                              title: "Could not submit",
                              description: err instanceof Error ? err.message : "Try again",
                              variant: "destructive",
                            });
                          }
                        }}
                      />
                    )}
                  </div>
                );
              })}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
