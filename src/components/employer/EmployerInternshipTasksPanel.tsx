import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Plus, Trash2, Pencil } from "lucide-react";
import {
  useEmployerInternshipTasks,
  useSaveEmployerInternshipTask,
  useDeleteEmployerInternshipTask,
} from "@/hooks/useData";
import { useToast } from "@/hooks/use-toast";
import { STAGE_TASK_PRESETS } from "@/lib/stageTaskPresets";

const emptyForm = {
  title: "",
  description: "",
  content_body: "",
  content_url: "",
};

type Props = {
  embedded?: boolean;
};

export default function EmployerInternshipTasksPanel({ embedded }: Props) {
  const { data: tasks, isLoading } = useEmployerInternshipTasks();
  const saveTask = useSaveEmployerInternshipTask();
  const deleteTask = useDeleteEmployerInternshipTask();
  const { toast } = useToast();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);

  const taskList = tasks ?? [];

  const resetForm = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(false);
  };

  const startEdit = (task: (typeof taskList)[number]) => {
    setEditingId(task.id);
    setForm({
      title: task.title,
      description: task.description ?? "",
      content_body: task.content_body ?? "",
      content_url: task.content_url ?? "",
    });
    setShowForm(true);
  };

  const addPreset = (preset: (typeof STAGE_TASK_PRESETS.internship)[number]) => {
    setEditingId(null);
    setForm({
      title: preset.title,
      description: preset.description,
      content_body: preset.content_body,
      content_url: preset.content_url ?? "",
    });
    setShowForm(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    try {
      await saveTask.mutateAsync({
        id: editingId ?? undefined,
        title: form.title.trim(),
        description: form.description.trim() || null,
        content_body: form.content_body.trim() || null,
        content_url: form.content_url.trim() || null,
        sort_order: editingId
          ? taskList.find((t) => t.id === editingId)?.sort_order ?? taskList.length + 1
          : taskList.length + 1,
        task_type: "task",
      });
      toast({ title: editingId ? "Task updated" : "Task added" });
      resetForm();
    } catch (err) {
      toast({
        title: "Save failed",
        description: err instanceof Error ? err.message : "Try again",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteTask.mutateAsync(id);
      toast({ title: "Task removed" });
      if (editingId === id) resetForm();
    } catch (err) {
      toast({
        title: "Delete failed",
        description: err instanceof Error ? err.message : "Try again",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-10">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Card className={embedded ? "border-dashed" : undefined}>
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <CardTitle className="text-lg">
          {embedded ? "Step 1 — Internship" : "Internship tasks"}
        </CardTitle>
        {!showForm && (
          <Button size="sm" className="gap-2" onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4" />
            Add task
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {taskList.length === 0 && !showForm && (
          <p className="text-sm text-muted-foreground">
            No internship tasks yet. Add agreements, team intros, project kickoff, or check-ins.
          </p>
        )}

        {taskList.map((task) => (
          <div key={task.id} className="flex items-start justify-between gap-3 p-3 border rounded-lg">
            <div className="min-w-0">
              <p className="font-medium text-sm">{task.title}</p>
              {task.description && (
                <p className="text-xs text-muted-foreground mt-0.5">{task.description}</p>
              )}
            </div>
            <div className="flex gap-1 shrink-0">
              <Button size="icon" variant="ghost" onClick={() => startEdit(task)}>
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="text-destructive"
                onClick={() => handleDelete(task.id)}
                disabled={deleteTask.isPending}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}

        {showForm && (
          <form onSubmit={handleSave} className="space-y-4 pt-2 border-t">
            <div className="flex flex-wrap gap-2">
              {STAGE_TASK_PRESETS.internship.map((preset) => (
                <Button
                  key={preset.title}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addPreset(preset)}
                >
                  Use: {preset.title}
                </Button>
              ))}
            </div>
            <div className="space-y-2">
              <Label>Task title</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="Internship agreement"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Short description (optional)</Label>
              <Input
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Sign and return before start date"
              />
            </div>
            <div className="space-y-2">
              <Label>Instructions for candidate</Label>
              <Textarea
                rows={6}
                value={form.content_body}
                onChange={(e) => setForm((f) => ({ ...f, content_body: e.target.value }))}
                placeholder="What the candidate should do during the internship..."
              />
            </div>
            <div className="space-y-2">
              <Label>Link (optional)</Label>
              <Input
                value={form.content_url}
                onChange={(e) => setForm((f) => ({ ...f, content_url: e.target.value }))}
                placeholder="https://..."
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={saveTask.isPending}>
                {editingId ? "Save changes" : "Add task"}
              </Button>
              <Button type="button" variant="outline" onClick={resetForm}>
                Cancel
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
