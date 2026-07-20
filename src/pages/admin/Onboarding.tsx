import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, ChevronRight, Clock } from "lucide-react";
import AdminStageTasks from "./StageTasks";
import {
  useAdminOnboardingApplications,
  useOnboardingSteps,
  useOnboardingChecklist,
} from "@/hooks/useModuleOnboarding";
import { useActivationRecord } from "@/hooks/useActivation";
import { resolveProfile } from "@/lib/resolveProfile";
import {
  flagAgeHours,
  onboardingStepProgress,
  rollupStatusLabel,
  type OnboardingRollupStatus,
} from "@/lib/onboardingModule";
import type { SelectionApplication } from "@/lib/selectionModule";
import type { Track } from "@/lib/track";
import { TRACK_META } from "@/lib/track";

function OnboardingAppRow({ app }: { app: SelectionApplication }) {
  const profile = resolveProfile(app.candidates?.profiles);
  const track =
    (app.track as Track | null) ??
    ((app.candidates as { track?: Track } | null)?.track ?? "entry");
  const { data: steps } = useOnboardingSteps(app.id);
  const { data: checklist } = useOnboardingChecklist(app.id);
  const { data: record } = useActivationRecord(app.id);
  const progress = onboardingStepProgress(steps ?? []);

  const flagAges = [
    ...(steps ?? [])
      .filter((s) => s.state === "flag" && s.flagged_at)
      .map((s) => flagAgeHours(s.flagged_at) ?? 0),
    ...(checklist ?? [])
      .filter((c) => c.state === "flag" && c.flagged_at)
      .map((c) => flagAgeHours(c.flagged_at) ?? 0),
  ];
  const oldestFlag = flagAges.length ? Math.max(...flagAges) : null;

  return (
    <Link
      to={`/admin/onboarding/${app.id}`}
      className="flex items-center justify-between gap-3 p-3 rounded-lg border hover:bg-muted/50"
    >
      <div className="min-w-0">
        <p className="font-medium truncate">{profile?.full_name ?? "Candidate"}</p>
        <p className="text-xs text-muted-foreground">
          {app.jobs?.title} · {TRACK_META[track].label}
        </p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {record?.onboarding_completed_at || record?.onboarding_status === "onboarding_complete" ? (
          <Badge className="bg-success text-success-foreground text-xs">Complete</Badge>
        ) : (
          <>
            <Badge variant="outline" className="text-xs">
              {progress.done}/{progress.total}
            </Badge>
            {record?.onboarding_status && (
              <Badge variant="secondary" className="text-xs">
                {rollupStatusLabel(record.onboarding_status as OnboardingRollupStatus)}
              </Badge>
            )}
            {oldestFlag !== null && (
              <Badge variant="destructive" className="text-xs gap-1">
                <Clock className="h-3 w-3" />
                {oldestFlag}h
              </Badge>
            )}
          </>
        )}
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
      </div>
    </Link>
  );
}

export default function AdminOnboarding() {
  const { data: apps, isLoading } = useAdminOnboardingApplications();
  const list = [...(apps ?? [])].sort((a, b) => {
    // Prefer flagged apps — rough client sort by status label presence
    return 0;
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-medium">Onboarding</h1>
        <p className="text-muted-foreground">
          Module 6 — first four weeks after arrival. Flags require follow-up within 24 hours.
        </p>
      </div>

      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="pt-6 text-sm text-muted-foreground">
          Opens automatically when Relocation confirms arrival. Completion is system-driven when
          the practical checklist, workplace onboarding, and admin items are clear — no manual
          complete button.
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Candidates in onboarding</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : list.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No candidates in onboarding yet. They appear after Module 5 arrival is confirmed.
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

      <AdminStageTasks
        fixedStageId="onboarding"
        title="Onboarding guides"
        description="Optional guide cards for candidates"
      />
    </div>
  );
}
