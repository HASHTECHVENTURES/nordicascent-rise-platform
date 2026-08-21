import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Loader2,
  AlertTriangle,
  Users,
  ExternalLink,
  Search,
  ChevronLeft,
  ChevronRight,
  Filter,
} from "lucide-react";
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
  type SelectionApplication,
} from "@/lib/selectionModule";
import { isMentorAssignmentOverdue } from "@/lib/mentorProgram";
import { PageSpinner } from "@/components/ui/PageSpinner";
import { cn } from "@/lib/utils";

type AttentionFilter = "all" | "needs_action" | "sla" | "mentor";
type SortMode = "newest" | "oldest" | "name" | "attention";

const PAGE_SIZES = [25, 50, 100] as const;

function isBulkEligibleStep1(app: SelectionApplication) {
  const step = getSelectionStepFromStatus(app.status, app.selection_step);
  if (step !== 1) return false;
  if (isTerminalSelectionStatus(app.status)) return false;
  return (
    app.status === "accepted" ||
    app.status === SELECTION_STATUSES.APPLICATION_COMPLETE ||
    app.status === SELECTION_STATUSES.ELIGIBILITY_REVIEW ||
    app.status.startsWith("eligibility_")
  );
}

function appName(app: SelectionApplication) {
  return app.candidates?.profiles?.full_name ?? app.candidates?.full_name ?? "Candidate";
}

function appEmail(app: SelectionApplication) {
  return app.candidates?.profiles?.email ?? "";
}

function hasSla(app: SelectionApplication) {
  const step = getSelectionStepFromStatus(app.status, app.selection_step);
  return isStepOverdue(step, app.selection_step_entered_at);
}

function hasMentorOverdue(app: SelectionApplication) {
  const step = getSelectionStepFromStatus(app.status, app.selection_step);
  return (
    (app.status === "selected_for_readiness" || step >= 5) &&
    !app.assigned_mentor_id &&
    isMentorAssignmentOverdue(app.board_decided_at)
  );
}

const AdminSelection = () => {
  const { data: jobs, isLoading: jobsLoading } = useAdminSelectionJobs();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialStep = searchParams.get("step");
  const [jobId, setJobId] = useState<string>("");
  const [stepFilter, setStepFilter] = useState<SelectionStepId | "all">(() => {
    if (initialStep && /^[1-5]$/.test(initialStep)) {
      return Number(initialStep) as SelectionStepId;
    }
    return "all";
  });
  const [search, setSearch] = useState("");
  const [attention, setAttention] = useState<AttentionFilter>("all");
  const [sortMode, setSortMode] = useState<SortMode>("attention");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<(typeof PAGE_SIZES)[number]>(50);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const bulkDecide = useBulkSelectionDecision();
  const { toast } = useToast();

  const selectedJobId = jobId || jobs?.[0]?.id;
  const { data: applications, isLoading: appsLoading } = useAdminJobSelectionApplications(
    selectedJobId
  );

  useEffect(() => {
    setPage(1);
    setSelectedIds(new Set());
  }, [selectedJobId, stepFilter, search, attention, sortMode, pageSize]);

  useEffect(() => {
    const next = new URLSearchParams(searchParams);
    if (stepFilter === "all") next.delete("step");
    else next.set("step", String(stepFilter));
    setSearchParams(next, { replace: true });
  }, [stepFilter]); // eslint-disable-line react-hooks/exhaustive-deps

  const allApps = applications ?? [];

  const funnelCounts = useMemo(() => {
    const counts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    allApps.forEach((a) => {
      const step = getSelectionStepFromStatus(a.status, a.selection_step);
      counts[step] = (counts[step] ?? 0) + 1;
    });
    return counts;
  }, [allApps]);

  const attentionCounts = useMemo(() => {
    let needs = 0;
    let sla = 0;
    let mentor = 0;
    allApps.forEach((a) => {
      if (a.needs_action) needs += 1;
      if (hasSla(a)) sla += 1;
      if (hasMentorOverdue(a)) mentor += 1;
    });
    return { needs, sla, mentor };
  }, [allApps]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = allApps.filter((a) => {
      const step = getSelectionStepFromStatus(a.status, a.selection_step);
      if (stepFilter !== "all" && step !== stepFilter) return false;
      if (q) {
        const hay = `${appName(a)} ${appEmail(a)}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (attention === "needs_action" && !a.needs_action) return false;
      if (attention === "sla" && !hasSla(a)) return false;
      if (attention === "mentor" && !hasMentorOverdue(a)) return false;
      return true;
    });

    list = [...list].sort((a, b) => {
      if (sortMode === "name") return appName(a).localeCompare(appName(b));
      if (sortMode === "oldest") {
        return new Date(a.applied_at).getTime() - new Date(b.applied_at).getTime();
      }
      if (sortMode === "newest") {
        return new Date(b.applied_at).getTime() - new Date(a.applied_at).getTime();
      }
      // attention: SLA / mentor / needs_action first, then newest
      const score = (x: SelectionApplication) =>
        (hasSla(x) ? 4 : 0) + (hasMentorOverdue(x) ? 3 : 0) + (x.needs_action ? 2 : 0);
      const d = score(b) - score(a);
      if (d !== 0) return d;
      return new Date(b.applied_at).getTime() - new Date(a.applied_at).getTime();
    });

    return list;
  }, [allApps, stepFilter, search, attention, sortMode]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const pageRows = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

  const bulkEligible = useMemo(
    () => filtered.filter(isBulkEligibleStep1),
    [filtered]
  );

  const selectedJob = jobs?.find((j) => j.id === selectedJobId);
  const positions = selectedJob?.positions_count ?? 2;
  const maxSelected = maxSelectionsForJob(positions);
  const selectedCount = countSelectedForJob(allApps);

  const toggleOne = (id: string, checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  const togglePage = (checked: boolean) => {
    const pageEligible = pageRows.filter(isBulkEligibleStep1);
    setSelectedIds((prev) => {
      const next = new Set(prev);
      pageEligible.forEach((a) => {
        if (checked) next.add(a.id);
        else next.delete(a.id);
      });
      return next;
    });
  };

  const toggleAllFiltered = (checked: boolean) => {
    if (checked) setSelectedIds(new Set(bulkEligible.map((a) => a.id)));
    else setSelectedIds(new Set());
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
        title:
          decision === "pass"
            ? "Bulk pass complete"
            : decision === "reject"
              ? "Bulk reject complete"
              : "Marked for review",
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

  const showBulkBar = stepFilter === 1 || stepFilter === "all";
  const pageEligible = pageRows.filter(isBulkEligibleStep1);
  const pageAllSelected =
    pageEligible.length > 0 && pageEligible.every((a) => selectedIds.has(a.id));
  const selectedOnPage = pageEligible.filter((a) => selectedIds.has(a.id)).length;

  if (jobsLoading) {
    return <PageSpinner />;
  }

  return (
    <div className="space-y-5 pb-24">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-medium">Selection pipeline</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Review queue by step — search, filter, and bulk-decide without opening every profile.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
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
        </div>
      </div>

      {selectedJob && (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-md border bg-muted/30 px-4 py-3 text-sm">
          <span className="font-medium">{positions} positions</span>
          <span className="text-muted-foreground">·</span>
          <span>
            {selectedCount} selected
            {selectedCount >= maxSelected && (
              <span className="text-amber-700 ml-1">(at capacity)</span>
            )}
          </span>
          <span className="text-muted-foreground">·</span>
          <span>{allApps.length} applications</span>
          <span className="text-muted-foreground">·</span>
          <span>
            Showing {filtered.length === 0 ? 0 : (safePage - 1) * pageSize + 1}–
            {Math.min(safePage * pageSize, filtered.length)} of {filtered.length}
          </span>
        </div>
      )}

      {/* Compact step queue — inspired by Candidates filter chips / Activation tables */}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setStepFilter("all")}
          className={cn(
            "inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm transition-colors",
            stepFilter === "all"
              ? "border-primary bg-primary text-primary-foreground"
              : "bg-card hover:border-primary/40"
          )}
        >
          All
          <span
            className={cn(
              "rounded px-1.5 py-0.5 text-xs font-semibold tabular-nums",
              stepFilter === "all" ? "bg-primary-foreground/20" : "bg-muted"
            )}
          >
            {allApps.length}
          </span>
        </button>
        {SELECTION_STEPS.map((s) => (
          <button
            key={s.step}
            type="button"
            onClick={() => setStepFilter(s.step)}
            className={cn(
              "inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm transition-colors",
              stepFilter === s.step
                ? "border-primary bg-primary text-primary-foreground"
                : "bg-card hover:border-primary/40"
            )}
          >
            <span className="text-xs opacity-70">{s.step}.</span>
            {s.label}
            <span
              className={cn(
                "rounded px-1.5 py-0.5 text-xs font-semibold tabular-nums",
                stepFilter === s.step ? "bg-primary-foreground/20" : "bg-muted"
              )}
            >
              {funnelCounts[s.step] ?? 0}
            </span>
          </button>
        ))}
      </div>

      <Card>
        <CardHeader className="space-y-4 pb-3">
          <div className="flex flex-col xl:flex-row gap-3 xl:items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-4 w-4" />
              Review queue
              {stepFilter !== "all" && (
                <Badge variant="secondary" className="font-normal">
                  Step {stepFilter}: {SELECTION_STEPS.find((s) => s.step === stepFilter)?.label}
                </Badge>
              )}
            </CardTitle>
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search name or email…"
                  className="pl-9 h-9"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Select
                value={attention}
                onValueChange={(v) => setAttention(v as AttentionFilter)}
              >
                <SelectTrigger className="w-[160px] h-9">
                  <Filter className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                  <SelectValue placeholder="Attention" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All attention</SelectItem>
                  <SelectItem value="needs_action">
                    Needs review ({attentionCounts.needs})
                  </SelectItem>
                  <SelectItem value="sla">SLA overdue ({attentionCounts.sla})</SelectItem>
                  <SelectItem value="mentor">
                    Mentor overdue ({attentionCounts.mentor})
                  </SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortMode} onValueChange={(v) => setSortMode(v as SortMode)}>
                <SelectTrigger className="w-[150px] h-9">
                  <SelectValue placeholder="Sort" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="attention">Attention first</SelectItem>
                  <SelectItem value="newest">Newest applied</SelectItem>
                  <SelectItem value="oldest">Oldest applied</SelectItem>
                  <SelectItem value="name">Name A–Z</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={String(pageSize)}
                onValueChange={(v) => setPageSize(Number(v) as (typeof PAGE_SIZES)[number])}
              >
                <SelectTrigger className="w-[110px] h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PAGE_SIZES.map((n) => (
                    <SelectItem key={n} value={String(n)}>
                      {n} / page
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {showBulkBar && bulkEligible.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 rounded-md border bg-muted/40 px-3 py-2 text-sm">
              <label className="flex items-center gap-2 text-muted-foreground">
                <Checkbox
                  checked={pageAllSelected}
                  onCheckedChange={(v) => togglePage(Boolean(v))}
                />
                Page ({selectedOnPage}/{pageEligible.length})
              </label>
              <Button
                size="sm"
                variant="ghost"
                className="h-8"
                onClick={() => toggleAllFiltered(selectedIds.size !== bulkEligible.length)}
              >
                {selectedIds.size === bulkEligible.length
                  ? "Clear selection"
                  : `Select all eligible (${bulkEligible.length})`}
              </Button>
              {selectedIds.size > 0 && (
                <>
                  <span className="text-muted-foreground">{selectedIds.size} selected</span>
                  <Button
                    size="sm"
                    className="h-8"
                    disabled={bulkDecide.isPending}
                    onClick={() => runBulk("pass")}
                  >
                    Pass
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    className="h-8"
                    disabled={bulkDecide.isPending}
                    onClick={() => runBulk("reject")}
                  >
                    Reject
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8"
                    disabled={bulkDecide.isPending}
                    onClick={() => runBulk("review")}
                  >
                    Review
                  </Button>
                </>
              )}
            </div>
          )}
        </CardHeader>

        <CardContent className="pt-0">
          {appsLoading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : filtered.length === 0 ? (
            <p className="text-sm text-muted-foreground py-12 text-center">
              {allApps.length === 0
                ? "No applications in this pipeline yet."
                : "No candidates match these filters."}
            </p>
          ) : (
            <>
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      {showBulkBar && (
                        <TableHead className="w-10">
                          <span className="sr-only">Select</span>
                        </TableHead>
                      )}
                      <TableHead>Candidate</TableHead>
                      <TableHead className="hidden md:table-cell">Step</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="hidden lg:table-cell">Flags</TableHead>
                      <TableHead className="hidden sm:table-cell">Applied</TableHead>
                      <TableHead className="text-right w-24">Open</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pageRows.map((app) => {
                      const cand = app.candidates;
                      const step = getSelectionStepFromStatus(app.status, app.selection_step);
                      const overdue = hasSla(app);
                      const mentorOverdue = hasMentorOverdue(app);
                      const canBulk = showBulkBar && isBulkEligibleStep1(app);
                      const name = appName(app);
                      const email = appEmail(app);
                      return (
                        <TableRow key={app.id} className="group">
                          {showBulkBar && (
                            <TableCell>
                              <Checkbox
                                disabled={!canBulk}
                                checked={selectedIds.has(app.id)}
                                onCheckedChange={(v) => toggleOne(app.id, Boolean(v))}
                              />
                            </TableCell>
                          )}
                          <TableCell className="min-w-[180px]">
                            <Link
                              to={`/admin/selection/${app.id}`}
                              className="block hover:underline"
                            >
                              <p className="font-medium leading-tight">{name}</p>
                              <p className="text-xs text-muted-foreground truncate max-w-[240px]">
                                {email || "—"}
                              </p>
                            </Link>
                          </TableCell>
                          <TableCell className="hidden md:table-cell text-sm text-muted-foreground whitespace-nowrap">
                            {step}. {SELECTION_STEPS.find((s) => s.step === step)?.label}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="font-normal whitespace-nowrap">
                              {selectionStatusLabel(app.status)}
                            </Badge>
                          </TableCell>
                          <TableCell className="hidden lg:table-cell">
                            <div className="flex flex-wrap gap-1">
                              {overdue && (
                                <Badge variant="destructive" className="gap-1 font-normal">
                                  <AlertTriangle className="h-3 w-3" />
                                  SLA
                                </Badge>
                              )}
                              {mentorOverdue && (
                                <Badge variant="destructive" className="gap-1 font-normal">
                                  <AlertTriangle className="h-3 w-3" />
                                  Mentor
                                </Badge>
                              )}
                              {app.needs_action && (
                                <Badge variant="secondary" className="font-normal">
                                  Review
                                </Badge>
                              )}
                              {!overdue && !mentorOverdue && !app.needs_action && (
                                <span className="text-xs text-muted-foreground">—</span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="hidden sm:table-cell text-sm text-muted-foreground whitespace-nowrap">
                            {app.applied_at ? app.applied_at.split("T")[0] : "—"}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="inline-flex items-center gap-1">
                              <Button variant="ghost" size="sm" className="h-8 px-2" asChild>
                                <Link to={`/admin/selection/${app.id}`}>Open</Link>
                              </Button>
                              {cand?.id && (
                                <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                                  <Link
                                    to={`/admin/candidates/${cand.id}`}
                                    title="Candidate profile"
                                  >
                                    <ExternalLink className="h-3.5 w-3.5" />
                                  </Link>
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4 text-sm text-muted-foreground">
                <p>
                  Page {safePage} of {totalPages}
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={safePage <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Prev
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={safePage >= totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            </>
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

      {/* Sticky bulk bar when scrolling large lists */}
      {selectedIds.size > 0 && showBulkBar && (
        <div className="fixed bottom-4 left-1/2 z-40 -translate-x-1/2 flex items-center gap-2 rounded-lg border bg-background shadow-lg px-4 py-3">
          <span className="text-sm font-medium whitespace-nowrap">
            {selectedIds.size} selected
          </span>
          <Button size="sm" disabled={bulkDecide.isPending} onClick={() => runBulk("pass")}>
            Pass
          </Button>
          <Button
            size="sm"
            variant="destructive"
            disabled={bulkDecide.isPending}
            onClick={() => runBulk("reject")}
          >
            Reject
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={bulkDecide.isPending}
            onClick={() => runBulk("review")}
          >
            Review
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setSelectedIds(new Set())}>
            Clear
          </Button>
        </div>
      )}
    </div>
  );
};

export default AdminSelection;
