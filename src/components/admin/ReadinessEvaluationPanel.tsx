import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, ChevronDown, ChevronUp } from "lucide-react";
import {
  useAdminReadinessAttempts,
  useAdminReadinessAnswers,
  useAdminReadinessEvaluation,
  useSaveReadinessEvaluation,
  useResetReadinessAttempt,
  useReadinessQuestions,
} from "@/hooks/useReadiness";
import { READINESS_AREA_LABELS, READINESS_SIGNAL_LABELS } from "@/data/readinessModuleSeed";
import { useToast } from "@/hooks/use-toast";

type Props = { candidateId: string };

function AttemptReviewBlock({
  attemptId,
  testId,
  area,
  level,
  title,
  status,
  submittedAt,
  onReset,
}: {
  attemptId: string;
  testId: string;
  area: string;
  level: number;
  title: string;
  status: string;
  submittedAt: string | null;
  onReset: () => void;
}) {
  const [open, setOpen] = useState(false);
  const { data: questions } = useReadinessQuestions(open ? testId : undefined);
  const { data: answers } = useAdminReadinessAnswers(open ? attemptId : undefined);
  const resetAttempt = useResetReadinessAttempt();
  const { toast } = useToast();

  const answerMap = new Map((answers ?? []).map((a) => [a.question_id, a]));

  return (
    <div className="border rounded-lg">
      <button
        type="button"
        className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/50"
        onClick={() => setOpen(!open)}
      >
        <div>
          <p className="font-medium text-sm">
            {READINESS_AREA_LABELS[area] ?? area} · Level {level}
          </p>
          <p className="text-xs text-muted-foreground">{title}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={status === "submitted" ? "default" : "secondary"}>{status}</Badge>
          {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </div>
      </button>
      {open && (
        <div className="border-t p-4 space-y-4">
          {submittedAt && (
            <p className="text-xs text-muted-foreground">
              Submitted {new Date(submittedAt).toLocaleString()}
            </p>
          )}
          {(questions ?? []).map((q, i) => {
            const ans = answerMap.get(q.id);
            return (
              <div key={q.id} className="space-y-1 text-sm">
                {q.scenario_label && (
                  <p className="text-xs font-semibold text-primary">{q.scenario_label}</p>
                )}
                <p className="text-muted-foreground whitespace-pre-wrap">{q.prompt}</p>
                <div className="rounded bg-muted/50 p-3 mt-1">
                  {ans?.answer_text ? (
                    <p className="whitespace-pre-wrap">{ans.answer_text}</p>
                  ) : ans?.video_path ? (
                    <p className="text-xs">Video: {ans.video_path}</p>
                  ) : (
                    <p className="text-muted-foreground italic">No answer</p>
                  )}
                </div>
              </div>
            );
          })}
          <Button
            size="sm"
            variant="outline"
            disabled={resetAttempt.isPending}
            onClick={async () => {
              try {
                await resetAttempt.mutateAsync(attemptId);
                toast({ title: "Attempt reset" });
                onReset();
              } catch (err) {
                toast({
                  title: "Reset failed",
                  description: err instanceof Error ? err.message : "Try again",
                  variant: "destructive",
                });
              }
            }}
          >
            Reset attempt (allow retake)
          </Button>
        </div>
      )}
    </div>
  );
}

export default function ReadinessEvaluationPanel({ candidateId }: Props) {
  const { data: attempts, isLoading, refetch } = useAdminReadinessAttempts(candidateId);
  const { data: evaluation } = useAdminReadinessEvaluation(candidateId);
  const saveEval = useSaveReadinessEvaluation();
  const { toast } = useToast();

  const [cultural, setCultural] = useState<string>("");
  const [technical, setTechnical] = useState<string>("");
  const [redFlag, setRedFlag] = useState(false);
  const [redFlagNote, setRedFlagNote] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (!evaluation) return;
    setCultural(evaluation.cultural_signal ?? "");
    setTechnical(evaluation.technical_signal ?? "");
    setRedFlag(evaluation.red_flag);
    setRedFlagNote(evaluation.red_flag_note ?? "");
    setNotes(evaluation.evaluator_notes ?? "");
  }, [evaluation]);

  if (isLoading) {
    return <Loader2 className="h-6 w-6 animate-spin text-primary" />;
  }

  const submittedCount = (attempts ?? []).filter(
    (a) => a.status === "submitted" || a.status === "expired"
  ).length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Readiness evaluation</CardTitle>
        <p className="text-sm text-muted-foreground">
          {submittedCount} test(s) submitted · Score per area: Strong / Acceptable / Weak
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          {(attempts ?? []).length === 0 && (
            <p className="text-sm text-muted-foreground">No readiness attempts yet.</p>
          )}
          {(attempts ?? []).map((a) => {
            const t = a.readiness_tests as { area: string; level: number; title: string } | null;
            if (!t) return null;
            return (
              <AttemptReviewBlock
                key={a.id}
                attemptId={a.id}
                testId={a.test_id}
                area={t.area}
                level={t.level}
                title={t.title}
                status={a.status}
                submittedAt={a.submitted_at}
                onReset={() => refetch()}
              />
            );
          })}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Cultural & Social signal</Label>
            <Select value={cultural} onValueChange={setCultural}>
              <SelectTrigger>
                <SelectValue placeholder="Select signal" />
              </SelectTrigger>
              <SelectContent>
                {(["strong", "acceptable", "weak"] as const).map((s) => (
                  <SelectItem key={s} value={s}>
                    {READINESS_SIGNAL_LABELS[s]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Technical signal</Label>
            <Select value={technical} onValueChange={setTechnical}>
              <SelectTrigger>
                <SelectValue placeholder="Select signal" />
              </SelectTrigger>
              <SelectContent>
                {(["strong", "acceptable", "weak"] as const).map((s) => (
                  <SelectItem key={s} value={s}>
                    {READINESS_SIGNAL_LABELS[s]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Checkbox id="red-flag" checked={redFlag} onCheckedChange={(v) => setRedFlag(v === true)} />
          <Label htmlFor="red-flag">Red flag — serious concern regardless of scores</Label>
        </div>
        {redFlag && (
          <Textarea
            placeholder="Red flag note (required)"
            value={redFlagNote}
            onChange={(e) => setRedFlagNote(e.target.value)}
            rows={2}
          />
        )}
        <div className="space-y-2">
          <Label>Evaluator notes (internal)</Label>
          <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} />
        </div>

        <div className="flex flex-wrap gap-3">
          <Button
            disabled={saveEval.isPending || !cultural || !technical}
            onClick={async () => {
              try {
                await saveEval.mutateAsync({
                  candidateId,
                  cultural_signal: cultural as "strong" | "acceptable" | "weak",
                  technical_signal: technical as "strong" | "acceptable" | "weak",
                  red_flag: redFlag,
                  red_flag_note: redFlagNote || null,
                  evaluator_notes: notes || null,
                });
                toast({ title: "Evaluation saved" });
              } catch (err) {
                toast({
                  title: "Save failed",
                  description: err instanceof Error ? err.message : "Try again",
                  variant: "destructive",
                });
              }
            }}
          >
            {saveEval.isPending ? "Saving…" : "Save evaluation"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
