import { Link, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, ArrowLeft } from "lucide-react";
import { useAdminSelectionApplication } from "@/hooks/useSelection";
import FollowupTrackerPanel from "@/components/followup/FollowupTrackerPanel";
import { useActivationRecord } from "@/hooks/useActivation";
import { useFollowupAnswers, useFollowupQuestionnaires } from "@/hooks/useFollowup";
import { selectionStatusLabel } from "@/lib/selectionModule";
import { resolveProfile } from "@/lib/resolveProfile";
import { rollupStatusLabel, type FollowupRollupStatus } from "@/lib/followupModule";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminFollowupApplication() {
  const { applicationId } = useParams<{ applicationId: string }>();
  const { data: app, isLoading, isError } = useAdminSelectionApplication(applicationId);
  const { data: record } = useActivationRecord(applicationId);
  const { data: questionnaires } = useFollowupQuestionnaires(applicationId);
  const { data: answers } = useFollowupAnswers(applicationId);

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
          <Link to="/admin/followup">Back to Follow-up</Link>
        </Button>
      </div>
    );
  }

  const profile = resolveProfile(app.candidates?.profiles);
  const byDimension = new Map<string, number[]>();
  for (const a of answers ?? []) {
    if (a.score == null || !a.readiness_dimension) continue;
    const arr = byDimension.get(a.readiness_dimension) ?? [];
    arr.push(a.score);
    byDimension.set(a.readiness_dimension, arr);
  }

  return (
    <div className="space-y-8 max-w-4xl">
      <div className="flex items-start gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/admin/followup">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-medium">{profile?.full_name ?? "Candidate"}</h1>
          <p className="text-sm text-muted-foreground">{app.jobs?.title}</p>
          <div className="flex flex-wrap gap-2 mt-2">
            <Badge variant="outline">{selectionStatusLabel(app.status)}</Badge>
            {record?.followup_status && (
              <Badge variant="secondary">
                {rollupStatusLabel(record.followup_status as FollowupRollupStatus)}
              </Badge>
            )}
          </div>
        </div>
      </div>

      <FollowupTrackerPanel
        applicationId={app.id}
        applicationStatus={app.status}
        role="admin"
        canEdit={!record?.followup_completed_at}
      />

      {byDimension.size > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Questionnaire rollup by dimension</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {[...byDimension.entries()].map(([dim, scores]) => {
              const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
              return (
                <p key={dim} className="text-sm">
                  <span className="font-medium capitalize">{dim.replace(/_/g, " ")}</span>
                  : avg {avg.toFixed(1)} / 5 ({scores.length} answers)
                </p>
              );
            })}
            <p className="text-xs text-muted-foreground">
              {(questionnaires ?? []).filter((q) => q.status === "submitted").length} questionnaire(s)
              submitted
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
