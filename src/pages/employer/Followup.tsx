import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, ChevronRight } from "lucide-react";
import { useEmployerFollowupApplications } from "@/hooks/useFollowup";
import { useActivationRecord } from "@/hooks/useActivation";
import { useMyCompany } from "@/hooks/useData";
import { resolveProfile } from "@/lib/resolveProfile";
import type { SelectionApplication } from "@/lib/selectionModule";

function Row({ app }: { app: SelectionApplication }) {
  const profile = resolveProfile(app.candidates?.profiles);
  const { data: record } = useActivationRecord(app.id);

  return (
    <Link
      to={`/employer/followup/${app.id}`}
      className="flex items-center justify-between gap-3 p-3 rounded-lg border hover:bg-muted/50"
    >
      <div className="min-w-0">
        <p className="font-medium truncate">{profile?.full_name ?? "Candidate"}</p>
        <p className="text-xs text-muted-foreground">{app.jobs?.title}</p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {record?.followup_completed_at ? (
          <Badge className="bg-success text-success-foreground text-xs">Complete</Badge>
        ) : (
          <Badge variant="outline" className="text-xs">Active</Badge>
        )}
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
      </div>
    </Link>
  );
}

export default function EmployerFollowup() {
  const { data: companyData } = useMyCompany();
  const companyName = (companyData?.companies as { name: string } | null)?.name ?? "Your company";
  const { data: apps, isLoading, isError, error, refetch } = useEmployerFollowupApplications();
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
        <h1 className="text-2xl font-medium">Follow-up</h1>
        <p className="text-muted-foreground">
          Module 7 at {companyName} — your meeting schedule and questionnaires (candidate answers
          stay private).
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Candidates</CardTitle>
        </CardHeader>
        <CardContent>
          {isError ? (
            <div className="space-y-2">
              <p className="text-sm text-destructive">
                Could not load follow-up candidates
                {error instanceof Error ? `: ${error.message}` : "."}
              </p>
              <button
                type="button"
                className="text-sm text-primary underline"
                onClick={() => refetch()}
              >
                Try again
              </button>
            </div>
          ) : list.length === 0 ? (
            <p className="text-sm text-muted-foreground">No candidates in follow-up yet.</p>
          ) : (
            <div className="space-y-2">
              {list.map((app) => (
                <Row key={app.id} app={app} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
