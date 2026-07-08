import { Link, useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Briefcase, CheckCircle, Loader2, UserPlus } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useJobById, useMyApplications } from "@/hooks/useData";
import { isCandidateVisibleJob } from "@/lib/jobVisibility";
import { isPreparationComplete } from "@/lib/candidateJourney";
import ProfileReadinessAlert from "@/components/candidate/ProfileReadinessAlert";
import JobPostingView from "@/components/jobs/JobPostingView";
import type { CandidateJobPosting } from "@/lib/jobPostingDisplay";
import {
  jobApplyPath,
  loginPathForJobApply,
  setPendingJobApplication,
  signupPathForNetwork,
} from "@/lib/pendingJobApplication";

export default function CandidateJobDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { profile, candidate, session } = useAuth();
  const { data: job, isLoading } = useJobById(id);
  const { data: applications } = useMyApplications();

  const profileReady = isPreparationComplete(profile, candidate);
  const alreadyApplied = (applications ?? []).some((a) => a.job_id === id);

  const goToApply = () => {
    if (!id) return;
    setPendingJobApplication(id);
    if (!session) {
      navigate(loginPathForJobApply(id));
      return;
    }
    if (!profileReady) {
      navigate("/candidate/profile");
      return;
    }
    navigate(jobApplyPath(id));
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
          <Link to="/candidate/jobs">Back to Job Roles</Link>
        </Button>
      </div>
    );
  }

  const posting = job as CandidateJobPosting;

  const applyButton = alreadyApplied ? (
    <Button disabled variant="secondary" size="lg">
      <CheckCircle className="h-4 w-4 mr-2" />
      Applied
    </Button>
  ) : (
    <Button size="lg" onClick={goToApply} disabled={job.status !== "open"}>
      <Briefcase className="h-4 w-4 mr-2" />
      Apply now
    </Button>
  );

  const secondaryButton = (
    <Button size="lg" variant="outline" asChild>
      <Link to={session ? "/candidate/profile" : signupPathForNetwork()}>
        <UserPlus className="h-4 w-4 mr-2" />
        Join our network
      </Link>
    </Button>
  );

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" asChild>
        <Link to="/candidate/jobs">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Job Roles
        </Link>
      </Button>

      {!profileReady && !alreadyApplied && <ProfileReadinessAlert compact />}

      <JobPostingView job={posting} applyButton={applyButton} secondaryButton={secondaryButton} />
    </div>
  );
}
