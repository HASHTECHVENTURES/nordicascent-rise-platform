import { Link, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from "lucide-react";
import { PageSpinner } from "@/components/ui/PageSpinner";
import { useMyMentorAssignments } from "@/hooks/useMentorPortal";
import MentorProgramPanel from "@/components/mentor/MentorProgramPanel";
import { resolveProfile } from "@/lib/resolveProfile";
import { TRACK_META, type Track } from "@/lib/track";
import { selectionStatusLabel } from "@/lib/selectionModule";

export default function MentorCandidateDetail() {
  const { applicationId } = useParams<{ applicationId: string }>();
  const { data, isLoading } = useMyMentorAssignments();

  if (isLoading) return <PageSpinner />;

  const app = (data?.assignments ?? []).find((a) => a.id === applicationId);
  if (!app) {
    return (
      <div className="space-y-4 max-w-lg py-12">
        <h1 className="text-xl font-medium">Programme not found</h1>
        <p className="text-sm text-muted-foreground">
          This candidate is not assigned to you, or the programme has not started.
        </p>
        <Button variant="outline" asChild>
          <Link to="/mentor/candidates">Back</Link>
        </Button>
      </div>
    );
  }

  const profile = resolveProfile(app.candidates?.profiles);
  const track =
    (app.track as Track | null) ??
    ((app.candidates as { track?: Track } | null)?.track ?? "entry");

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-start gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/mentor/candidates">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-medium">
            {profile?.full_name ?? app.candidates?.full_name ?? "Candidate"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {app.jobs?.title} · {TRACK_META[track].label}
          </p>
          <Badge variant="outline" className="mt-2">
            {selectionStatusLabel(app.status)}
          </Badge>
        </div>
      </div>

      <MentorProgramPanel
        applicationId={app.id}
        track={track}
        canEdit
        showObservations
        canEditSummaryNotes
      />
    </div>
  );
}
