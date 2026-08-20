import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowRight, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import {
  useEmployerTasks,
  useEmployerApplications,
  useToggleEmployerTask,
  useCreateEmployerTask,
  usePlatformStageTasks,
} from "@/hooks/useData";
import { useToast } from "@/hooks/use-toast";
import { PageSpinner } from "@/components/ui/PageSpinner";
import { PIPELINE_STAGES, programStageLabel } from "@/lib/pipeline";

const EmployerTasks = () => {
  const { data: platformTasks, isLoading: platformLoading } = usePlatformStageTasks();
  const { data: tasks, isLoading: tasksLoading } = useEmployerTasks();
  const { data: applications, isLoading: appsLoading } = useEmployerApplications();
  const toggleTask = useToggleEmployerTask();
  const createTask = useCreateEmployerTask();
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [showCompanyForm, setShowCompanyForm] = useState(false);

  const needsAction = (applications ?? []).filter((a) => a.needs_action);

  const tasksByStage = useMemo(() => {
    const map = new Map<string, NonNullable<typeof platformTasks>>();
    for (const task of platformTasks ?? []) {
      const list = map.get(task.stage_id) ?? [];
      list.push(task);
      map.set(task.stage_id, list);
    }
    const preferred = [
      ...PIPELINE_STAGES.map((s) => s.id),
      "internship",
      "mentoring",
    ];
    const ordered = preferred.filter((id) => map.has(id));
    for (const id of map.keys()) {
      if (!ordered.includes(id)) ordered.push(id);
    }
    return ordered.map((stageId) => ({
      stageId,
      label: programStageLabel(stageId),
      tasks: map.get(stageId) ?? [],
    }));
  }, [platformTasks]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createTask.mutateAsync({ title: title.trim(), description: description.trim() || undefined });
      toast({ title: "Task created" });
      setTitle("");
      setDescription("");
      setShowCompanyForm(false);
    } catch (err) {
      toast({ title: "Failed", description: err instanceof Error ? err.message : "Try again", variant: "destructive" });
    }
  };

  if (platformLoading || tasksLoading || appsLoading) {
    return <PageSpinner />;
  }

  const taskList = tasks ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-medium">Tasks</h1>
        <p className="text-muted-foreground">
          Program tasks from Nordic Ascent. They apply to every company — you do not need to create them.
        </p>
      </div>

      {needsAction.length > 0 && (
        <Card className="border-warning/30">
          <CardHeader><CardTitle className="text-lg">Candidates needing action</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {needsAction.map((app) => {
              const c = app.candidates as {
                id: string;
                profiles: { full_name: string | null } | null;
                title: string | null;
              };
              return (
                <div key={app.id} className="flex items-center justify-between p-3 border rounded gap-3">
                  <span className="text-sm">{c.profiles?.full_name ?? "Candidate"} — {c.title}</span>
                  <Button size="sm" className="gap-1 shrink-0" asChild>
                    <Link to={`/employer/candidates/${c.id}`}>
                      Review
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  </Button>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {tasksByStage.length === 0 ? (
        <Card>
          <CardContent className="py-8">
            <p className="text-sm text-muted-foreground">
              Nordic Ascent has not published program tasks yet. They will appear here for every company once added.
            </p>
          </CardContent>
        </Card>
      ) : (
        tasksByStage.map((group) => (
          <Card key={group.stageId}>
            <CardHeader className="flex flex-row items-center justify-between gap-3">
              <CardTitle className="text-lg">{group.label}</CardTitle>
              <Badge variant="secondary">{group.tasks.length}</Badge>
            </CardHeader>
            <CardContent className="space-y-2">
              {group.tasks.map((task) => (
                <div key={task.id} className="flex items-start gap-3 p-3 border rounded">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{task.title}</p>
                    {task.description && (
                      <p className="text-xs text-muted-foreground mt-0.5">{task.description}</p>
                    )}
                  </div>
                  <Badge variant="outline" className="shrink-0">
                    {task.task_type === "course" ? "Course" : "Task"}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        ))
      )}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-3">
          <div>
            <CardTitle className="text-lg">Your company checklist</CardTitle>
            <p className="text-sm text-muted-foreground font-normal mt-1">
              Optional extras for your team. Program tasks above are already set.
            </p>
          </div>
          {!showCompanyForm && (
            <Button size="sm" variant="outline" className="gap-2 shrink-0" onClick={() => setShowCompanyForm(true)}>
              <Plus className="h-4 w-4" />
              Add
            </Button>
          )}
        </CardHeader>
        <CardContent className="space-y-3">
          {showCompanyForm && (
            <form onSubmit={handleCreate} className="space-y-3 max-w-lg pb-3 border-b">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Internal reminder" required />
              </div>
              <div className="space-y-2">
                <Label>Description (optional)</Label>
                <Textarea rows={2} value={description} onChange={(e) => setDescription(e.target.value)} />
              </div>
              <div className="flex gap-2">
                <Button type="submit" size="sm" disabled={createTask.isPending}>
                  Save
                </Button>
                <Button type="button" size="sm" variant="outline" onClick={() => setShowCompanyForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          )}
          {taskList.length === 0 && !showCompanyForm && (
            <p className="text-sm text-muted-foreground">No company extras yet.</p>
          )}
          {taskList.map((task) => (
            <div key={task.id} className="flex items-center gap-3 p-3 border rounded">
              <Checkbox
                checked={task.completed}
                onCheckedChange={(checked) => toggleTask.mutate({ id: task.id, completed: !!checked })}
              />
              <div className="flex-1">
                <p className={`text-sm font-medium ${task.completed ? "line-through text-muted-foreground" : ""}`}>{task.title}</p>
                {task.description && <p className="text-xs text-muted-foreground">{task.description}</p>}
              </div>
              <Badge variant="outline">{task.priority}</Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default EmployerTasks;
