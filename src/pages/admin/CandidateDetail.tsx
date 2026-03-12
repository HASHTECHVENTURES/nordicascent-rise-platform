import { useParams, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, AlertTriangle, CheckCircle, Send, UserCheck } from "lucide-react";

const mockCandidate = {
  id: 1,
  name: "Emma Lindqvist",
  email: "emma@email.com",
  location: "Stockholm, SE",
  role: "Engineer",
  status: "active",
  stage: "Readiness",
  joined: "2024-01-15",
  problems: [
    { id: 1, text: "Readiness incomplete for 14 days", severity: "high" },
    { id: 2, text: "Technical Assessment Module 3 not submitted", severity: "high" },
  ],
};

const AdminCandidateDetail = () => {
  const { id } = useParams();
  const c = mockCandidate;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/admin/candidates"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{c.name}</h1>
          <p className="text-muted-foreground">{c.email} · {c.location}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p><span className="text-muted-foreground">Role</span> {c.role}</p>
            <p><span className="text-muted-foreground">Status</span> <Badge>{c.status}</Badge></p>
            <p><span className="text-muted-foreground">Journey stage</span> {c.stage}</p>
            <p><span className="text-muted-foreground">Joined</span> {c.joined}</p>
          </CardContent>
        </Card>

        <Card className="border-warning/30">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-warning" />
              Problems
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              {c.problems.map((p) => (
                <li key={p.id} className="flex items-center gap-2">
                  <AlertTriangle className="h-3 w-3 text-warning flex-shrink-0" />
                  {p.text}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Fix actions</CardTitle>
          <p className="text-sm text-muted-foreground">Resolve issues from here</p>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button variant="outline" size="sm" className="gap-2">
            <CheckCircle className="h-4 w-4" />
            Mark Readiness complete
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
            <Send className="h-4 w-4" />
            Send reminder
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
            <UserCheck className="h-4 w-4" />
            Update status
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminCandidateDetail;
