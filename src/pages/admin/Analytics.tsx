import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, TrendingUp, TrendingDown, Users, ArrowRight, AlertTriangle, CheckCircle, Building2, Heart } from "lucide-react";

// KPI 1: Candidates per Stage + Conversion
const stageData = [
  { stage: "Preparation", count: 120, conversion: 85 },
  { stage: "Selection", count: 102, conversion: 72 },
  { stage: "Readiness", count: 73, conversion: 88 },
  { stage: "Internship", count: 64, conversion: 78 },
  { stage: "Relocation", count: 50, conversion: 92 },
  { stage: "Onboarding", count: 46, conversion: 96 },
  { stage: "Follow-up", count: 44, conversion: 100 },
];

// KPI 2: Task Completion
const taskCompletionData = [
  { category: "Interview Scheduling", completed: 45, total: 52, rate: 87 },
  { category: "Assessment Reviews", completed: 38, total: 48, rate: 79 },
  { category: "Mentor Sessions", completed: 62, total: 70, rate: 89 },
  { category: "Document Verification", completed: 55, total: 55, rate: 100 },
];

// KPI 3: Drop-offs
const dropOffData = [
  { stage: "Preparation → Selection", dropOffs: 18, reason: "Incomplete profile" },
  { stage: "Selection → Readiness", dropOffs: 29, reason: "Failed screening" },
  { stage: "Readiness → Internship", dropOffs: 9, reason: "Withdrew application" },
  { stage: "Internship → Relocation", dropOffs: 14, reason: "No-hire decision" },
];

// KPI 4: Mentor Sessions
const mentorData = [
  { mentor: "Erik Johansson", sessions: 24, attended: 22, rate: 92 },
  { mentor: "Anna Lindqvist", sessions: 18, attended: 16, rate: 89 },
  { mentor: "Lars Petersen", sessions: 15, attended: 14, rate: 93 },
];

// KPI 5: Company Engagement
const companyData = [
  { company: "TechCorp Nordic", activeCandidates: 5, responseTime: "1.2 days", engagement: "High" },
  { company: "Fjord Systems", activeCandidates: 3, responseTime: "2.5 days", engagement: "Medium" },
  { company: "Nordic Digital", activeCandidates: 4, responseTime: "0.8 days", engagement: "High" },
  { company: "Scandi Solutions", activeCandidates: 2, responseTime: "4.1 days", engagement: "Low" },
];

const handleExportCSV = () => {
  const headers = ["Stage", "Candidates", "Conversion Rate (%)"];
  const rows = stageData.map(s => [s.stage, s.count, s.conversion]);
  const csvContent = [headers, ...rows].map(r => r.join(",")).join("\n");
  const blob = new Blob([csvContent], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "analytics-export.csv";
  a.click();
  URL.revokeObjectURL(url);
};

const AdminAnalytics = () => {
  const totalCandidates = stageData[0].count;
  const totalPlaced = stageData[stageData.length - 1].count;
  const overallConversion = Math.round((totalPlaced / totalCandidates) * 100);
  const totalDropOffs = dropOffData.reduce((sum, d) => sum + d.dropOffs, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analytics & Reports</h1>
          <p className="text-muted-foreground">Platform performance metrics</p>
        </div>
        <div className="flex items-center gap-3">
          <Select defaultValue="30days">
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">Last 7 days</SelectItem>
              <SelectItem value="30days">Last 30 days</SelectItem>
              <SelectItem value="90days">Last 90 days</SelectItem>
              <SelectItem value="year">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={handleExportCSV}>
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Top-level KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalCandidates}</p>
                <p className="text-sm text-muted-foreground">Total Candidates</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-success/10 rounded-lg">
                <CheckCircle className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalPlaced}</p>
                <p className="text-sm text-muted-foreground">Successfully Placed</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-secondary/10 rounded-lg">
                <TrendingUp className="w-5 h-5 text-secondary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{overallConversion}%</p>
                <p className="text-sm text-muted-foreground">Overall Conversion</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-destructive/10 rounded-lg">
                <TrendingDown className="w-5 h-5 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalDropOffs}</p>
                <p className="text-sm text-muted-foreground">Total Drop-offs</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* KPI 1: Candidates per Stage + Conversion */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-medium">Candidates per Stage & Conversion Rates</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {stageData.map((stage, i) => (
              <div key={stage.stage} className="flex items-center gap-4">
                <span className="text-sm font-medium w-28 flex-shrink-0">{stage.stage}</span>
                <div className="flex-1">
                  <Progress value={(stage.count / totalCandidates) * 100} className="h-3" />
                </div>
                <span className="text-sm font-medium w-12 text-right">{stage.count}</span>
                {i < stageData.length - 1 && (
                  <Badge variant={stage.conversion >= 85 ? "default" : stage.conversion >= 70 ? "secondary" : "destructive"} className="w-16 justify-center">
                    {stage.conversion}%
                  </Badge>
                )}
                {i === stageData.length - 1 && <div className="w-16" />}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* KPI 2: Task Completion Rate */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-medium">Task Completion Rate</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {taskCompletionData.map((task) => (
              <div key={task.category} className="p-4 rounded border border-border">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">{task.category}</span>
                  <Badge variant={task.rate >= 90 ? "default" : task.rate >= 80 ? "secondary" : "destructive"}>
                    {task.rate}%
                  </Badge>
                </div>
                <Progress value={task.rate} className="h-2 mb-1" />
                <p className="text-xs text-muted-foreground">{task.completed} of {task.total} completed</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* KPI 3: Candidate Drop-offs */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-medium flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-warning" />
            Candidate Drop-offs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {dropOffData.map((item) => (
              <div key={item.stage} className="flex items-center justify-between p-3 rounded border border-border">
                <div className="flex items-center gap-3">
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">{item.stage}</p>
                    <p className="text-xs text-muted-foreground">Primary reason: {item.reason}</p>
                  </div>
                </div>
                <Badge variant="destructive">{item.dropOffs} dropped</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* KPI 4: Mentor Session Participation */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-medium flex items-center gap-2">
            <Heart className="h-5 w-5 text-primary" />
            Mentor Session Participation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {mentorData.map((mentor) => (
              <div key={mentor.mentor} className="flex items-center justify-between p-3 rounded border border-border">
                <div>
                  <p className="text-sm font-medium">{mentor.mentor}</p>
                  <p className="text-xs text-muted-foreground">{mentor.attended} of {mentor.sessions} sessions attended</p>
                </div>
                <div className="flex items-center gap-3">
                  <Progress value={mentor.rate} className="w-20 h-2" />
                  <Badge variant={mentor.rate >= 90 ? "default" : "secondary"}>{mentor.rate}%</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* KPI 5: Company Engagement */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-medium flex items-center gap-2">
            <Building2 className="h-5 w-5 text-secondary" />
            Company Engagement
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {companyData.map((company) => (
              <div key={company.company} className="flex items-center justify-between p-3 rounded border border-border">
                <div>
                  <p className="text-sm font-medium">{company.company}</p>
                  <p className="text-xs text-muted-foreground">{company.activeCandidates} active candidates · Avg response: {company.responseTime}</p>
                </div>
                <Badge variant={company.engagement === "High" ? "default" : company.engagement === "Medium" ? "secondary" : "destructive"}>
                  {company.engagement}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminAnalytics;
