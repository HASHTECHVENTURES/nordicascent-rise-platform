import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Circle, ArrowRight, Calendar, Video, FileCheck } from "lucide-react";
import { Link } from "react-router-dom";

const tasks = [
  { id: 1, text: "Initial screening call", completed: true },
  { id: 2, text: "Technical interview", completed: true },
  { id: 3, text: "Cultural fit assessment", completed: true },
  { id: 4, text: "Reference verification", completed: true },
];

const CandidateSelection = () => {
  const completedTasks = tasks.filter(t => t.completed).length;
  const readiness = Math.round((completedTasks / tasks.length) * 100);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-medium text-foreground">Selection</h1>
          <p className="text-muted-foreground">Screening and matching phase</p>
        </div>
        <Badge className="bg-success text-success-foreground">Completed</Badge>
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

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-medium">Selection Steps</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {tasks.map((task) => (
            <div key={task.id} className={`flex items-center gap-3 p-3 rounded border ${task.completed ? 'bg-success/5 border-success/20' : 'border-border'}`}>
              {task.completed ? <CheckCircle className="h-5 w-5 text-success" /> : <Circle className="h-5 w-5 text-muted-foreground" />}
              <span className={task.completed ? 'text-muted-foreground' : ''}>{task.text}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-medium">Match Result</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-4 rounded bg-primary/5 border border-primary/20">
            <p className="font-medium">Matched with TechCorp Nordic</p>
            <p className="text-sm text-muted-foreground mt-1">Senior Software Engineer position</p>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button asChild>
          <Link to="/candidate/readiness">Continue to Readiness <ArrowRight className="ml-2 h-4 w-4" /></Link>
        </Button>
      </div>
    </div>
  );
};

export default CandidateSelection;
