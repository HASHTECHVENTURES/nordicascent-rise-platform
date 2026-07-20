import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, ChevronRight, Clock, AlertTriangle, Flag } from "lucide-react";
import { useAdminFollowupDashboard } from "@/hooks/useFollowup";
import { resolveProfile } from "@/lib/resolveProfile";
import { rollupStatusLabel, type FollowupRollupStatus } from "@/lib/followupModule";
import type { SelectionApplication } from "@/lib/selectionModule";

type DashRow = {
  app: SelectionApplication;
  overdueCount: number;
  isFlagged: boolean;
  atRisk: boolean;
  status: FollowupRollupStatus | null;
};

function FollowupAppRow({ row }: { row: DashRow }) {
  const profile = resolveProfile(row.app.candidates?.profiles);

  return (
    <Link
      to={`/admin/followup/${row.app.id}`}
      className="flex items-center justify-between gap-3 p-3 rounded-lg border hover:bg-muted/50"
    >
      <div className="min-w-0">
        <p className="font-medium truncate">{profile?.full_name ?? "Candidate"}</p>
        <p className="text-xs text-muted-foreground">{row.app.jobs?.title}</p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {row.atRisk && (
          <Badge variant="destructive" className="text-xs gap-1">
            <AlertTriangle className="h-3 w-3" />
            Retention
          </Badge>
        )}
        {row.overdueCount > 0 && (
          <Badge variant="outline" className="text-xs gap-1">
            <Clock className="h-3 w-3" />
            {row.overdueCount} overdue
          </Badge>
        )}
        {row.isFlagged && (
          <Badge variant="destructive" className="text-xs gap-1">
            <Flag className="h-3 w-3" />
            Flag
          </Badge>
        )}
        {row.status && !row.isFlagged && !row.atRisk && (
          <Badge variant="secondary" className="text-xs">
            {rollupStatusLabel(row.status)}
          </Badge>
        )}
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
      </div>
    </Link>
  );
}

function Section({
  title,
  empty,
  rows,
}: {
  title: string;
  empty: string;
  rows: DashRow[];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {rows.length === 0 ? (
          <p className="text-sm text-muted-foreground">{empty}</p>
        ) : (
          <div className="space-y-2">
            {rows.map((row) => (
              <FollowupAppRow key={row.app.id} row={row} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function AdminFollowup() {
  const { data: rows, isLoading } = useAdminFollowupDashboard();
  const list = rows ?? [];

  const overdue = list.filter((r) => r.overdueCount > 0);
  const flagged = list.filter((r) => r.isFlagged);
  const retention = list.filter((r) => r.atRisk);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-medium">Follow-up</h1>
        <p className="text-muted-foreground">
          Module 7 — six-month support. Overdue touchpoints, Flags, and retention risk are listed
          separately from the full roster.
        </p>
      </div>

      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="pt-6 text-sm text-muted-foreground">
          Starts at arrival (parallel with onboarding). Log separate candidate and company meetings.
          Questionnaires open one week before the 3- and 6-month touchpoints. Overdue ≠ Flag.
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : list.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-sm text-muted-foreground text-center">
            No candidates yet. They appear after Module 5 arrival is confirmed.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          <Section
            title={`Overdue (${overdue.length})`}
            empty="No overdue touchpoints."
            rows={overdue}
          />
          <Section
            title={`Flags (${flagged.length})`}
            empty="No flagged meetings."
            rows={flagged}
          />
          <Section
            title={`At risk — retention (${retention.length})`}
            empty="No retention risk signals."
            rows={retention}
          />
          <Section
            title={`All candidates (${list.length})`}
            empty="No candidates."
            rows={list}
          />
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Reporting</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Questionnaire answers are stored with Readiness dimensions for cohort rollup. Open a
          candidate to review submitted responses. Full analytics export can be added later.
        </CardContent>
      </Card>
    </div>
  );
}
