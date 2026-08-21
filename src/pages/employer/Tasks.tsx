import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertTriangle,
  ClipboardList,
  Heart,
  MessageSquare,
  Plus,
  Timer,
} from "lucide-react";
import {
  useEmployerTasks,
  useEmployerApplications,
  useToggleEmployerTask,
  useCreateEmployerTask,
  usePlatformStageTasks,
} from "@/hooks/useData";
import { useToast } from "@/hooks/use-toast";
import { PageSpinner } from "@/components/ui/PageSpinner";
import { programStageLabel } from "@/lib/pipeline";
import { isMentorAssignmentOverdue } from "@/lib/mentorProgram";
import { cn } from "@/lib/utils";

type TaskCategory = "action" | "bottlenecks" | "mentoring" | "interviews" | "other";

type UnifiedTask = {
  id: string;
  category: TaskCategory;
  title: string;
  personName: string;
  stageLabel: string;
  dueLabel?: string | null;
  urgent: boolean;
  href?: string;
  avatarUrl?: string | null;
  kind: "application" | "company" | "platform";
  companyTaskId?: string;
  companyCompleted?: boolean;
  companyPriority?: string;
  platformDescription?: string | null;
};

const CATEGORIES: {
  id: TaskCategory;
  label: string;
  icon: typeof AlertTriangle;
  iconClass: string;
}[] = [
  {
    id: "action",
    label: "Action Required",
    icon: AlertTriangle,
    iconClass: "text-amber-500",
  },
  {
    id: "bottlenecks",
    label: "Bottlenecks",
    icon: Timer,
    iconClass: "text-red-500",
  },
  {
    id: "mentoring",
    label: "Mentoring",
    icon: Heart,
    iconClass: "text-sky-500",
  },
  {
    id: "interviews",
    label: "Interviews",
    icon: ClipboardList,
    iconClass: "text-teal-600",
  },
  {
    id: "other",
    label: "Other",
    icon: MessageSquare,
    iconClass: "text-violet-500",
  },
];

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

function formatDue(iso: string | null | undefined) {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return `Due ${d.toLocaleDateString(undefined, { day: "numeric", month: "numeric", year: "numeric" })}`;
}

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
  const [tab, setTab] = useState<TaskCategory>("action");

  const unified = useMemo(() => {
    const items: UnifiedTask[] = [];
    const usedAppIds = new Set<string>();

    for (const app of applications ?? []) {
      const cand = app.candidates as {
        id: string;
        title?: string | null;
        profiles?: {
          full_name?: string | null;
          avatar_url?: string | null;
        } | null;
      } | null;
      const name = cand?.profiles?.full_name ?? "Candidate";
      const avatarUrl = cand?.profiles?.avatar_url ?? null;
      const stageLabel = programStageLabel(app.stage_id ?? "selection");
      const href = cand?.id ? `/employer/candidates/${cand.id}` : undefined;
      const hasInterview = Boolean(app.interview_scheduled_at || app.interview_meet_url);
      const mentorOverdue =
        (app.status === "selected_for_readiness" || Boolean(app.readiness_unlocked_at)) &&
        !app.assigned_mentor_id &&
        isMentorAssignmentOverdue(app.board_decided_at);

      if (hasInterview && app.needs_action) {
        items.push({
          id: `interview-${app.id}`,
          category: "interviews",
          title: "Interview scheduled — follow up",
          personName: name,
          stageLabel,
          dueLabel: formatDue(app.interview_scheduled_at),
          urgent: true,
          href,
          avatarUrl,
          kind: "application",
        });
        usedAppIds.add(app.id);
      } else if (hasInterview) {
        items.push({
          id: `interview-${app.id}`,
          category: "interviews",
          title: "Upcoming interview",
          personName: name,
          stageLabel,
          dueLabel: formatDue(app.interview_scheduled_at),
          urgent: false,
          href,
          avatarUrl,
          kind: "application",
        });
        usedAppIds.add(app.id);
      }

      if (mentorOverdue) {
        items.push({
          id: `bottleneck-mentor-${app.id}`,
          category: "bottlenecks",
          title: "Assign mentor (overdue)",
          personName: name,
          stageLabel,
          dueLabel: formatDue(app.board_decided_at),
          urgent: true,
          href: `/employer/selection/${app.id}`,
          avatarUrl,
          kind: "application",
        });
        usedAppIds.add(app.id);
      } else if (app.assigned_mentor_id && app.readiness_unlocked_at) {
        items.push({
          id: `mentor-${app.id}`,
          category: "mentoring",
          title: "Mentor programme in progress",
          personName: name,
          stageLabel: "Mentoring",
          dueLabel: null,
          urgent: false,
          href: `/employer/mentoring/${app.id}`,
          avatarUrl,
          kind: "application",
        });
      } else if (
        app.status === "selected_for_readiness" &&
        !app.assigned_mentor_id
      ) {
        items.push({
          id: `mentor-assign-${app.id}`,
          category: "mentoring",
          title: "Assign a mentor",
          personName: name,
          stageLabel,
          dueLabel: formatDue(app.board_decided_at),
          urgent: false,
          href: `/employer/selection/${app.id}`,
          avatarUrl,
          kind: "application",
        });
      }

      if (app.needs_action && !usedAppIds.has(app.id) && !hasInterview) {
        items.push({
          id: `action-${app.id}`,
          category: "action",
          title: "Review application",
          personName: name,
          stageLabel,
          dueLabel: formatDue(app.updated_at ?? app.applied_at),
          urgent: Boolean(app.needs_action),
          href,
          avatarUrl,
          kind: "application",
        });
      }
    }

    for (const task of platformTasks ?? []) {
      items.push({
        id: `platform-${task.id}`,
        category: "other",
        title: task.title,
        personName: "Nordic Ascent",
        stageLabel: programStageLabel(task.stage_id),
        dueLabel: null,
        urgent: false,
        href: undefined,
        avatarUrl: null,
        kind: "platform",
        platformDescription: task.description,
      });
    }

    for (const task of tasks ?? []) {
      if (task.completed) continue;
      items.push({
        id: `company-${task.id}`,
        category: "other",
        title: task.title,
        personName: "Your checklist",
        stageLabel: "Company",
        dueLabel: formatDue(task.due_at),
        urgent: task.priority === "high" || task.priority === "urgent",
        href: undefined,
        avatarUrl: null,
        kind: "company",
        companyTaskId: task.id,
        companyCompleted: task.completed,
        companyPriority: task.priority,
        platformDescription: task.description,
      });
    }

    return items;
  }, [applications, platformTasks, tasks]);

  const counts = useMemo(() => {
    const base: Record<TaskCategory, number> = {
      action: 0,
      bottlenecks: 0,
      mentoring: 0,
      interviews: 0,
      other: 0,
    };
    for (const t of unified) base[t.category] += 1;
    return base;
  }, [unified]);

  const urgentCount = unified.filter((t) => t.urgent).length;
  const totalCount = unified.length;

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createTask.mutateAsync({
        title: title.trim(),
        description: description.trim() || undefined,
      });
      toast({ title: "Task created" });
      setTitle("");
      setDescription("");
      setShowCompanyForm(false);
      setTab("other");
    } catch (err) {
      toast({
        title: "Failed",
        description: err instanceof Error ? err.message : "Try again",
        variant: "destructive",
      });
    }
  };

  if (platformLoading || tasksLoading || appsLoading) {
    return <PageSpinner />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-medium">Tasks</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Actions requiring your attention
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge className="rounded-full bg-sky-600 hover:bg-sky-600 text-white font-normal px-3">
            {totalCount} total
          </Badge>
          <Badge className="rounded-full bg-red-500 hover:bg-red-500 text-white font-normal px-3">
            {urgentCount} urgent
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const active = tab === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setTab(cat.id)}
              className={cn(
                "rounded-xl border bg-card p-4 text-center transition-colors hover:border-primary/30",
                active && "border-primary/40 ring-1 ring-primary/20"
              )}
            >
              <Icon className={cn("h-5 w-5 mx-auto mb-2", cat.iconClass)} />
              <p className="text-2xl font-semibold tabular-nums text-foreground">
                {counts[cat.id]}
              </p>
              <p className="text-xs text-muted-foreground mt-1">{cat.label}</p>
            </button>
          );
        })}
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as TaskCategory)}>
        <TabsList className="w-full h-auto flex flex-wrap justify-start gap-1 bg-muted/60 p-1">
          {CATEGORIES.map((cat) => (
            <TabsTrigger
              key={cat.id}
              value={cat.id}
              className="text-xs sm:text-sm data-[state=active]:bg-background"
            >
              {cat.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {CATEGORIES.map((cat) => {
          const categoryTasks = unified.filter((t) => t.category === cat.id);
          return (
          <TabsContent key={cat.id} value={cat.id} className="mt-4 space-y-3">
            {cat.id === "other" && (
              <div className="flex justify-end">
                {!showCompanyForm ? (
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-2"
                    onClick={() => setShowCompanyForm(true)}
                  >
                    <Plus className="h-4 w-4" />
                    Add company task
                  </Button>
                ) : null}
              </div>
            )}

            {cat.id === "other" && showCompanyForm && (
              <Card>
                <CardContent className="pt-4">
                  <form onSubmit={handleCreate} className="space-y-3 max-w-lg">
                    <div className="space-y-2">
                      <Label>Title</Label>
                      <Input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Internal reminder"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Description (optional)</Label>
                      <Textarea
                        rows={2}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button type="submit" size="sm" disabled={createTask.isPending}>
                        Save
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => setShowCompanyForm(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            {categoryTasks.length === 0 ? (
              <Card>
                <CardContent className="py-10 text-center text-sm text-muted-foreground">
                  No {cat.label.toLowerCase()} tasks right now.
                </CardContent>
              </Card>
            ) : (
              categoryTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex flex-wrap items-center gap-3 rounded-xl border bg-card px-4 py-3"
                >
                  {task.kind === "company" ? (
                    <Checkbox
                      checked={Boolean(task.companyCompleted)}
                      onCheckedChange={(checked) =>
                        task.companyTaskId &&
                        toggleTask.mutate({
                          id: task.companyTaskId,
                          completed: Boolean(checked),
                        })
                      }
                      className="shrink-0"
                    />
                  ) : (
                    <Avatar className="h-10 w-10 shrink-0">
                      {task.avatarUrl ? <AvatarImage src={task.avatarUrl} alt="" /> : null}
                      <AvatarFallback className="bg-muted text-xs">
                        {initials(task.personName)}
                      </AvatarFallback>
                    </Avatar>
                  )}

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{task.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {task.personName}
                      {task.stageLabel ? ` · ${task.stageLabel}` : ""}
                      {task.dueLabel ? ` · ${task.dueLabel}` : ""}
                    </p>
                    {task.platformDescription && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {task.platformDescription}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0 ml-auto">
                    {task.urgent && (
                      <Badge className="rounded-full bg-red-500 hover:bg-red-500 text-white font-normal">
                        Urgent
                      </Badge>
                    )}
                    {task.href ? (
                      <Button size="sm" variant="outline" asChild>
                        <Link to={task.href}>Review</Link>
                      </Button>
                    ) : task.kind === "platform" ? (
                      <Badge variant="outline" className="font-normal">
                        Program
                      </Badge>
                    ) : null}
                  </div>
                </div>
              ))
            )}
          </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
};

export default EmployerTasks;
