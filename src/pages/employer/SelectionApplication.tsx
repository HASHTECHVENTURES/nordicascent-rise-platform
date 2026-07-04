import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  useEmployerSelectionApplication,
  useEmployerSelectionFeedback,
  useSelectionBoardDecision,
} from "@/hooks/useSelection";
import { employerBoardSummary, getSelectionStepFromStatus, selectionStatusLabel } from "@/lib/selectionModule";

const EmployerSelectionApplication = () => {
  const { applicationId } = useParams<{ applicationId: string }>();
  const { data: app, isLoading, isError, error } = useEmployerSelectionApplication(applicationId);
  const feedbackMut = useEmployerSelectionFeedback();
  const board = useSelectionBoardDecision();
  const { toast } = useToast();

  const step = app ? getSelectionStepFromStatus(app.status, app.selection_step) : 1;
  const [techFeedback, setTechFeedback] = useState("");
  const [motFeedback, setMotFeedback] = useState("");
  const [boardDecision, setBoardDecision] = useState<"selected" | "hold" | "rejected">("selected");

  useEffect(() => {
    if (!app) return;
    setTechFeedback(app.technical_company_feedback ?? "");
    setMotFeedback(app.motivation_company_feedback ?? "");
    setBoardDecision((app.board_company_decision as typeof boardDecision) ?? "selected");
  }, [app]);

  const saveFeedback = async (stepNum: 3 | 4) => {
    if (!app) return;
    try {
      await feedbackMut.mutateAsync({
        applicationId: app.id,
        step: stepNum,
        feedback: stepNum === 3 ? techFeedback : motFeedback,
      });
      toast({ title: "Feedback saved" });
    } catch (err) {
      toast({
        title: "Failed",
        description: err instanceof Error ? err.message : "Try again",
        variant: "destructive",
      });
    }
  };

  const saveBoardDecision = async () => {
    if (!app) return;
    try {
      await board.mutateAsync({
        applicationId: app.id,
        adminRecommendation: (app.board_admin_recommendation as "recommended" | "not_recommended") ?? "recommended",
        adminReason: app.board_admin_reason ?? "",
        companyDecision: boardDecision,
      });
      toast({ title: "Decision recorded" });
    } catch (err) {
      toast({
        title: "Failed",
        description: err instanceof Error ? err.message : "Try again",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isError || !app) {
    return (
      <div className="space-y-4 max-w-lg py-12">
        <h1 className="text-xl font-medium">Application not found</h1>
        <p className="text-sm text-muted-foreground">
          {error instanceof Error ? error.message : "This application could not be loaded."}
        </p>
        <Button variant="outline" asChild>
          <Link to="/employer/candidates">Back to candidates</Link>
        </Button>
      </div>
    );
  }

  const profile = app.candidates?.profiles;
  const summary = employerBoardSummary(app);

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-start gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/employer/candidates">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-medium">
            {profile?.full_name ?? "Candidate"}
          </h1>
          <p className="text-sm text-muted-foreground">{app.jobs?.title}</p>
          <Badge variant="outline" className="mt-2">
            {selectionStatusLabel(app.status)}
          </Badge>
        </div>
      </div>

      {step >= 3 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Technical session feedback</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Share your impressions after the face-to-face session. No score required.
            </p>
            <Textarea value={techFeedback} onChange={(e) => setTechFeedback(e.target.value)} rows={4} />
            <Button size="sm" onClick={() => saveFeedback(3)} disabled={feedbackMut.isPending}>
              Save feedback
            </Button>
          </CardContent>
        </Card>
      )}

      {step >= 4 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Motivation session feedback</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Textarea value={motFeedback} onChange={(e) => setMotFeedback(e.target.value)} rows={4} />
            <Button size="sm" onClick={() => saveFeedback(4)} disabled={feedbackMut.isPending}>
              Save feedback
            </Button>
          </CardContent>
        </Card>
      )}

      {step >= 4 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Selection board</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <p><span className="text-muted-foreground">Technical:</span> {summary.technical_score ?? "—"}</p>
              <p><span className="text-muted-foreground">Cognitive:</span> {summary.cognitive_score ?? "—"}</p>
              <p><span className="text-muted-foreground">Motivation:</span> {summary.motivation_score ?? "—"}</p>
            </div>
            {summary.admin_recommendation && (
              <div className="rounded-lg border p-3 text-sm">
                <p className="font-medium">Admin recommendation</p>
                <p className="capitalize">{summary.admin_recommendation.replace("_", " ")}</p>
                {summary.admin_reason && (
                  <p className="text-muted-foreground mt-1">{summary.admin_reason}</p>
                )}
              </div>
            )}
            {(summary.company_feedback_step3 || summary.company_feedback_step4) && (
              <div className="rounded-lg border p-3 text-sm space-y-2">
                <p className="font-medium">Your session feedback</p>
                {summary.company_feedback_step3 && (
                  <p className="text-muted-foreground">
                    <span className="text-foreground">Technical:</span> {summary.company_feedback_step3}
                  </p>
                )}
                {summary.company_feedback_step4 && (
                  <p className="text-muted-foreground">
                    <span className="text-foreground">Motivation:</span> {summary.company_feedback_step4}
                  </p>
                )}
              </div>
            )}
            <div className="space-y-2">
              <Label>Your decision</Label>
              <Select value={boardDecision} onValueChange={(v) => setBoardDecision(v as typeof boardDecision)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="selected">Selected</SelectItem>
                  <SelectItem value="hold">Hold</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={saveBoardDecision} disabled={board.isPending}>
              Submit decision
            </Button>
          </CardContent>
        </Card>
      )}

      {step < 3 && (
        <Card>
          <CardContent className="py-8 text-center text-sm text-muted-foreground">
            This candidate is still in early selection stages. You'll be invited when they reach technical assessment.
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EmployerSelectionApplication;
