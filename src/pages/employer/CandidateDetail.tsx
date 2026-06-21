import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  ArrowLeft,
  MessageSquare,
  Loader2,
  CheckCircle,
  XCircle,
  Video,
  Send,
  FileText,
  Download,
  ExternalLink,
  Circle,
  CheckCircle2,
} from "lucide-react";
import { useEmployerApplicantCandidate, useUpdateApplication, useSendInterviewInvite } from "@/hooks/useData";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { applicationStatusVariant, employerApplicationStatusLabel } from "@/lib/applicationJourney";
import { resolveProfile } from "@/lib/resolveProfile";
import { getSupabaseErrorMessage } from "@/lib/supabaseError";
import { cn } from "@/lib/utils";

type AppStatus = "applied" | "reviewing" | "interview" | "accepted" | "rejected";

type AppRecord = {
  id: string;
  status: string;
  stage_id: string | null;
  interview_meet_url?: string | null;
  interview_scheduled_at?: string | null;
  interview_notes?: string | null;
  jobs: { title: string; companies?: { name: string } | null };
};

function StepRow({
  done,
  active,
  title,
  children,
}: {
  done: boolean;
  active: boolean;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("flex gap-3", !active && !done && "opacity-50")}>
      <div className="pt-0.5 shrink-0">
        {done ? (
          <CheckCircle2 className="h-5 w-5 text-success" />
        ) : active ? (
          <Circle className="h-5 w-5 text-primary fill-primary/10" />
        ) : (
          <Circle className="h-5 w-5 text-muted-foreground/40" />
        )}
      </div>
      <div className="flex-1 space-y-3 min-w-0">
        <p className="font-medium text-sm">{title}</p>
        {children}
      </div>
    </div>
  );
}

export default function EmployerCandidateDetail() {
  const { candidateId } = useParams();
  const navigate = useNavigate();
  const { data: candidate, isLoading } = useEmployerApplicantCandidate(candidateId);
  const updateApp = useUpdateApplication();
  const sendInvite = useSendInterviewInvite();
  const { toast } = useToast();
  const [status, setStatus] = useState<AppStatus>("applied");
  const [meetUrl, setMeetUrl] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [interviewNotes, setInterviewNotes] = useState("");
  const [cvLoading, setCvLoading] = useState(false);

  const cvFileName = candidate?.cv_url?.split("/").pop()?.replace(/^\d+-/, "") ?? null;

  const openCv = async (download = false) => {
    if (!candidate?.cv_url) return;
    setCvLoading(true);
    try {
      const { data, error } = await supabase.storage
        .from("documents")
        .createSignedUrl(candidate.cv_url, 3600);
      if (error) throw error;
      if (download) {
        const link = document.createElement("a");
        link.href = data.signedUrl;
        link.download = cvFileName ?? "resume";
        link.rel = "noopener";
        link.click();
      } else {
        window.open(data.signedUrl, "_blank", "noopener,noreferrer");
      }
    } catch (err) {
      toast({
        title: download ? "Download failed" : "Could not open resume",
        description: getSupabaseErrorMessage(err, "Could not open resume"),
        variant: "destructive",
      });
    } finally {
      setCvLoading(false);
    }
  };

  const applications = (candidate?.applications ?? []) as AppRecord[];
  const app = applications[0];

  useEffect(() => {
    if (app?.status) {
      setStatus(app.status as AppStatus);
    }
  }, [app?.id, app?.status]);

  useEffect(() => {
    if (!app) return;
    setMeetUrl(app.interview_meet_url ?? "");
    setInterviewNotes(app.interview_notes ?? "");
    if (app.interview_scheduled_at) {
      const d = new Date(app.interview_scheduled_at);
      const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
      setScheduledAt(local.toISOString().slice(0, 16));
    }
  }, [app?.id, app?.interview_meet_url, app?.interview_scheduled_at, app?.interview_notes]);

  const setApplicationStatus = async (next: AppStatus, label: string) => {
    if (!app) return;
    const previous = status;
    setStatus(next);
    try {
      await updateApp.mutateAsync({ id: app.id, status: next });
      toast({ title: label });
    } catch (err) {
      setStatus(previous);
      toast({ title: "Failed", description: getSupabaseErrorMessage(err), variant: "destructive" });
    }
  };

  const handleSendInterview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!app || !candidate) return;
    if (!meetUrl.trim() || !scheduledAt) {
      toast({ title: "Missing details", description: "Add date/time and Google Meet link.", variant: "destructive" });
      return;
    }
    const companyName = app.jobs.companies?.name ?? "Your company";
    try {
      const result = await sendInvite.mutateAsync({
        applicationId: app.id,
        candidateProfileId: candidate.profile_id,
        candidateId: candidate.id,
        jobTitle: app.jobs.title,
        companyName,
        meetUrl: meetUrl.trim(),
        scheduledAt: new Date(scheduledAt).toISOString(),
        notes: interviewNotes.trim() || undefined,
        previousStatus: app.status,
      });
      setStatus("interview");
      toast({
        title: "Interview invite sent",
        description: `Scheduled for ${result.when}`,
      });
    } catch (err) {
      toast({
        title: "Failed to send invite",
        description: getSupabaseErrorMessage(err),
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
    return (
      <div className="space-y-4">
        <Button variant="ghost" size="icon" asChild><Link to="/employer/candidates"><ArrowLeft className="h-4 w-4" /></Link></Button>
        <p className="text-muted-foreground">Candidate not found or not in your pipeline.</p>
      </div>
    );
  }

  const profile = resolveProfile(candidate.profiles as {
    full_name: string | null;
    email: string | null;
    phone: string | null;
    avatar_url: string | null;
  } | {
    full_name: string | null;
    email: string | null;
    phone: string | null;
    avatar_url: string | null;
  }[] | null);
  const name = candidate.full_name ?? profile?.full_name ?? "Candidate";
  const avatarUrl = candidate.avatar_url ?? profile?.avatar_url ?? undefined;
  const isFinal = status === "accepted" || status === "rejected";
  const reviewDone = ["reviewing", "interview", "offer", "accepted"].includes(status);
  const interviewDone = !!app?.interview_meet_url;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <Button variant="ghost" size="icon" asChild><Link to="/employer/candidates"><ArrowLeft className="h-4 w-4" /></Link></Button>
          <Avatar className="h-14 w-14 shrink-0">
            <AvatarImage src={avatarUrl} />
            <AvatarFallback>{name.slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <h1 className="text-2xl font-bold truncate">{name}</h1>
            <p className="text-muted-foreground truncate">{profile?.email}</p>
            {app && (
              <p className="text-sm text-muted-foreground mt-0.5 truncate">
                Applied for <span className="text-foreground font-medium">{app.jobs.title}</span>
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0 sm:ml-auto">
          {app && (
            <Badge variant={applicationStatusVariant(status)} className="text-sm px-3 py-1">
              {status === "interview" && !app.interview_meet_url
                ? "Under review"
                : employerApplicationStatusLabel(status)}
            </Badge>
          )}
          <Button
            className="gap-2 bg-nordic-orange hover:bg-nordic-orange/90 text-white"
            onClick={() =>
              navigate("/employer/messages", { state: { startWithProfileId: candidate.profile_id } })
            }
          >
            <MessageSquare className="h-4 w-4" />Message
          </Button>
        </div>
      </div>

      {status === "accepted" && app && (
        <Card className="border-success/30 bg-success/5">
          <CardContent className="pt-6 flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
            <div>
              <p className="font-medium flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-success" />
                You accepted this candidate
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                They can continue in the Nordic Ascent program from Selection stage.
              </p>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link to="/employer/candidates?stage=selection">View in Selection</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {status === "rejected" && (
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="pt-6">
            <p className="font-medium flex items-center gap-2">
              <XCircle className="h-4 w-4 text-destructive" />
              Application declined
            </p>
          </CardContent>
        </Card>
      )}

      {app && !isFinal && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">What to do next</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <StepRow done={reviewDone} active={status === "applied" || reviewDone} title="1. Review their profile and resume">
              <div className="space-y-3">
                {candidate.cv_url ? (
                  <div className="flex flex-wrap items-center gap-2 p-3 rounded-lg border bg-muted/30">
                    <FileText className="h-4 w-4 text-primary shrink-0" />
                    <span className="text-sm flex-1 min-w-0 truncate">{cvFileName ?? "Resume"}</span>
                    <Button variant="outline" size="sm" onClick={() => openCv(false)} disabled={cvLoading} className="gap-1">
                      {cvLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ExternalLink className="h-3.5 w-3.5" />}
                      View
                    </Button>
                    <Button size="sm" onClick={() => openCv(true)} disabled={cvLoading} className="gap-1">
                      {cvLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
                      Download
                    </Button>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No resume uploaded yet.</p>
                )}
                {status === "applied" ? (
                  <Button
                    onClick={() => setApplicationStatus("reviewing", "Marked as under review")}
                    disabled={updateApp.isPending}
                  >
                    Start review
                  </Button>
                ) : (
                  <p className="text-sm text-muted-foreground">Review in progress.</p>
                )}
              </div>
            </StepRow>

            <StepRow
              done={interviewDone}
              active={reviewDone}
              title="2. Schedule an interview"
            >
              {reviewDone ? (
                <form onSubmit={handleSendInterview} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Date & time</Label>
                      <Input
                        type="datetime-local"
                        value={scheduledAt}
                        onChange={(e) => setScheduledAt(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label>Google Meet link</Label>
                      <Input
                        value={meetUrl}
                        onChange={(e) => setMeetUrl(e.target.value)}
                        placeholder="https://meet.google.com/abc-defg-hij"
                        required
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label>Notes for candidate (optional)</Label>
                      <Textarea
                        rows={2}
                        value={interviewNotes}
                        onChange={(e) => setInterviewNotes(e.target.value)}
                        placeholder="What to prepare, who will join, etc."
                      />
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <Button type="submit" disabled={sendInvite.isPending} className="gap-2">
                      {sendInvite.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                      {app.interview_meet_url ? "Update invite" : "Send interview invite"}
                    </Button>
                    {app.interview_meet_url && app.interview_scheduled_at && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Video className="h-3.5 w-3.5" />
                        Last sent for {new Date(app.interview_scheduled_at).toLocaleString()}
                      </p>
                    )}
                  </div>
                </form>
              ) : (
                <p className="text-sm text-muted-foreground">Available after you start review.</p>
              )}
            </StepRow>

            <StepRow done={false} active={reviewDone} title="3. Make your decision">
              {reviewDone ? (
                <div className="flex flex-wrap gap-2">
                  <Button
                    className="gap-2 bg-success hover:bg-success/90 text-success-foreground"
                    onClick={() => setApplicationStatus("accepted", "Candidate accepted")}
                    disabled={updateApp.isPending}
                  >
                    <CheckCircle className="h-4 w-4" />
                    Accept candidate
                  </Button>
                  <Button
                    variant="outline"
                    className="gap-2 border-destructive text-destructive hover:bg-destructive/10"
                    onClick={() => setApplicationStatus("rejected", "Application declined")}
                    disabled={updateApp.isPending}
                  >
                    <XCircle className="h-4 w-4" />
                    Decline
                  </Button>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Available after you start review.</p>
              )}
            </StepRow>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-base">Profile</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p><span className="text-muted-foreground">Title </span>{candidate.title ?? "—"}</p>
            {profile?.phone && (
              <p><span className="text-muted-foreground">Phone </span>{profile.phone}</p>
            )}
            <p><span className="text-muted-foreground">Location </span>{candidate.location ?? "—"}</p>
            <p><span className="text-muted-foreground">Experience </span>{candidate.experience ?? "—"}</p>
            <p><span className="text-muted-foreground">Education </span>{candidate.education ?? "—"}</p>
            <div className="flex flex-wrap gap-1 pt-2">
              {(candidate.skills ?? []).map((s) => <Badge key={s} variant="secondary">{s}</Badge>)}
            </div>
          </CardContent>
        </Card>
        {candidate.bio && (
          <Card>
            <CardHeader><CardTitle className="text-base">Bio</CardTitle></CardHeader>
            <CardContent><p className="text-sm text-muted-foreground">{candidate.bio}</p></CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
