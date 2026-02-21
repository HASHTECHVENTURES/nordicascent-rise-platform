import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Lock, ArrowRight, Briefcase, Calendar, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { Separator } from "@/components/ui/separator";

const phase1Milestones = [
  { id: 1, name: "Project assignment", description: "Receive your internship project from the company", locked: true },
  { id: 2, name: "Week 1-2: Onboarding", description: "Meet your team and understand the codebase", locked: true },
  { id: 3, name: "Week 3-8: Project work", description: "Work on assigned deliverables with mentor guidance", locked: true },
  { id: 4, name: "Week 8-10: Final review", description: "Present your work and receive evaluation feedback", locked: true },
];

const phase2Milestones = [
  { id: 5, name: "Professional onboarding", description: "Begin as a pre-employed team member", locked: true },
  { id: 6, name: "Project contribution", description: "Contribute to real company projects and sprints", locked: true },
  { id: 7, name: "Relocation preparation", description: "Begin visa and relocation logistics in parallel", locked: true },
  { id: 8, name: "Handover & transition", description: "Prepare for physical onboarding in the Nordics", locked: true },
];

const CandidateInternship = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-medium text-foreground">Internship</h1>
          <p className="text-muted-foreground">Formal digital engagement with company</p>
        </div>
        <Badge variant="secondary">Not Started</Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-medium">Stage Readiness</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm">Progress</span>
            <span className="text-sm font-medium">0%</span>
          </div>
          <Progress value={0} className="h-2" />
          <p className="text-sm text-muted-foreground mt-3">Complete the Readiness stage to unlock this phase.</p>
        </CardContent>
      </Card>

      {/* Phase 1: Official Internship */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-medium">Phase 1: Official Internship</CardTitle>
            <Badge variant="outline">8–10 weeks</Badge>
          </div>
          <p className="text-sm text-muted-foreground">Academic internship per school/university rules. Earns academic credit.</p>
        </CardHeader>
        <CardContent className="space-y-3">
          {phase1Milestones.map((milestone) => (
            <div key={milestone.id} className="flex items-center justify-between p-4 rounded border border-muted bg-muted/30">
              <div className="flex items-center gap-3">
                <Lock className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium text-muted-foreground">{milestone.name}</p>
                  <p className="text-sm text-muted-foreground">{milestone.description}</p>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Hire / No-Hire Decision Divider */}
      <div className="relative py-4">
        <Separator />
        <div className="absolute inset-0 flex items-center justify-center">
          <Badge className="bg-warning text-warning-foreground px-4 py-1.5 text-sm font-semibold">
            ⚡ Hire / No-Hire Decision
          </Badge>
        </div>
      </div>

      {/* Phase 2: Professional Pre-Employment */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-medium">Phase 2: Professional Pre-Employment</CardTitle>
            <Badge variant="outline">Ongoing</Badge>
          </div>
          <p className="text-sm text-muted-foreground">After a positive hire decision. No academic credit — early professional engagement with the company.</p>
        </CardHeader>
        <CardContent className="space-y-3">
          {phase2Milestones.map((milestone) => (
            <div key={milestone.id} className="flex items-center justify-between p-4 rounded border border-muted bg-muted/30">
              <div className="flex items-center gap-3">
                <Lock className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium text-muted-foreground">{milestone.name}</p>
                  <p className="text-sm text-muted-foreground">{milestone.description}</p>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* What to Expect */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-medium">What to Expect</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded bg-muted/30 text-center">
              <Briefcase className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="font-medium">Real Projects</p>
              <p className="text-sm text-muted-foreground">Work on actual company deliverables</p>
            </div>
            <div className="p-4 rounded bg-muted/30 text-center">
              <Users className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="font-medium">Team Integration</p>
              <p className="text-sm text-muted-foreground">Collaborate with Nordic engineers</p>
            </div>
            <div className="p-4 rounded bg-muted/30 text-center">
              <Calendar className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="font-medium">Two Phases</p>
              <p className="text-sm text-muted-foreground">Academic internship → Pre-employment</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-primary/50 bg-primary/5">
        <CardHeader>
          <CardTitle className="text-lg font-medium">Important: Digital 1:1 Engagement</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            The Internship stage is a <strong>digital, one-on-one engagement</strong> with your matched Nordic company. 
            It begins with an official academic internship and, upon a positive hire decision, transitions into a professional pre-employment phase.
          </p>
          <div className="space-y-2 text-sm">
            <p><strong>Phase 1:</strong> 8–10 weeks official internship (academic credit, school rules apply)</p>
            <p><strong>Decision Point:</strong> Company makes hire / no-hire decision based on performance</p>
            <p><strong>Phase 2:</strong> Professional pre-employment — real project work, no academic credit</p>
            <p><strong>Compensation:</strong> Standard internship compensation as per Nordic standards</p>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" asChild>
          <Link to="/candidate/readiness">Back to Readiness</Link>
        </Button>
        <Button disabled>
          Continue to Relocation <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default CandidateInternship;
