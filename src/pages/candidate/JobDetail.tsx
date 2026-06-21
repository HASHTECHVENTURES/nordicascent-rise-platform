import { Link, useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, Briefcase, CheckCircle, Loader2 } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useApplyToJob, useJobById, useMyApplications } from "@/hooks/useData";
import { useToast } from "@/hooks/use-toast";
import { getMissingJobHuntProfileFields, isJobHuntProfileReady } from "@/lib/profileCompleteness";
import { isCandidateVisibleJob } from "@/lib/jobVisibility";
import ApplicationSubmittedDialog from "@/components/candidate/ApplicationSubmittedDialog";
import ProfileReadinessAlert from "@/components/candidate/ProfileReadinessAlert";

export default function CandidateJobDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { profile, candidate } = useAuth();
  const { data: job, isLoading } = useJobById(id);
  const { data: applications } = useMyApplications();
  const applyToJob = useApplyToJob();
  const [submittedJob, setSubmittedJob] = useState<string | null>(null);

  const profileReady = isJobHuntProfileReady(profile, candidate);
  const alreadyApplied = (applications ?? []).some((a) => a.job_id === id);

  const handleApply = async () => {
    if (!job) return;
    if (!profileReady) {
      const missing = getMissingJobHuntProfileFields(profile, candidate).map((m) => m.label).join(", ");
      toast({
        title: "Complete your profile first",
        description: `Still needed: ${missing}. Save Changes in My Profile.`,
        variant: "destructive",
      });
      navigate("/candidate/profile");
      return;
    }
    try {
      const { jobTitle } = await applyToJob.mutateAsync(job.id);
      setSubmittedJob(jobTitle);
    } catch (err) {
      toast({
        title: "Could not apply",
        description: err instanceof Error ? err.message : "Try again",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!job || !isCandidateVisibleJob(job)) {
    return (
      <div className="text-center py-20 space-y-4">
        <p className="text-muted-foreground">This job is no longer available.</p>
        <Button asChild variant="outline">
          <Link to="/candidate/jobs">Back to Jobs</Link>
        </Button>
      </div>
    );
  }

  const company = job.companies as { name: string; logo_url: string | null; location: string | null } | null;

  return (
    <div className="space-y-6 max-w-3xl">
      <ApplicationSubmittedDialog
        open={!!submittedJob}
        onOpenChange={(open) => !open && setSubmittedJob(null)}
        jobTitle={submittedJob ?? ""}
      />
      <Button variant="ghost" size="sm" asChild>
        <Link to="/candidate/jobs">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Jobs
        </Link>
      </Button>

      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex gap-4">
          <Avatar className="h-14 w-14 rounded-lg shrink-0">
            <AvatarImage src={company?.logo_url ?? undefined} className="object-contain p-1" />
            <AvatarFallback className="rounded-lg">
              {(company?.name ?? "CO").slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <h1 className="text-2xl font-medium">{job.title}</h1>
              <Badge variant="secondary">{job.job_type}</Badge>
            </div>
            <p className="text-muted-foreground">
              {company?.name}
              {job.location ? ` · ${job.location}` : ""}
            </p>
          </div>
        </div>
        {alreadyApplied ? (
          <Button disabled variant="secondary">
            <CheckCircle className="h-4 w-4 mr-2" />
            Applied
          </Button>
        ) : (
          <Button
            onClick={handleApply}
            disabled={!profileReady || applyToJob.isPending || job.status !== "open"}
          >
            <Briefcase className="h-4 w-4 mr-2" />
            Apply with my profile
          </Button>
        )}
      </div>

      {!profileReady && !alreadyApplied && <ProfileReadinessAlert compact />}

      <Card>
        <CardHeader>
          <CardTitle>About the role</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground whitespace-pre-wrap">
            {job.description ?? "No description provided."}
          </p>
        </CardContent>
      </Card>

      {(job.requirements ?? []).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Requirements</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {(job.requirements ?? []).map((item, i) => (
                <li key={i}>• {item}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {job.salary_range && (
        <Card>
          <CardHeader>
            <CardTitle>Compensation</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{job.salary_range}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
