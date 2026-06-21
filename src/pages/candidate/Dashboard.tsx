import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, ArrowRight, Loader2, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { useTrack, TRACK_META, isStageInTrack } from "@/lib/track";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import {
  useMyStageProgress,
  useMyTaskProgress,
  useStageTasks,
  useNotifications,
  useMyApplications,
} from "@/hooks/useData";
import { hasUnlockedPipeline, hasActiveApplication } from "@/lib/applicationJourney";
import { PIPELINE_STAGES } from "@/lib/pipeline";
import { computeStageReadiness } from "@/lib/profileCompleteness";
import ProfileCompletionBanner from "@/components/candidate/ProfileCompletionBanner";
import StageTaskRow from "@/components/candidate/StageTaskRow";
import { STAGES_WITH_TASK_PAGES, stageTaskPath } from "@/lib/stageRoutes";

const CandidateDashboard = () => {
  const [track] = useTrack();
  const meta = TRACK_META[track];
  const { candidate } = useAuth();
  const { data: stageProgress, isLoading } = useMyStageProgress();
  const { data: notifications } = useNotifications();
  const { data: applications } = useMyApplications();
  const journeyUnlocked = hasUnlockedPipeline(applications ?? []);

  const activeStage = stageProgress?.find((s) => s.status === "active");
  const activeStageId = activeStage?.stage_id ?? "preparation";
  const activeMeta = PIPELINE_STAGES.find((s) => s.id === activeStageId);
  const { data: stageTasks } = useStageTasks(activeStageId);
  const { data: taskProgress } = useMyTaskProgress();

  const completedIds = new Set(taskProgress?.map((p) => p.task_id) ?? []);
  const tasks = stageTasks ?? [];
  const completedTasks = tasks.filter((t) => completedIds.has(t.id)).length;
  const readiness = computeStageReadiness(completedTasks, tasks.length);
  const preparationComplete =
    activeStageId === "preparation" && tasks.length > 0 && readiness === 100;
  const hasApplications = (applications?.length ?? 0) > 0;
  const waitingOnEmployer = hasActiveApplication(applications ?? []);

  const completedStages = stageProgress?.filter((s) => s.status === "completed").length ?? 0;
  const daysInPipeline = candidate?.created_at
    ? Math.floor((Date.now() - new Date(candidate.created_at).getTime()) / 86400000)
    : 0;

  const openIssues = (notifications ?? []).filter((n) => !n.read_at).slice(0, 3);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-success text-success-foreground">Completed</Badge>;
      case "active":
        return <Badge className="bg-primary text-primary-foreground">Active</Badge>;
      default:
        return <Badge variant="secondary">Not Started</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-medium text-foreground">My Journey</h1>
            <Badge variant="outline" className="border-primary/40 text-primary font-medium">{meta.label}</Badge>
          </div>
          <p className="text-muted-foreground">Track your progress through the Nordic Ascent pipeline</p>
          <p className="text-xs text-muted-foreground mt-1">Program: <strong>{meta.label}</strong> — {meta.short}</p>
        </div>
      </div>

      <ProfileCompletionBanner />

      {journeyUnlocked && (
        <Card className="border-success/30 bg-success/5">
          <CardContent className="pt-6 flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-success shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-medium">You've been accepted — your journey continues</p>
              <p className="text-sm text-muted-foreground mt-1">
                Selection stage is now open. Complete tasks there and track updates in My Applications.
              </p>
              <div className="flex flex-wrap gap-2 mt-3">
                <Button size="sm" asChild>
                  <Link to="/candidate/selection">
                    Go to Selection
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
                <Button size="sm" variant="outline" asChild>
                  <Link to="/candidate/applications">My Applications</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="border-border bg-muted/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium">Entry Track vs. Fast Track</CardTitle>
        </CardHeader>
        <CardContent className="pt-0 space-y-4 text-sm text-muted-foreground">
          <div className={cn("space-y-2 p-3 rounded-md border", track === "entry" ? "border-primary/40 bg-primary/5" : "border-transparent")}>
            <div className="font-medium text-foreground flex items-center gap-2">
              Entry Track {track === "entry" && <Badge>Your track</Badge>}
            </div>
            <p>12-month program for participants with 0–12 months of professional experience.</p>
          </div>
          <div className={cn("space-y-2 p-3 rounded-md border", track === "fast" ? "border-primary/40 bg-primary/5" : "border-transparent")}>
            <div className="font-medium text-foreground flex items-center gap-2">
              Fast Track {track === "fast" && <Badge>Your track</Badge>}
            </div>
            <p>Accelerated program for participants with 1+ years of experience.</p>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg font-medium">Current Stage: {activeMeta?.name ?? "—"}</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {(activeStage?.pipeline_stages as { description?: string } | null)?.description ?? activeMeta?.name}
              </p>
            </div>
            {getStatusBadge(
              preparationComplete && !journeyUnlocked ? "completed" : (activeStage?.status ?? "not_started")
            )}
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Stage Readiness</span>
                <span className="text-sm text-muted-foreground">{readiness}%</span>
              </div>
              <Progress value={readiness} className="h-2" />
            </div>

            <div>
              <h4 className="text-sm font-medium mb-3">Tasks</h4>
              <div className="space-y-2">
                {tasks.length === 0 && <p className="text-sm text-muted-foreground">No tasks for this stage.</p>}
                {tasks.map((task) => (
                  <StageTaskRow
                    key={task.id}
                    taskId={task.id}
                    title={task.title}
                    description={task.description}
                    done={completedIds.has(task.id)}
                    contentUrl={task.content_url}
                    taskType={task.task_type as "task" | "course" | undefined}
                    continueTo={
                      STAGES_WITH_TASK_PAGES.includes(activeStageId as (typeof STAGES_WITH_TASK_PAGES)[number])
                        ? stageTaskPath(activeStageId, task.id)
                        : undefined
                    }
                  />
                ))}
              </div>
            </div>

            {!journeyUnlocked && preparationComplete ? (
              <div className="pt-4 border-t space-y-3">
                <p className="text-sm text-muted-foreground">
                  {waitingOnEmployer
                    ? "Preparation is done. Track employer updates in My Applications."
                    : "Preparation is done. Apply to an open role to continue."}
                </p>
                <div className="flex flex-wrap gap-2">
                  {!waitingOnEmployer && (
                    <Button className="btn-professional" asChild>
                      <Link to="/candidate/jobs">
                        {hasApplications ? "Browse more jobs" : "Apply to a job"}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  )}
                  {hasApplications && (
                    <Button variant="outline" asChild>
                      <Link to="/candidate/applications">My Applications</Link>
                    </Button>
                  )}
                </div>
              </div>
            ) : activeMeta?.href ? (
              <div className="pt-4 border-t">
                <Button className="w-full btn-professional" asChild>
                  <Link to={activeMeta.href}>
                    Continue {activeMeta.name}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            ) : null}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle className="text-lg font-medium">Open Issues</CardTitle></CardHeader>
            <CardContent>
              {openIssues.length > 0 ? (
                <div className="space-y-3">
                  {openIssues.map((n) => (
                    <div key={n.id} className="flex items-start gap-3 p-3 rounded bg-warning/10">
                      <AlertTriangle className="h-4 w-4 mt-0.5 text-warning" />
                      <span className="text-sm">{n.title}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No open issues</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-lg font-medium">Journey Stats</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Stages Completed</span>
                <span className="text-sm font-medium">{completedStages} of 7</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Days in Pipeline</span>
                <span className="text-sm font-medium">{daysInPipeline}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Track</span>
                <span className="text-sm font-medium">{meta.label}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-sm font-medium">All Stages</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {PIPELINE_STAGES.map((stage) => {
                const prog = stageProgress?.find((s) => s.stage_id === stage.id);
                const inTrack = isStageInTrack(stage.id, track);
                return (
                  <Link
                    key={stage.id}
                    to={inTrack ? stage.href : "#"}
                    className={cn(
                      "flex items-center justify-between p-2 rounded text-sm",
                      inTrack ? "hover:bg-muted" : "opacity-40 pointer-events-none"
                    )}
                  >
                    <span>{stage.name}</span>
                    {getStatusBadge(prog?.status ?? "not_started")}
                  </Link>
                );
              })}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CandidateDashboard;
