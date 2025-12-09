import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Clock, BookOpen, Users, Play, CheckCircle, FileText, Download, Award } from "lucide-react";
import { trainings } from "@/data/mockData";
import { useToast } from "@/hooks/use-toast";

export default function TrainingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const training = trainings.find((t) => t.id === Number(id));

  if (!training) {
    return (<div className="text-center py-20"><h1 className="text-2xl font-bold mb-4">Training not found</h1><Button onClick={() => navigate("/training")}>Back to Training</Button></div>);
  }

  const lessons = [
    { id: 1, title: "Introduction", duration: "15 min", completed: true },
    { id: 2, title: "Core Concepts", duration: "30 min", completed: true },
    { id: 3, title: "Practical Applications", duration: "45 min", completed: false },
    { id: 4, title: "Case Studies", duration: "30 min", completed: false },
    { id: 5, title: "Assessment", duration: "20 min", completed: false },
  ];

  const resources = [{ name: "Course Handbook.pdf", size: "2.4 MB" }, { name: "Reference Guide.pdf", size: "1.1 MB" }, { name: "Practice Exercises.zip", size: "5.8 MB" }];

  const handleStartTraining = () => { toast({ title: "Training Started", description: "Good luck with your learning journey!" }); };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/training")}><ArrowLeft className="h-5 w-5" /></Button>
        <div className="flex-1">
          <div className="flex items-center gap-3"><h1 className="text-3xl font-bold">{training.title}</h1><Badge variant="secondary">{training.category}</Badge><Badge variant="outline">{training.difficulty}</Badge></div>
          <p className="text-muted-foreground mt-1">{training.description}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[{ icon: Clock, label: "Duration", value: training.duration, color: "bg-primary/10 text-primary" }, { icon: BookOpen, label: "Modules", value: `${training.modules} lessons`, color: "bg-success/10 text-success" }, { icon: Users, label: "Enrolled", value: `${training.enrolled} people`, color: "bg-warning/10 text-warning" }, { icon: Award, label: "Completion", value: `${training.completion}%`, color: "bg-accent text-accent-foreground" }].map((stat) => (
          <Card key={stat.label}><CardContent className="pt-6 flex items-center gap-3"><div className={`h-10 w-10 rounded-lg flex items-center justify-center ${stat.color}`}><stat.icon className="h-5 w-5" /></div><div><p className="text-sm text-muted-foreground">{stat.label}</p><p className="font-bold">{stat.value}</p></div></CardContent></Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between"><CardTitle>Course Content</CardTitle><div className="text-sm text-muted-foreground">2 of 5 completed</div></CardHeader>
            <CardContent>
              <div className="space-y-3">
                {lessons.map((lesson, i) => (
                  <div key={lesson.id} className={`flex items-center justify-between p-4 rounded-lg border ${lesson.completed ? "bg-success/5 border-success/20" : "border-border"}`}>
                    <div className="flex items-center gap-4">
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center ${lesson.completed ? "bg-success text-success-foreground" : "bg-muted text-muted-foreground"}`}>
                        {lesson.completed ? <CheckCircle className="h-4 w-4" /> : <span className="text-sm font-medium">{i + 1}</span>}
                      </div>
                      <div><p className="font-medium">{lesson.title}</p><p className="text-sm text-muted-foreground">{lesson.duration}</p></div>
                    </div>
                    <Button size="sm" variant={lesson.completed ? "ghost" : "default"} disabled={i > 2}>{lesson.completed ? "Review" : i === 2 ? "Start" : "Locked"}</Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Your Progress</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center"><div className="inline-flex items-center justify-center h-24 w-24 rounded-full nordic-gradient"><span className="text-2xl font-bold text-primary-foreground">40%</span></div></div>
              <Progress value={40} className="h-3" />
              <p className="text-center text-sm text-muted-foreground">2 of 5 lessons completed</p>
              <Button className="w-full nordic-gradient" onClick={handleStartTraining}><Play className="mr-2 h-4 w-4" />Continue Learning</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Resources</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {resources.map((resource) => (
                <div key={resource.name} className="flex items-center justify-between p-3 rounded-lg border border-border">
                  <div className="flex items-center gap-3"><FileText className="h-5 w-5 text-muted-foreground" /><div><p className="text-sm font-medium">{resource.name}</p><p className="text-xs text-muted-foreground">{resource.size}</p></div></div>
                  <Button variant="ghost" size="icon"><Download className="h-4 w-4" /></Button>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-primary/5 to-accent/10">
            <CardContent className="pt-6 text-center space-y-3">
              <Award className="h-12 w-12 mx-auto text-primary" />
              <h3 className="font-semibold">Certificate Available</h3>
              <p className="text-sm text-muted-foreground">Complete all lessons to earn your certificate.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
