import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Circle, ArrowRight, Briefcase, MessageSquare } from "lucide-react";
import { useMyApplications, useMyTaskProgress, useStageTasks, useCompleteTask } from "@/hooks/useData";
import InterviewInviteCard from "@/components/candidate/InterviewInviteCard";
import {
  applicationStatusLabel,
  applicationStatusVariant,
  getApplicationJob,
  getPrimaryApplication,
  getSelectionStepState,
} from "@/lib/applicationJourney";
import { useAuth } from "@/contexts/AuthContext";
import { useTrack, getNextStageInTrack } from "@/lib/track";
import { PIPELINE_STAGES } from "@/lib/pipeline";
import { stageListPath } from "@/lib/stageRoutes";
import { completeSelectionIfReady } from "@/lib/pipelineProgress";
import { useQueryClient } from "@tanstack/react-query";

/** Selection = you were accepted by a company. Tasks mirror your job application — not My Profile. */
export default function SelectionStageContent() {
  const { candidate } = useAuth();
  const [track] = useTrack();
  const qc = useQueryClient();
  const { data: applications } = useMyApplications();
  const { data: tasks } = useStageTasks("selection");
  const { data: taskProgress } = useMyTaskProgress();
  const completeTask = useCompleteTask();
  const advancedRef = useRef(false);

  const apps = applications ?? [];
  const primary = getPrimaryApplication(apps);
  const job = primary ? getApplicationJob(primary) : null;
  const steps = getSelectionStepState(apps);
  const completedCount = steps.filter((s) => s.done).length;
  const percent = steps.length ? Math.round((completedCount / steps.length) * 100) : 0;
  const selectionComplete = percent === 100;

  const nextStageId = getNextStageInTrack("selection", track);
  const nextStage = nextStageId ? PIPELINE_STAGES.find((s) => s.id === nextStageId) : null;
  const nextHref = nextStageId ? stageListPath(nextStageId) : "/candidate/dashboard";

  const completedIds = new Set(taskProgress?.map((p) => p.task_id) ?? []);

  // Keep database task progress in sync with application status
  useEffect(() => {
    if (!tasks?.length) return;
    for (const task of tasks) {
      const step = steps.find((s) => task.title.toLowerCase().includes(s.taskKey));
      if (!step?.done || completedIds.has(task.id)) continue;
      completeTask.mutate(task.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- sync when application-driven steps change
  }, [tasks, steps.map((s) => `${s.id}:${s.done}`).join(",")]);

  // Advance pipeline when employer acceptance steps are done
  useEffect(() => {
    if (!candidate?.id || !selectionComplete || advancedRef.current) return;
    advancedRef.current = true;
    completeSelectionIfReady(candidate.id, apps).then((didAdvance) => {
      if (didAdvance) {
        qc.invalidateQueries({ queryKey: ["stage-progress"] });
      }
    });
  }, [candidate?.id, selectionComplete, apps, qc]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-medium text-foreground">Selection</h1>
        <p className="text-muted-foreground mt-1">Screening and matching with your employer.</p>
      </div>

      {primary && job && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="pt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="font-medium">{job.companies?.name ?? "Company"} — {job.title}</p>
              <Badge variant={applicationStatusVariant(primary.status)} className="mt-2">
                {applicationStatusLabel(primary.status)}
              </Badge>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link to="/candidate/applications">
                My Applications
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {primary?.interview_meet_url && primary.interview_scheduled_at && (
        <InterviewInviteCard
          jobTitle={job?.title ?? "Role"}
          companyName={job?.companies?.name}
          meetUrl={primary.interview_meet_url}
          scheduledAt={primary.interview_scheduled_at}
          notes={primary.interview_notes}
        />
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-medium">Stage progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-2 text-sm">
            <span className="text-muted-foreground">{completedCount} of {steps.length} steps</span>
            <span className="font-medium">{percent}%</span>
          </div>
          <Progress value={percent} className="h-2" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-medium">Tasks</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {steps.map((step) => (
            <div
              key={step.id}
              className={`flex items-start gap-3 p-4 rounded-lg border ${
                step.done ? "bg-success/5 border-success/20" : "bg-card"
              }`}
            >
              {step.done ? (
                <CheckCircle className="h-5 w-5 text-success shrink-0 mt-0.5" />
              ) : (
                <Circle className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
              )}
              <div className="flex-1 min-w-0">
                <p className={`font-medium text-sm ${step.done ? "text-muted-foreground line-through" : ""}`}>
                  {step.title}
                </p>
                <p className="text-xs text-muted-foreground mt-1">{step.description}</p>
                {!step.done && step.hint && (
                  <p className="text-xs text-primary mt-2">{step.hint}</p>
                )}
              </div>
            </div>
          ))}

          <div className="flex flex-wrap gap-2 pt-2 border-t">
            <Button size="sm" variant="outline" asChild>
              <Link to="/candidate/applications">
                <Briefcase className="h-4 w-4 mr-1" />
                My Applications
              </Link>
            </Button>
            <Button size="sm" variant="outline" asChild>
              <Link to="/candidate/messages">
                <MessageSquare className="h-4 w-4 mr-1" />
                Messages
              </Link>
            </Button>
            {selectionComplete && nextStage && (
              <Button size="sm" asChild>
                <Link to={nextHref}>
                  Continue to {nextStage.name}
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
