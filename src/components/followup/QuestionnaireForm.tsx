import { useMemo, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import {
  useFollowupAnswers,
  useFollowupCms,
  useSubmitFollowupQuestionnaire,
} from "@/hooks/useFollowup";
import {
  DEFAULT_FOLLOWUP_QUESTIONNAIRE_CMS,
  questionnaireDefKey,
  type FollowupQuestionnaire,
  type MeetingParty,
} from "@/lib/followupModule";
import { useToast } from "@/hooks/use-toast";

type Props = {
  questionnaire: FollowupQuestionnaire;
  applicationId: string;
  readOnly?: boolean;
};

function statusLabel(status: FollowupQuestionnaire["status"]) {
  if (status === "submitted") return "Submitted";
  if (status === "open") return "Open";
  return "Pending";
}

export default function QuestionnaireForm({ questionnaire, applicationId, readOnly }: Props) {
  const { toast } = useToast();
  const submit = useSubmitFollowupQuestionnaire();
  const { data: cms } = useFollowupCms();
  const { data: savedAnswers } = useFollowupAnswers(
    applicationId,
    questionnaire.status === "submitted" ? questionnaire.id : undefined
  );
  const defs =
    (cms?.questionnaires ?? DEFAULT_FOLLOWUP_QUESTIONNAIRE_CMS)[
      questionnaireDefKey(questionnaire.month_number as 3 | 6, questionnaire.party as MeetingParty)
    ] ?? [];
  const [answers, setAnswers] = useState<
    Record<string, { option_key?: string; score?: number; open_text?: string }>
  >({});
  const [open, setOpen] = useState(false);

  const requiredCount = defs.filter((q) => !q.optional).length;
  const answeredRequiredCount = useMemo(() => {
    return defs.filter((q) => {
      if (q.optional) return false;
      const a = answers[q.key];
      if (q.type === "likert") return Boolean(a?.option_key);
      return Boolean(a?.open_text?.trim());
    }).length;
  }, [answers, defs]);

  const allAnswered = requiredCount > 0 && answeredRequiredCount >= requiredCount;

  useEffect(() => {
    if (!open) return;
    setAnswers({});
  }, [open, questionnaire.id]);

  if (questionnaire.status === "pending") {
    return (
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="secondary">Pending</Badge>
        <p className="text-sm text-muted-foreground">
          Opens {questionnaire.opens_at ? `on ${questionnaire.opens_at}` : "soon"} (one week before
          the touchpoint).
        </p>
      </div>
    );
  }

  if (questionnaire.status === "submitted") {
    return (
      <div className="space-y-2">
        <Badge className="bg-success text-success-foreground">Submitted</Badge>
        <p className="text-sm text-muted-foreground">
          {questionnaire.submitted_at
            ? `Submitted on ${questionnaire.submitted_at.slice(0, 10)}.`
            : "Submitted."}
        </p>
        {readOnly &&
          (savedAnswers ?? []).map((a) => {
            const def = defs.find((d) => d.key === a.question_key);
            return (
              <div key={a.id} className="text-xs space-y-0.5 border-l-2 pl-2">
                <p className="font-medium text-foreground">{def?.prompt ?? a.question_key}</p>
                <p className="text-muted-foreground">
                  {a.open_text ??
                    (a.score != null ? `Score ${a.score}${a.option_key ? ` (${a.option_key})` : ""}` : "—")}
                  {a.readiness_dimension ? ` · ${a.readiness_dimension}` : ""}
                </p>
              </div>
            );
          })}
      </div>
    );
  }

  if (readOnly) {
    return (
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="outline">Open</Badge>
        <p className="text-sm text-muted-foreground">
          Awaiting {questionnaire.party} submission
          {questionnaire.opens_at ? ` (opened ${questionnaire.opens_at})` : ""}.
        </p>
      </div>
    );
  }

  const formBody = (
    <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
      <p className="text-xs text-muted-foreground sticky top-0 bg-background py-1">
        {answeredRequiredCount} of {requiredCount} required questions answered
      </p>
      {defs.map((q) => {
        const a = answers[q.key];
        const isAnswered =
          q.optional ||
          (q.type === "likert" ? Boolean(a?.option_key) : Boolean(a?.open_text?.trim()));

        return (
          <div
            key={q.key}
            className={`space-y-1.5 rounded-md border p-3 ${isAnswered ? "border-border" : "border-destructive/30"}`}
          >
            <Label className="text-sm leading-snug">
              {q.prompt}
              {!q.optional && <span className="text-destructive"> *</span>}
              {q.optional && (
                <span className="text-muted-foreground font-normal"> (optional)</span>
              )}
            </Label>
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
              {q.dimension.replace(/_/g, " ")}
            </p>
            {q.type === "likert" && q.options ? (
              <>
                <Select
                  value={answers[q.key]?.option_key ?? ""}
                  onValueChange={(key) => {
                    const opt = q.options!.find((o) => o.key === key);
                    setAnswers((prev) => ({
                      ...prev,
                      [q.key]: {
                        ...prev[q.key],
                        option_key: key,
                        score: opt?.score,
                      },
                    }));
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select…" />
                  </SelectTrigger>
                  <SelectContent>
                    {q.options.map((o) => (
                      <SelectItem key={o.key} value={o.key}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {q.openFollowUp && (
                  <Textarea
                    rows={2}
                    className="mt-1.5"
                    placeholder="Optional comment…"
                    value={answers[q.key]?.open_text ?? ""}
                    onChange={(e) =>
                      setAnswers((prev) => ({
                        ...prev,
                        [q.key]: { ...prev[q.key], open_text: e.target.value },
                      }))
                    }
                  />
                )}
              </>
            ) : (
              <Textarea
                rows={2}
                required={!q.optional}
                value={answers[q.key]?.open_text ?? ""}
                onChange={(e) =>
                  setAnswers((prev) => ({
                    ...prev,
                    [q.key]: { ...prev[q.key], open_text: e.target.value },
                  }))
                }
              />
            )}
          </div>
        );
      })}
      <Button
        className="w-full"
        disabled={submit.isPending || !allAnswered}
        onClick={async () => {
          if (!allAnswered) {
            toast({
              title: "Answer all required questions",
              description: "Every required question must be answered before you can submit.",
              variant: "destructive",
            });
            return;
          }
          try {
            await submit.mutateAsync({
              questionnaireId: questionnaire.id,
              applicationId,
              month: questionnaire.month_number as 3 | 6,
              party: questionnaire.party,
              answers,
            });
            toast({ title: "Questionnaire submitted" });
            setOpen(false);
          } catch (err) {
            toast({
              title: "Submit failed",
              description: err instanceof Error ? err.message : "Try again",
              variant: "destructive",
            });
          }
        }}
      >
        {submit.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Submit questionnaire"}
      </Button>
      {!allAnswered && (
        <p className="text-xs text-muted-foreground text-center">
          Answer every required question to enable submit.
        </p>
      )}
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="default" className="gap-2">
          Complete questionnaire
          <Badge variant="secondary" className="font-normal">
            {statusLabel(questionnaire.status)}
          </Badge>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>
            {questionnaire.party === "candidate" ? "Candidate" : "Company"} questionnaire — month{" "}
            {questionnaire.month_number}
          </DialogTitle>
          <DialogDescription>
            All required questions must be answered. Progress: {answeredRequiredCount}/{requiredCount}.
          </DialogDescription>
        </DialogHeader>
        {formBody}
      </DialogContent>
    </Dialog>
  );
}
