import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Circle, ArrowRight, AlertTriangle, BookOpen, Code, MessageSquare } from "lucide-react";
import { Link } from "react-router-dom";

const modules = [
  { id: 1, name: "Technical Assessment Module 1", description: "Core programming fundamentals", completed: true },
  { id: 2, name: "Technical Assessment Module 2", description: "System design principles", completed: true },
  { id: 3, name: "Technical Assessment Module 3", description: "Advanced problem solving", completed: false },
  { id: 4, name: "Soft Skills Workshop", description: "Communication and collaboration", completed: false },
];

const risks = [
  { id: 1, text: "Technical assessment deadline in 5 days", level: "warning" },
];

const CandidateTrainee = () => {
  const completedModules = modules.filter(m => m.completed).length;
  const readiness = Math.round((completedModules / modules.length) * 100);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-medium text-foreground">Trainee</h1>
          <p className="text-muted-foreground">Digital validation phase</p>
        </div>
        <Badge className="bg-primary text-primary-foreground">Active</Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-medium">Stage Readiness</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm">Progress</span>
            <span className="text-sm font-medium">{readiness}%</span>
          </div>
          <Progress value={readiness} className="h-2" />
        </CardContent>
      </Card>

      {risks.length > 0 && (
        <Card className="border-warning/50">
          <CardHeader>
            <CardTitle className="text-lg font-medium flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-warning" />
              Open Issues
            </CardTitle>
          </CardHeader>
          <CardContent>
            {risks.map((risk) => (
              <div key={risk.id} className="flex items-center gap-3 p-3 rounded bg-warning/10">
                <span className="text-sm">{risk.text}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-medium">Training Modules</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {modules.map((module) => (
            <div key={module.id} className={`flex items-center justify-between p-4 rounded border ${module.completed ? 'bg-success/5 border-success/20' : 'border-border'}`}>
              <div className="flex items-center gap-3">
                {module.completed ? <CheckCircle className="h-5 w-5 text-success" /> : <Circle className="h-5 w-5 text-muted-foreground" />}
                <div>
                  <p className={`font-medium ${module.completed ? 'text-muted-foreground' : ''}`}>{module.name}</p>
                  <p className="text-sm text-muted-foreground">{module.description}</p>
                </div>
              </div>
              {!module.completed && (
                <Button size="sm">Start</Button>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="border-primary/50 bg-primary/5">
        <CardHeader>
          <CardTitle className="text-lg font-medium">Stage Completion & Approval</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Upon completion of all Trainee modules, your technical baseline and work readiness will be assessed. 
            <strong> Final selection for Internship (1:1 digital engagement) happens at the end of this stage.</strong>
          </p>
          <div className="space-y-2 text-sm">
            <p><strong>Approval Criteria:</strong></p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>All technical assessment modules completed</li>
              <li>Work readiness and communication skills validated</li>
              <li>Company match confirmed</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" asChild>
          <Link to="/candidate/selection">Back to Selection</Link>
        </Button>
        <Button disabled={readiness < 100}>
          {readiness === 100 ? "Request Approval for Internship" : "Complete All Modules to Proceed"} 
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default CandidateTrainee;
