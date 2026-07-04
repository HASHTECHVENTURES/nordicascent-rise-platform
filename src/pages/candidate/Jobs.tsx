import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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
import { useMyApplications, useOpenJobs } from "@/hooks/useData";
import { useToast } from "@/hooks/use-toast";
import { isPreparationComplete } from "@/lib/candidateJourney";
import { jobApplyPath, loginPathForJobApply, setPendingJobApplication } from "@/lib/pendingJobApplication";
import {
  getCandidateCompanyName,
  getCandidateJobLocation,
  getJobTrackBadge,
  isAnonymousCompany,
} from "@/lib/jobPostingDisplay";
import ProfileReadinessAlert from "@/components/candidate/ProfileReadinessAlert";

export default function CandidateJobs() {
  const navigate = useNavigate();
  const { profile, candidate, session } = useAuth();
  const { data: jobs, isLoading: jobsLoading } = useOpenJobs();
  const { data: applications, isLoading: appsLoading } = useMyApplications();
  const { toast } = useToast();
  const [search, setSearch] = useState("");

  const profileReady = isPreparationComplete(profile, candidate);
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

  const handleApply = (jobId: string) => {
    setPendingJobApplication(jobId);
    if (!session) {
      navigate(loginPathForJobApply(jobId));
      return;
    }
    if (!profileReady) {
      toast({
        title: "Complete your profile first",
        description: "Finish registration steps 1–3 before applying.",
        variant: "destructive",
      });
      navigate("/candidate/profile");
      return;
    }
    if (appliedJobIds.has(jobId)) return;
    navigate(jobApplyPath(jobId));
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
      <div>
        <h1 className="text-2xl font-medium text-foreground">Roles</h1>
        <p className="text-muted-foreground mt-1">Browse open positions and apply.</p>
        <p className="text-muted-foreground">Open roles you can apply to.</p>
      </div>

      {!profileReady && <ProfileReadinessAlert compact />}

      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <CardTitle className="text-lg font-medium">Open Positions</CardTitle>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search roles..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {openJobs.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-8">
              No open roles right now.
            </p>
          )}
          {openJobs.map((job) => {
            const company = job.companies as {
              name: string;
              logo_url: string | null;
              location: string | null;
              status: string | null;
            } | null;
            const applied = appliedJobIds.has(job.id);
            const companyName = getCandidateCompanyName(company);
            const location = getCandidateJobLocation(job, company);
            const trackBadge = getJobTrackBadge(job);
            const anonymous = isAnonymousCompany(company?.status);
            return (
              <div
                key={job.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg border"
              >
                <div className="flex gap-4 min-w-0 flex-1">
                  {!anonymous && company?.logo_url ? (
                    <Avatar className="h-12 w-12 rounded-lg shrink-0">
                      <AvatarImage src={company.logo_url} className="object-contain p-1" />
                      <AvatarFallback className="rounded-lg text-xs">
                        {companyName.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  ) : (
                    <div className="h-12 w-12 rounded-lg shrink-0 bg-muted flex items-center justify-center">
                      <Building2 className="h-5 w-5 text-muted-foreground" />
                    </div>
                  )}
                  <div className="min-w-0 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-medium">{job.title}</h3>
                      {trackBadge && <Badge variant="secondary">{trackBadge}</Badge>}
                      {applied && <Badge variant="outline">Applied</Badge>}
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Building2 className="h-4 w-4" />
                        {companyName}
                      </span>
                      {location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {location}
                        </span>
                      )}
                    </div>
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
                      disabled={!profileReady || job.status !== "open"}
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
