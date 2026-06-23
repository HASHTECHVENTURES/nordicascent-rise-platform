import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowRight, Building2, CheckCircle, Loader2 } from "lucide-react";
import {
  useStageTasks,
  useMyTaskProgress,
  useMyStageProgress,
  useAdvanceStageIfReady,
} from "@/hooks/useData";
import { useAuth } from "@/contexts/AuthContext";
import { computeStageReadiness } from "@/lib/profileCompleteness";
import { PIPELINE_STAGES } from "@/lib/pipeline";
import { getNextStageInTrack, useTrack } from "@/lib/track";
import { stageTaskPath } from "@/lib/stageRoutes";

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1600&auto=format&fit=crop";
const HERO_FALLBACK_CLASS =
  "bg-gradient-to-br from-emerald-800 via-emerald-700 to-primary/70";

function SafeImage({
  src,
  alt,
  className,
  fallbackClassName = HERO_FALLBACK_CLASS,
}: {
  src?: string | null;
  alt: string;
  className: string;
  fallbackClassName?: string;
}) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) {
    return <div className={`${className} ${fallbackClassName}`} role="img" aria-label={alt} />;
  }
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setFailed(true)}
      loading="lazy"
    />
  );
}

export default function OnboardingStageContent() {
  const [track] = useTrack();
  const { loading: authLoading } = useAuth();
  const stageId = "onboarding";
  const { data: tasks, isLoading, isError, refetch } = useStageTasks(stageId);
  const { data: progress } = useMyTaskProgress();
  const { data: stageProgress } = useMyStageProgress();
  const advanceStage = useAdvanceStageIfReady();
  const syncedRef = useRef(false);

  const taskList = tasks ?? [];
  const completedIds = new Set(progress?.map((p) => p.task_id) ?? []);
  const completedCount = taskList.filter((t) => completedIds.has(t.id)).length;
  const readiness = computeStageReadiness(completedCount, taskList.length);
  const stageTasksDone = taskList.length > 0 && readiness === 100;
  const stageStatus = stageProgress?.find((s) => s.stage_id === stageId)?.status ?? "not_started";
  const nextStageId = getNextStageInTrack(stageId, track);
  const nextStageMeta = nextStageId ? PIPELINE_STAGES.find((s) => s.id === nextStageId) : null;

  useEffect(() => {
    syncedRef.current = false;
  }, [stageId]);

  useEffect(() => {
    if (!stageTasksDone || stageStatus === "completed" || syncedRef.current) return;
    syncedRef.current = true;
    advanceStage.mutate(stageId);
  }, [stageId, stageTasksDone, stageStatus, advanceStage]);

  if (authLoading || isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isError) {
    return (
      <Card>
        <CardContent className="py-10 text-center space-y-3">
          <p className="text-sm text-muted-foreground">
            Could not load onboarding tasks. Please refresh or try again.
          </p>
          <Button size="sm" variant="outline" onClick={() => refetch()}>
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-2xl border bg-card">
        <SafeImage
          src={taskList[0]?.image_url ?? HERO_IMAGE}
          alt="Onboarding at your Nordic workplace"
          className="h-48 sm:h-56 w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <div className="flex items-center gap-2 mb-2">
            <Building2 className="h-5 w-5" />
            <Badge className="bg-white/20 text-white border-white/30 hover:bg-white/20">Onboarding</Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-medium">Welcome to your new workplace</h1>
          <p className="text-white/85 text-sm mt-1 max-w-xl">
            Physical arrival and workplace integration — your first weeks in the Nordics.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {completedCount} of {taskList.length} tasks completed
        </p>
        {stageTasksDone || stageStatus === "completed" ? (
          <Badge className="bg-success text-success-foreground">Completed</Badge>
        ) : stageStatus === "active" ? (
          <Badge className="bg-primary text-primary-foreground">In progress</Badge>
        ) : (
          <Badge variant="secondary">Not started</Badge>
        )}
      </div>

      <Progress value={readiness} className="h-2" />

      {taskList.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            Onboarding tasks are being prepared. Check back soon or contact Nordic Ascent in Messages.
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {taskList.map((task) => {
            const done = completedIds.has(task.id);
            return (
              <Card
                key={task.id}
                className={`overflow-hidden transition-shadow hover:shadow-md ${
                  done ? "border-success/30 bg-success/5" : ""
                }`}
              >
                <div className="relative h-40 w-full overflow-hidden">
                  <SafeImage
                    src={task.image_url}
                    alt={task.title}
                    className="h-full w-full object-cover"
                    fallbackClassName="bg-gradient-to-br from-muted to-muted-foreground/20"
                  />
                  {done && (
                    <div className="absolute top-3 right-3 rounded-full bg-success text-success-foreground p-1.5">
                      <CheckCircle className="h-4 w-4" />
                    </div>
                  )}
                </div>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-medium leading-snug">{task.title}</CardTitle>
                  {task.description && (
                    <p className="text-sm text-muted-foreground font-normal">{task.description}</p>
                  )}
                </CardHeader>
                <CardContent className="pt-0">
                  <Button size="sm" variant={done ? "outline" : "default"} asChild className="gap-1">
                    <Link to={stageTaskPath(stageId, task.id)}>
                      {done ? "Review task" : "Open task"}
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {stageTasksDone && nextStageMeta && (
        <Card className="border-success/30 bg-success/5">
          <CardContent className="pt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="font-medium">Onboarding complete</p>
              <p className="text-sm text-muted-foreground mt-1">
                Continue to {nextStageMeta.name} for your next steps.
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
    </div>
  );
}
