import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertTriangle, Clock, Loader2, Search, Shield, Trash2 } from "lucide-react";
import { useActivityLog } from "@/hooks/useData";
import {
  useAccessAnomalies,
  useApplyErasureLedger,
  useErasureLedger,
  useProcessExpiredRetention,
  useResolveAccessAnomaly,
} from "@/hooks/useGdpr";
import { formatDistanceToNow } from "date-fns";
import { useMemo, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

const AdminSecurity = () => {
  const { isMasterAdmin } = useAuth();
  const { toast } = useToast();
  const { data: activityLog, isLoading } = useActivityLog();
  const { data: anomalies, isLoading: anomaliesLoading } = useAccessAnomalies();
  const { data: erasureLedger, isLoading: ledgerLoading } = useErasureLedger();
  const resolveAnomaly = useResolveAccessAnomaly();
  const processRetention = useProcessExpiredRetention();
  const applyErasure = useApplyErasureLedger();
  const [search, setSearch] = useState("");

  const filteredLogs = useMemo(() => {
    const q = search.toLowerCase();
    return (activityLog ?? []).filter((log) => {
      const actor = log.profiles as { full_name: string | null } | null;
      return (
        log.action.toLowerCase().includes(q) ||
        (actor?.full_name?.toLowerCase().includes(q) ?? false) ||
        log.entity_type.toLowerCase().includes(q)
      );
    });
  }, [activityLog, search]);

  const recentDeletes = useMemo(
    () =>
      (activityLog ?? [])
        .filter((log) => log.action === "candidate.delete")
        .slice(0, 20),
    [activityLog],
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Deletions &amp; security</h1>
        <p className="text-muted-foreground">
          See who was deleted, handle backup restores, and review access activity
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="space-y-2 max-w-2xl">
              <CardTitle className="flex items-center gap-2 text-base font-medium">
                <Trash2 className="h-5 w-5" />
                Candidate deletions
              </CardTitle>
              <div className="text-sm text-muted-foreground space-y-2">
                <p>
                  <strong className="text-foreground">When you delete a candidate:</strong> they are
                  removed from the live platform immediately (profile, applications, documents, login).
                </p>
                <p>
                  <strong className="text-foreground">About backups:</strong> the system keeps short
                  emergency copies of the database for about 30 days. We cannot erase one person from
                  inside those copies. Instead we keep this deletion list, and if a backup is ever
                  restored, you click the button below so deleted people stay deleted.
                </p>
                <p>
                  <strong className="text-foreground">After 30 days:</strong> each row below is removed
                  automatically when the backup window ends (also when this page loads or the retention
                  job runs).
                </p>
              </div>
            </div>
            {isMasterAdmin && (
              <Button
                size="sm"
                variant="outline"
                disabled={applyErasure.isPending}
                onClick={async () => {
                  try {
                    const result = await applyErasure.mutateAsync();
                    toast({
                      title: "Backup restore check complete",
                      description: `Removed again: ${result.deleted}. Already gone: ${result.alreadyGone}. Cleared expired list rows: ${result.purged}.`,
                    });
                  } catch (err) {
                    toast({
                      title: "Could not re-apply deletions",
                      description: err instanceof Error ? err.message : "Try again",
                      variant: "destructive",
                    });
                  }
                }}
              >
                {applyErasure.isPending ? (
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                ) : null}
                After a backup restore: keep deletions
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {!isMasterAdmin ? (
            <p className="text-sm text-muted-foreground">Only a master admin can manage deletions.</p>
          ) : (
            <>
              <div>
                <h3 className="text-sm font-medium mb-2">People on the deletion list (backup window)</h3>
                {ledgerLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : (erasureLedger ?? []).length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No one is currently on the 30-day deletion list.
                  </p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Deleted</TableHead>
                        <TableHead>List ends</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(erasureLedger ?? []).map((entry) => (
                        <TableRow key={entry.path}>
                          <TableCell className="font-medium text-sm">
                            {entry.full_name ?? "Candidate"}
                          </TableCell>
                          <TableCell className="text-sm">{entry.email ?? "n/a"}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {entry.erased_at
                              ? formatDistanceToNow(new Date(entry.erased_at), { addSuffix: true })
                              : "n/a"}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {entry.backup_expires_at ?? "n/a"}
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">
                              {entry.status === "active_window"
                                ? "Within 30-day window"
                                : "Expired (will clear)"}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </div>

              <div>
                <h3 className="text-sm font-medium mb-2">Recent delete actions (activity log)</h3>
                {isLoading ? (
                  <div className="flex justify-center py-6">
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  </div>
                ) : recentDeletes.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No candidate deletions logged yet.</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Action</TableHead>
                        <TableHead>Deleted by</TableHead>
                        <TableHead>When</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {recentDeletes.map((log) => {
                        const actor = log.profiles as { full_name: string | null } | null;
                        return (
                          <TableRow key={log.id}>
                            <TableCell className="font-medium text-sm">Candidate deleted</TableCell>
                            <TableCell className="text-sm">{actor?.full_name ?? "System"}</TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base font-medium">
            <Shield className="h-5 w-5" />
            Auth &amp; access
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-1">
          <p>Admin accounts are invite-only. Password policy and 2FA are managed in Supabase → Authentication.</p>
          <p>Row Level Security is enabled on platform tables.</p>
          <p>GDPR retention runs daily at 03:00 UTC via pg_cron (job: gdpr-retention-daily).</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Access anomalies
            </CardTitle>
            {isMasterAdmin && (
              <Button
                size="sm"
                variant="outline"
                disabled={processRetention.isPending}
                onClick={async () => {
                  try {
                    const result = await processRetention.mutateAsync();
                    toast({
                      title: "Retention job complete",
                      description: `Deleted ${result.deleted}, anonymised ${result.anonymized}. Cleared expired deletion-list rows: ${result.purgedLedger}.`,
                    });
                  } catch (err) {
                    toast({
                      title: "Retention job failed",
                      description: err instanceof Error ? err.message : "Try again",
                      variant: "destructive",
                    });
                  }
                }}
              >
                Run retention job
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {anomaliesLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : (anomalies ?? []).length === 0 ? (
            <p className="text-sm text-muted-foreground">No unresolved access anomalies.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead>When</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {(anomalies ?? []).map((flag) => {
                  const actor = flag.profiles as { full_name: string | null; email: string | null } | null;
                  return (
                    <TableRow key={flag.id}>
                      <TableCell className="font-medium">{flag.anomaly_type.replace(/_/g, " ")}</TableCell>
                      <TableCell>{actor?.full_name ?? actor?.email ?? "n/a"}</TableCell>
                      <TableCell className="text-xs text-muted-foreground max-w-xs truncate">
                        {JSON.stringify(flag.details)}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(flag.created_at), { addSuffix: true })}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="ghost"
                          disabled={resolveAnomaly.isPending}
                          onClick={() => resolveAnomaly.mutate(flag.id)}
                        >
                          Resolve
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <CardTitle>Audit log</CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search logs..."
                className="pl-9 w-64"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredLogs.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No activity logged yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Action</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Entity</TableHead>
                  <TableHead>When</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.map((log) => {
                  const actor = log.profiles as { full_name: string | null } | null;
                  return (
                    <TableRow key={log.id}>
                      <TableCell className="font-medium">{log.action.replace(/_/g, " ")}</TableCell>
                      <TableCell>{actor?.full_name ?? "System"}</TableCell>
                      <TableCell>{log.entity_type}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-muted-foreground text-sm">
                          <Clock className="w-4 h-4" />
                          {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSecurity;
