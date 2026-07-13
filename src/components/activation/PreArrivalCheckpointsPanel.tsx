import { useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, Lock, FileText } from "lucide-react";
import CheckpointConfirm from "@/components/activation/CheckpointConfirm";
import {
  useActivationRecord,
  usePreArrivalCheckpoints,
  useEnsurePreArrivalInitialized,
  useConfirmPreArrivalCheckpoint,
  useRefreshPreArrivalCheckpoints,
} from "@/hooks/useActivation";
import {
  PRE_ARRIVAL_CHECKPOINT_DEFS,
  getPreArrivalLockedReason,
  preArrivalCheckpointProgress,
  uploadPreArrivalContract,
} from "@/lib/activationModule";
import { documentFileName, openStoredDocument } from "@/lib/documentAccess";
import { useToast } from "@/hooks/use-toast";

type Props = {
  applicationId: string;
  canConfirmCompany?: boolean;
  canConfirmCandidate?: boolean;
  embedded?: boolean;
};

export default function PreArrivalCheckpointsPanel({
  applicationId,
  canConfirmCompany = false,
  canConfirmCandidate = false,
  embedded = false,
}: Props) {
  const { toast } = useToast();
  const { data: record, isLoading: recordLoading } = useActivationRecord(applicationId);
  const { data: checkpoints, isLoading: cpLoading } = usePreArrivalCheckpoints(applicationId);
  const ensureInit = useEnsurePreArrivalInitialized(applicationId);
  const refreshUnlocks = useRefreshPreArrivalCheckpoints(applicationId);
  const confirmCheckpoint = useConfirmPreArrivalCheckpoint();

  const list = checkpoints ?? [];
  const progress = preArrivalCheckpointProgress(list);
  const clearanceCleared = record?.status === "cleared";

  useEffect(() => {
    if (!applicationId || !clearanceCleared || cpLoading) return;
    if (list.length === 0 && !ensureInit.isPending) {
      ensureInit.mutate();
    }
  }, [applicationId, clearanceCleared, list.length, cpLoading, ensureInit]);

  useEffect(() => {
    if (!applicationId || !clearanceCleared || list.length === 0) return;
    refreshUnlocks.mutate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [applicationId, clearanceCleared, list.length]);

  if (!clearanceCleared) {
    return (
      <p className="text-sm text-muted-foreground">
        Pre-arrival employment steps unlock after Final Clearance (Clear decision).
      </p>
    );
  }

  if (recordLoading || cpLoading || ensureInit.isPending) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  const header = (
    <div className="flex flex-wrap items-center gap-3">
      <div>
        <h3 className="text-base font-medium">Pre-arrival employment (6)</h3>
        <p className="text-sm text-muted-foreground">
          Complete all checkpoints in order before the candidate starts full-time employment.
        </p>
      </div>
      <Badge variant="outline">
        {progress.done}/{progress.total} complete
      </Badge>
    </div>
  );

  const body = (
    <div className="space-y-4">
      {list.map((cp) => {
        const def = PRE_ARRIVAL_CHECKPOINT_DEFS.find(
          (d) => d.checkpoint_number === cp.checkpoint_number
        );
        const done = cp.status === "completed";
        const locked = cp.status === "locked";
        const lockedReason = getPreArrivalLockedReason(cp, list, clearanceCleared);
        const canEdit =
          (cp.who_confirms === "company" && canConfirmCompany) ||
          (cp.who_confirms === "candidate" && canConfirmCandidate);
        const showForm =
          canEdit &&
          ((!done && !locked) || (done && cp.allow_reconfirm));

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
                <p className="text-xs text-muted-foreground mt-1">
                  Confirmed by: {cp.who_confirms === "company" ? "Company" : "Candidate"}
                </p>
              </div>
              {done ? (
                <Badge className="bg-success text-success-foreground shrink-0 gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  {cp.allow_reconfirm ? "Last confirmed" : "Completed"}
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
                {cp.notes && (
                  <p>
                    <span className="text-muted-foreground">Notes:</span> {cp.notes}
                  </p>
                )}
                {cp.attachment_path && (
                  <Button
                    type="button"
                    variant="link"
                    size="sm"
                    className="h-auto p-0 gap-1"
                    onClick={() => openStoredDocument(cp.attachment_path!)}
                  >
                    <FileText className="h-3.5 w-3.5" />
                    {documentFileName(cp.attachment_path)}
                  </Button>
                )}
              </div>
            )}

            {locked && lockedReason && (
              <p className="text-xs text-muted-foreground">{lockedReason}</p>
            )}

            {showForm && (
              <CheckpointConfirm
                title={cp.allow_reconfirm && done ? "Re-confirm ongoing work" : undefined}
                notesLabel={def?.notesLabel ?? "Notes"}
                notesRequired={Boolean(def?.notesRequired)}
                requiresAttachment={Boolean(def?.requiresAttachment) && !done}
                attachmentLabel="Signed employment contract"
                confirmLabel={cp.allow_reconfirm && done ? "Update confirmation" : "Confirm"}
                defaultDate={cp.event_date ?? new Date().toISOString().slice(0, 10)}
                defaultNotes={cp.notes ?? ""}
                isPending={confirmCheckpoint.isPending}
                onConfirm={async (data) => {
                  try {
                    let attachment_path: string | null | undefined;
                    if (data.file) {
                      attachment_path = await uploadPreArrivalContract(applicationId, data.file);
                    }
                    await confirmCheckpoint.mutateAsync({
                      checkpointId: cp.id,
                      applicationId,
                      event_date: data.event_date,
                      notes: data.notes,
                      attachment_path,
                    });
                    toast({
                      title:
                        cp.allow_reconfirm && done
                          ? "Ongoing work updated"
                          : `Checkpoint ${cp.checkpoint_number} confirmed`,
                    });
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
          </div>
        );
      })}
    </div>
  );

  if (embedded) {
    return (
      <div className="space-y-4">
        {header}
        {body}
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">{header}</CardHeader>
      <CardContent>{body}</CardContent>
    </Card>
  );
}
