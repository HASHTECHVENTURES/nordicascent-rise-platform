import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Eye, Loader2, Plus, Trash2 } from "lucide-react";
import {
  usePipelineStages,
  useStageTasks,
  useSaveStageTask,
  useDeleteStageTask,
} from "@/hooks/useData";
import { useToast } from "@/hooks/use-toast";
import { STAGE_TASK_PRESETS, findStagePreset, type StageTaskPreset } from "@/lib/stageTaskPresets";

const emptyForm = {
  title: "",
  description: "",
  sort_order: 1,
  task_type: "task" as "task" | "course",
  content_url: "",
  image_url: "",
  content_body: "",
};

type Props = {
  fixedStageId?: string;
  title?: string;
  description?: string;
};

export default function AdminStageTasks({
  fixedStageId,
  title = "Program Tasks",
  description = "Content candidates see when they click Continue",
}: Props) {
  const { toast } = useToast();
  const { data: stages, isLoading: stagesLoading } = usePipelineStages();
  const [stageId, setStageId] = useState(fixedStageId ?? "readiness");
  const { data: tasks, isLoading: tasksLoading } = useStageTasks(stageId);
  const saveTask = useSaveStageTask();
  const deleteTask = useDeleteStageTask();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [previewId, setPreviewId] = useState<string | null>(null);

  const startNew = () => {
    setEditingId(null);
    setPreviewId(null);
    const nextOrder = (tasks?.length ?? 0) + 1;
    setForm({ ...emptyForm, sort_order: nextOrder });
  };

  const startEdit = (task: NonNullable<typeof tasks>[number]) => {
    setEditingId(task.id);
    setPreviewId(task.id);
    setForm({
      title: task.title,
      description: task.description ?? "",
      sort_order: task.sort_order,
      task_type: (task.task_type as "task" | "course") ?? "task",
      content_url: task.content_url ?? "",
      image_url: (task as { image_url?: string | null }).image_url ?? "",
      content_body: task.content_body ?? "",
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await saveTask.mutateAsync({
        id: editingId ?? undefined,
        stage_id: stageId,
        title: form.title.trim(),
        description: form.description.trim() || null,
        sort_order: form.sort_order,
        task_type: form.task_type,
        content_url: form.content_url.trim() || null,
        image_url: form.image_url.trim() || null,
        content_body: form.content_body.trim() || null,
      });
      toast({ title: editingId ? "Task updated" : "Task created" });
      startNew();
    } catch (err) {
      toast({
        title: "Save failed",
        description: err instanceof Error ? err.message : "Try again",
        variant: "destructive",
      });
    }
  };

  const addPreset = async (preset: StageTaskPreset) => {
    const existing = tasks?.find((t) => t.title.toLowerCase() === preset.title.toLowerCase());
    if (existing) {
      startEdit(existing);
      if (!existing.content_body) {
        setForm((f) => ({ ...f, content_body: preset.content_body }));
      }
      toast({ title: "Opened for edit", description: preset.title });
      return;
    }
    try {
      await saveTask.mutateAsync({
        stage_id: stageId,
        title: preset.title,
        description: preset.description,
        sort_order: (tasks?.length ?? 0) + 1,
        task_type: preset.task_type,
        content_url: preset.content_url ?? null,
        image_url: preset.image_url ?? null,
        content_body: preset.content_body,
      });
      toast({ title: "Task added", description: preset.title });
    } catch (err) {
      toast({
        title: "Failed",
        description: err instanceof Error ? err.message : "Try again",
        variant: "destructive",
      });
    }
  };

  const loadTemplateContent = () => {
    const preset = findStagePreset(stageId, form.title);
    if (!preset) {
      toast({ title: "No template for this task title" });
      return;
    }
    setForm((f) => ({
      ...f,
      description: preset.description,
      task_type: preset.task_type,
      image_url: preset.image_url ?? f.image_url,
      content_body: preset.content_body,
    }));
    toast({ title: "Template loaded", description: "Review and save" });
  };

  const previewTask = previewId ? tasks?.find((t) => t.id === previewId) : null;
  const previewBody = editingId ? form.content_body : previewTask?.content_body;

  if (stagesLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const stageName = stages?.find((s) => s.id === stageId)?.name ?? stageId;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
          <p className="text-muted-foreground">{description}</p>
        </div>
        <Button onClick={startNew} className="gap-2">
          <Plus className="h-4 w-4" />
          New task
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {!fixedStageId && (
          <>
            <Label className="text-sm text-muted-foreground">Stage</Label>
            <Select value={stageId} onValueChange={(v) => { setStageId(v); startNew(); }}>
              <SelectTrigger className="w-56">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(stages ?? []).map((s) => (
                  <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </>
        )}
        {(STAGE_TASK_PRESETS[stageId] ?? []).length > 0 && (
          <div className="flex flex-wrap gap-2">
            {(STAGE_TASK_PRESETS[stageId] ?? []).map((p) => (
              <Button key={p.title} size="sm" variant="outline" onClick={() => addPreset(p)}>
                Add {p.title}
              </Button>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <Card className="xl:col-span-1">
          <CardHeader>
            <CardTitle className="text-base">{stageName} tasks</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {tasksLoading && <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />}
            {!tasksLoading && (tasks ?? []).length === 0 && (
              <p className="text-sm text-muted-foreground py-4">No tasks yet. Add a readiness preset or create one.</p>
            )}
            {(tasks ?? []).map((task) => (
              <div
                key={task.id}
                className={`flex items-center justify-between p-3 border rounded-lg ${
                  previewId === task.id ? "border-primary bg-primary/5" : ""
                }`}
              >
                <button
                  type="button"
                  className="text-left flex-1 min-w-0"
                  onClick={() => startEdit(task)}
                >
                  <p className="font-medium text-sm">{task.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 truncate">{task.description}</p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    <Badge variant="outline" className="text-xs capitalize">{task.task_type ?? "task"}</Badge>
                    <Badge variant="secondary" className="text-xs">#{task.sort_order}</Badge>
                    {task.content_body && (
                      <Badge variant="outline" className="text-xs text-success border-success/30">Has content</Badge>
                    )}
                    {(task as { image_url?: string | null }).image_url && (
                      <Badge variant="outline" className="text-xs">Has image</Badge>
                    )}
                  </div>
                </button>
                <Button
                  variant="ghost"
                  size="icon"
                  disabled={deleteTask.isPending}
                  onClick={async () => {
                    try {
                      await deleteTask.mutateAsync({ id: task.id, stageId });
                      toast({ title: "Deleted" });
                      if (editingId === task.id) startNew();
                    } catch (err) {
                      toast({
                        title: "Delete failed",
                        description: err instanceof Error ? err.message : "Try again",
                        variant: "destructive",
                      });
                    }
                  }}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="xl:col-span-1">
          <CardHeader>
            <CardTitle className="text-base">{editingId ? "Edit task" : "Create task"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-3">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Technical validation"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Short description (list view)</Label>
                <Textarea
                  rows={2}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Pass technical interview"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select
                    value={form.task_type}
                    onValueChange={(v) => setForm({ ...form, task_type: v as "task" | "course" })}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="task">Task</SelectItem>
                      <SelectItem value="course">Course</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Order</Label>
                  <Input
                    type="number"
                    min={1}
                    value={form.sort_order}
                    onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) || 1 })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Cover image URL {stageId === "relocation" && "(shown on guide card)"}</Label>
                <Input
                  value={form.image_url}
                  onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                />
                {form.image_url && (
                  <img
                    src={form.image_url}
                    alt=""
                    className="h-32 w-full max-w-sm rounded-lg object-cover border"
                  />
                )}
              </div>
              {form.task_type === "course" && (
                <div className="space-y-2">
                  <Label>Course link (optional)</Label>
                  <Input
                    value={form.content_url}
                    onChange={(e) => setForm({ ...form, content_url: e.target.value })}
                    placeholder="https://..."
                  />
                </div>
              )}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Page content (candidate sees on Continue)</Label>
                  {STAGE_TASK_PRESETS[stageId] && (
                    <Button type="button" variant="ghost" size="sm" onClick={loadTemplateContent}>
                      Load template
                    </Button>
                  )}
                </div>
                <Textarea
                  rows={12}
                  value={form.content_body}
                  onChange={(e) => setForm({ ...form, content_body: e.target.value })}
                  placeholder="Interview steps, module outline, instructions..."
                  className="font-mono text-xs"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <Button type="submit" disabled={saveTask.isPending}>
                  {editingId ? "Save changes" : "Create task"}
                </Button>
                {editingId && (
                  <Button type="button" variant="outline" onClick={startNew}>Cancel</Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        <Card className="xl:col-span-1">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Candidate preview
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!previewBody && !form.title ? (
              <p className="text-sm text-muted-foreground">Select or edit a task to preview what candidates see.</p>
            ) : (
              <div className="space-y-3">
                {(form.image_url || (previewTask as { image_url?: string })?.image_url) && (
                  <img
                    src={form.image_url || (previewTask as { image_url?: string })?.image_url}
                    alt=""
                    className="w-full h-36 object-cover rounded-lg border"
                  />
                )}
                <div>
                  <Badge variant="outline" className="mb-2 capitalize">{form.task_type}</Badge>
                  <p className="font-medium">{form.title || previewTask?.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {form.description || previewTask?.description}
                  </p>
                </div>
                <div className="p-4 border rounded-lg bg-muted/30 text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed max-h-96 overflow-y-auto">
                  {previewBody || "No page content yet."}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
