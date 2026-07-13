import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { Loader2, Lock, AlertTriangle } from "lucide-react";
import FinalClearanceInputsSummary from "@/components/activation/FinalClearanceInputsSummary";
import {
  useActivationRecord,
  useFinalClearanceDecision,
  useInternshipCheckpoints,
  useInternshipEvaluation,
  useSubmitFinalClearance,
} from "@/hooks/useActivation";
import {
  useMentorActivationNote,
  useMentorProgramMeetings,
  useMentorSignalNote,
} from "@/hooks/useMentorProgram";
import {
  ACTIVATION_STATUS_LABELS,
  evaluateFinalClearanceReadiness,
  type FinalClearanceDecision,
} from "@/lib/activationModule";
import { useActivationCms } from "@/hooks/useActivation";
import { resolveProfile } from "@/lib/resolveProfile";
import type { SelectionApplication } from "@/lib/selectionModule";
import type { Track } from "@/lib/track";
import { useToast } from "@/hooks/use-toast";

type Props = {
  application: SelectionApplication;
  track: Track;
  canEdit?: boolean;
};

export default function FinalClearancePanel({
  application,
  track,
  canEdit = false,
}: Props) {
  const { toast } = useToast();
  const applicationId = application.id;
  const candidateId = application.candidate_id;
  const profile = resolveProfile(application.candidates?.profiles);
  const jobTitle = application.jobs?.title ?? "this role";

  const { data: record } = useActivationRecord(applicationId);
  const { data: existing } = useFinalClearanceDecision(applicationId);
  const { data: checkpoints = [] } = useInternshipCheckpoints(
    track === "entry" ? applicationId : undefined
  );
  const { data: evaluation } = useInternshipEvaluation(track === "entry" ? applicationId : undefined);
  const { data: meetings = [] } = useMentorProgramMeetings(applicationId);
  const { data: signalNote } = useMentorSignalNote(applicationId);
  const { data: activationNote } = useMentorActivationNote(
    track === "entry" ? applicationId : undefined
  );
  const submitClearance = useSubmitFinalClearance();
  const { data: cms } = useActivationCms();

  const meeting3Complete =
    meetings.find((m) => m.meeting_number === 3)?.status === "completed";
  const meeting6Complete =
    meetings.find((m) => m.meeting_number === 6)?.status === "completed";

  const readiness = evaluateFinalClearanceReadiness({
    track,
    checkpoints,
    meeting3Complete: Boolean(meeting3Complete),
    meeting6Complete: Boolean(meeting6Complete),
    signalNoteExists: Boolean(signalNote),
    activationNoteExists: Boolean(activationNote),
    evaluationExists: Boolean(evaluation),
  });

  const alreadyDecided = Boolean(existing);
  const locked = !readiness.ready && !alreadyDecided;

  const [decision, setDecision] = useState<"clear" | "hold" | "">("");
  const [decisionMaker, setDecisionMaker] = useState("");
  const [decisionDate, setDecisionDate] = useState(new Date().toISOString().slice(0, 10));
  const [reasoning, setReasoning] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!decision || !decisionMaker.trim() || !reasoning.trim() || !candidateId) {
      return;
    }
    const profileId =
      (profile as { id?: string } | null)?.id ??
      (application.candidates as { profile_id?: string } | null)?.profile_id;
    if (!profileId) return;
    try {
      await submitClearance.mutateAsync({
        applicationId,
        candidateId,
        candidateProfileId: profileId,
        jobTitle,
        track,
        decision,
        decision_maker_name: decisionMaker,
        decision_date: decisionDate,
        reasoning,
      });
      toast({
        title: decision === "clear" ? "Candidate cleared" : "Decision recorded",
        description:
          decision === "clear"
            ? "Pre-arrival employment is now unlocked."
            : "The candidate has been notified.",
      });
      setDecision("");
    } catch (err) {
      toast({
        title: "Could not save decision",
        description: err instanceof Error ? err.message : "Try again",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="text-base font-medium">Final Clearance</h3>
        {record && (
          <Badge variant="secondary">{ACTIVATION_STATUS_LABELS[record.status]}</Badge>
        )}
        {alreadyDecided && existing && (
          <Badge variant={existing.decision === "clear" ? "default" : "destructive"}>
            {existing.decision === "clear" ? "Cleared" : "Hold — not proceeding"}
          </Badge>
        )}
      </div>

      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="pt-6 text-sm text-muted-foreground">
          {cms?.clearance_screen_note}
        </CardContent>
      </Card>

      {locked && (
        <Card className="border-amber-500/30 bg-amber-500/5">
          <CardContent className="pt-6 flex gap-3 text-sm">
            <Lock className="h-4 w-4 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Final Clearance is locked</p>
              <ul className="mt-2 space-y-1 text-muted-foreground list-disc list-inside">
                {readiness.blockers.map((b) => (
                  <li key={b}>{b}</li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      )}

      <FinalClearanceInputsSummary application={application} track={track} />

      {alreadyDecided && existing ? (
        <DecisionReadOnly decision={existing} />
      ) : canEdit && !locked ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Your decision</CardTitle>
            <p className="text-sm text-muted-foreground">
              Neither option is pre-selected. Choose Clear or Hold after reviewing the inputs above.
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <RadioGroup
                value={decision}
                onValueChange={(v) => setDecision(v as "clear" | "hold")}
                className="space-y-3"
              >
                <div className="flex items-start gap-3 rounded-lg border p-3">
                  <RadioGroupItem value="clear" id="decision-clear" className="mt-1" />
                  <Label htmlFor="decision-clear" className="font-normal cursor-pointer">
                    <span className="font-medium">Clear</span>
                    <p className="text-sm text-muted-foreground">
                      Proceed to pre-arrival employment and relocation.
                    </p>
                  </Label>
                </div>
                <div className="flex items-start gap-3 rounded-lg border border-destructive/30 p-3">
                  <RadioGroupItem value="hold" id="decision-hold" className="mt-1" />
                  <Label htmlFor="decision-hold" className="font-normal cursor-pointer">
                    <span className="font-medium text-destructive">Hold</span>
                    <p className="text-sm text-muted-foreground">
                      Genuine red flag — do not proceed. Candidate moves to alumni.
                    </p>
                  </Label>
                </div>
              </RadioGroup>

              {decision === "hold" && (
                <div className="flex gap-2 rounded-lg border border-destructive/40 bg-destructive/5 p-3 text-sm">
                  <AlertTriangle className="h-4 w-4 text-destructive shrink-0" />
                  <p>Use Hold only for serious concerns. This ends the employment path for this role.</p>
                </div>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="dm-name">Decision maker name</Label>
                  <Input
                    id="dm-name"
                    value={decisionMaker}
                    onChange={(e) => setDecisionMaker(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="dm-date">Date</Label>
                  <Input
                    id="dm-date"
                    type="date"
                    value={decisionDate}
                    onChange={(e) => setDecisionDate(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="dm-reasoning">Reasoning</Label>
                <Textarea
                  id="dm-reasoning"
                  rows={4}
                  value={reasoning}
                  onChange={(e) => setReasoning(e.target.value)}
                  placeholder="Brief rationale for your decision…"
                  required
                />
              </div>

              <Button type="submit" disabled={!decision || submitClearance.isPending}>
                {submitClearance.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Submit decision"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      ) : !canEdit && !alreadyDecided ? (
        <p className="text-sm text-muted-foreground">
          Final Clearance is completed by your company decision-maker.
        </p>
      ) : null}
    </div>
  );
}

function DecisionReadOnly({ decision }: { decision: FinalClearanceDecision }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Decision recorded</CardTitle>
      </CardHeader>
      <CardContent className="text-sm space-y-2">
        <p>
          <span className="text-muted-foreground">Decision:</span>{" "}
          {decision.decision === "clear" ? "Clear" : "Hold"}
        </p>
        <p>
          <span className="text-muted-foreground">Decision maker:</span> {decision.decision_maker_name}
        </p>
        <p>
          <span className="text-muted-foreground">Date:</span> {decision.decision_date}
        </p>
        <p>
          <span className="text-muted-foreground">Reasoning:</span> {decision.reasoning}
        </p>
      </CardContent>
    </Card>
  );
}
