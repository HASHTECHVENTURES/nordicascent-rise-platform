import { useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowRight, Info, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useTrack, TRACK_META, isStageInTrack, getNextStageInTrack, getContinueStageForExcluded } from "@/lib/track";
import {
  useStageTasks,
  useMyTaskProgress,
  useMyStageProgress,
  useMyApplications,
  useAdvanceStageIfReady,
} from "@/hooks/useData";
import { PIPELINE_STAGES } from "@/lib/pipeline";
import { computeStageReadiness } from "@/lib/profileCompleteness";
import { hasUnlockedPipeline, isPostPreparationStage, hasActiveApplication } from "@/lib/applicationJourney";
import { STAGES_WITH_TASK_PAGES, stageListPath, stageTaskPath } from "@/lib/stageRoutes";
import StageTaskRow from "@/components/candidate/StageTaskRow";
import SelectionStageContent from "@/components/candidate/SelectionStageContent";

type Props = {
  stageId: string;
  title?: string;
  description?: string;
  /** Render as a subsection inside Activation (no page header / continue card). */
  embedded?: boolean;
  sectionTitle?: string;
  /** Internship tasks shown inside Activation for Entry Track even though internship is not a top-level stage. */
  nestedInActivation?: boolean;
};

export default function StageTasksPanel({
  stageId,
  title,
  description,
  embedded = false,
  sectionTitle,
  nestedInActivation = false,
}: Props) {
  const [track] = useTrack();
  const stageMeta = PIPELINE_STAGES.find((s) => s.id === stageId);
  const { data: tasks, isLoading: tasksLoading } = useStageTasks(stageId);
  const { data: progress } = useMyTaskProgress();
  const { data: stageProgress } = useMyStageProgress();
  const { data: applications } = useMyApplications();
  const advanceStage = useAdvanceStageIfReady();
  const syncedRef = useRef(false);

  const pipelineUnlocked = hasUnlockedPipeline(applications ?? []);

  const stageStatus = stageProgress?.find((s) => s.stage_id === stageId)?.status ?? "not_started";
  const completedIds = new Set(progress?.map((p) => p.task_id) ?? []);
  const taskList = tasks ?? [];
  const completedCount = taskList.filter((t) => completedIds.has(t.id)).length;
  const readiness = computeStageReadiness(completedCount, taskList.length);
  const stageTasksDone = taskList.length > 0 && readiness === 100;
  const preparationDone = stageId === "preparation" && stageTasksDone;
  const hasApplications = (applications?.length ?? 0) > 0;
  const waitingOnEmployer = hasActiveApplication(applications ?? []);

  const nextStageId = getNextStageInTrack(stageId, track);
  const nextStageMeta = nextStageId ? PIPELINE_STAGES.find((s) => s.id === nextStageId) : null;

  useEffect(() => {
    syncedRef.current = false;
  }, [stageId]);

  useEffect(() => {
    if (!stageTasksDone || stageStatus === "completed" || syncedRef.current) return;
    syncedRef.current = true;
    advanceStage.mutate(stageId);
  }, [stageId, stageTasksDone, stageStatus]);

  if (!nestedInActivation && !isStageInTrack(stageId, track)) {
    const continueStageId = getContinueStageForExcluded(stageId, track);
    const continueMeta = PIPELINE_STAGES.find((s) => s.id === continueStageId);
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-medium text-foreground">{title ?? stageMeta?.name}</h1>
          <p className="text-muted-foreground">Not part of {TRACK_META[track].label}</p>
        </div>
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="pt-6 flex items-start gap-3">
            <Info className="h-5 w-5 text-primary mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-foreground">
                {stageMeta?.name} is not required on {TRACK_META[track].label}
              </p>
              <p className="text-muted-foreground mt-1">
                Continue with the stages in your track using the pipeline above.
              </p>
              <Button variant="outline" size="sm" className="mt-3" asChild>
                <Link to={stageListPath(continueStageId)}>
                  Go to {continueMeta?.name ?? "your next stage"} <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isPostPreparationStage(stageId) && !pipelineUnlocked) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-medium text-foreground">{title ?? stageMeta?.name}</h1>
          <p className="text-muted-foreground">{description ?? stageMeta?.name}</p>
        </div>
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="pt-6 flex items-start gap-3">
            <Info className="h-5 w-5 text-primary mt-0.5" />
            <div className="text-sm space-y-3">
              <p className="font-medium text-foreground">This stage opens after employer acceptance</p>
              <p className="text-muted-foreground">
                Complete your profile, apply to a job, and wait for the employer to accept you.
                Then {stageMeta?.name} and the rest of your journey will begin here.
              </p>
              <Button size="sm" asChild>
                <Link to="/candidate/jobs">Go to Jobs <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (stageId === "selection" && pipelineUnlocked) {
    return <SelectionStageContent />;
  }

  if (tasksLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const statusBadge = () => {
    if (stageTasksDone || stageStatus === "completed" || preparationDone) {
      return <Badge className="bg-success text-success-foreground">Completed</Badge>;
    }
    if (stageStatus === "active") return <Badge className="bg-primary text-primary-foreground">In progress</Badge>;
    return <Badge variant="secondary">Not started</Badge>;
  };

  return (
    <div className={embedded ? "space-y-4" : "space-y-6"}>
      {!embedded && (
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-medium text-foreground">{title ?? stageMeta?.name}</h1>
            <p className="text-muted-foreground">{description ?? stageMeta?.name}</p>
          </div>
          {statusBadge()}
        </div>
      )}

      {embedded && sectionTitle && (
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-medium text-foreground">{sectionTitle}</h2>
          {statusBadge()}
        </div>
      )}

      <Card>
        {embedded ? (
          <CardContent className="pt-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{completedCount} of {taskList.length} tasks</span>
              <span className="text-sm font-medium">{readiness}%</span>
            </div>
            <Progress value={readiness} className="h-2" />
            <div className="space-y-2 pt-2">
              {taskList.length === 0 && (
                <p className="text-sm text-muted-foreground py-2">
                  {stageId === "internship"
                    ? "Your employer has not added internship tasks yet. Check Messages for updates."
                    : "Your employer has not added pre-arrival tasks yet. Check Messages for updates."}
                </p>
              )}
              {taskList.map((task) => (
                <StageTaskRow
                  key={task.id}
                  taskId={task.id}
                  title={task.title}
                  description={task.description}
                  done={completedIds.has(task.id)}
                  contentUrl={task.content_url}
                  taskType={task.task_type as "task" | "course" | undefined}
                  continueTo={
                    STAGES_WITH_TASK_PAGES.includes(stageId as (typeof STAGES_WITH_TASK_PAGES)[number])
                      ? stageTaskPath(stageId, task.id)
                      : undefined
                  }
                />
              ))}
            </div>
          </CardContent>
        ) : (
          <>
            <CardHeader>
              <CardTitle className="text-lg font-medium">Stage progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">{completedCount} of {taskList.length} tasks</span>
                <span className="text-sm font-medium">{readiness}%</span>
              </div>
              <Progress value={readiness} className="h-2" />
            </CardContent>
          </>
        )}
      </Card>

      {!embedded && (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-medium">Tasks</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {taskList.length === 0 && (
            <p className="text-sm text-muted-foreground py-4">
              {stageId === "internship"
                ? "Your employer has not added internship tasks yet. Check Messages for updates from the company."
                : stageId === "activation"
                  ? "Your employer has not added activation tasks yet. Check Messages for updates from the company."
                  : "No tasks configured for this stage yet."}
            </p>
          )}
          {taskList.map((task) => (
            <StageTaskRow
              key={task.id}
              taskId={task.id}
              title={task.title}
              description={task.description}
              done={completedIds.has(task.id)}
              contentUrl={task.content_url}
              taskType={task.task_type as "task" | "course" | undefined}
              continueTo={
                STAGES_WITH_TASK_PAGES.includes(stageId as (typeof STAGES_WITH_TASK_PAGES)[number])
                  ? stageTaskPath(stageId, task.id)
                  : undefined
              }
            />
          ))}
        </CardContent>
      </Card>
      )}

      {stageTasksDone && nextStageMeta && !embedded && (
        <Card className="border-success/30 bg-success/5">
          <CardContent className="pt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="font-medium">{stageMeta?.name} complete</p>
              <p className="text-sm text-muted-foreground mt-1">
                Continue to {nextStageMeta.name} to keep your journey moving.
              </p>
            </div>
            <Button asChild className="shrink-0">
              <Link to={nextStageMeta.href}>
                Continue to {nextStageMeta.name}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {preparationDone && !pipelineUnlocked && (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="pt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="font-medium">Preparation complete</p>
              <p className="text-sm text-muted-foreground mt-1">
                {waitingOnEmployer
                  ? "Your applications are with employers. Track updates in My Applications."
                  : hasApplications
                    ? "Apply to more roles or check status in My Applications."
                    : "Next step: apply to an open job."}
              </p>
            </div>
            <div className="flex flex-wrap gap-2 shrink-0">
              {!waitingOnEmployer && (
                <Button asChild>
                  <Link to="/candidate/jobs">
                    {hasApplications ? "Browse more jobs" : "Apply to a job"}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              )}
              {hasApplications && (
                <Button variant={waitingOnEmployer ? "default" : "outline"} asChild>
                  <Link to="/candidate/applications">My Applications</Link>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
