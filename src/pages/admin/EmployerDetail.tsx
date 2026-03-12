import { useParams, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, AlertTriangle, CheckCircle, Building2 } from "lucide-react";

const mockEmployer = {
  id: 1,
  name: "TechNordic AB",
  email: "hr@technordic.com",
  location: "Stockholm, SE",
  jobs: 12,
  status: "verified",
  joined: "2024-01-10",
  problems: [
    { id: 1, text: "Interview not scheduled for matched candidate Rahul S.", severity: "high" },
  ],
  tasks: [
    { id: 1, text: "Schedule interview with Emma L.", done: false },
    { id: 2, text: "Submit feedback for Readiness review", done: true },
  ],
};

const AdminEmployerDetail = () => {
  const { id } = useParams();
  const e = mockEmployer;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/admin/employers"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{e.name}</h1>
          <p className="text-muted-foreground">{e.email} · {e.location}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Company
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p><span className="text-muted-foreground">Status</span> <Badge>{e.status}</Badge></p>
            <p><span className="text-muted-foreground">Active jobs</span> {e.jobs}</p>
            <p><span className="text-muted-foreground">Joined</span> {e.joined}</p>
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
              {e.problems.map((p) => (
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
          <CardTitle className="text-base">Company tasks</CardTitle>
          <p className="text-sm text-muted-foreground">Complete on behalf of company if needed</p>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {e.tasks.map((t) => (
              <li key={t.id} className="flex items-center justify-between p-2 rounded border">
                <span className={t.done ? "text-muted-foreground line-through" : ""}>{t.text}</span>
                {!t.done && (
                  <Button variant="outline" size="sm">Mark done</Button>
                )}
                {t.done && <CheckCircle className="h-4 w-4 text-success" />}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Fix actions</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button variant="outline" size="sm" className="gap-2">
            <CheckCircle className="h-4 w-4" />
            Verify company
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
            Complete task on behalf
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminEmployerDetail;
