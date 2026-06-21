import { Link, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, Loader2, MapPin, Users } from "lucide-react";
import { useEmployerJobApplications, useJobById, useUpdateJob } from "@/hooks/useData";
import { applicationStatusLabel, applicationStatusVariant } from "@/lib/applicationJourney";
import { useToast } from "@/hooks/use-toast";

export default function EmployerJobDetail() {
  const { id } = useParams();
  const { data: job, isLoading } = useJobById(id);
  const { data: applications } = useEmployerJobApplications(id);
  const updateJob = useUpdateJob();
  const { toast } = useToast();

  const company = job?.companies as { name: string; logo_url?: string | null } | null;

  const setStatus = async (status: string) => {
    if (!id) return;
    try {
      await updateJob.mutateAsync({ id, status });
      toast({ title: "Job updated" });
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

  if (!job) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" size="icon" asChild><Link to="/employer/jobs"><ArrowLeft className="h-4 w-4" /></Link></Button>
        <p className="text-muted-foreground">Job not found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild><Link to="/employer/jobs"><ArrowLeft className="h-4 w-4" /></Link></Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{job.title}</h1>
          <p className="text-muted-foreground flex items-center gap-2 mt-1">
            <MapPin className="h-4 w-4" />
            {company?.name ?? "Company"} · {job.location ?? "—"}
          </p>
        </div>
        <Badge variant={job.status === "open" ? "default" : "secondary"}>{job.status}</Badge>
      </div>

      <div className="flex flex-wrap gap-2">
        {job.status !== "open" && (
          <Button size="sm" onClick={() => setStatus("open")} disabled={updateJob.isPending}>Publish</Button>
        )}
        {job.status === "open" && (
          <Button size="sm" variant="outline" onClick={() => setStatus("closed")} disabled={updateJob.isPending}>Close posting</Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-base">Job details</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p><span className="text-muted-foreground">Type </span>{job.job_type ?? "—"}</p>
            <p><span className="text-muted-foreground">Salary </span>{job.salary_range ?? "—"}</p>
            {job.posted_at && <p><span className="text-muted-foreground">Posted </span>{job.posted_at.split("T")[0]}</p>}
            {job.description && <p className="pt-2 text-muted-foreground whitespace-pre-wrap">{job.description}</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-4 w-4" />
              Applicants ({applications?.length ?? 0})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {(applications ?? []).length === 0 && (
              <p className="text-sm text-muted-foreground">No applications yet.</p>
            )}
            {(applications ?? []).map((app) => {
              const c = app.candidates as {
                id: string;
                title: string | null;
                profiles: { full_name: string | null; avatar_url: string | null } | null;
              };
              return (
                <Link
                  key={app.id}
                  to={`/employer/candidates/${c.id}`}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={c.profiles?.avatar_url ?? undefined} />
                      <AvatarFallback>{(c.profiles?.full_name ?? "?").slice(0, 2)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-sm">{c.profiles?.full_name ?? "Candidate"}</p>
                      <p className="text-xs text-muted-foreground">{c.title}</p>
                    </div>
                  </div>
                  <Badge variant={applicationStatusVariant(app.status)}>{applicationStatusLabel(app.status)}</Badge>
                </Link>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
