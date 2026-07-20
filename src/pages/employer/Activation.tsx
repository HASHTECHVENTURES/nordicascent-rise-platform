import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, ChevronRight } from "lucide-react";
import { useEmployerActivationApplications, useActivationRecord } from "@/hooks/useActivation";
import { useMyCompany } from "@/hooks/useData";
import { resolveProfile } from "@/lib/resolveProfile";
import { TRACK_META, type Track } from "@/lib/track";
import { ACTIVATION_STATUS_LABELS } from "@/lib/activationModule";
import type { SelectionApplication } from "@/lib/selectionModule";

function ActivationAppRow({ app }: { app: SelectionApplication }) {
  const profile = resolveProfile(app.candidates?.profiles);
  const track =
    (app.track as Track | null) ??
    ((app.candidates as { track?: Track } | null)?.track ?? "entry");
  const { data: record } = useActivationRecord(app.id);

  return (
    <Link
      to={`/employer/activation/${app.id}`}
      className="flex items-center justify-between gap-3 p-3 rounded-lg border hover:bg-muted/50"
    >
      <div className="min-w-0">
        <p className="font-medium truncate">{profile?.full_name ?? "Candidate"}</p>
        <p className="text-xs text-muted-foreground">
          {app.jobs?.title} · {TRACK_META[track].label}
        </p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {record && (
          <Badge variant="secondary" className="text-xs">
            {ACTIVATION_STATUS_LABELS[record.status]}
          </Badge>
        )}
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
      </div>
    </Link>
  );
}

export default function EmployerActivation() {
  const { data: companyData } = useMyCompany();
  const companyName = (companyData?.companies as { name: string } | null)?.name ?? "Your company";
  const { data: apps, isLoading } = useEmployerActivationApplications();

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const list = apps ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-medium">Activation</h1>
        <p className="text-muted-foreground">
          Module 4 at {companyName} — internship checkpoints, evaluation, and final clearance.
        </p>
      </div>

      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="pt-6 text-sm text-muted-foreground space-y-2">
          <p>
            <strong>Entry track:</strong> 7 internship checkpoints (meetings 4–6 auto-complete from
            Mentoring). Then Final Clearance, then pre-arrival employment.
          </p>
          <p>
            <strong>Fast track:</strong> Skips internship — goes to Final Clearance after Readiness +
            Meeting 3 (Phase 3).
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Candidates in activation</CardTitle>
        </CardHeader>
        <CardContent>
          {list.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No candidates in activation yet. Admin unlocks activation after Readiness.
            </p>
          ) : (
            <div className="space-y-2">
              {list.map((app) => (
                <ActivationAppRow key={app.id} app={app} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
