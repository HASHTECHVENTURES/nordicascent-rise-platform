import { useParams, Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, AlertTriangle, CheckCircle, Send, UserCheck, Loader2 } from "lucide-react";
import { TRACK_META, type Track } from "@/lib/track";
import { useCandidateById, useUpdateCandidateTrack, useUpdateCandidateStatus, useCreateIssue, useAdvanceCandidateStage, useCandidateStageProgress, useCandidateTaskProgress, useStageTasks, useAdminMarkTaskComplete, useAdminCandidateJourneyBrief, useUnlockCandidateJobs } from "@/hooks/useData";
import { useToast } from "@/hooks/use-toast";
import { adminJourneyStageLabel } from "@/lib/adminJourney";

const AdminCandidateDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: candidate, isLoading } = useCandidateById(id);
  const { data: journeyMap } = useAdminCandidateJourneyBrief();
  const unlockJobs = useUnlockCandidateJobs();
  const updateTrack = useUpdateCandidateTrack();
  const updateStatus = useUpdateCandidateStatus();
  const createIssue = useCreateIssue();
  const advanceStage = useAdvanceCandidateStage();
  const { toast } = useToast();
  const { data: stageProgress } = useCandidateStageProgress(id);
  const { data: taskProgress } = useCandidateTaskProgress(id);
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
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
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
                    toast({ title: "Jobs unlocked" });
                  } catch (err) {
                    toast({
                      title: "Failed",
                      description: err instanceof Error ? err.message : "Try again",
                      variant: "destructive",
                    });
                  }
                }}
              >
                Unlock jobs
              </Button>
            )}
          </div>
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
    </div>
  );
};

export default AdminCandidateDetail;
