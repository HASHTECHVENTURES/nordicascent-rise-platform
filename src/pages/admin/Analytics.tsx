import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Building2, Briefcase, AlertTriangle, Loader2 } from "lucide-react";
import { useAdminCandidates, usePlatformStats } from "@/hooks/useData";
import { TRACK_META } from "@/lib/track";
import { PIPELINE_STAGES } from "@/lib/pipeline";

const AdminAnalytics = () => {
  const { data: candidates, isLoading: cLoading } = useAdminCandidates();
  const { data: stats, isLoading: sLoading } = usePlatformStats();

  if (cLoading || sLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const list = candidates ?? [];
  const entryCount = list.filter((c) => c.track === "entry").length;
  const fastCount = list.filter((c) => c.track === "fast").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Platform Analytics</h1>
        <p className="text-muted-foreground">Live metrics from your Supabase database</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground flex items-center gap-2"><Users className="h-4 w-4" />Candidates</CardTitle></CardHeader>
          <CardContent><div className="text-3xl font-bold">{stats?.candidates ?? 0}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground flex items-center gap-2"><Building2 className="h-4 w-4" />Companies</CardTitle></CardHeader>
          <CardContent><div className="text-3xl font-bold">{stats?.companies ?? 0}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground flex items-center gap-2"><Briefcase className="h-4 w-4" />Roles</CardTitle></CardHeader>
          <CardContent><div className="text-3xl font-bold">{stats?.jobs ?? 0}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground flex items-center gap-2"><AlertTriangle className="h-4 w-4" />Open Issues</CardTitle></CardHeader>
          <CardContent><div className="text-3xl font-bold">{stats?.openIssues ?? 0}</div></CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Candidates by Track</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span>{TRACK_META.entry.label}</span>
              <Badge>{entryCount}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>{TRACK_META.fast.label}</span>
              <Badge>{fastCount}</Badge>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Applications</CardTitle></CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.applications ?? 0}</div>
            <p className="text-sm text-muted-foreground mt-1">Total job applications on platform</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Pipeline Stages (configured)</CardTitle></CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {PIPELINE_STAGES.map((s) => (
              <Badge key={s.id} variant="outline">{s.name}</Badge>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-4">Stage-level conversion charts populate as candidates progress through the pipeline.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminAnalytics;
