import { Link, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, ArrowLeft } from "lucide-react";
import { useEmployerSelectionApplication } from "@/hooks/useSelection";
import MentorProgramPanel from "@/components/mentor/MentorProgramPanel";
import type { Track } from "@/lib/track";
import { selectionStatusLabel } from "@/lib/selectionModule";
import { resolveProfile } from "@/lib/resolveProfile";

export default function EmployerMentoringApplication() {
  const { applicationId } = useParams<{ applicationId: string }>();
  const { data: app, isLoading, isError, error } = useEmployerSelectionApplication(applicationId);

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isError || !app) {
    return (
      <div className="space-y-4 max-w-lg py-12">
        <h1 className="text-xl font-medium">Application not found</h1>
        <p className="text-sm text-muted-foreground">
          {error instanceof Error ? error.message : "This application could not be loaded."}
        </p>
        <Button variant="outline" asChild>
          <Link to="/employer/mentoring">Back to Mentoring</Link>
        </Button>
      </div>
    );
  }

  if (!app.readiness_unlocked_at) {
    return (
      <div className="space-y-4 max-w-lg py-12">
        <h1 className="text-xl font-medium">Mentoring not started</h1>
        <p className="text-sm text-muted-foreground">
          Assign a mentor in Selection first to unlock the mentor programme.
        </p>
        <Button variant="outline" asChild>
          <Link to={`/employer/selection/${app.id}`}>Open in Selection</Link>
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
          <Link to="/employer/mentoring">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-medium">{profile?.full_name ?? "Candidate"}</h1>
          <p className="text-sm text-muted-foreground">{app.jobs?.title}</p>
          <Badge variant="outline" className="mt-2">
            {selectionStatusLabel(app.status)}
          </Badge>
        </div>
      </div>

      <MentorProgramPanel applicationId={app.id} track={track} canEdit showObservations={false} />
    </div>
  );
}
