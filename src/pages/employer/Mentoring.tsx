import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, UserCircle, ClipboardList } from "lucide-react";
import { useCompanyMentors, useCreateCompanyMentor } from "@/hooks/useData";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

const EmployerMentoring = () => {
  const { data: mentors, isLoading: mentorsLoading } = useCompanyMentors();
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
          Standard 3+3 mentor programme — six fixed sessions per candidate. Mentors complete observations
          in Selection; they can add optional topics to each session but cannot create custom meetings.
        </p>
      </div>

      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="pt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="font-medium">Complete mentor meetings in Selection</p>
            <p className="text-sm text-muted-foreground mt-1">
              Open a candidate&apos;s application to record the six standard sessions, signal note, and activation note.
            </p>
          </div>
          <Button asChild className="shrink-0 gap-2">
            <Link to="/employer/candidates">
              <ClipboardList className="h-4 w-4" />
              Go to candidates
            </Link>
          </Button>
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
