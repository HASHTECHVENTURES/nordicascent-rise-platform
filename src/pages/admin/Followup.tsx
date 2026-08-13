import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, ChevronRight, Clock, AlertTriangle, Flag } from "lucide-react";
import { useAdminFollowupDashboard } from "@/hooks/useFollowup";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { resolveProfile } from "@/lib/resolveProfile";
import {
  fetchFollowupDimensionRollup,
  openDueFollowupQuestionnaires,
  rollupStatusLabel,
  type FollowupRollupStatus,
} from "@/lib/followupModule";
import type { SelectionApplication } from "@/lib/selectionModule";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";

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
  const { toast } = useToast();
  const qc = useQueryClient();
  const list = rows ?? [];

  const { data: rollup, isLoading: rollupLoading } = useQuery({
    queryKey: ["admin-followup-dimension-rollup"],
    queryFn: fetchFollowupDimensionRollup,
  });

  const openDue = useMutation({
    mutationFn: openDueFollowupQuestionnaires,
    onSuccess: (count) => {
      qc.invalidateQueries({ queryKey: ["admin-followup-dashboard"] });
      toast({
        title: "Questionnaires refreshed",
        description:
          count > 0
            ? `Opened due questionnaires for ${count} programme${count === 1 ? "" : "s"} and notified parties.`
            : "No questionnaires were due to open.",
      });
    },
    onError: (err) => {
      toast({
        title: "Could not open questionnaires",
        description: err instanceof Error ? err.message : "Try again",
        variant: "destructive",
      });
    },
  });

  const overdue = list.filter((r) => r.overdueCount > 0);
  const flagged = list.filter((r) => r.isFlagged);
  const retention = list.filter((r) => r.atRisk);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-medium">Follow-up</h1>
          <p className="text-muted-foreground">
            Module 7 — six-month support. Overdue touchpoints, Flags, and retention risk are listed
            separately from the full roster.
          </p>
        </div>
        <Button
          size="sm"
          variant="outline"
          disabled={openDue.isPending}
          onClick={() => openDue.mutate()}
        >
          {openDue.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            "Open due questionnaires"
          )}
        </Button>
      </div>

      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="pt-6 text-sm text-muted-foreground">
          Starts at arrival (parallel with onboarding). Log separate candidate and company meetings.
          Questionnaires open one week before the 3- and 6-month touchpoints and notify both parties.
          Flag creates an admin task. Overdue ≠ Flag.
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
          <CardTitle className="text-base">Reporting — by Readiness dimension</CardTitle>
        </CardHeader>
        <CardContent>
          {rollupLoading ? (
            <div className="flex justify-center py-6">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
            </div>
          ) : !rollup?.length ? (
            <p className="text-sm text-muted-foreground">
              No submitted questionnaire scores yet. Averages appear here once candidates and companies
              submit 3- and 6-month questionnaires.
            </p>
          ) : (
            <div className="rounded-lg border overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 text-left">
                  <tr>
                    <th className="p-2 font-medium">Month</th>
                    <th className="p-2 font-medium">Party</th>
                    <th className="p-2 font-medium">Dimension</th>
                    <th className="p-2 font-medium">Avg score</th>
                    <th className="p-2 font-medium">Responses</th>
                  </tr>
                </thead>
                <tbody>
                  {rollup.map((row) => (
                    <tr key={`${row.month}-${row.party}-${row.dimension}`} className="border-t">
                      <td className="p-2">{row.month}</td>
                      <td className="p-2 capitalize">{row.party}</td>
                      <td className="p-2">{row.dimension.replace(/_/g, " ")}</td>
                      <td className="p-2 font-mono">{row.avgScore}/5</td>
                      <td className="p-2">{row.responses}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
