import { useMemo } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, ChevronRight, AlertTriangle } from "lucide-react";
import {
  useAdminMentoringPipeline,
  useUnlockCandidateJobs,
} from "@/hooks/useData";
import {
  useAdminActivationApplications,
  useAdminActivationOverdueFlags,
} from "@/hooks/useActivation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { resolveProfile } from "@/lib/resolveProfile";
import type { Track } from "@/lib/track";

export default function AdminActivation() {
  const { data: pipeline, isLoading: pipelineLoading } = useAdminMentoringPipeline();
  const { data: activationApps, isLoading: appsLoading } = useAdminActivationApplications();
  const { data: overdueFlags } = useAdminActivationOverdueFlags();
  const unlockJobs = useUnlockCandidateJobs();
  const { toast } = useToast();

  const pipelineOptions = useMemo(() => pipeline ?? [], [pipeline]);
  const unlockedApps = activationApps ?? [];
  const overdueByApp = overdueFlags?.overdueByApp ?? {};
  const missingStartDateIds = overdueFlags?.missingStartDateIds ?? new Set<string>();
  const overdueProgrammeCount = Object.keys(overdueByApp).length;
  const missingStartCount = missingStartDateIds.size;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-medium">Activation</h1>
        <p className="text-muted-foreground">
          Module 4 — unlock activation, then track internship checkpoints and clearance per candidate.
        </p>
      </div>

      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="pt-6 text-sm text-muted-foreground">
          Mentoring runs parallel inside{" "}
          <Link to="/admin/readiness" className="text-primary font-medium hover:underline">
            Readiness
          </Link>{" "}
          (meetings 1–3) and Activation (meetings 4–6). After readiness is complete, unlock
          activation below. Entry track candidates get 7 internship checkpoints (M4–M6 auto-sync
          from mentoring).
        </CardContent>
      </Card>

      {(overdueProgrammeCount > 0 || missingStartCount > 0) && (
        <Card className="border-destructive/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              Attention needed
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-1">
            {overdueProgrammeCount > 0 && (
              <p>
                {overdueProgrammeCount} programme{overdueProgrammeCount > 1 ? "s" : ""} with company
                checkpoint(s) available 14+ days (stalled).
              </p>
            )}
            {missingStartCount > 0 && (
              <p>
                {missingStartCount} accepted internship{missingStartCount > 1 ? "s" : ""} missing
                start date (mentor M4–M6 stay locked until set).
              </p>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Candidates ready for Activation</CardTitle>
        </CardHeader>
        <CardContent>
          {pipelineLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : pipelineOptions.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4">
              No candidates have completed Readiness yet.
            </p>
          ) : (
            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Candidate</TableHead>
                    <TableHead>Readiness</TableHead>
                    <TableHead>Activation</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pipelineOptions.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell>
                        <p className="font-medium text-sm">{row.fullName}</p>
                        <p className="text-xs text-muted-foreground">{row.email}</p>
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {row.testsSubmitted}/{row.testsTotal}
                      </TableCell>
                      <TableCell>
                        {row.jobsUnlocked ? (
                          <Badge className="bg-success text-success-foreground">Unlocked</Badge>
                        ) : (
                          <Badge variant="secondary">Locked</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        {!row.jobsUnlocked && (
                          <Button
                            size="sm"
                            disabled={unlockJobs.isPending}
                            onClick={async () => {
                              try {
                                await unlockJobs.mutateAsync({ candidateId: row.id, unlock: true });
                                toast({ title: "Activation unlocked", description: row.fullName });
                              } catch (err) {
                                toast({
                                  title: "Failed",
                                  description: err instanceof Error ? err.message : "Try again",
                                  variant: "destructive",
                                });
                              }
                            }}
                          >
                            Unlock activation
                          </Button>
                        )}
                        <Button size="sm" variant="outline" asChild>
                          <Link
                            to={(() => {
                              const activationApp = unlockedApps.find(
                                (a) => (a.candidates as { id?: string } | null)?.id === row.id
                              );
                              if (row.jobsUnlocked && activationApp) {
                                return `/admin/activation/${activationApp.id}`;
                              }
                              return `/admin/candidates/${row.id}`;
                            })()}
                          >
                            {row.jobsUnlocked ? "Open activation" : "View"}
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Active activation programmes</CardTitle>
        </CardHeader>
        <CardContent>
          {appsLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : unlockedApps.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Unlock activation for candidates above to start Module 4.
            </p>
          ) : (
            <div className="space-y-2">
              {unlockedApps.map((app) => {
                const profile = resolveProfile(app.candidates?.profiles);
                const track =
                  (app.track as Track | null) ??
                  ((app.candidates as { track?: Track } | null)?.track ?? "entry");
                const overdueCps = overdueByApp[app.id] ?? [];
                const missingStart = missingStartDateIds.has(app.id);
                return (
                  <Link
                    key={app.id}
                    to={`/admin/activation/${app.id}`}
                    className="flex items-center justify-between gap-3 p-3 rounded-lg border hover:bg-muted/50"
                  >
                    <div className="min-w-0">
                      <p className="font-medium truncate">{profile?.full_name ?? "Candidate"}</p>
                      <p className="text-xs text-muted-foreground">
                        {app.jobs?.title} · {track === "entry" ? "Entry — 7 checkpoints" : "Fast track"}
                      </p>
                      {(overdueCps.length > 0 || missingStart) && (
                        <div className="flex flex-wrap gap-1.5 mt-1.5">
                          {overdueCps.length > 0 && (
                            <Badge variant="destructive" className="text-[10px]">
                              CP {overdueCps.join(", ")} overdue
                            </Badge>
                          )}
                          {missingStart && (
                            <Badge variant="destructive" className="text-[10px]">
                              Missing start date
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                  </Link>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
