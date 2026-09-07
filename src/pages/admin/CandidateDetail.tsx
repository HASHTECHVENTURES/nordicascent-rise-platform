import { useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, AlertTriangle, CheckCircle, Send, UserCheck, Loader2, Download, Pencil, Shield, History, NotebookPen } from "lucide-react";
import { TRACK_META, type Track } from "@/lib/track";
import { useCandidateById, useUpdateCandidateTrack, useUpdateCandidateStatus, useCreateIssue, useAdvanceCandidateStage, useCandidateStageProgress, useCandidateTaskProgress, useStageTasks, useAdminMarkTaskComplete, useAdminCandidateJourneyBrief, useUnlockCandidateJobs, useDeleteCandidate, useCandidateStatusHistory, useCandidateInternalNotes } from "@/hooks/useData";
import { useExportCandidate, useLogCandidateAccess, useUpdateRetentionDate } from "@/hooks/useGdpr";
import { suggestRetentionDate } from "@/lib/gdpr";
import { useToast } from "@/hooks/use-toast";
import { adminJourneyStageLabel } from "@/lib/adminJourney";
import AdminDeleteButton from "@/components/admin/AdminDeleteButton";
import { PageSpinner } from "@/components/ui/PageSpinner";
import { useAuth } from "@/contexts/AuthContext";

const AdminCandidateDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isMasterAdmin } = useAuth();
  const { data: candidate, isLoading } = useCandidateById(id);
  const { data: journeyMap } = useAdminCandidateJourneyBrief();
  const unlockJobs = useUnlockCandidateJobs();
  const deleteCandidate = useDeleteCandidate();
  const exportCandidate = useExportCandidate();
  const logAccess = useLogCandidateAccess();
  const updateRetention = useUpdateRetentionDate();
  const updateTrack = useUpdateCandidateTrack();
  const updateStatus = useUpdateCandidateStatus();
  const createIssue = useCreateIssue();
  const advanceStage = useAdvanceCandidateStage();
  const { toast } = useToast();
  const { data: stageProgress } = useCandidateStageProgress(id);
  const { data: taskProgress } = useCandidateTaskProgress(id);
  const { data: statusHistory } = useCandidateStatusHistory(id);
  const { data: internalNotes } = useCandidateInternalNotes(id);
  const markTaskComplete = useAdminMarkTaskComplete();

  const activeStage = stageProgress?.find((s) => s.status === "active");
  const activeStageId = activeStage?.stage_id ?? "readiness";
  const { data: stageTasks } = useStageTasks(activeStageId);
  const completedTaskIds = new Set(taskProgress?.map((p) => p.task_id) ?? []);

  const profile = candidate?.profiles as {
    full_name: string | null;
    email: string | null;
    phone: string | null;
  } | null;

  const track = (candidate?.track ?? "entry") as Track;
  const journeyStage = id ? journeyMap?.get(id) : undefined;
  const retentionDate =
    (candidate as { retention_date?: string | null } | undefined)?.retention_date ??
    (candidate ? suggestRetentionDate(candidate.status) : "");

  useEffect(() => {
    if (id) logAccess.mutate(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- log once per candidate open
  }, [id]);

  const onTrackChange = async (v: string) => {
    if (!candidate) return;
    try {
      await updateTrack.mutateAsync({ id: candidate.id, track: v as Track });
      toast({ title: "Track updated", description: `Set to ${TRACK_META[v as Track].label}` });
    } catch (err) {
      toast({
        title: "Failed to update track",
        description: err instanceof Error ? err.message : "Try again",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return <PageSpinner />;
  }

  if (!candidate) {
    return <p className="text-muted-foreground">Candidate not found.</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/admin/candidates"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold tracking-tight">{profile?.full_name ?? "Candidate"}</h1>
            <Badge variant="outline" className="border-primary/40 text-primary">{TRACK_META[track].label}</Badge>
          </div>
          <p className="text-muted-foreground">{profile?.email} · {candidate.location ?? "—"}</p>
        </div>
        <AdminDeleteButton
          allowed={isMasterAdmin}
          label="Delete candidate"
          title={`Delete ${profile?.full_name ?? "candidate"}?`}
          description="Permanently removes this candidate from the live database and Platform storage, and records the erasure in the backup-window ledger (30 days). Immutable Supabase backups cannot be scrubbed per person; after any restore, re-apply erasures from Security."
          isPending={deleteCandidate.isPending}
          onConfirm={async () => {
            try {
              await deleteCandidate.mutateAsync(candidate.id);
              toast({
                title: "Candidate deleted",
                description: "Live data removed. Erasure recorded for the backup window.",
              });
              navigate("/admin/candidates");
            } catch (err) {
              toast({
                title: "Delete failed",
                description: err instanceof Error ? err.message : "Try again",
                variant: "destructive",
              });
            }
          }}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p><span className="text-muted-foreground">Title</span> {candidate.title ?? "—"}</p>
            <p><span className="text-muted-foreground">Status</span> <Badge>{candidate.status}</Badge></p>
            <p><span className="text-muted-foreground">Joined</span> {candidate.created_at.split("T")[0]}</p>
            <p><span className="text-muted-foreground">Readiness</span> {candidate.readiness_score}%</p>
            {candidate.linkedin_url && (
              <p>
                <span className="text-muted-foreground">LinkedIn</span>{" "}
                <a
                  href={candidate.linkedin_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  View profile
                </a>
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Track</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p className="text-muted-foreground">{TRACK_META[track].short}</p>
            <Select value={track} onValueChange={onTrackChange} disabled={updateTrack.isPending}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="entry">Entry Track</SelectItem>
                <SelectItem value="fast">Fast Track</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Stages in track: {TRACK_META[track].stages.length} of 8
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Journey</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm">
            Stage:{" "}
            <Badge variant="outline">
              {journeyStage ? adminJourneyStageLabel(journeyStage) : "—"}
            </Badge>
          </p>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline" asChild>
              <Link to="/admin/readiness">Readiness reviews</Link>
            </Button>
            <Button size="sm" variant="outline" asChild>
              <Link to="/admin/mentoring">Mentoring</Link>
            </Button>
            {journeyStage === "mentoring" && !candidate.jobs_unlocked && (
              <Button
                size="sm"
                disabled={unlockJobs.isPending}
                onClick={async () => {
                  try {
                    await unlockJobs.mutateAsync({ candidateId: candidate.id, unlock: true });
                    toast({ title: "Activation unlocked" });
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
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Shield className="h-4 w-4" />
            GDPR & data
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline" asChild>
              <Link to={`/admin/candidates/${candidate.id}/edit`}>
                <Pencil className="h-4 w-4 mr-1" />
                Correct details
              </Link>
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={exportCandidate.isPending}
              onClick={async () => {
                try {
                  const data = await exportCandidate.mutateAsync(candidate.id);
                  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = `candidate-export-${candidate.id}.json`;
                  a.click();
                  URL.revokeObjectURL(url);
                  toast({ title: "Export downloaded" });
                } catch (err) {
                  toast({
                    title: "Export failed",
                    description: err instanceof Error ? err.message : "Try again",
                    variant: "destructive",
                  });
                }
              }}
            >
              {exportCandidate.isPending ? (
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              ) : (
                <Download className="h-4 w-4 mr-1" />
              )}
              Export all data
            </Button>
          </div>
          <div className="grid gap-2 max-w-xs">
            <Label htmlFor="retention">Retention date</Label>
            <div className="flex gap-2">
              <Input
                id="retention"
                type="date"
                defaultValue={retentionDate}
                key={retentionDate}
                onBlur={async (e) => {
                  const val = e.target.value || null;
                  try {
                    await updateRetention.mutateAsync({ candidateId: candidate.id, retentionDate: val });
                    toast({ title: "Retention date saved" });
                  } catch (err) {
                    toast({
                      title: "Failed to save retention date",
                      description: err instanceof Error ? err.message : "Try again",
                      variant: "destructive",
                    });
                  }
                }}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Set from status; editable. Delete runs after this date via retention job.
            </p>
          </div>
          {isMasterAdmin && (
            <p className="text-xs text-muted-foreground">
              Delete removes live database records and Platform storage, and writes an erasure ledger
              entry (outside DB backups). After any Supabase backup restore within ~30 days, use
              Security → Re-apply erasures so resurrected rows are deleted again.
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Actions</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            disabled={updateStatus.isPending || candidate.status === "verified"}
            onClick={async () => {
              try {
                await updateStatus.mutateAsync({ id: candidate.id, status: "verified" });
                toast({ title: "Candidate marked verified" });
              } catch (err) {
                toast({
                  title: "Failed",
                  description: err instanceof Error ? err.message : "Try again",
                  variant: "destructive",
                });
              }
            }}
          >
            <CheckCircle className="h-4 w-4" />
            Mark verified
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            disabled={advanceStage.isPending}
            onClick={async () => {
              try {
                await advanceStage.mutateAsync(candidate.id);
                toast({ title: "Stage advanced" });
              } catch (err) {
                toast({ title: "Failed", description: err instanceof Error ? err.message : "Try again", variant: "destructive" });
              }
            }}
          >
            <UserCheck className="h-4 w-4" />
            Advance stage
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() =>
              navigate("/admin/messages", {
                state: { startWithProfileId: candidate.profile_id },
              })
            }
          >
            <Send className="h-4 w-4" />
            Send message
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-2 text-destructive"
            disabled={createIssue.isPending}
            onClick={async () => {
              try {
                await createIssue.mutateAsync({
                  title: `Review needed: ${profile?.full_name ?? "Candidate"}`,
                  description: `Flagged from candidate detail (${candidate.id})`,
                  candidate_id: candidate.id,
                  priority: "high",
                });
                toast({ title: "Issue flagged" });
              } catch (err) {
                toast({
                  title: "Failed to flag",
                  description: err instanceof Error ? err.message : "Try again",
                  variant: "destructive",
                });
              }
            }}
          >
            <AlertTriangle className="h-4 w-4" />
            Flag issue
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Stage tasks</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {(stageTasks ?? []).length === 0 && (
            <p className="text-sm text-muted-foreground">
              No tasks for this stage.{" "}
              <Link to="/admin/stage-tasks" className="text-primary underline">Create in Program Tasks</Link>
            </p>
          )}
          {(stageTasks ?? []).map((task) => {
            const done = completedTaskIds.has(task.id);
            return (
              <div key={task.id} className="flex items-center justify-between p-3 border rounded-lg text-sm">
                <div>
                  <p className={`font-medium ${done ? "line-through text-muted-foreground" : ""}`}>{task.title}</p>
                  <p className="text-xs text-muted-foreground">{task.description}</p>
                </div>
                {!done && (
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={markTaskComplete.isPending}
                    onClick={async () => {
                      try {
                        await markTaskComplete.mutateAsync({ candidateId: candidate.id, taskId: task.id });
                        toast({ title: "Marked complete" });
                      } catch (err) {
                        toast({
                          title: "Failed",
                          description: err instanceof Error ? err.message : "Try again",
                          variant: "destructive",
                        });
                      }
                    }}
                  >
                    Mark done
                  </Button>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <NotebookPen className="h-4 w-4" />
            Internal notes
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            All admin-only notes across selection, readiness, mentoring and follow-up. Hidden from candidates and employers.
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          {(internalNotes ?? []).length === 0 && (
            <p className="text-sm text-muted-foreground">No internal notes recorded yet.</p>
          )}
          {(internalNotes ?? []).map((n, i) => (
            <div key={`${n.stage}-${n.label}-${i}`} className="rounded-lg border p-3">
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="secondary" className="text-xs">{n.stage}</Badge>
                <span className="text-xs font-medium text-muted-foreground">{n.label}</span>
                {n.noted_at && (
                  <span className="text-xs text-muted-foreground ml-auto">
                    {new Date(n.noted_at).toLocaleDateString()}
                  </span>
                )}
              </div>
              <p className="text-sm whitespace-pre-wrap">{n.note}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <History className="h-4 w-4" />
            Status history
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {(statusHistory ?? []).length === 0 && (
            <p className="text-sm text-muted-foreground">No status changes recorded yet.</p>
          )}
          {(statusHistory ?? []).map((entry) => {
            const actor = entry.profiles?.full_name ?? "System";
            const when = new Date(entry.changed_at).toLocaleString();
            return (
              <div key={entry.id} className="flex items-start gap-3 text-sm">
                <div className="mt-1 h-2 w-2 rounded-full bg-primary shrink-0" />
                <div className="min-w-0">
                  <p className="font-medium">
                    {entry.from_status ? (
                      <>
                        {entry.from_status.replace(/_/g, " ")}
                        <span className="text-muted-foreground"> &rarr; </span>
                        {entry.to_status.replace(/_/g, " ")}
                      </>
                    ) : (
                      <>Initial status: {entry.to_status.replace(/_/g, " ")}</>
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {when} &middot; by {actor}
                  </p>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminCandidateDetail;
