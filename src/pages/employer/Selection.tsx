import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, AlertTriangle, ChevronRight } from "lucide-react";
import { useEmployerJobs } from "@/hooks/useData";
import { useEmployerSelectionApplications } from "@/hooks/useSelection";
import {
  SELECTION_STEPS,
  getSelectionStepFromStatus,
  isStepOverdue,
  isSelectionPipelineStatus,
  selectionStatusLabel,
  type SelectionStepId,
} from "@/lib/selectionModule";
import { isMentorAssignmentOverdue } from "@/lib/mentorProgram";
import type { SelectionApplication } from "@/lib/selectionModule";
import { resolveProfile } from "@/lib/resolveProfile";

const EmployerSelection = () => {
  const { data: jobs, isLoading: jobsLoading } = useEmployerJobs();
  const [jobId, setJobId] = useState<string>("");
  const [stepFilter, setStepFilter] = useState<SelectionStepId | "all">("all");

  const selectedJobId = jobId || jobs?.[0]?.id;
  const { data: applications, isLoading: appsLoading } = useEmployerSelectionApplications(selectedJobId);

  const filteredApps = useMemo(() => {
    const inPipeline = (applications ?? []).filter((a) => isSelectionPipelineStatus(a.status));
    if (stepFilter === "all") return inPipeline;
    return inPipeline.filter(
      (a) => getSelectionStepFromStatus(a.status, a.selection_step) === stepFilter
    );
  }, [applications, stepFilter]);

  const funnelCounts = useMemo(() => {
    const inPipeline = (applications ?? []).filter((a) => isSelectionPipelineStatus(a.status));
    const counts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    inPipeline.forEach((a) => {
      const step = getSelectionStepFromStatus(a.status, a.selection_step);
      counts[step] = (counts[step] ?? 0) + 1;
    });
    return counts;
  }, [applications]);

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
        <h1 className="text-2xl font-medium">Selection</h1>
        <p className="text-muted-foreground">
          Review applications in the Selection pipeline. Mentor assignment happens here; complete 3+3
          observations in the Mentoring module.
        </p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Job role</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedJobId ?? ""} onValueChange={setJobId}>
            <SelectTrigger className="max-w-md">
              <SelectValue placeholder="Select a job role" />
            </SelectTrigger>
            <SelectContent>
              {(jobs ?? []).map((j) => (
                <SelectItem key={j.id} value={j.id}>
                  {j.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <div className="grid grid-cols-5 gap-2">
        {SELECTION_STEPS.map((s) => (
          <button
            key={s.step}
            type="button"
            onClick={() => setStepFilter(s.step)}
            className={`flex flex-col items-center gap-1 p-3 rounded-lg border transition-all ${
              stepFilter === s.step ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"
            }`}
          >
            <span className="text-xl font-bold">{funnelCounts[s.step] ?? 0}</span>
            <span className="text-[10px] text-center text-muted-foreground leading-tight">{s.label}</span>
          </button>
        ))}
        <button
          type="button"
          onClick={() => setStepFilter("all")}
          className={`flex flex-col items-center gap-1 p-3 rounded-lg border transition-all ${
            stepFilter === "all" ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"
          }`}
        >
          <span className="text-xl font-bold">
            {(applications ?? []).filter((a) => isSelectionPipelineStatus(a.status)).length}
          </span>
          <span className="text-[10px] text-center text-muted-foreground leading-tight">All steps</span>
        </button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Applications in Selection</CardTitle>
        </CardHeader>
        <CardContent>
          {appsLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : filteredApps.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">
              No applications in Selection for this job role yet.
            </p>
          ) : (
            <div className="space-y-2">
              {filteredApps.map((app) => (
                <ApplicationRow key={app.id} app={app} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

function ApplicationRow({ app }: { app: SelectionApplication }) {
  const cand = app.candidates;
  const profile = resolveProfile(cand?.profiles);
  const candidateId = cand?.id;
  const step = getSelectionStepFromStatus(app.status, app.selection_step);
  const overdue = isStepOverdue(step, app.selection_step_entered_at);
  const mentorOverdue =
    (app.status === "selected_for_readiness" || step >= 5) &&
    !app.assigned_mentor_id &&
    isMentorAssignmentOverdue(app.board_decided_at);

  return (
    <Link
      to={`/employer/selection/${app.id}`}
      className="flex items-center justify-between gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
    >
      <div className="min-w-0">
        <p className="font-medium truncate">
          {profile?.full_name ?? cand?.full_name ?? "Candidate"}
        </p>
        <p className="text-xs text-muted-foreground truncate">
          Step {step}: {SELECTION_STEPS.find((s) => s.step === step)?.label}
          {app.readiness_unlocked_at && " · Mentor programme active"}
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
        <Badge variant="outline">{selectionStatusLabel(app.status)}</Badge>
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
      </div>
    </Link>
  );
}

export default EmployerSelection;
