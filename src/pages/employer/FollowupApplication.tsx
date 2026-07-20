import { Link, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, ArrowLeft } from "lucide-react";
import { useEmployerSelectionApplication } from "@/hooks/useSelection";
import FollowupTrackerPanel from "@/components/followup/FollowupTrackerPanel";
import { useActivationRecord } from "@/hooks/useActivation";
import { selectionStatusLabel } from "@/lib/selectionModule";
import { resolveProfile } from "@/lib/resolveProfile";

export default function EmployerFollowupApplication() {
  const { applicationId } = useParams<{ applicationId: string }>();
  const { data: app, isLoading, isError } = useEmployerSelectionApplication(applicationId);
  const { data: record } = useActivationRecord(applicationId);

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
        <Button variant="outline" asChild>
          <Link to="/employer/followup">Back to Follow-up</Link>
        </Button>
      </div>
    );
  }

  const profile = resolveProfile(app.candidates?.profiles);

  return (
    <div className="space-y-8 max-w-3xl">
      <div className="flex items-start gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/employer/followup">
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

      <FollowupTrackerPanel
        applicationId={app.id}
        applicationStatus={app.status}
        role="company"
        canEdit={false}
      />
    </div>
  );
}
