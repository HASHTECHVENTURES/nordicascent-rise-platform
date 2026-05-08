import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Circle, ArrowRight, Info } from "lucide-react";
import { Link } from "react-router-dom";
import { useTrack, TRACK_META } from "@/lib/track";

const tasks = [
  { id: 1, text: "Profile Setup", completed: true },
  { id: 2, text: "Professional Background", completed: true },
  { id: 3, text: "Skills Assessment", completed: true },
  { id: 4, text: "Mobility Readiness", completed: false },
];

const CandidatePreparation = () => {
  const [track] = useTrack();
  if (track === "fast") {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-medium text-foreground">Preparation</h1>
          <p className="text-muted-foreground">Not part of {TRACK_META.fast.label}</p>
        </div>
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="pt-6 flex items-start gap-3">
            <Info className="h-5 w-5 text-primary mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-foreground">Preparation is not part of Fast Track</p>
              <p className="text-muted-foreground mt-1">
                Fast Track participants start at Readiness. Use the pipeline above to continue.
              </p>
              <Button variant="outline" size="sm" className="mt-3" asChild>
                <Link to="/candidate/readiness">Go to Readiness <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const completedTasks = tasks.filter(t => t.completed).length;
  const readiness = Math.round((completedTasks / tasks.length) * 100);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-medium text-foreground">Preparation</h1>
          <p className="text-muted-foreground">Initial readiness assessment</p>
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
          <CardTitle className="text-lg font-medium">Preparation (points on page)</CardTitle>
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

      <div className="flex justify-end">
        <Button asChild>
          <Link to="/candidate/selection">Continue to Selection <ArrowRight className="ml-2 h-4 w-4" /></Link>
        </Button>
      </div>
    </div>
  );
};

export default CandidatePreparation;
