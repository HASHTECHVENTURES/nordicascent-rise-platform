import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Briefcase, Clock, CheckCircle, Loader2, Plus, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { PIPELINE_STAGES } from "@/lib/pipeline";
import { useEmployerApplications, useEmployerJobs, useEmployerTasks } from "@/hooks/useData";

const EmployerDashboard = () => {
  const { data: applications, isLoading: appsLoading } = useEmployerApplications();
  const { data: jobs, isLoading: jobsLoading } = useEmployerJobs();
  const { data: tasks, isLoading: tasksLoading } = useEmployerTasks();

  const byStage = useMemo(() => {
    const map: Record<string, number> = {};
    PIPELINE_STAGES.forEach((s) => { map[s.id] = 0; });
    (applications ?? []).forEach((app) => {
      const stage = app.stage_id ?? "preparation";
      map[stage] = (map[stage] ?? 0) + 1;
    });
    return map;
  }, [applications]);

  const totalCandidates = applications?.length ?? 0;
  const openRoles = jobs?.filter((j) => j.status === "open").length ?? 0;
  const awaitingAction = applications?.filter((a) => a.needs_action).length ?? 0;
  const acceptedCount = applications?.filter((a) => a.status === "accepted").length ?? 0;
  const onboarded = (byStage["onboarding"] ?? 0) + (byStage["followup"] ?? 0);

  if (appsLoading || jobsLoading || tasksLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-medium text-foreground">Pipeline Overview</h1>
        <p className="text-muted-foreground">Monitor candidates across all stages</p>
      </div>

      {awaitingAction > 0 && (
        <Card className="border-warning/40 bg-warning/5">
          <CardContent className="pt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="font-medium">
                {awaitingAction} application{awaitingAction > 1 ? "s" : ""} need your review
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                New candidates applied to your roles — review and accept or decline.
              </p>
            </div>
            <Button className="gap-2 bg-nordic-orange hover:bg-nordic-orange/90 text-white shrink-0" asChild>
              <Link to="/employer/candidates">
                Review candidates
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {openRoles === 0 && awaitingAction === 0 && (
        <Card className="border-nordic-orange/30 bg-nordic-orange/5">
          <CardContent className="pt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="font-medium">Post your first job role</p>
              <p className="text-sm text-muted-foreground mt-1">
                Candidates browse open job roles — post one to start receiving applications.
              </p>
            </div>
            <Button className="gap-2 bg-nordic-orange hover:bg-nordic-orange/90 text-white shrink-0" asChild>
              <Link to="/employer/jobs?new=1">
                <Plus className="h-4 w-4" />
                Post job role
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {acceptedCount > 0 && (
        <Card className="border-success/30 bg-success/5">
          <CardContent className="pt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="font-medium">{acceptedCount} accepted candidate{acceptedCount > 1 ? "s" : ""}</p>
              <p className="text-sm text-muted-foreground mt-1">
                They are in Selection. Message them or move them through the pipeline.
              </p>
            </div>
            <Button variant="outline" className="shrink-0" asChild>
              <Link to="/employer/candidates">View in Candidates</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium">Candidates per Stage</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between overflow-x-auto pb-2">
            {PIPELINE_STAGES.map((stage, index) => {
              const count = byStage[stage.id] ?? 0;
              return (
                <Link key={stage.id} to="/employer/candidates" className="flex items-center">
                  <div className="flex flex-col items-center min-w-[90px] hover:opacity-80 transition-opacity">
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center border-2 mb-2 ${
                      count > 0 ? "bg-primary/10 border-primary text-primary" : "bg-muted border-muted-foreground/30 text-muted-foreground"
                    }`}>
                      <stage.icon className="h-6 w-6" />
                    </div>
                    <span className="text-2xl font-bold">{count}</span>
                    <span className="text-xs text-muted-foreground text-center">{stage.name}</span>
                  </div>
                  {index < PIPELINE_STAGES.length - 1 && (
                    <div className={`w-8 h-0.5 mx-1 ${count > 0 ? "bg-primary/50" : "bg-muted"}`} />
                  )}
                </Link>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Link to="/employer/candidates">
          <Card className="hover:border-primary/50 transition-colors cursor-pointer">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center">
                <Users className="h-7 w-7 text-primary" />
              </div>
              <div>
                <p className="text-4xl font-bold">{totalCandidates}</p>
                <p className="text-sm text-muted-foreground">Total Candidates</p>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link to="/employer/jobs">
          <Card className="hover:border-primary/50 transition-colors cursor-pointer">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="h-14 w-14 rounded-xl bg-secondary/20 flex items-center justify-center">
                <Briefcase className="h-7 w-7 text-secondary" />
              </div>
              <div>
                <p className="text-4xl font-bold">{openRoles}</p>
                <p className="text-sm text-muted-foreground">Open job roles</p>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link to="/employer/tasks">
          <Card className="hover:border-primary/50 transition-colors cursor-pointer">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="h-14 w-14 rounded-xl bg-warning/10 flex items-center justify-center">
                <Clock className="h-7 w-7 text-warning" />
              </div>
              <div>
                <p className="text-4xl font-bold">{awaitingAction}</p>
                <p className="text-sm text-muted-foreground">Needs Action</p>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="h-14 w-14 rounded-xl bg-success/10 flex items-center justify-center">
              <CheckCircle className="h-7 w-7 text-success" />
            </div>
            <div>
              <p className="text-4xl font-bold">{onboarded}</p>
              <p className="text-sm text-muted-foreground">Onboarded / Follow-up</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {(tasks ?? []).length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-lg">Recent Tasks</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {tasks!.slice(0, 5).map((t) => (
              <div key={t.id} className="flex items-center justify-between p-3 border rounded">
                <span className={t.completed ? "line-through text-muted-foreground" : ""}>{t.title}</span>
                <span className="text-xs text-muted-foreground">{t.priority}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EmployerDashboard;
