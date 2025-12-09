import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Mail, Phone, MapPin, Calendar, Edit, GraduationCap, Award, TrendingUp, Clock, FileText } from "lucide-react";
import { employees, trainings } from "@/data/mockData";

export default function EmployeeProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const employee = employees.find((e) => e.id === Number(id));

  if (!employee) {
    return (<div className="text-center py-20"><h1 className="text-2xl font-bold mb-4">Employee not found</h1><Button onClick={() => navigate("/employees")}>Back to Employees</Button></div>);
  }

  const assignedTrainings = trainings.slice(0, 3);
  const activityTimeline = [
    { date: "Dec 5, 2024", action: "Completed training: Leadership Fundamentals", type: "training" },
    { date: "Nov 28, 2024", action: "Performance review completed", type: "review" },
    { date: "Nov 15, 2024", action: "Started training: Agile Project Management", type: "training" },
    { date: "Oct 20, 2024", action: "Received recognition: Team Player Award", type: "award" },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/employees")}><ArrowLeft className="h-5 w-5" /></Button>
        <div className="flex-1"><h1 className="text-3xl font-bold">{employee.name}</h1><p className="text-muted-foreground">{employee.role} • {employee.department}</p></div>
        <Button variant="outline"><Edit className="mr-2 h-4 w-4" />Edit Profile</Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <Avatar className="h-24 w-24 mx-auto"><AvatarFallback className="bg-primary text-primary-foreground text-3xl">{employee.avatar}</AvatarFallback></Avatar>
              <div><h2 className="text-xl font-semibold">{employee.name}</h2><p className="text-muted-foreground">{employee.role}</p><Badge className="mt-2" variant={employee.status === "active" ? "default" : "secondary"}>{employee.status === "active" ? "Active" : "On Leave"}</Badge></div>
            </div>
            <div className="mt-6 space-y-4">
              <div className="flex items-center gap-3 text-sm"><Mail className="h-4 w-4 text-muted-foreground" /><span>{employee.email}</span></div>
              <div className="flex items-center gap-3 text-sm"><Phone className="h-4 w-4 text-muted-foreground" /><span>+46 70 123 45 67</span></div>
              <div className="flex items-center gap-3 text-sm"><MapPin className="h-4 w-4 text-muted-foreground" /><span>Stockholm, Sweden</span></div>
              <div className="flex items-center gap-3 text-sm"><Calendar className="h-4 w-4 text-muted-foreground" /><span>Joined {new Date(employee.joinDate).toLocaleDateString()}</span></div>
            </div>
            <div className="mt-6 pt-6 border-t border-border">
              <h3 className="font-medium mb-3">Quick Stats</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-secondary rounded-lg"><p className="text-2xl font-bold text-primary">{employee.completedTrainings}</p><p className="text-xs text-muted-foreground">Trainings</p></div>
                <div className="text-center p-3 bg-secondary rounded-lg"><p className="text-2xl font-bold text-success">92%</p><p className="text-xs text-muted-foreground">Performance</p></div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <Tabs defaultValue="trainings" className="w-full">
            <CardHeader><TabsList><TabsTrigger value="trainings">Trainings</TabsTrigger><TabsTrigger value="performance">Performance</TabsTrigger><TabsTrigger value="documents">Documents</TabsTrigger><TabsTrigger value="activity">Activity</TabsTrigger></TabsList></CardHeader>
            <CardContent>
              <TabsContent value="trainings" className="mt-0 space-y-4">
                <div className="flex justify-between items-center"><h3 className="font-medium">Assigned Trainings</h3><Button size="sm" variant="outline">Assign New</Button></div>
                {assignedTrainings.map((training) => (
                  <div key={training.id} className="p-4 rounded-lg border border-border space-y-3">
                    <div className="flex items-start justify-between"><div><h4 className="font-medium">{training.title}</h4><p className="text-sm text-muted-foreground">{training.category} • {training.duration}</p></div><Badge variant="secondary">{training.difficulty}</Badge></div>
                    <div className="space-y-1"><div className="flex justify-between text-sm"><span>Progress</span><span>{training.completion}%</span></div><Progress value={training.completion} className="h-2" /></div>
                  </div>
                ))}
              </TabsContent>
              <TabsContent value="performance" className="mt-0 space-y-6">
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 rounded-lg bg-secondary/50 text-center"><TrendingUp className="h-8 w-8 mx-auto mb-2 text-success" /><p className="text-2xl font-bold">92%</p><p className="text-sm text-muted-foreground">Overall Score</p></div>
                  <div className="p-4 rounded-lg bg-secondary/50 text-center"><GraduationCap className="h-8 w-8 mx-auto mb-2 text-primary" /><p className="text-2xl font-bold">{employee.completedTrainings}</p><p className="text-sm text-muted-foreground">Trainings Done</p></div>
                  <div className="p-4 rounded-lg bg-secondary/50 text-center"><Award className="h-8 w-8 mx-auto mb-2 text-warning" /><p className="text-2xl font-bold">3</p><p className="text-sm text-muted-foreground">Awards</p></div>
                </div>
                <div className="space-y-3"><h4 className="font-medium">Performance Metrics</h4>
                  {[{ label: "Goal Completion", value: 88 }, { label: "Skill Development", value: 92 }, { label: "Team Collaboration", value: 95 }, { label: "Punctuality", value: 90 }].map((metric) => (
                    <div key={metric.label} className="space-y-1"><div className="flex justify-between text-sm"><span>{metric.label}</span><span>{metric.value}%</span></div><Progress value={metric.value} className="h-2" /></div>
                  ))}
                </div>
              </TabsContent>
              <TabsContent value="documents" className="mt-0 space-y-4">
                {[{ name: "Employment Contract.pdf", date: "Mar 15, 2022", size: "245 KB" }, { name: "NDA Agreement.pdf", date: "Mar 15, 2022", size: "128 KB" }, { name: "Performance Review Q3.pdf", date: "Oct 1, 2024", size: "89 KB" }, { name: "Training Certificates.zip", date: "Nov 20, 2024", size: "1.2 MB" }].map((doc) => (
                  <div key={doc.name} className="flex items-center justify-between p-3 rounded-lg border border-border">
                    <div className="flex items-center gap-3"><FileText className="h-8 w-8 text-muted-foreground" /><div><p className="font-medium">{doc.name}</p><p className="text-sm text-muted-foreground">{doc.date} • {doc.size}</p></div></div>
                    <Button variant="ghost" size="sm">Download</Button>
                  </div>
                ))}
              </TabsContent>
              <TabsContent value="activity" className="mt-0">
                <div className="relative"><div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />
                  <div className="space-y-6">
                    {activityTimeline.map((item, i) => (
                      <div key={i} className="relative pl-10">
                        <div className={`absolute left-2 w-4 h-4 rounded-full border-2 border-background ${item.type === "training" ? "bg-primary" : item.type === "review" ? "bg-success" : "bg-warning"}`} />
                        <div className="flex items-center gap-2"><Clock className="h-4 w-4 text-muted-foreground" /><span className="text-sm text-muted-foreground">{item.date}</span></div>
                        <p className="mt-1">{item.action}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}
