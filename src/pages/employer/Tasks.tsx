import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertTriangle,
  Clock,
  Heart,
  ClipboardCheck,
  MessageSquare,
} from "lucide-react";

const actionTasks = [
  { id: 1, candidate: "Rahul Sharma", avatar: "https://i.pravatar.cc/150?img=1", task: "Review technical assessment", stage: "Readiness", urgent: true, dueDate: "2026-02-22" },
  { id: 2, candidate: "Priya Patel", avatar: "https://i.pravatar.cc/150?img=5", task: "Schedule interview", stage: "Selection", urgent: false, dueDate: "2026-02-25" },
  { id: 3, candidate: "Sneha Reddy", avatar: "https://i.pravatar.cc/150?img=9", task: "Provide feedback on portfolio", stage: "Selection", urgent: true, dueDate: "2026-02-23" },
];

const bottleneckTasks = [
  { id: 4, stage: "Selection", count: 5, issue: "High volume of candidates awaiting interview scheduling", suggestion: "Consider batch scheduling or adding interviewers" },
];

const mentoringTasks = [
  { id: 5, candidate: "Rahul Sharma", avatar: "https://i.pravatar.cc/150?img=1", task: "Weekly check-in overdue", mentor: "Erik Johansson", dueDate: "2026-02-20" },
  { id: 6, candidate: "Priya Patel", avatar: "https://i.pravatar.cc/150?img=5", task: "Schedule career planning session", mentor: "Erik Johansson", dueDate: "2026-02-28" },
];

const interviewTasks = [
  { id: 7, candidate: "Vikram Singh", avatar: "https://i.pravatar.cc/150?img=15", task: "Complete interview scorecard", role: "DevOps Engineer", dueDate: "2026-02-24" },
  { id: 8, candidate: "Anjali Mehta", avatar: "https://i.pravatar.cc/150?img=20", task: "Submit evaluation report", role: "Data Engineer", dueDate: "2026-02-26" },
];

const otherTasks = [
  { id: 9, task: "Update company profile information", category: "Admin", dueDate: "2026-03-01" },
  { id: 10, task: "Review and approve job posting draft", category: "Roles", dueDate: "2026-02-27" },
];

const EmployerTasks = () => {
  const totalTasks = actionTasks.length + bottleneckTasks.length + mentoringTasks.length + interviewTasks.length + otherTasks.length;
  const urgentCount = actionTasks.filter(t => t.urgent).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-medium text-foreground">Tasks</h1>
          <p className="text-muted-foreground">Actions requiring your attention</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">{totalTasks} total</Badge>
          {urgentCount > 0 && (
            <Badge className="bg-destructive text-destructive-foreground">{urgentCount} urgent</Badge>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <AlertTriangle className="h-6 w-6 mx-auto mb-2 text-warning" />
            <p className="text-2xl font-medium">{actionTasks.length}</p>
            <p className="text-xs text-muted-foreground">Action Required</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <Clock className="h-6 w-6 mx-auto mb-2 text-destructive" />
            <p className="text-2xl font-medium">{bottleneckTasks.length}</p>
            <p className="text-xs text-muted-foreground">Bottlenecks</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <Heart className="h-6 w-6 mx-auto mb-2 text-primary" />
            <p className="text-2xl font-medium">{mentoringTasks.length}</p>
            <p className="text-xs text-muted-foreground">Mentoring</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <ClipboardCheck className="h-6 w-6 mx-auto mb-2 text-secondary" />
            <p className="text-2xl font-medium">{interviewTasks.length}</p>
            <p className="text-xs text-muted-foreground">Interviews</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <MessageSquare className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
            <p className="text-2xl font-medium">{otherTasks.length}</p>
            <p className="text-xs text-muted-foreground">Other</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="action" className="space-y-4">
        <TabsList>
          <TabsTrigger value="action">Action Required</TabsTrigger>
          <TabsTrigger value="bottlenecks">Bottlenecks</TabsTrigger>
          <TabsTrigger value="mentoring">Mentoring</TabsTrigger>
          <TabsTrigger value="interviews">Interviews</TabsTrigger>
          <TabsTrigger value="other">Other</TabsTrigger>
        </TabsList>

        <TabsContent value="action" className="space-y-3">
          {actionTasks.map((task) => (
            <Card key={task.id} className={task.urgent ? "border-warning/50" : ""}>
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={task.avatar} />
                    <AvatarFallback>{task.candidate.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">{task.task}</p>
                    <p className="text-xs text-muted-foreground">{task.candidate} · {task.stage} · Due {new Date(task.dueDate).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {task.urgent && <Badge className="bg-destructive text-destructive-foreground">Urgent</Badge>}
                  <Button size="sm" variant="outline">Review</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="bottlenecks" className="space-y-3">
          {bottleneckTasks.map((task) => (
            <Card key={task.id} className="border-warning/50 bg-warning/5">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">{task.stage} Stage — {task.count} candidates</p>
                    <p className="text-sm text-muted-foreground mt-1">{task.issue}</p>
                    <p className="text-sm text-primary mt-2">💡 {task.suggestion}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="mentoring" className="space-y-3">
          {mentoringTasks.map((task) => (
            <Card key={task.id}>
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={task.avatar} />
                    <AvatarFallback>{task.candidate.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">{task.task}</p>
                    <p className="text-xs text-muted-foreground">{task.candidate} · Mentor: {task.mentor} · Due {new Date(task.dueDate).toLocaleDateString()}</p>
                  </div>
                </div>
                <Button size="sm" variant="outline">Schedule</Button>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="interviews" className="space-y-3">
          {interviewTasks.map((task) => (
            <Card key={task.id}>
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={task.avatar} />
                    <AvatarFallback>{task.candidate.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">{task.task}</p>
                    <p className="text-xs text-muted-foreground">{task.candidate} · {task.role} · Due {new Date(task.dueDate).toLocaleDateString()}</p>
                  </div>
                </div>
                <Button size="sm" variant="outline">Complete</Button>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="other" className="space-y-3">
          {otherTasks.map((task) => (
            <Card key={task.id}>
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{task.task}</p>
                  <p className="text-xs text-muted-foreground">{task.category} · Due {new Date(task.dueDate).toLocaleDateString()}</p>
                </div>
                <Button size="sm" variant="outline">View</Button>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EmployerTasks;
