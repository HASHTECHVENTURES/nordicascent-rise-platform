import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, ExternalLink, Loader2, Plus, Video, Users, CalendarDays } from "lucide-react";
import {
  useAdminMentoringPipeline,
  useAdminMentoringSessions,
  useAdminMentors,
  useCreateMentoringSession,
  useUnlockCandidateJobs,
  useUpdateMentoringSession,
} from "@/hooks/useData";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";

export default function AdminMentoring() {
  const { profile } = useAuth();
  const { data: sessions, isLoading } = useAdminMentoringSessions();
  const { data: pipeline, isLoading: pipelineLoading } = useAdminMentoringPipeline();
  const { data: mentors } = useAdminMentors();
  const createSession = useCreateMentoringSession();
  const updateSession = useUpdateMentoringSession();
  const unlockJobs = useUnlockCandidateJobs();
  const { toast } = useToast();

  const [candidateId, setCandidateId] = useState("");
  const [mentorId, setMentorId] = useState(profile?.id ?? "");
  const [title, setTitle] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [meetingUrl, setMeetingUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [duration, setDuration] = useState("60");
  const [tab, setTab] = useState("pipeline");

  const pipelineOptions = useMemo(() => pipeline ?? [], [pipeline]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!candidateId || !mentorId || !title || !scheduledAt) return;
    try {
      await createSession.mutateAsync({
        candidate_id: candidateId,
        mentor_id: mentorId,
        title,
        scheduled_at: new Date(scheduledAt).toISOString(),
        meeting_url: meetingUrl || undefined,
        notes: notes || undefined,
        duration_minutes: Number(duration) || 60,
      });
      toast({ title: "Session scheduled" });
      setTitle("");
      setScheduledAt("");
      setMeetingUrl("");
      setNotes("");
      setCandidateId("");
    } catch (err) {
      toast({
        title: "Failed",
        description: err instanceof Error ? err.message : "Try again",
        variant: "destructive",
      });
    }
  };

  const list = sessions ?? [];

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-medium">Mentoring</h1>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="pipeline" className="gap-2">
            <Users className="h-4 w-4" />
            Pipeline
          </TabsTrigger>
          <TabsTrigger value="schedule" className="gap-2">
            <Plus className="h-4 w-4" />
            Schedule
          </TabsTrigger>
          <TabsTrigger value="sessions" className="gap-2">
            <CalendarDays className="h-4 w-4" />
            Sessions ({list.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pipeline" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">After Readiness — unlock jobs here</CardTitle>
            </CardHeader>
            <CardContent>
              {pipelineLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : pipelineOptions.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4">No candidates have completed Readiness yet.</p>
              ) : (
                <div className="rounded-lg border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Candidate</TableHead>
                        <TableHead>Readiness</TableHead>
                        <TableHead>Sessions</TableHead>
                        <TableHead>Jobs</TableHead>
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
                          <TableCell className="text-sm">{row.sessionCount}</TableCell>
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
                                    toast({ title: "Jobs unlocked", description: row.fullName });
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
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setCandidateId(row.id);
                                setTab("schedule");
                              }}
                            >
                              Schedule
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
        </TabsContent>

        <TabsContent value="schedule" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Schedule session</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl">
                <div className="space-y-2 md:col-span-2">
                  <Label>Candidate</Label>
                  <Select value={candidateId} onValueChange={setCandidateId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select candidate (Readiness complete)" />
                    </SelectTrigger>
                    <SelectContent>
                      {pipelineOptions.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.fullName} · {c.email}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Mentor</Label>
                  <Select value={mentorId} onValueChange={setMentorId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select mentor" />
                    </SelectTrigger>
                    <SelectContent>
                      {(mentors ?? []).map((m) => (
                        <SelectItem key={m.id} value={m.id}>
                          {m.full_name ?? m.email ?? "Admin"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input value={title} onChange={(e) => setTitle(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label>Date & time</Label>
                  <Input
                    type="datetime-local"
                    value={scheduledAt}
                    onChange={(e) => setScheduledAt(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Duration (min)</Label>
                  <Input type="number" min={15} step={15} value={duration} onChange={(e) => setDuration(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Meeting URL</Label>
                  <Input value={meetingUrl} onChange={(e) => setMeetingUrl(e.target.value)} placeholder="https://..." />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Notes (optional)</Label>
                  <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
                </div>
                <Button type="submit" className="md:col-span-2 gap-2" disabled={createSession.isPending}>
                  {createSession.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                  Schedule
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sessions" className="mt-6">
          <Card>
            <CardContent className="pt-6 space-y-3">
              {list.length === 0 && (
                <p className="text-sm text-muted-foreground py-4">No sessions yet.</p>
              )}
              {list.map((s) => {
                const cand = s.candidate as {
                  id: string;
                  profiles: { full_name: string | null; email: string | null } | null;
                } | null;
                const mentor = s.mentor as { full_name: string | null } | null;
                const candName = cand?.profiles?.full_name ?? cand?.profiles?.email ?? "Candidate";
                return (
                  <div key={s.id} className="flex flex-wrap items-start justify-between gap-4 p-4 border rounded-lg">
                    <div className="space-y-1 min-w-0">
                      <p className="font-medium text-sm">{s.title}</p>
                      <p className="text-sm text-muted-foreground">
                        <Link to={`/admin/candidates/${s.candidate_id}`} className="text-primary hover:underline">
                          {candName}
                        </Link>
                        {" · "}
                        {mentor?.full_name ?? "—"}
                      </p>
                      <p className="text-sm text-muted-foreground flex items-center gap-2">
                        <Calendar className="h-4 w-4 shrink-0" />
                        {format(new Date(s.scheduled_at), "PPp")}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      {s.meeting_url && (
                        <Button size="sm" variant="outline" asChild>
                          <a href={s.meeting_url} target="_blank" rel="noopener noreferrer">
                            <Video className="h-4 w-4 mr-1" />
                            Link
                            <ExternalLink className="h-3 w-3 ml-1" />
                          </a>
                        </Button>
                      )}
                      <Badge variant={s.status === "completed" ? "secondary" : "default"}>{s.status}</Badge>
                      {s.status === "scheduled" && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={updateSession.isPending}
                            onClick={() => updateSession.mutateAsync({ id: s.id, status: "completed" })}
                          >
                            Complete
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            disabled={updateSession.isPending}
                            onClick={() => updateSession.mutateAsync({ id: s.id, status: "cancelled" })}
                          >
                            Cancel
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
