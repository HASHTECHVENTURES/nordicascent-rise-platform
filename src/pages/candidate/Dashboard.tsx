import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  CheckCircle,
  Circle,
  AlertTriangle,
  ArrowRight,
  ClipboardCheck,
  UserCheck,
  CheckCircle2,
  Briefcase,
  MapPin,
  Building2,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useTrack, TRACK_META, type Track } from "@/lib/track";
import { cn } from "@/lib/utils";

// Pipeline stages definition
const pipelineStages = [
  { 
    id: 1, 
    name: "Preparation", 
    status: "completed",
    href: "/candidate/preparation",
    icon: ClipboardCheck,
    description: "Initial readiness assessment"
  },
  { 
    id: 2, 
    name: "Selection", 
    status: "completed",
    href: "/candidate/selection",
    icon: UserCheck,
    description: "Screening and matching"
  },
  { 
    id: 3, 
    name: "Readiness", 
    status: "active",
    href: "/candidate/readiness",
    icon: CheckCircle2,
    description: "Technical, social & cultural validation"
  },
  { 
    id: 4, 
    name: "Activation",
    status: "not_started",
    href: "/candidate/internship",
    icon: Briefcase,
    description: "Activation – Internship or Pre-Employment"
  },
  { 
    id: 5, 
    name: "Relocation", 
    status: "not_started",
    href: "/candidate/relocation",
    icon: MapPin,
    description: "Visa, housing, documentation"
  },
  { 
    id: 6, 
    name: "Onboarding", 
    status: "not_started",
    href: "/candidate/onboarding",
    icon: Building2,
    description: "Physical arrival and integration"
  },
  { 
    id: 7, 
    name: "Follow-up", 
    status: "not_started",
    href: "/candidate/followup",
    icon: Users,
    description: "Long-term support"
  },
];

// Current stage details
const currentStage = {
  name: "Readiness",
  readiness: 65,
  nextAction: "Complete Technical Assessment Module 3",
  risks: [
    { id: 1, text: "Technical assessment deadline in 5 days", level: "warning" },
  ],
  tasks: [
    { id: 1, text: "Technical Assessment Module 1", completed: true },
    { id: 2, text: "Technical Assessment Module 2", completed: true },
    { id: 3, text: "Technical Assessment Module 3", completed: false },
    { id: 4, text: "Soft Skills Workshop", completed: false },
  ]
};

const CandidateDashboard = () => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-5 w-5 text-success" />;
      case "active":
        return <Circle className="h-5 w-5 text-primary fill-primary" />;
      case "blocked":
        return <AlertTriangle className="h-5 w-5 text-destructive" />;
      default:
        return <Circle className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-success text-success-foreground">Completed</Badge>;
      case "active":
        return <Badge className="bg-primary text-primary-foreground">Active</Badge>;
      case "blocked":
        return <Badge variant="destructive">Blocked</Badge>;
      case "not_started":
        return <Badge variant="secondary">Not Started</Badge>;
      default:
        return <Badge variant="secondary">Not Started</Badge>;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-medium text-foreground">My Journey</h1>
        <p className="text-muted-foreground">Track your progress through the Nordic Ascent pipeline</p>
        <p className="text-xs text-muted-foreground mt-1">Program: <strong>Entry Track</strong> — Academic-to-Professional, up to 12 months</p>
      </div>

      <Card className="border-border bg-muted/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium">Entry Track vs. Fast Track — Step by step</CardTitle>
          <CardDescription className="text-sm font-normal">
            Both tracks follow the same seven-stage journey you see in My Journey (Preparation → Selection → Readiness → Activation → Relocation → Onboarding → Follow-up).
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0 space-y-4 text-sm text-muted-foreground">
          <div className="space-y-2">
            <p className="font-medium text-foreground">Entry Track</p>
            <p>Entry Track is a 12-month selection and preparation program for participants with 0–12 months of professional experience, from selected schools.</p>
            <p><strong className="text-foreground">Process:</strong> Participants progress through Preparation, Selection, and Readiness, then enter Activation beginning with a 6–10-week academic internship (unless otherwise specified). After the internship, the final hiring decision is confirmed, followed by Relocation and Pre-employment stages, before Onboarding and move to the Company.</p>
          </div>
          <div className="space-y-2">
            <p className="font-medium text-foreground">Fast Track</p>
            <p>Fast Track is an accelerated preparation and activation program for participants with 1+ years of professional experience and education/alumni from selected schools.</p>
            <p>The Fast Track timeline starts after Selection has been completed, and it covers the stages of Readiness, Activation and Relocation. This route is designed for participants who already meet defined criteria with the company, allowing fewer or shorter upstream steps.</p>
          </div>
          <p>Nordic Ascent will confirm the track and stages applicable to your profile, and the pipeline indicates which steps are currently active.</p>
          <Button variant="outline" size="sm" asChild>
            <Link to="/candidate/internship">How the road is built — read on Activation</Link>
          </Button>
        </CardContent>
      </Card>

      {/* Current Stage Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main stage info */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg font-medium">Current Stage: {currentStage.name}</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">Technical, social & cultural validation</p>
            </div>
            {getStatusBadge("active")}
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Readiness */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Stage Readiness</span>
                <span className="text-sm text-muted-foreground">{currentStage.readiness}%</span>
              </div>
              <Progress value={currentStage.readiness} className="h-2" />
            </div>

            {/* Tasks */}
            <div>
              <h4 className="text-sm font-medium mb-3">Tasks</h4>
              <div className="space-y-2">
                {currentStage.tasks.map((task) => (
                  <div 
                    key={task.id} 
                    className={`flex items-center gap-3 p-3 rounded border ${
                      task.completed ? 'bg-success/5 border-success/20' : 'bg-card border-border'
                    }`}
                  >
                    {task.completed ? (
                      <CheckCircle className="h-4 w-4 text-success" />
                    ) : (
                      <Circle className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span className={`text-sm ${task.completed ? 'text-muted-foreground line-through' : ''}`}>
                      {task.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Next Action */}
            <div className="pt-4 border-t">
              <Button className="w-full btn-professional" asChild>
                <Link to="/candidate/readiness">
                  {currentStage.nextAction}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Sidebar - Risks & Info */}
        <div className="space-y-6">
          {/* Risks */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-medium">Open Issues</CardTitle>
            </CardHeader>
            <CardContent>
              {currentStage.risks.length > 0 ? (
                <div className="space-y-3">
                  {currentStage.risks.map((risk) => (
                    <div 
                      key={risk.id} 
                      className={`flex items-start gap-3 p-3 rounded ${
                        risk.level === 'warning' ? 'bg-warning/10' : 'bg-destructive/10'
                      }`}
                    >
                      <AlertTriangle className={`h-4 w-4 mt-0.5 ${
                        risk.level === 'warning' ? 'text-warning' : 'text-destructive'
                      }`} />
                      <span className="text-sm">{risk.text}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No open issues</p>
              )}
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-medium">Journey Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Stages Completed</span>
                <span className="text-sm font-medium">2 of 7</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Days in Pipeline</span>
                <span className="text-sm font-medium">45</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Target Company</span>
                <span className="text-sm font-medium">TechCorp Nordic</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CandidateDashboard;
