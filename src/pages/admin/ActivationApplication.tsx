import { Link, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, ArrowLeft } from "lucide-react";
import { useAdminSelectionApplication } from "@/hooks/useSelection";
import InternshipCheckpointsPanel from "@/components/activation/InternshipCheckpointsPanel";
import PreInternshipGatePanel from "@/components/activation/PreInternshipGatePanel";
import PreArrivalCheckpointsPanel from "@/components/activation/PreArrivalCheckpointsPanel";
import InPersonVisitPanel from "@/components/activation/InPersonVisitPanel";
import FinalClearancePanel from "@/components/activation/FinalClearancePanel";
import { useActivationRecord } from "@/hooks/useActivation";
import type { Track } from "@/lib/track";
import { selectionStatusLabel } from "@/lib/selectionModule";
import { resolveProfile } from "@/lib/resolveProfile";

export default function AdminActivationApplication() {
  const { applicationId } = useParams<{ applicationId: string }>();
  const { data: app, isLoading, isError, error } = useAdminSelectionApplication(applicationId);
  const { data: activationRecord } = useActivationRecord(applicationId);

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
          <Link to="/admin/activation">Back to Activation</Link>
        </Button>
      </div>
    );
  }

  const profile = resolveProfile(app.candidates?.profiles);
  const candidateProfileId =
    (profile as { id?: string } | null)?.id ??
    (app.candidates as { profile_id?: string } | null)?.profile_id ??
    "";
  const track =
    (app.track as Track | null) ??
    ((app.candidates as { track?: Track } | null)?.track ?? "entry");

  return (
    <div className="space-y-8 max-w-3xl">
      <div className="flex items-start gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/admin/activation">
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

      {track === "entry" && (
        <>
          <PreInternshipGatePanel
            applicationId={app.id}
            companyName={app.jobs?.companies?.name}
            jobTitle={app.jobs?.title}
            canAdmin
          />
          <InternshipCheckpointsPanel applicationId={app.id} canEdit showStatus />
        </>
      )}

      <InPersonVisitPanel
        applicationId={app.id}
        track={track}
        companyName={app.jobs?.companies?.name ?? "Company"}
        candidateProfileId={candidateProfileId}
        canEdit
      />

      <FinalClearancePanel application={app} track={track} canEdit />

      {activationRecord?.status === "cleared" && (
        <PreArrivalCheckpointsPanel
          applicationId={app.id}
          canConfirmCompany
          canConfirmCandidate
        />
      )}
    </div>
  );
}
