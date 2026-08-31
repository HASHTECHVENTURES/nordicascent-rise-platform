import { Link, Navigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Briefcase,
  Clock,
  Loader2,
  MapPin,
  Bell,
} from "lucide-react";
import { useMyApplications } from "@/hooks/useData";
import { useJobsAccessLock } from "@/hooks/useJobsAccessLock";
import InterviewInviteCard from "@/components/candidate/InterviewInviteCard";
import SelectionProgressTracker from "@/components/selection/SelectionProgressTracker";
import {
  SELECTION_STATUSES,
  candidateTrackerMessage,
  isSelectionPipelineStatus,
} from "@/lib/selectionModule";
import {
  applicationStatusLabel,
  applicationStatusNextStep,
  applicationStatusVariant,
  getApplicationJob,
} from "@/lib/applicationJourney";

type Props = {
  /** When true, render as a Selection journey section (no standalone page chrome / no redirect). */
  embedded?: boolean;
};

function isOffeeForwardStatus(status: string) {
  return (
    status === SELECTION_STATUSES.ELIGIBILITY_PASS ||
    status === SELECTION_STATUSES.OFFEE_REVIEW ||
    status === SELECTION_STATUSES.OFFEE_PASS
  );
}

export default function CandidateApplications({ embedded = false }: Props) {
  const { data: applications, isLoading } = useMyApplications();
  const { jobsOpen } = useJobsAccessLock();
  const apps = applications ?? [];

  if (!embedded) {
    return <Navigate to="/candidate/selection#applications" replace />;
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h2 className="text-lg font-medium text-foreground">Your applications</h2>
          <p className="text-sm text-muted-foreground">
            Track selection steps for every role you applied to. Offee appears early in the path.
          </p>
        </div>
        {jobsOpen && (
          <Button variant="outline" size="sm" asChild>
            <a href="#roles">
              <Briefcase className="h-4 w-4 mr-2" />
              Browse open roles
            </a>
          </Button>
        )}
      </div>

      {apps.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center space-y-4">
            <Briefcase className="h-10 w-10 text-muted-foreground mx-auto" />
            <p className="text-muted-foreground">No applications yet.</p>
            {jobsOpen ? (
              <Button asChild>
                <a href="#roles">Find open job roles</a>
              </Button>
            ) : (
              <p className="text-sm text-muted-foreground">Complete Preparation to unlock open roles.</p>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {apps.map((app) => {
            const job = getApplicationJob(app);
            const company = job?.companies;
            const showOffeeCallout =
              isSelectionPipelineStatus(app.status) && isOffeeForwardStatus(app.status);
            return (
              <Card key={app.id}>
                <CardHeader className="pb-3">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="flex gap-4">
                      <Avatar className="h-12 w-12 rounded-lg shrink-0">
                        <AvatarImage src={company?.logo_url ?? undefined} className="object-contain p-1" />
                        <AvatarFallback className="rounded-lg text-xs">
                          {(company?.name ?? "CO").slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-lg font-medium">{job?.title ?? "Job role"}</CardTitle>
                        <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                          <MapPin className="h-3 w-3" />
                          {company?.name ?? "Company"}
                          {job?.location ? ` · ${job.location}` : ""}
                        </p>
                      </div>
                    </div>
                    <Badge variant={applicationStatusVariant(app.status)} className="shrink-0 w-fit">
                      {applicationStatusLabel(app.status)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isSelectionPipelineStatus(app.status) && (
                    <SelectionProgressTracker status={app.status} selectionStep={app.selection_step} />
                  )}

                  {showOffeeCallout && (
                    <div className="rounded-lg border border-primary/30 bg-primary/5 p-4 text-sm">
                      <p className="font-medium text-foreground">Offee</p>
                      <p className="text-muted-foreground mt-1">
                        {candidateTrackerMessage(app.status, app.selection_step)}
                      </p>
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    Applied {new Date(app.applied_at).toLocaleString()}
                  </div>

                  {!showOffeeCallout && (
                    <div className="rounded-lg border bg-muted/30 p-4 text-sm">
                      <p className="font-medium flex items-center gap-2 mb-1">
                        <Bell className="h-4 w-4 text-primary" />
                        What happens next
                      </p>
                      <p className="text-muted-foreground">
                        {applicationStatusNextStep(app.status, app.selection_step)}
                      </p>
                    </div>
                  )}

                  {app.interview_meet_url && app.interview_scheduled_at && (
                    <InterviewInviteCard
                      jobTitle={job?.title ?? "Job role"}
                      companyName={company?.name}
                      meetUrl={app.interview_meet_url}
                      scheduledAt={app.interview_scheduled_at}
                      notes={app.interview_notes}
                    />
                  )}

                  <div className="flex flex-wrap gap-2">
                    {job && (
                      <Button size="sm" variant="outline" asChild>
                        <Link to={`/candidate/jobs/${app.job_id}`}>View job</Link>
                      </Button>
                    )}
                    {jobsOpen && (
                      <Button size="sm" variant="ghost" asChild>
                        <a href="#roles">Apply to another job role</a>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
