import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, ChevronRight } from "lucide-react";
import {
  useEmployerOnboardingApplications,
  useOnboardingSteps,
} from "@/hooks/useModuleOnboarding";
import { useActivationRecord } from "@/hooks/useActivation";
import { useMyCompany } from "@/hooks/useData";
import { resolveProfile } from "@/lib/resolveProfile";
import { TRACK_META, type Track } from "@/lib/track";
import { onboardingStepProgress } from "@/lib/onboardingModule";
import type { SelectionApplication } from "@/lib/selectionModule";

function OnboardingAppRow({ app }: { app: SelectionApplication }) {
  const profile = resolveProfile(app.candidates?.profiles);
  const track =
    (app.track as Track | null) ??
    ((app.candidates as { track?: Track } | null)?.track ?? "entry");
  const { data: steps } = useOnboardingSteps(app.id);
  const { data: record } = useActivationRecord(app.id);
  const progress = onboardingStepProgress(steps ?? []);

  return (
    <Link
      to={`/employer/onboarding/${app.id}`}
      className="flex items-center justify-between gap-3 p-3 rounded-lg border hover:bg-muted/50"
    >
      <div className="min-w-0">
        <p className="font-medium truncate">{profile?.full_name ?? "Candidate"}</p>
        <p className="text-xs text-muted-foreground">
          {app.jobs?.title} · {TRACK_META[track].label}
        </p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {record?.onboarding_completed_at ? (
          <Badge className="bg-success text-success-foreground text-xs">Complete</Badge>
        ) : (
          <Badge variant="outline" className="text-xs">
            {progress.done}/{progress.total}
          </Badge>
        )}
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
      </div>
    </Link>
  );
}

export default function EmployerOnboarding() {
  const { data: companyData } = useMyCompany();
  const companyName = (companyData?.companies as { name: string } | null)?.name ?? "Your company";
  const { data: apps, isLoading } = useEmployerOnboardingApplications();
  const list = apps ?? [];

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-medium">Onboarding</h1>
        <p className="text-muted-foreground">
          Module 6 at {companyName} — confirm workplace onboarding and access.
        </p>
      </div>

      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="pt-6 text-sm text-muted-foreground">
          Confirm that workplace onboarding has started and that building/system access is in place.
          Personal and family checklist items are not shown here.
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Candidates in onboarding</CardTitle>
        </CardHeader>
        <CardContent>
          {list.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No candidates in onboarding yet.
            </p>
          ) : (
            <div className="space-y-2">
              {list.map((app) => (
                <OnboardingAppRow key={app.id} app={app} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
