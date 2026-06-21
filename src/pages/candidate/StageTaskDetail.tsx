import { Link, useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, CheckCircle, ExternalLink, Loader2 } from "lucide-react";
import { useCompleteTask, useMyTaskProgress, useStageTasks } from "@/hooks/useData";
import { useToast } from "@/hooks/use-toast";
import { PIPELINE_STAGES } from "@/lib/pipeline";
import { stageIdFromPath, stageListPath } from "@/lib/stageRoutes";

export default function StageTaskDetail() {
  const { stagePath, taskId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const stageId = stageIdFromPath(stagePath ?? "");
  const stageMeta = PIPELINE_STAGES.find((s) => s.id === stageId);
  const backPath = stageListPath(stageId);

  const { data: tasks, isLoading } = useStageTasks(stageId);
  const { data: progress } = useMyTaskProgress();
  const completeTask = useCompleteTask();

  const task = tasks?.find((t) => t.id === taskId);
  const done = progress?.some((p) => p.task_id === taskId) ?? false;

  const handleComplete = async () => {
    if (!taskId) return;
    try {
      await completeTask.mutateAsync(taskId);
      toast({ title: "Task completed" });
      navigate(backPath);
    } catch (err) {
      toast({
        title: "Could not complete",
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

  if (!task) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" size="sm" asChild>
          <Link to={backPath}><ArrowLeft className="h-4 w-4 mr-1" />Back</Link>
        </Button>
        <p className="text-muted-foreground">Task not found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <Button variant="ghost" size="sm" asChild>
        <Link to={backPath}>
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to {stageMeta?.name ?? "stage"}
        </Link>
      </Button>

      <div className="flex items-start justify-between gap-4">
        <div>
          <Badge variant="outline" className="mb-2 capitalize">{task.task_type ?? "task"}</Badge>
          <h1 className="text-2xl font-medium text-foreground">{task.title}</h1>
          {task.description && <p className="text-muted-foreground mt-1">{task.description}</p>}
        </div>
        {done && <Badge className="bg-success text-success-foreground shrink-0">Completed</Badge>}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-medium">{task.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          {task.content_body ? (
            <div className="text-muted-foreground whitespace-pre-wrap leading-relaxed">{task.content_body}</div>
          ) : (
            <p className="text-muted-foreground">{task.description ?? "No details added yet."}</p>
          )}
          {task.task_type === "course" && task.content_url && (
            <Button asChild>
              <a href={task.content_url} target="_blank" rel="noopener noreferrer">
                Open course
                <ExternalLink className="ml-2 h-4 w-4" />
              </a>
            </Button>
          )}
        </CardContent>
      </Card>

      {!done && (
        <Button className="w-full sm:w-auto" disabled={completeTask.isPending} onClick={handleComplete}>
          {completeTask.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <CheckCircle className="h-4 w-4 mr-2" />
          )}
          Mark as complete
        </Button>
      )}
    </div>
  );
}
