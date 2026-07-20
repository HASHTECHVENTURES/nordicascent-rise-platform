import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Briefcase, Clock, Target, Loader2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useEmployerApplications, useEmployerJobs } from "@/hooks/useData";
import { PIPELINE_STAGES, normalizePipelineStageId } from "@/lib/pipeline";

const EmployerAnalytics = () => {
  const { data: applications, isLoading: aLoading } = useEmployerApplications();
  const { data: jobs, isLoading: jLoading } = useEmployerJobs();

  const funnel = useMemo(() => {
    const map: Record<string, number> = {};
    PIPELINE_STAGES.forEach((s) => { map[s.id] = 0; });
    (applications ?? []).forEach((app) => {
      const stage = normalizePipelineStageId(app.stage_id);
      map[stage] = (map[stage] ?? 0) + 1;
    });
    return PIPELINE_STAGES.map((s) => ({ stage: s.name, count: map[s.id] ?? 0 }));
  }, [applications]);

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    (applications ?? []).forEach((app) => {
      counts[app.status] = (counts[app.status] ?? 0) + 1;
    });
    return counts;
  }, [applications]);

  if (aLoading || jLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const totalApps = applications?.length ?? 0;
  const openJobs = jobs?.filter((j) => j.status === "open").length ?? 0;
  const hired = statusCounts["accepted"] ?? 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground">Hiring performance from live application data</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground flex items-center gap-2"><Users className="h-4 w-4" />Applications</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{totalApps}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground flex items-center gap-2"><Briefcase className="h-4 w-4" />Open job roles</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{openJobs}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground flex items-center gap-2"><Target className="h-4 w-4" />Accepted</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{hired}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground flex items-center gap-2"><Clock className="h-4 w-4" />In Review</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{statusCounts["reviewing"] ?? 0}</div></CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Pipeline Funnel</CardTitle></CardHeader>
        <CardContent className="h-72">
          {totalApps === 0 ? (
            <p className="text-muted-foreground text-sm">No applications yet — post jobs and wait for candidates to apply.</p>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={funnel}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="stage" tick={{ fontSize: 10 }} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EmployerAnalytics;
