import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Briefcase,
  Building2,
  Loader2,
  MapPin,
  Search,
  ArrowRight,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useApplyToJob, useMyApplications, useOpenJobs } from "@/hooks/useData";
import { useToast } from "@/hooks/use-toast";
import { isJobHuntProfileReady, getMissingProfileFields } from "@/lib/profileCompleteness";
import ProfileReadinessAlert from "@/components/candidate/ProfileReadinessAlert";
import ApplicationSubmittedDialog from "@/components/candidate/ApplicationSubmittedDialog";

export default function CandidateJobs() {
  const { profile, candidate } = useAuth();
  const { data: jobs, isLoading: jobsLoading } = useOpenJobs();
  const { data: applications, isLoading: appsLoading } = useMyApplications();
  const applyToJob = useApplyToJob();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [submittedJob, setSubmittedJob] = useState<string | null>(null);

  const profileReady = isJobHuntProfileReady(profile, candidate);
  const appliedJobIds = useMemo(
    () => new Set((applications ?? []).map((a) => a.job_id)),
    [applications]
  );

  const openJobs = useMemo(() => {
    const list = jobs ?? [];
    if (!search.trim()) return list;
    const q = search.toLowerCase();
    return list.filter((job) => {
      const company = job.companies as { name: string } | null;
      return (
        job.title.toLowerCase().includes(q) ||
        (job.location ?? "").toLowerCase().includes(q) ||
        (company?.name ?? "").toLowerCase().includes(q)
      );
    });
  }, [jobs, search]);

  const handleApply = async (jobId: string) => {
    if (!profileReady) {
      const missing = getMissingProfileFields(profile, candidate).map((m) => m.label).join(", ");
      toast({
        title: "Complete your profile first",
        description: `Still needed: ${missing}. Save Changes in My Profile.`,
        variant: "destructive",
      });
      return;
    }
    if (appliedJobIds.has(jobId)) return;

    try {
      const { jobTitle } = await applyToJob.mutateAsync(jobId);
      setSubmittedJob(jobTitle);
    } catch (err) {
      toast({
        title: "Could not apply",
        description: err instanceof Error ? err.message : "Try again",
        variant: "destructive",
      });
    }
  };

  if (jobsLoading || appsLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ApplicationSubmittedDialog
        open={!!submittedJob}
        onOpenChange={(open) => !open && setSubmittedJob(null)}
        jobTitle={submittedJob ?? ""}
      />

      <div>
        <h1 className="text-2xl font-medium text-foreground">Jobs</h1>
        <p className="text-muted-foreground">Open roles you can apply to.</p>
      </div>

      {!profileReady && <ProfileReadinessAlert compact />}

      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <CardTitle className="text-lg font-medium">Open Positions</CardTitle>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search jobs..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {openJobs.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-8">
              No open jobs right now.
            </p>
          )}
          {openJobs.map((job) => {
            const company = job.companies as { name: string; logo_url: string | null; location: string | null } | null;
            const applied = appliedJobIds.has(job.id);
            return (
              <div
                key={job.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg border"
              >
                <div className="flex gap-4 min-w-0 flex-1">
                  <Avatar className="h-12 w-12 rounded-lg shrink-0">
                    <AvatarImage src={company?.logo_url ?? undefined} className="object-contain p-1" />
                    <AvatarFallback className="rounded-lg text-xs">
                      {(company?.name ?? "CO").slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-medium">{job.title}</h3>
                      <Badge variant="outline">{job.job_type}</Badge>
                      {applied && <Badge variant="secondary">Applied</Badge>}
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Building2 className="h-4 w-4" />
                        {company?.name ?? "Company"}
                      </span>
                      {job.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {job.location}
                        </span>
                      )}
                    </div>
                    {job.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">{job.description}</p>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Button variant="outline" size="sm" asChild>
                    <Link to={`/candidate/jobs/${job.id}`}>
                      View
                      <ArrowRight className="ml-1 h-3 w-3" />
                    </Link>
                  </Button>
                  {!applied && (
                    <Button
                      size="sm"
                      disabled={!profileReady || applyToJob.isPending}
                      onClick={() => handleApply(job.id)}
                    >
                      <Briefcase className="h-4 w-4 mr-1" />
                      Apply
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
