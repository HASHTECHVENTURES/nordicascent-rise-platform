import { Link, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, ArrowLeft } from "lucide-react";
import { useAdminSelectionApplication } from "@/hooks/useSelection";
import OnboardingTrackerPanel from "@/components/onboarding/OnboardingTrackerPanel";
import { useActivationRecord } from "@/hooks/useActivation";
import { selectionStatusLabel } from "@/lib/selectionModule";
import { resolveProfile } from "@/lib/resolveProfile";
import { rollupStatusLabel, type OnboardingRollupStatus } from "@/lib/onboardingModule";

export default function AdminOnboardingApplication() {
  const { applicationId } = useParams<{ applicationId: string }>();
  const { data: app, isLoading, isError } = useAdminSelectionApplication(applicationId);
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
          <Link to="/admin/onboarding">Back to Onboarding</Link>
        </Button>
      </div>
    );
  }

  const profile = resolveProfile(app.candidates?.profiles);
  const candidate = app.candidates as { family_relocating?: boolean } | null;

  return (
    <div className="space-y-8 max-w-3xl">
      <div className="flex items-start gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/admin/onboarding">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-medium">{profile?.full_name ?? "Candidate"}</h1>
          <p className="text-sm text-muted-foreground">{app.jobs?.title}</p>
          <div className="flex flex-wrap gap-2 mt-2">
            <Badge variant="outline">{selectionStatusLabel(app.status)}</Badge>
            {activationRecord?.onboarding_status && (
              <Badge variant="secondary">
                {rollupStatusLabel(activationRecord.onboarding_status as OnboardingRollupStatus)}
              </Badge>
            )}
          </div>
        </div>
      </div>

      <OnboardingTrackerPanel
        applicationId={app.id}
        applicationStatus={app.status}
        familyRelocating={Boolean(candidate?.family_relocating)}
        role="admin"
        canEdit={!activationRecord?.onboarding_completed_at}
      />
    </div>
  );
}
