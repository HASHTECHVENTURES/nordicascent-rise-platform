import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, UserCircle, ChevronRight } from "lucide-react";
import { useCompanyMentors, useCreateCompanyMentor } from "@/hooks/useData";
import { useEmployerMentoringApplications } from "@/hooks/useSelection";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { resolveProfile } from "@/lib/resolveProfile";
import { TRACK_META, type Track } from "@/lib/track";
import { mentorMeetingCountForTrack } from "@/lib/mentorProgram";

const EmployerMentoring = () => {
  const { data: mentors, isLoading: mentorsLoading } = useCompanyMentors();
  const { data: mentoringApps, isLoading: appsLoading } = useEmployerMentoringApplications();
  const createMentor = useCreateCompanyMentor();
  const { toast } = useToast();
  const [mentorName, setMentorName] = useState("");
  const [mentorRole, setMentorRole] = useState("");
  const [mentorEmail, setMentorEmail] = useState("");
  const [mentorPhone, setMentorPhone] = useState("");

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

  if (mentorsLoading) {
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
        <p className="text-muted-foreground">
          Standard 3+3 programme — six fixed sessions per candidate (Entry track) or three (Fast track).
          Complete mentor observations here. Optional add-on topics allowed — no custom meetings.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Active mentor programmes</CardTitle>
        </CardHeader>
        <CardContent>
          {appsLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : (mentoringApps ?? []).length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No active programmes yet. Assign a mentor in Selection to start the 3+3 meetings.
            </p>
          ) : (
            <div className="space-y-2">
              {(mentoringApps ?? []).map((app) => {
                const profile = resolveProfile(app.candidates?.profiles);
                const track =
                  (app.track as Track | null) ??
                  ((app.candidates as { track?: Track } | null)?.track ?? "entry");
                return (
                  <Link
                    key={app.id}
                    to={`/employer/mentoring/${app.id}`}
                    className="flex items-center justify-between gap-3 p-3 rounded-lg border hover:bg-muted/50"
                  >
                    <div className="min-w-0">
                      <p className="font-medium truncate">{profile?.full_name ?? "Candidate"}</p>
                      <p className="text-xs text-muted-foreground">
                        {app.jobs?.title} · {mentorMeetingCountForTrack(track)} meetings
                      </p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                  </Link>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

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
              <Label>Email</Label>
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
    </div>
  );
};

export default EmployerMentoring;
