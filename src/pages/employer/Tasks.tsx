import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, ArrowRight, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import {
  useEmployerTasks,
  useEmployerApplications,
  useToggleEmployerTask,
  useCreateEmployerTask,
} from "@/hooks/useData";
import { useToast } from "@/hooks/use-toast";

const EmployerTasks = () => {
  const { data: tasks, isLoading: tasksLoading } = useEmployerTasks();
  const { data: applications, isLoading: appsLoading } = useEmployerApplications();
  const toggleTask = useToggleEmployerTask();
  const createTask = useCreateEmployerTask();
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const needsAction = (applications ?? []).filter((a) => a.needs_action);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createTask.mutateAsync({ title: title.trim(), description: description.trim() || undefined });
      toast({ title: "Task created" });
      setTitle("");
      setDescription("");
    } catch (err) {
      toast({ title: "Failed", description: err instanceof Error ? err.message : "Try again", variant: "destructive" });
    }
  };

  if (tasksLoading || appsLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const taskList = tasks ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-medium">Tasks</h1>
        <p className="text-muted-foreground">Action items for your hiring pipeline</p>
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

      <Card>
        <CardHeader><CardTitle className="text-lg">Add task</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleCreate} className="space-y-3 max-w-lg">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Schedule interviews for iOS role" required />
            </div>
            <div className="space-y-2">
              <Label>Description (optional)</Label>
              <Textarea rows={2} value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
            <Button type="submit" size="sm" className="gap-2" disabled={createTask.isPending}>
              <Plus className="h-4 w-4" />Add task
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-lg">Your tasks</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {taskList.length === 0 && (
            <p className="text-sm text-muted-foreground py-4">No tasks yet. Add one above.</p>
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
