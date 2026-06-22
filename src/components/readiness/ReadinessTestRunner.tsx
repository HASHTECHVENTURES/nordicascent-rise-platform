import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Loader2, Send, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { getAttemptExpiresAtMs } from "@/lib/readiness";
import { useCountdown } from "@/hooks/useCountdown";
import ReadinessCountdown from "@/components/readiness/ReadinessCountdown";
import {
  useReadinessQuestions,
  useReadinessAnswers,
  useSaveReadinessAnswer,
  useSubmitReadinessAttempt,
  type ReadinessAttempt,
  type ReadinessTest,
} from "@/hooks/useReadiness";
import { useAuth } from "@/contexts/AuthContext";

type Props = {
  test: ReadinessTest;
  attempt: ReadinessAttempt;
};

export default function ReadinessTestRunner({ test, attempt }: Props) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { candidate } = useAuth();
  const { data: questions, isLoading } = useReadinessQuestions(test.id);
  const { data: savedAnswers } = useReadinessAnswers(attempt.id);
  const saveAnswer = useSaveReadinessAnswer();
  const submitAttempt = useSubmitReadinessAttempt();

  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [videoPaths, setVideoPaths] = useState<Record<string, string>>({});
  const [uploading, setUploading] = useState<string | null>(null);
  const submittedRef = useRef(false);
  const saveTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const expiresAtMs = useMemo(
    () => getAttemptExpiresAtMs(attempt, test.timer_minutes),
    [attempt, test.timer_minutes]
  );
  const secondsLeft = useCountdown(expiresAtMs);

  useEffect(() => {
    if (!savedAnswers) return;
    const texts: Record<string, string> = {};
    const videos: Record<string, string> = {};
    for (const a of savedAnswers) {
      if (a.answer_text) texts[a.question_id] = a.answer_text;
      if (a.video_path) videos[a.question_id] = a.video_path;
    }
    setDrafts((prev) => ({ ...texts, ...prev }));
    setVideoPaths((prev) => ({ ...videos, ...prev }));
  }, [savedAnswers]);

  const handleSubmit = useCallback(
    async (expired = false) => {
      if (submittedRef.current) return;
      submittedRef.current = true;
      try {
        await submitAttempt.mutateAsync({ attemptId: attempt.id, expired });
        toast({
          title: expired ? "Time expired — answers submitted" : "Test submitted",
          description: "Your answers are with the Nordic Ascent team for review.",
        });
        navigate("/candidate/readiness", { replace: true });
      } catch (err) {
        submittedRef.current = false;
        toast({
          title: "Submit failed",
          description: err instanceof Error ? err.message : "Try again",
          variant: "destructive",
        });
      }
    },
    [attempt.id, navigate, submitAttempt, toast]
  );

  useEffect(() => {
    if (!test.timer_hard || secondsLeft === null) return;
    if (secondsLeft <= 0 && !submittedRef.current) {
      handleSubmit(true);
    }
  }, [test.timer_hard, secondsLeft, handleSubmit]);

  const debouncedSave = (questionId: string, value: string) => {
    if (saveTimers.current[questionId]) clearTimeout(saveTimers.current[questionId]);
    saveTimers.current[questionId] = setTimeout(() => {
      saveAnswer.mutate({ attemptId: attempt.id, questionId, answerText: value });
    }, 800);
  };

  const handleTextChange = (questionId: string, value: string) => {
    setDrafts((prev) => ({ ...prev, [questionId]: value }));
    debouncedSave(questionId, value);
  };

  const handleVideoUpload = async (questionId: string, file: File) => {
    if (!candidate?.id) return;
    setUploading(questionId);
    try {
      const ext = file.name.split(".").pop() ?? "webm";
      const path = `readiness/${candidate.id}/${attempt.id}/${questionId}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("documents")
        .upload(path, file, { upsert: true });
      if (uploadError) throw uploadError;
      setVideoPaths((prev) => ({ ...prev, [questionId]: path }));
      await saveAnswer.mutateAsync({ attemptId: attempt.id, questionId, videoPath: path });
      toast({ title: "Video uploaded" });
    } catch (err) {
      toast({
        title: "Upload failed",
        description: err instanceof Error ? err.message : "Try again",
        variant: "destructive",
      });
    } finally {
      setUploading(null);
    }
  };

  const answeredCount = useMemo(() => {
    if (!questions) return 0;
    return questions.filter((q) => {
      if (q.answer_type === "video") return Boolean(videoPaths[q.id] || drafts[q.id]?.trim());
      return Boolean(drafts[q.id]?.trim());
    }).length;
  }, [questions, drafts, videoPaths]);

  if (isLoading || !questions) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      {expiresAtMs && (
        <div className="sticky top-0 z-20 -mx-1 px-1 py-2 bg-background/95 backdrop-blur border-b border-border">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Live timer</p>
              <p className="text-sm font-medium truncate">{test.title}</p>
            </div>
            <ReadinessCountdown expiresAtMs={expiresAtMs} hard={test.timer_hard} size="lg" />
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Badge variant="outline" className="mb-2">
            {test.timer_hard ? "Timed test — auto-submit" : "Self-paced with timer"}
          </Badge>
          <h1 className="text-2xl font-medium">{test.title}</h1>
          {test.subtitle && <p className="text-muted-foreground mt-1">{test.subtitle}</p>}
        </div>
        <div className="flex flex-col items-end gap-2">
          <p className="text-sm text-muted-foreground">
            {answeredCount} of {questions.length} answered
          </p>
        </div>
      </div>

      {test.timer_hard && (
        <Card className="border-amber-200 bg-amber-50/50 dark:border-amber-900 dark:bg-amber-950/20">
          <CardContent className="flex items-start gap-3 pt-4 text-sm">
            <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <p>
              This is a <strong>{test.timer_minutes}-minute hard limit</strong> test. The countdown
              updates live. Your answers auto-save as you type — when time hits 0:00, your test
              submits automatically.
            </p>
          </CardContent>
        </Card>
      )}

      {!test.timer_hard && expiresAtMs && (
        <Card className="border-border bg-muted/30">
          <CardContent className="pt-4 text-sm text-muted-foreground">
            Suggested time: <strong>{test.timer_minutes} minutes</strong>. The live timer is a guide —
            you can take longer and submit when ready.
          </CardContent>
        </Card>
      )}

      <div className="space-y-6">
        {questions.map((q, idx) => (
          <Card key={q.id}>
            <CardHeader className="pb-3">
              {q.scenario_label && (
                <p className="text-xs font-semibold uppercase tracking-wide text-primary mb-1">
                  {q.scenario_label}
                </p>
              )}
              <CardTitle className="text-base font-medium leading-relaxed whitespace-pre-wrap">
                {q.prompt}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {q.answer_type === "video" ? (
                <div className="space-y-3">
                  <Label>Video response (2–3 minutes)</Label>
                  <div className="flex flex-wrap gap-3">
                    <Button variant="outline" size="sm" disabled={uploading === q.id} asChild>
                      <label className="cursor-pointer">
                        {uploading === q.id ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <Upload className="h-4 w-4 mr-2" />
                        )}
                        Upload video
                        <input
                          type="file"
                          accept="video/*"
                          className="hidden"
                          onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (f) handleVideoUpload(q.id, f);
                          }}
                        />
                      </label>
                    </Button>
                    {videoPaths[q.id] && (
                      <Badge className="bg-success text-success-foreground">Video uploaded</Badge>
                    )}
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Or paste a video link</Label>
                    <Input
                      placeholder="https://..."
                      value={drafts[q.id] ?? ""}
                      onChange={(e) => handleTextChange(q.id, e.target.value)}
                    />
                  </div>
                </div>
              ) : (
                <Textarea
                  placeholder={
                    q.answer_type === "bullets"
                      ? "Enter bullet points (one per line)..."
                      : "Type your answer..."
                  }
                  rows={q.answer_type === "short" ? 3 : 6}
                  value={drafts[q.id] ?? ""}
                  onChange={(e) => handleTextChange(q.id, e.target.value)}
                  className="resize-y min-h-[100px]"
                />
              )}
              <p className="text-xs text-muted-foreground mt-2">Question {idx + 1}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="sticky bottom-4 flex flex-wrap items-center justify-between gap-3 pb-4">
        {expiresAtMs && (
          <ReadinessCountdown expiresAtMs={expiresAtMs} hard={test.timer_hard} size="sm" className="shadow-md" />
        )}
        <div className="flex gap-3 ml-auto">
          <Button variant="outline" onClick={() => navigate("/candidate/readiness")}>
            Save & exit
          </Button>
          <Button
            disabled={submitAttempt.isPending || submittedRef.current}
            onClick={() => handleSubmit(false)}
            className="gap-2"
          >
            {submitAttempt.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            Submit test
          </Button>
        </div>
      </div>
    </div>
  );
}
