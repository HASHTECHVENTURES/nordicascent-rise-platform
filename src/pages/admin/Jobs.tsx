import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Eye, CheckCircle, XCircle, MoreHorizontal, Building2, MapPin, Clock, Loader2 } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useAdminJobs, useUpdateJob } from "@/hooks/useData";
import { useMemo, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const AdminJobs = () => {
  const { data: jobs, isLoading } = useAdminJobs();
  const updateJob = useUpdateJob();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [viewJobId, setViewJobId] = useState<string | null>(null);
  const viewJob = viewJobId ? (jobs ?? []).find((j) => j.id === viewJobId) : null;

  const list = useMemo(() => {
    const q = search.toLowerCase();
    return (jobs ?? []).filter((j) => {
      const company = j.companies as { name: string } | null;
      return !q || j.title.toLowerCase().includes(q) || (company?.name ?? "").toLowerCase().includes(q);
    });
  }, [jobs, search]);

  const setStatus = async (id: string, status: string) => {
    try {
      await updateJob.mutateAsync({ id, status });
      toast({ title: status === "open" ? "Job approved" : "Job closed" });
    } catch (err) {
      toast({ title: "Failed", description: err instanceof Error ? err.message : "Try again", variant: "destructive" });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Job Moderation</h1>
        <p className="text-muted-foreground">Review and moderate job postings</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Total Jobs</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{list.length}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Open</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-chart-success">{list.filter((j) => j.status === "open").length}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Draft</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-chart-warning">{list.filter((j) => j.status === "draft").length}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Closed</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{list.filter((j) => j.status === "closed").length}</div></CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search jobs..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {list.length === 0 && <p className="text-center text-muted-foreground py-8">No jobs posted yet.</p>}
            {list.map((job) => {
              const company = job.companies as { name: string } | null;
              return (
              <div key={job.id} className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors">
                <div className="flex-1">
                  <h3 className="font-semibold">{job.title}</h3>
                  <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1"><Building2 className="h-3 w-3" />{company?.name ?? "—"}</span>
                    <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{job.location ?? "—"}</span>
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{job.job_type ?? "—"}</span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Badge variant={job.status === "open" ? "default" : job.status === "draft" ? "secondary" : "outline"}>{job.status}</Badge>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setViewJobId(job.id)}>
                        <Eye className="h-4 w-4 mr-2" />View Details
                      </DropdownMenuItem>
                      {job.status !== "open" && (
                        <DropdownMenuItem onClick={() => setStatus(job.id, "open")}>
                          <CheckCircle className="h-4 w-4 mr-2" />Approve / Publish
                        </DropdownMenuItem>
                      )}
                      {job.status !== "closed" && (
                        <DropdownMenuItem className="text-destructive" onClick={() => setStatus(job.id, "closed")}>
                          <XCircle className="h-4 w-4 mr-2" />Close job
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            );})}
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!viewJob} onOpenChange={(o) => !o && setViewJobId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{viewJob?.title}</DialogTitle>
          </DialogHeader>
          {viewJob && (
            <div className="space-y-2 text-sm">
              <p><span className="text-muted-foreground">Company </span>{(viewJob.companies as { name: string } | null)?.name}</p>
              <p><span className="text-muted-foreground">Location </span>{viewJob.location ?? "—"}</p>
              <p><span className="text-muted-foreground">Status </span>{viewJob.status}</p>
              {viewJob.description && <p className="text-muted-foreground whitespace-pre-wrap pt-2">{viewJob.description}</p>}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminJobs;
