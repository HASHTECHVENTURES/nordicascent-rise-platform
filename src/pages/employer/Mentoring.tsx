import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Calendar, Loader2, Plus, UserCircle } from "lucide-react";
import { useEmployerApplications, useCreateMentoringSession, useMentoringSessions, useCompanyMentors, useCreateCompanyMentor } from "@/hooks/useData";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const EmployerMentoring = () => {
  const { data: sessions, isLoading } = useMentoringSessions();
  const { data: mentors, isLoading: mentorsLoading } = useCompanyMentors();
  const { data: applications } = useEmployerApplications();
  const createSession = useCreateMentoringSession();
  const createMentor = useCreateCompanyMentor();
  const { toast } = useToast();
  const [candidateId, setCandidateId] = useState("");
  const [title, setTitle] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [meetingUrl, setMeetingUrl] = useState("");
  const [mentorName, setMentorName] = useState("");
  const [mentorRole, setMentorRole] = useState("");
  const [mentorEmail, setMentorEmail] = useState("");
  const [mentorPhone, setMentorPhone] = useState("");

  const candidates = (applications ?? []).map((a) => {
    const c = a.candidates as { id: string; profiles: { full_name: string | null } | null };
    return { id: c.id, name: c.profiles?.full_name ?? "Candidate" };
  });
  const uniqueCandidates = [...new Map(candidates.map((c) => [c.id, c])).values()];

  const handleCreateMentor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mentorName.trim() || !mentorEmail.trim()) return;
    try {
      await createMentor.mutateAsync({
        name: mentorName,
        role_title: mentorRole,
        email: mentorEmail,
        phone: mentorPhone,
      });
      toast({ title: "Mentor added" });
      setMentorName("");
      setMentorRole("");
      setMentorEmail("");
      setMentorPhone("");
    } catch (err) {
      toast({ title: "Failed", description: err instanceof Error ? err.message : "Try again", variant: "destructive" });
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!candidateId || !title || !scheduledAt) return;
    try {
      await createSession.mutateAsync({
        candidate_id: candidateId,
        title,
        scheduled_at: new Date(scheduledAt).toISOString(),
        meeting_url: meetingUrl || undefined,
      });
      toast({ title: "Session scheduled" });
      setTitle("");
      setScheduledAt("");
      setMeetingUrl("");
    } catch (err) {
      toast({ title: "Failed", description: err instanceof Error ? err.message : "Try again", variant: "destructive" });
    }
  };

  const list = sessions ?? [];

  if (isLoading || mentorsLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-medium">Mentoring</h1>
        <p className="text-muted-foreground">Add mentors and schedule sessions with candidates</p>
      </div>

      <Card>
        <CardHeader><CardTitle>Add mentor</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleCreateMentor} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input value={mentorName} onChange={(e) => setMentorName(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label>Role title</Label>
              <Input value={mentorRole} onChange={(e) => setMentorRole(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Email (login ID)</Label>
              <Input type="email" value={mentorEmail} onChange={(e) => setMentorEmail(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input value={mentorPhone} onChange={(e) => setMentorPhone(e.target.value)} />
            </div>
            <Button type="submit" className="md:col-span-2 gap-2" disabled={createMentor.isPending}>
              <Plus className="h-4 w-4" />Add mentor
            </Button>
          </form>
          {(mentors ?? []).length > 0 && (
            <div className="mt-6 space-y-2">
              <p className="text-sm font-medium">Company mentors</p>
              {(mentors ?? []).map((m) => (
                <div key={m.id} className="flex items-center justify-between rounded-lg border p-3 text-sm">
                  <div className="flex items-center gap-3">
                    <UserCircle className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{m.name}</p>
                      <p className="text-muted-foreground">{m.role_title ?? "Mentor"} · {m.email}</p>
                    </div>
                  </div>
                  <Badge variant={m.status === "active" ? "secondary" : "outline"}>{m.status}</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Schedule session</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Candidate</Label>
              <Select value={candidateId} onValueChange={setCandidateId}>
                <SelectTrigger><SelectValue placeholder="Select candidate" /></SelectTrigger>
                <SelectContent>
                  {uniqueCandidates.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
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
              <Input type="datetime-local" value={scheduledAt} onChange={(e) => setScheduledAt(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label>Meeting URL</Label>
              <Input value={meetingUrl} onChange={(e) => setMeetingUrl(e.target.value)} placeholder="https://..." />
            </div>
            <Button type="submit" className="md:col-span-2 gap-2" disabled={createSession.isPending}>
              <Plus className="h-4 w-4" />Schedule
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Sessions</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {list.length === 0 && (
            <p className="text-sm text-muted-foreground py-4">No mentoring sessions scheduled yet.</p>
          )}
          {list.map((s) => (
            <div key={s.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="font-medium">{s.title}</p>
                <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                  <Calendar className="h-4 w-4" />{format(new Date(s.scheduled_at), "PPp")}
                </p>
              </div>
              <Badge>{s.status}</Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default EmployerMentoring;
