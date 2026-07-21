import { useEffect, useRef, useState } from "react";
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
  DEFAULT_ACTIVATION_CMS,
  isPreInternshipGateComplete,
  normalizeActivationCmsText,
  preInternshipGateBlockers,
} from "@/lib/activationModule";
import AcademicWorkflowPanel from "@/components/activation/AcademicWorkflowPanel";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

type Props = {
  applicationId: string;
  companyName?: string | null;
  jobTitle?: string | null;
  canAdmin?: boolean;
  canEmployer?: boolean;
  canCandidate?: boolean;
};

export default function PreInternshipGatePanel({
  applicationId,
  companyName,
  jobTitle,
  canAdmin = false,
  canEmployer = false,
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
  const acceptSectionRef = useRef<HTMLDivElement>(null);
  const [highlightAccept, setHighlightAccept] = useState(false);

  const presentationText = normalizeActivationCmsText(
    cms?.pre_internship_presentation || DEFAULT_ACTIVATION_CMS.pre_internship_presentation
  );

  useEffect(() => {
    if (!record?.presentation_acknowledged_at || record.candidate_accepted_at) {
      setHighlightAccept(false);
      return;
    }
    setHighlightAccept(true);
    acceptSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [record?.presentation_acknowledged_at, record?.candidate_accepted_at]);

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
  const canAcknowledge = canCandidate || canAdmin;
  const acknowledged = Boolean(record.presentation_acknowledged_at);
  const accepted = Boolean(record.candidate_accepted_at);

  const runAcknowledge = async () => {
    try {
      await acknowledge.mutateAsync({ applicationId });
      toast({
        title: "Presentation acknowledged",
        description: "Next: accept the internship below to unlock checkpoints.",
      });
      setHighlightAccept(true);
      requestAnimationFrame(() => {
        acceptSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      });
    } catch (err) {
      toast({
        title: "Could not save",
        description: err instanceof Error ? err.message : "Try again",
        variant: "destructive",
      });
    }
  };

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
          Two steps unlock internship checkpoints: (1) acknowledge the presentation, then (2)
          accept the internship
          {record.university_credit_required ? ", plus academic approval if credit is required" : ""}.
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
          <div className="flex items-center gap-2">
            <Badge variant={acknowledged ? "default" : "outline"} className="text-[10px]">
              Step 1
            </Badge>
            <p className="text-sm font-medium">Platform presentation</p>
          </div>
          <p className="text-sm text-muted-foreground whitespace-pre-line">{presentationText}</p>
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
          {acknowledged ? (
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5 text-success" />
              Acknowledged {new Date(record.presentation_acknowledged_at!).toLocaleDateString()}
              {!accepted ? " — continue with Step 2 below" : ""}
            </p>
          ) : canAcknowledge ? (
            <Button size="sm" disabled={acknowledge.isPending} onClick={runAcknowledge}>
              {acknowledge.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "I have read this"}
            </Button>
          ) : (
            <p className="text-xs text-muted-foreground">Waiting for candidate acknowledgment</p>
          )}
        </div>

        <div
          ref={acceptSectionRef}
          className={cn(
            "rounded-lg border p-4 space-y-3 transition-shadow",
            highlightAccept && !accepted && "ring-2 ring-primary shadow-sm"
          )}
        >
          <div className="flex items-center gap-2">
            <Badge variant={accepted ? "default" : acknowledged ? "outline" : "secondary"} className="text-[10px]">
              Step 2
            </Badge>
            <p className="text-sm font-medium">Accept internship</p>
          </div>
          <p className="text-xs text-muted-foreground">
            This is the step that unlocks internship checkpoints. Acknowledging the presentation alone
            is not enough.
          </p>
          {accepted ? (
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5 text-success" />
              Accepted {new Date(record.candidate_accepted_at!).toLocaleDateString()}
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
                  disabled={!acknowledged}
                />
              </div>
              <Button
                size="sm"
                disabled={accept.isPending || !acknowledged}
                onClick={async () => {
                  try {
                    await accept.mutateAsync({
                      applicationId,
                      internship_start_date: startDate || null,
                    });
                    setHighlightAccept(false);
                    toast({
                      title: "Internship accepted",
                      description: "Checkpoint #1 is now unlocked.",
                    });
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
              {!acknowledged && (
                <p className="text-xs text-muted-foreground">
                  Complete Step 1 first — click “I have read this” above.
                </p>
              )}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">
              {acknowledged
                ? "Waiting for the candidate to log in and click Accept internship."
                : "Waiting for candidate acceptance (candidate login required for this step)."}
            </p>
          )}
        </div>

        {record.university_credit_required && (
          <div className="rounded-lg border p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-[10px]">
                Step 3
              </Badge>
              <p className="text-sm font-medium">Academic approval</p>
            </div>
            <AcademicWorkflowPanel
              applicationId={applicationId}
              creditRequired={record.university_credit_required}
              canAdmin={canAdmin}
              canEdit={canAdmin || canEmployer}
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
                    toast({ title: "Emergency unlock applied" });
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
                  "Emergency override — unlock without step 1"
                )}
              </Button>
            )}
            {canAdmin && !record.academic_unlocked_at && (
              <p className="text-xs text-muted-foreground">
                Prefer completing step 1. Override only if the university process is blocked.
              </p>
            )}
            {record.academic_unlocked_at && (
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5 text-success" />
                Academic approval recorded{" "}
                {new Date(record.academic_unlocked_at).toLocaleDateString()}
              </p>
            )}
            {!canAdmin && !canEmployer && !record.academic_unlocked_at && (
              <p className="text-xs text-muted-foreground">
                Waiting for academic step 1 (project approval + supervisor). That unlocks internship
                start. Hiring decisions are never shared with the university.
              </p>
            )}
            {(canAdmin || canEmployer) && !record.academic_unlocked_at && !canAdmin && (
              <p className="text-xs text-muted-foreground">
                Complete academic step 1 with the university to unlock internship start.
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
