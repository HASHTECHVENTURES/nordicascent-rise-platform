import { useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  UserCheck,
  Building2,
  ArrowRight,
  ClipboardCheck,
  CheckCircle2,
  Briefcase,
  MapPin,
  Building,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

const ISSUE_AREAS = [
  { id: "preparation", label: "Prep", icon: ClipboardCheck },
  { id: "selection", label: "Screening", icon: UserCheck },
  { id: "readiness", label: "Readiness", icon: CheckCircle2 },
  { id: "activation", label: "Activation", icon: Briefcase },
  { id: "relocation", label: "Relocation", icon: MapPin },
  { id: "onboarding", label: "Onboard", icon: Building },
  { id: "followup", label: "Follow-up", icon: Users },
] as const;

type IssueArea = (typeof ISSUE_AREAS)[number]["id"];

type IssueRow = {
  id: number;
  name: string;
  issue: string;
  area: IssueArea;
  priority: "high" | "medium" | "low";
  reportedAt: string;
};

const candidateIssues: IssueRow[] = [
  {
    id: 1,
    name: "Emma Lindqvist",
    issue: "Readiness module incomplete — no activity",
    area: "readiness",
    priority: "high",
    reportedAt: "2026-03-22",
  },
  {
    id: 2,
    name: "Lars Andersen",
    issue: "Document upload pending — ID verification",
    area: "preparation",
    priority: "medium",
    reportedAt: "2026-04-01",
  },
  {
    id: 3,
    name: "Sofia Virtanen",
    issue: "Technical assessment not submitted",
    area: "readiness",
    priority: "high",
    reportedAt: "2026-03-28",
  },
  {
    id: 4,
    name: "Magnus Olsen",
    issue: "Follow-up check-in overdue (6-month)",
    area: "followup",
    priority: "medium",
    reportedAt: "2026-03-15",
  },
];

const companyIssues: IssueRow[] = [
  {
    id: 1,
    name: "TechNordic AB",
    issue: "Interview not scheduled for matched candidate",
    area: "selection",
    priority: "high",
    reportedAt: "2026-03-30",
  },
  {
    id: 2,
    name: "StartupHub Finland",
    issue: "Company profile pending verification",
    area: "preparation",
    priority: "medium",
    reportedAt: "2026-04-02",
  },
  {
    id: 3,
    name: "DataFlow Norway",
    issue: "Relocation paperwork stalled — HR contact",
    area: "relocation",
    priority: "high",
    reportedAt: "2026-03-25",
  },
];

function countByArea(items: IssueRow[]) {
  const m = new Map<IssueArea, number>();
  for (const a of ISSUE_AREAS) m.set(a.id, 0);
  for (const i of items) m.set(i.area, (m.get(i.area) ?? 0) + 1);
  return m;
}

function priorityBadge(p: IssueRow["priority"]) {
  switch (p) {
    case "high":
      return <Badge variant="destructive">High priority</Badge>;
    case "medium":
      return <Badge className="bg-warning/15 text-warning border border-warning/30">Medium</Badge>;
    default:
      return <Badge variant="secondary">Low</Badge>;
  }
}

function IssueListBlock({ issues, fixHref }: { issues: IssueRow[]; fixHref: string }) {
  if (issues.length === 0) {
    return <p className="text-sm text-muted-foreground py-2">No issues in this area.</p>;
  }
  return (
    <div className="space-y-2">
      {issues.map((item) => (
        <div
          key={item.id}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
        >
          <div className="space-y-1 min-w-0">
            <p className="font-medium">{item.name}</p>
            <p className="text-sm text-muted-foreground">{item.issue}</p>
            <div className="flex flex-wrap items-center gap-2 pt-1">
              {priorityBadge(item.priority)}
              <span className="text-xs text-muted-foreground">
                Reported {new Date(item.reportedAt).toLocaleDateString(undefined, { dateStyle: "medium" })}
              </span>
            </div>
          </div>
          <Button variant="outline" size="sm" className="shrink-0 self-start sm:self-center" asChild>
            <Link to={fixHref}>
              Open <ArrowRight className="ml-1 h-3 w-3" />
            </Link>
          </Button>
        </div>
      ))}
    </div>
  );
}

const AdminIssues = () => {
  const companyRef = useRef<HTMLElement>(null);
  const candidateRef = useRef<HTMLElement>(null);

  const companyByArea = countByArea(companyIssues);
  const candidateByArea = countByArea(candidateIssues);
  const totalByArea = ISSUE_AREAS.map((a) => ({
    ...a,
    count: (companyByArea.get(a.id) ?? 0) + (candidateByArea.get(a.id) ?? 0),
  }));

  const companyTotal = companyIssues.length;
  const candidateTotal = candidateIssues.length;

  const scrollTo = (el: HTMLElement | null) => {
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-medium text-foreground">Issues</h1>
        <p className="text-muted-foreground">Open items by pipeline area — companies and candidates</p>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium">Issues by area</CardTitle>
          <p className="text-sm text-muted-foreground font-normal">
            Prep → Screening → Readiness → Activation → Relocation → Onboard → Follow-up
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between overflow-x-auto pb-2 gap-1">
            {totalByArea.map((stage, index) => (
              <div key={stage.id} className="flex items-center">
                <div className="flex flex-col items-center min-w-[72px] sm:min-w-[80px]">
                  <div
                    className={cn(
                      "w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center border-2 mb-2",
                      stage.count > 0
                        ? "bg-warning/10 border-warning text-warning"
                        : "bg-muted border-muted-foreground/30 text-muted-foreground"
                    )}
                  >
                    <stage.icon className="h-5 w-5 sm:h-6 sm:w-6" />
                  </div>
                  <span className="text-xl sm:text-2xl font-bold">{stage.count}</span>
                  <span className="text-[10px] sm:text-xs text-muted-foreground text-center leading-tight px-0.5">
                    {stage.label}
                  </span>
                </div>
                {index < totalByArea.length - 1 && (
                  <div
                    className={cn(
                      "w-4 sm:w-8 h-0.5 mx-0.5 shrink-0",
                      stage.count > 0 ? "bg-warning/40" : "bg-muted"
                    )}
                  />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button
          type="button"
          onClick={() => scrollTo(companyRef.current)}
          className="text-left rounded-lg border border-border bg-card p-5 hover:bg-muted/50 hover:border-primary/40 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <div className="flex items-center gap-3 mb-2">
            <Building2 className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium text-muted-foreground">Company issues</span>
          </div>
          <p className="text-3xl font-bold">{companyTotal}</p>
          <p className="text-xs text-muted-foreground mt-1">Click to jump to the company list below</p>
        </button>
        <button
          type="button"
          onClick={() => scrollTo(candidateRef.current)}
          className="text-left rounded-lg border border-border bg-card p-5 hover:bg-muted/50 hover:border-primary/40 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <div className="flex items-center gap-3 mb-2">
            <UserCheck className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium text-muted-foreground">Candidate issues</span>
          </div>
          <p className="text-3xl font-bold">{candidateTotal}</p>
          <p className="text-xs text-muted-foreground mt-1">Click to jump to the candidate list below</p>
        </button>
      </div>

      <section
        ref={companyRef}
        id="admin-issues-companies"
        className="scroll-mt-24 space-y-6"
      >
        <div className="flex items-center gap-2">
          <Building2 className="h-6 w-6 text-primary" />
          <h2 className="text-xl font-semibold">Company issues</h2>
          <Badge variant="secondary">{companyTotal}</Badge>
        </div>
        {ISSUE_AREAS.map((area) => {
          const inArea = companyIssues.filter((i) => i.area === area.id);
          if (inArea.length === 0) return null;
          return (
            <Card key={`co-${area.id}`}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium flex items-center gap-2">
                  <area.icon className="h-4 w-4 text-muted-foreground" />
                  {area.label}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <IssueListBlock issues={inArea} fixHref="/admin/employers" />
              </CardContent>
            </Card>
          );
        })}
        {companyIssues.length === 0 && (
          <p className="text-sm text-muted-foreground">No open company issues.</p>
        )}
      </section>

      <section
        ref={candidateRef}
        id="admin-issues-candidates"
        className="scroll-mt-24 space-y-6 pt-4 border-t"
      >
        <div className="flex items-center gap-2">
          <UserCheck className="h-6 w-6 text-primary" />
          <h2 className="text-xl font-semibold">Candidate issues</h2>
          <Badge variant="secondary">{candidateTotal}</Badge>
        </div>
        {ISSUE_AREAS.map((area) => {
          const inArea = candidateIssues.filter((i) => i.area === area.id);
          if (inArea.length === 0) return null;
          return (
            <Card key={`ca-${area.id}`}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium flex items-center gap-2">
                  <area.icon className="h-4 w-4 text-muted-foreground" />
                  {area.label}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <IssueListBlock issues={inArea} fixHref="/admin/candidates" />
              </CardContent>
            </Card>
          );
        })}
        {candidateIssues.length === 0 && (
          <p className="text-sm text-muted-foreground">No open candidate issues.</p>
        )}
      </section>
    </div>
  );
};

export default AdminIssues;
