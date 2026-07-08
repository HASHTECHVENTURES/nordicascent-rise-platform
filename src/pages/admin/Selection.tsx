import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, AlertTriangle, ChevronRight, Users } from "lucide-react";
import {
  useAdminSelectionJobs,
  useAdminJobSelectionApplications,
  useBulkSelectionDecision,
} from "@/hooks/useSelection";
import { useToast } from "@/hooks/use-toast";
import {
  SELECTION_STATUSES,
  SELECTION_STEPS,
  countSelectedForJob,
  getSelectionStepFromStatus,
  isStepOverdue,
  isTerminalSelectionStatus,
  maxSelectionsForJob,
  selectionStatusLabel,
  type SelectionStepId,
  type StepDecision,
} from "@/lib/selectionModule";
import { isMentorAssignmentOverdue } from "@/lib/mentorProgram";
import type { SelectionApplication } from "@/lib/selectionModule";

function isBulkEligibleStep1(app: SelectionApplication) {
  const step = getSelectionStepFromStatus(app.status, app.selection_step);
  if (step !== 1) return false;
  if (isTerminalSelectionStatus(app.status)) return false;
  return (
    app.status === SELECTION_STATUSES.APPLICATION_COMPLETE ||
    app.status === SELECTION_STATUSES.ELIGIBILITY_REVIEW ||
    app.status.startsWith("eligibility_")
  );
}

const AdminSelection = () => {
  const { data: jobs, isLoading: jobsLoading } = useAdminSelectionJobs();
  const [jobId, setJobId] = useState<string>("");
  const [stepFilter, setStepFilter] = useState<SelectionStepId | "all">("all");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const bulkDecide = useBulkSelectionDecision();
  const { toast } = useToast();

  const selectedJobId = jobId || jobs?.[0]?.id;
  const { data: applications, isLoading: appsLoading } = useAdminJobSelectionApplications(
    selectedJobId,
    stepFilter
  );

  const bulkEligible = useMemo(
    () => (applications ?? []).filter(isBulkEligibleStep1),
    [applications]
  );

  const funnelCounts = useMemo(() => {
    const all = applications ?? [];
    const counts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    all.forEach((a) => {
      const step = getSelectionStepFromStatus(a.status, a.selection_step);
      counts[step] = (counts[step] ?? 0) + 1;
    });
    return counts;
  }, [applications]);

  const selectedJob = jobs?.find((j) => j.id === selectedJobId);
  const positions = selectedJob?.positions_count ?? 2;
  const maxSelected = maxSelectionsForJob(positions);
  const selectedCount = countSelectedForJob(applications ?? []);

  const toggleOne = (id: string, checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  const toggleAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(bulkEligible.map((a) => a.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const runBulk = async (decision: StepDecision) => {
    const ids = [...selectedIds].filter((id) => bulkEligible.some((a) => a.id === id));
    if (ids.length === 0) {
      toast({ title: "No candidates selected", variant: "destructive" });
      return;
    }
    try {
      await bulkDecide.mutateAsync(
        ids.map((applicationId) => ({
          applicationId,
          step: 1 as const,
          decision,
          fields: {},
        }))
      );
      setSelectedIds(new Set());
      toast({
        title: decision === "pass" ? "Bulk pass complete" : decision === "reject" ? "Bulk reject complete" : "Marked for review",
        description: `${ids.length} candidate(s) updated.`,
      });
    } catch (err) {
      toast({
        title: "Bulk action failed",
        description: err instanceof Error ? err.message : "Try again",
        variant: "destructive",
      });
    }
  };

  const showBulkBar = stepFilter === 1 && bulkEligible.length > 0;
  const allSelected = bulkEligible.length > 0 && bulkEligible.every((a) => selectedIds.has(a.id));

  if (jobsLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-medium">Selection pipeline</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Module 2 — Eligibility → Offee → Technical → Motivation → Selection board
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <Select
          value={selectedJobId}
          onValueChange={(v) => {
            setJobId(v);
            setSelectedIds(new Set());
          }}
        >
          <SelectTrigger className="w-full sm:w-80">
            <SelectValue placeholder="Select a job" />
          </SelectTrigger>
          <SelectContent>
            {(jobs ?? []).map((j) => {
              const company = j.companies as { name: string } | null;
              return (
                <SelectItem key={j.id} value={j.id}>
                  {j.title} — {company?.name ?? "Company"}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>

        <Select
          value={String(stepFilter)}
          onValueChange={(v) => {
            setStepFilter(v === "all" ? "all" : (Number(v) as SelectionStepId));
            setSelectedIds(new Set());
          }}
        >
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter step" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All steps</SelectItem>
            {SELECTION_STEPS.map((s) => (
              <SelectItem key={s.step} value={String(s.step)}>
                Step {s.step}: {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedJob && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="pt-4 flex flex-wrap items-center gap-4 text-sm">
            <span className="font-medium">{positions} positions available</span>
            <span className="text-muted-foreground">·</span>
            <span>
              {selectedCount} selected
              {selectedCount >= maxSelected && (
                <span className="text-amber-600 ml-1">(at capacity)</span>
              )}
            </span>
            <span className="text-muted-foreground">·</span>
            <span>{(applications ?? []).length} total applications</span>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {SELECTION_STEPS.map((s) => (
          <Card
            key={s.step}
            className="cursor-pointer hover:border-primary/40 transition-colors"
            onClick={() => {
              setStepFilter(s.step);
              setSelectedIds(new Set());
            }}
          >
            <CardHeader className="pb-1 pt-4">
              <CardTitle className="text-xs font-medium text-muted-foreground">
                Step {s.step}
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-4">
              <p className="text-sm font-medium">{s.label}</p>
              <p className="text-2xl font-bold mt-1">{funnelCounts[s.step] ?? 0}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="h-5 w-5" />
            Candidates
          </CardTitle>
          {showBulkBar && (
            <div className="flex flex-wrap items-center gap-2">
              <label className="flex items-center gap-2 text-sm text-muted-foreground mr-2">
                <Checkbox
                  checked={allSelected}
                  onCheckedChange={(v) => toggleAll(Boolean(v))}
                />
                Select all ({bulkEligible.length})
              </label>
              <Button
                size="sm"
                disabled={selectedIds.size === 0 || bulkDecide.isPending}
                onClick={() => runBulk("pass")}
              >
                Pass
              </Button>
              <Button
                size="sm"
                variant="destructive"
                disabled={selectedIds.size === 0 || bulkDecide.isPending}
                onClick={() => runBulk("reject")}
              >
                Reject
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={selectedIds.size === 0 || bulkDecide.isPending}
                onClick={() => runBulk("review")}
              >
                Review
              </Button>
            </div>
          )}
        </CardHeader>
        <CardContent>
          {appsLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : (applications ?? []).length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">
              No applications in this pipeline yet.
            </p>
          ) : (
            <div className="space-y-2">
              {(applications ?? []).map((app) => {
                const cand = app.candidates;
                const profile = cand?.profiles;
                const step = getSelectionStepFromStatus(app.status, app.selection_step);
                const overdue = isStepOverdue(step, app.selection_step_entered_at);
                const mentorOverdue =
                  (app.status === "selected_for_readiness" || step >= 5) &&
                  !app.assigned_mentor_id &&
                  isMentorAssignmentOverdue(app.board_decided_at);
                const canBulk = isBulkEligibleStep1(app);
                return (
                  <div
                    key={app.id}
                    className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    {showBulkBar && (
                      <Checkbox
                        disabled={!canBulk}
                        checked={selectedIds.has(app.id)}
                        onCheckedChange={(v) => toggleOne(app.id, Boolean(v))}
                      />
                    )}
                    <Link
                      to={`/admin/selection/${app.id}`}
                      className="flex flex-1 items-center justify-between gap-3 min-w-0"
                    >
                      <div className="min-w-0">
                        <p className="font-medium truncate">
                          {profile?.full_name ?? cand?.full_name ?? "Candidate"}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {profile?.email} · Step {step}: {SELECTION_STEPS.find((s) => s.step === step)?.label}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {overdue && (
                          <Badge variant="destructive" className="gap-1">
                            <AlertTriangle className="h-3 w-3" />
                            SLA
                          </Badge>
                        )}
                        {mentorOverdue && (
                          <Badge variant="destructive" className="gap-1">
                            <AlertTriangle className="h-3 w-3" />
                            Mentor
                          </Badge>
                        )}
                        {app.needs_action && <Badge variant="secondary">Review</Badge>}
                        <Badge variant="outline">{selectionStatusLabel(app.status)}</Badge>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {!jobs?.length && (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No open roles yet. Approve role postings first.
            <Button variant="link" asChild className="block mx-auto mt-2">
              <Link to="/admin/jobs">Go to Job Roles</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminSelection;
