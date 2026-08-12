import { Link, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { PageSpinner } from "@/components/ui/PageSpinner";
import { useUniversityCreditActivations } from "@/hooks/useUniversityPortal";
import { useActivationRecord } from "@/hooks/useActivation";
import AcademicWorkflowPanel from "@/components/activation/AcademicWorkflowPanel";
import { resolveProfile } from "@/lib/resolveProfile";
import { TRACK_META, type Track } from "@/lib/track";
import { ACTIVATION_STATUS_LABELS } from "@/lib/activationModule";

export default function UniversityStudentDetail() {
  const { applicationId } = useParams<{ applicationId: string }>();
  const { data: rows, isLoading } = useUniversityCreditActivations();
  const { data: record } = useActivationRecord(applicationId);

  if (isLoading) return <PageSpinner />;

  const app = (rows ?? []).find((a) => a.id === applicationId);
  if (!app) {
    return (
      <div className="space-y-4 max-w-lg py-12">
        <h1 className="text-xl font-medium">Internship not found</h1>
        <p className="text-sm text-muted-foreground">
          This student is not on a credit track at your university, or Activation has not enabled
          university credit yet.
        </p>
        <Button variant="outline" asChild>
          <Link to="/university/students">Back</Link>
        </Button>
      </div>
    );
  }

  const profile = resolveProfile(app.candidates?.profiles);
  const track =
    (app.track as Track | null) ??
    ((app.candidates as { track?: Track } | null)?.track ?? "entry");
  const activationStatus = record?.status ?? app.activation?.status;

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-start gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/university/students">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-medium">
            {profile?.full_name ?? app.candidates?.full_name ?? "Student"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {app.jobs?.title} · {app.jobs?.companies?.name} · {TRACK_META[track].label}
          </p>
          {app.candidates?.field_of_study && (
            <p className="text-xs text-muted-foreground mt-1">{app.candidates.field_of_study}</p>
          )}
          <div className="flex flex-wrap gap-2 mt-2">
            {activationStatus && (
              <Badge variant="outline">
                {ACTIVATION_STATUS_LABELS[activationStatus as keyof typeof ACTIVATION_STATUS_LABELS] ??
                  activationStatus}
              </Badge>
            )}
            {record?.internship_start_date && (
              <Badge variant="secondary">Start {record.internship_start_date}</Badge>
            )}
          </div>
        </div>
      </div>

      <Card className="border-muted">
        <CardContent className="pt-4 text-sm text-muted-foreground">
          This view is for learning credit only. Final Clearance, hiring evaluation, and in-person
          visit details are never shared with the university.
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Academic workflow</CardTitle>
        </CardHeader>
        <CardContent>
          <AcademicWorkflowPanel
            applicationId={app.id}
            creditRequired
            canEdit
          />
        </CardContent>
      </Card>
    </div>
  );
}
