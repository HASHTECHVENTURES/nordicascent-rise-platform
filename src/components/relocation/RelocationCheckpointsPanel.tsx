import { useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle2, Lock } from "lucide-react";
import CheckpointConfirm from "@/components/activation/CheckpointConfirm";
import {
  useRelocationCheckpoints,
  useEnsureRelocationInitialized,
  useConfirmRelocationCheckpoint,
  useRefreshRelocationCheckpoints,
} from "@/hooks/useRelocation";
import { useActivationRecord } from "@/hooks/useActivation";
import {
  RELOCATION_CHECKPOINT_DEFS,
  getRelocationLockedReason,
  isRelocationUnlocked,
  relocationCheckpointProgress,
} from "@/lib/relocationModule";
import { useToast } from "@/hooks/use-toast";

type Props = {
  applicationId: string;
  applicationStatus?: string | null;
  canConfirmCompany?: boolean;
  canConfirmCandidate?: boolean;
  embedded?: boolean;
};

export default function RelocationCheckpointsPanel({
  applicationId,
  applicationStatus,
  canConfirmCompany = false,
  canConfirmCandidate = false,
  embedded = false,
}: Props) {
  const { toast } = useToast();
  const { data: activationRecord, isLoading: recordLoading } = useActivationRecord(applicationId);
  const { data: checkpoints, isLoading: cpLoading } = useRelocationCheckpoints(applicationId);
  const ensureInit = useEnsureRelocationInitialized(applicationId);
  const refreshUnlocks = useRefreshRelocationCheckpoints(applicationId);
  const confirmCheckpoint = useConfirmRelocationCheckpoint();

  const list = checkpoints ?? [];
  const progress = relocationCheckpointProgress(list);
  const unlocked = isRelocationUnlocked({
    preArrivalCompletedAt: activationRecord?.pre_arrival_completed_at,
    applicationStatus: applicationStatus ?? null,
  });
  const relocationDone = Boolean(activationRecord?.relocation_completed_at);

  useEffect(() => {
    if (!applicationId || !unlocked || cpLoading) return;
    if (list.length === 0 && !ensureInit.isPending) {
      ensureInit.mutate();
    }
  }, [applicationId, unlocked, list.length, cpLoading, ensureInit]);

  useEffect(() => {
    if (!applicationId || !unlocked || list.length === 0) return;
    refreshUnlocks.mutate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [applicationId, unlocked, list.length]);

  if (!unlocked) {
    return (
      <p className="text-sm text-muted-foreground">
        Relocation checkpoints unlock after all pre-arrival employment steps are complete.
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
        <h3 className="text-base font-medium">Relocation checkpoints (6)</h3>
        <p className="text-sm text-muted-foreground">
          Complete visa, housing, travel, and settling-in before onboarding.
        </p>
      </div>
      {relocationDone ? (
        <Badge className="bg-success text-success-foreground">Complete</Badge>
      ) : (
        <Badge variant="outline">
          {progress.done}/{progress.total} complete
        </Badge>
      )}
    </div>
  );

  const body = (
    <div className="space-y-4">
      {list.map((cp) => {
        const def = RELOCATION_CHECKPOINT_DEFS.find(
          (d) => d.checkpoint_number === cp.checkpoint_number
        );
        const done = cp.status === "completed";
        const locked = cp.status === "locked";
        const lockedReason = getRelocationLockedReason(cp, list, unlocked);
        const canEdit =
          !relocationDone &&
          ((cp.who_confirms === "company" && canConfirmCompany) ||
            (cp.who_confirms === "candidate" && canConfirmCandidate));
        const showForm = canEdit && !done && !locked;

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
                  Confirmed by: {cp.who_confirms === "company" ? "Company" : "You"}
                </p>
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
                {cp.notes && (
                  <p>
                    <span className="text-muted-foreground">Notes:</span> {cp.notes}
                  </p>
                )}
              </div>
            )}

            {locked && lockedReason && (
              <p className="text-xs text-muted-foreground">{lockedReason}</p>
            )}

            {showForm && (
              <CheckpointConfirm
                notesLabel={def?.notesLabel ?? "Notes"}
                notesRequired={Boolean(def?.notesRequired)}
                defaultDate={new Date().toISOString().slice(0, 10)}
                isPending={confirmCheckpoint.isPending}
                onConfirm={async (data) => {
                  try {
                    await confirmCheckpoint.mutateAsync({
                      checkpointId: cp.id,
                      applicationId,
                      event_date: data.event_date,
                      notes: data.notes,
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
