import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, UserCheck, Building2, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const candidateIssues = [
  { id: 1, name: "Emma Lindqvist", issue: "Readiness incomplete for 14 days", stage: "Readiness", severity: "high" },
  { id: 2, name: "Lars Andersen", issue: "Document upload pending", stage: "Preparation", severity: "medium" },
  { id: 3, name: "Sofia Virtanen", issue: "Assessment not submitted", stage: "Readiness", severity: "high" },
];

const companyIssues = [
  { id: 1, name: "TechNordic AB", issue: "Interview not scheduled for matched candidate", severity: "high" },
  { id: 2, name: "StartupHub Finland", issue: "Pending verification", severity: "medium" },
];

const AdminIssues = () => (
  <div className="space-y-6">
    <div>
      <h1 className="text-3xl font-bold tracking-tight">Needs attention</h1>
      <p className="text-muted-foreground">Problems affecting candidates and companies — fix them from here</p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card className="bg-destructive/5 border-destructive/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <UserCheck className="h-4 w-4" />
            Candidate issues
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{candidateIssues.length}</div>
          <p className="text-xs text-muted-foreground">Stuck, overdue, or pending action</p>
        </CardContent>
      </Card>
      <Card className="bg-destructive/5 border-destructive/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Company issues
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{companyIssues.length}</div>
          <p className="text-xs text-muted-foreground">Pending verification or overdue tasks</p>
        </CardContent>
      </Card>
    </div>

    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-warning" />
          Candidate issues
        </CardTitle>
        <p className="text-sm text-muted-foreground">Click through to fix from the candidate detail page</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {candidateIssues.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
            >
              <div>
                <p className="font-medium">{item.name}</p>
                <p className="text-sm text-muted-foreground">{item.issue}</p>
                <Badge variant="outline" className="mt-1 text-xs">{item.stage}</Badge>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link to="/admin/candidates">
                  Fix <ArrowRight className="ml-1 h-3 w-3" />
                </Link>
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5 text-primary" />
          Company issues
        </CardTitle>
        <p className="text-sm text-muted-foreground">Click through to fix from the company detail page</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {companyIssues.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
            >
              <div>
                <p className="font-medium">{item.name}</p>
                <p className="text-sm text-muted-foreground">{item.issue}</p>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link to="/admin/employers">
                  Fix <ArrowRight className="ml-1 h-3 w-3" />
                </Link>
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  </div>
);

export default AdminIssues;
