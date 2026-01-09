import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Circle, Lock, ArrowRight, Briefcase, Calendar, Users } from "lucide-react";
import { Link } from "react-router-dom";

const milestones = [
  { id: 1, name: "Project assignment", description: "Receive your internship project", locked: true },
  { id: 2, name: "Week 1-2: Onboarding", description: "Meet your team and understand the codebase", locked: true },
  { id: 3, name: "Week 3-8: Project work", description: "Work on assigned deliverables", locked: true },
  { id: 4, name: "Final review", description: "Present your work and receive feedback", locked: true },
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
          <p className="text-sm text-muted-foreground mt-3">Complete the Trainee stage to unlock this phase.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-medium">Internship Milestones</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {milestones.map((milestone) => (
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
              <p className="font-medium">8 Weeks</p>
              <p className="text-sm text-muted-foreground">Digital engagement period</p>
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
            This phase represents a higher level of commitment following successful completion of the Trainee validation phase.
          </p>
          <div className="space-y-2 text-sm">
            <p><strong>Duration:</strong> 8 weeks of structured digital project work</p>
            <p><strong>Compensation:</strong> Standard internship compensation as per Nordic standards</p>
            <p><strong>Focus:</strong> Real project deliverables and preparation for potential relocation</p>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" asChild>
          <Link to="/candidate/trainee">Back to Trainee</Link>
        </Button>
        <Button disabled>
          Continue to Relocation <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default CandidateInternship;
