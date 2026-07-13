import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { CheckCircle2, Loader2, Lock } from "lucide-react";
import {
  useActivationRecord,
  useAcknowledgePreInternshipPresentation,
  useAcceptPreInternship,
  useUnlockAcademicInternship,
  useSetUniversityCreditRequired,
  useActivationCms,
} from "@/hooks/useActivation";
import {
  isPreInternshipGateComplete,
  preInternshipGateBlockers,
} from "@/lib/activationModule";
import AcademicWorkflowPanel from "@/components/activation/AcademicWorkflowPanel";
import { useToast } from "@/hooks/use-toast";

type Props = {
  applicationId: string;
  companyName?: string | null;
  jobTitle?: string | null;
  canAdmin?: boolean;
  canCandidate?: boolean;
};

export default function PreInternshipGatePanel({
  applicationId,
  companyName,
  jobTitle,
  canAdmin = false,
  canCandidate = false,
}: Props) {
  const { toast } = useToast();
  const { data: record, isLoading } = useActivationRecord(applicationId);
  const acknowledge = useAcknowledgePreInternshipPresentation();
  const accept = useAcceptPreInternship();
  const unlockAcademic = useUnlockAcademicInternship();
  const setCredit = useSetUniversityCreditRequired();
  const { data: cms } = useActivationCms();
  const [startDate, setStartDate] = useState("");

  if (isLoading) {
    return (
      <div className="flex justify-center py-6">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
      </div>
    );
  }

  if (!record) return null;

  const complete = isPreInternshipGateComplete(record);
  const blockers = preInternshipGateBlockers(record);

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex flex-wrap items-center gap-2">
          <CardTitle className="text-base">Pre-internship gate</CardTitle>
          {complete ? (
            <Badge className="bg-success text-success-foreground gap-1">
              <CheckCircle2 className="h-3 w-3" />
              Complete
            </Badge>
          ) : (
            <Badge variant="secondary" className="gap-1">
              <Lock className="h-3 w-3" />
              Required before internship
            </Badge>
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          Presentation, acceptance, and academic approval (if credit required) must be done before
          checkpoint #1 unlocks.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {canAdmin && (
          <div className="flex items-center justify-between gap-4 rounded-lg border p-3">
            <div>
              <p className="text-sm font-medium">University credit required</p>
              <p className="text-xs text-muted-foreground">
                When on, admin must unlock academic approval before internship starts.
              </p>
            </div>
            <Switch
              checked={record.university_credit_required}
              disabled={setCredit.isPending}
              onCheckedChange={async (checked) => {
                try {
                  await setCredit.mutateAsync({ applicationId, required: checked });
                  toast({ title: checked ? "University credit enabled" : "University credit disabled" });
                } catch (err) {
                  toast({
                    title: "Could not update",
                    description: err instanceof Error ? err.message : "Try again",
                    variant: "destructive",
                  });
                }
              }}
            />
          </div>
        )}

        <div className="rounded-lg border p-4 space-y-3 bg-muted/30">
          <p className="text-sm font-medium">Platform presentation</p>
          <p className="text-sm text-muted-foreground whitespace-pre-line">
            {cms?.pre_internship_presentation ?? ""}
          </p>
          {(companyName || jobTitle) && (
            <p className="text-sm">
              Your internship at{" "}
              <span className="font-medium">{companyName ?? "your company"}</span>
              {jobTitle ? (
                <>
                  : <span className="font-medium">{jobTitle}</span>
                </>
              ) : null}
              {record.internship_start_date ? (
                <>
                  . Start <span className="font-medium">{record.internship_start_date}</span>.
                </>
              ) : null}
            </p>
          )}
          {record.presentation_acknowledged_at ? (
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5 text-success" />
              Acknowledged {new Date(record.presentation_acknowledged_at).toLocaleDateString()}
            </p>
          ) : canCandidate ? (
            <Button
              size="sm"
              disabled={acknowledge.isPending}
              onClick={async () => {
                try {
                  await acknowledge.mutateAsync({ applicationId });
                  toast({ title: "Presentation acknowledged" });
                } catch (err) {
                  toast({
                    title: "Could not save",
                    description: err instanceof Error ? err.message : "Try again",
                    variant: "destructive",
                  });
                }
              }}
            >
              {acknowledge.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "I have read this"}
            </Button>
          ) : (
            <p className="text-xs text-muted-foreground">Waiting for candidate acknowledgment</p>
          )}
        </div>

        <div className="rounded-lg border p-4 space-y-3">
          <p className="text-sm font-medium">Candidate acceptance</p>
          {record.candidate_accepted_at ? (
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5 text-success" />
              Accepted {new Date(record.candidate_accepted_at).toLocaleDateString()}
            </p>
          ) : canCandidate ? (
            <div className="space-y-3">
              <div className="space-y-1.5 max-w-xs">
                <Label htmlFor="internship-start">Expected start date (optional)</Label>
                <Input
                  id="internship-start"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <Button
                size="sm"
                disabled={accept.isPending || !record.presentation_acknowledged_at}
                onClick={async () => {
                  try {
                    await accept.mutateAsync({
                      applicationId,
                      internship_start_date: startDate || null,
                    });
                    toast({ title: "Internship accepted" });
                  } catch (err) {
                    toast({
                      title: "Could not save",
                      description: err instanceof Error ? err.message : "Try again",
                      variant: "destructive",
                    });
                  }
                }}
              >
                {accept.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Accept internship"
                )}
              </Button>
              {!record.presentation_acknowledged_at && (
                <p className="text-xs text-muted-foreground">
                  Acknowledge the presentation first.
                </p>
              )}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">Waiting for candidate acceptance</p>
          )}
        </div>

        {record.university_credit_required && (
          <div className="rounded-lg border p-4 space-y-3">
            <AcademicWorkflowPanel
              applicationId={applicationId}
              creditRequired={record.university_credit_required}
              canAdmin={canAdmin}
            />
            {canAdmin && !record.academic_unlocked_at && (
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={unlockAcademic.isPending}
                onClick={async () => {
                  try {
                    await unlockAcademic.mutateAsync({ applicationId });
                    toast({ title: "Academic lock overridden" });
                  } catch (err) {
                    toast({
                      title: "Could not unlock",
                      description: err instanceof Error ? err.message : "Try again",
                      variant: "destructive",
                    });
                  }
                }}
              >
                {unlockAcademic.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Override — unlock without workflow"
                )}
              </Button>
            )}
            {record.academic_unlocked_at && (
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5 text-success" />
                Academic approval recorded{" "}
                {new Date(record.academic_unlocked_at).toLocaleDateString()}
              </p>
            )}
            {!canAdmin && !record.academic_unlocked_at && (
              <p className="text-xs text-muted-foreground">
                Waiting for admin to complete the university academic workflow.
              </p>
            )}
          </div>
        )}

        {!complete && blockers.length > 0 && (
          <ul className="text-xs text-muted-foreground list-disc pl-4 space-y-0.5">
            {blockers.map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
