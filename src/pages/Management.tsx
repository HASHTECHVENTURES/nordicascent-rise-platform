import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, GraduationCap, TrendingUp, Clock, Calendar, ArrowRight, UserCheck, FileText } from "lucide-react";
import { employees } from "@/data/mockData";

export default function Management() {
  const teamMembers = employees.slice(0, 5);
  const pendingApprovals = [
    { id: 1, type: "Leave Request", employee: "Erik Lindqvist", dates: "Dec 20-24, 2024", submitted: "Dec 5" },
    { id: 2, type: "Training Request", employee: "Lars Johansson", training: "Leadership Fundamentals", submitted: "Dec 4" },
    { id: 3, type: "Expense Claim", employee: "Freya Andersson", amount: "€450", submitted: "Dec 3" },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div><h1 className="text-3xl font-bold">Management</h1><p className="text-muted-foreground">Oversee your team's performance and activities.</p></div>
        <div className="flex gap-3"><Button variant="outline"><Calendar className="mr-2 h-4 w-4" />Schedule Meeting</Button><Button className="nordic-gradient"><FileText className="mr-2 h-4 w-4" />Generate Report</Button></div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[{ label: "Team Members", value: "12", icon: Users, color: "bg-primary/10 text-primary" }, { label: "Training Completion", value: "89%", icon: GraduationCap, color: "bg-success/10 text-success" }, { label: "Avg. Performance", value: "92%", icon: TrendingUp, color: "bg-warning/10 text-warning" }, { label: "Pending Approvals", value: "3", icon: Clock, color: "bg-destructive/10 text-destructive" }].map((stat) => (
          <Card key={stat.label}><CardContent className="pt-6"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">{stat.label}</p><p className="text-3xl font-bold mt-1">{stat.value}</p></div><div className={`h-12 w-12 rounded-lg flex items-center justify-center ${stat.color}`}><stat.icon className="h-6 w-6" /></div></div></CardContent></Card>
        ))}
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList><TabsTrigger value="overview">Team Overview</TabsTrigger><TabsTrigger value="approvals">Pending Approvals</TabsTrigger><TabsTrigger value="performance">Performance</TabsTrigger></TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card><CardHeader><CardTitle className="flex items-center gap-2"><GraduationCap className="h-5 w-5 text-primary" />Team Training Progress</CardTitle></CardHeader><CardContent className="space-y-4">
              {teamMembers.map((member) => (<div key={member.id} className="flex items-center gap-4"><Avatar className="h-10 w-10"><AvatarFallback className="bg-primary/10 text-primary">{member.avatar}</AvatarFallback></Avatar><div className="flex-1 min-w-0"><p className="font-medium truncate">{member.name}</p><div className="flex items-center gap-2"><Progress value={Math.random() * 40 + 60} className="h-1.5 flex-1" /><span className="text-xs text-muted-foreground w-10">{Math.round(Math.random() * 40 + 60)}%</span></div></div></div>))}
              <Button variant="outline" className="w-full mt-4">View All Team Training<ArrowRight className="ml-2 h-4 w-4" /></Button>
            </CardContent></Card>

            <Card><CardHeader><CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5 text-success" />Performance Overview</CardTitle></CardHeader><CardContent className="space-y-4">
              {[{ label: "Goal Achievement", value: 88, status: "on-track" }, { label: "Project Completion", value: 92, status: "exceeding" }, { label: "Team Collaboration", value: 95, status: "exceeding" }, { label: "Skill Development", value: 75, status: "needs-attention" }].map((metric) => (
                <div key={metric.label} className="space-y-2"><div className="flex justify-between items-center"><span className="text-sm font-medium">{metric.label}</span><Badge variant={metric.status === "exceeding" ? "default" : metric.status === "on-track" ? "secondary" : "destructive"}>{metric.status === "exceeding" ? "Exceeding" : metric.status === "on-track" ? "On Track" : "Needs Attention"}</Badge></div><div className="flex items-center gap-2"><Progress value={metric.value} className="h-2 flex-1" /><span className="text-sm font-medium w-10">{metric.value}%</span></div></div>
              ))}
            </CardContent></Card>
          </div>

          <Card><CardHeader><CardTitle>Quick Actions</CardTitle></CardHeader><CardContent>
            <div className="grid md:grid-cols-4 gap-4">
              {[{ icon: UserCheck, label: "Review Team" }, { icon: GraduationCap, label: "Assign Training" }, { icon: Calendar, label: "Schedule 1:1" }, { icon: FileText, label: "Team Report" }].map((action) => (
                <Button key={action.label} variant="outline" className="h-auto py-4 flex-col gap-2"><action.icon className="h-6 w-6" /><span>{action.label}</span></Button>
              ))}
            </div>
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="approvals" className="space-y-6">
          <Card><CardHeader><CardTitle className="flex items-center gap-2"><Clock className="h-5 w-5 text-warning" />Pending Approvals<Badge variant="secondary">{pendingApprovals.length}</Badge></CardTitle></CardHeader><CardContent className="space-y-4">
            {pendingApprovals.map((approval) => (
              <div key={approval.id} className="flex items-center justify-between p-4 rounded-lg border border-border">
                <div className="flex items-center gap-4">
                  <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${approval.type === "Leave Request" ? "bg-primary/10" : approval.type === "Training Request" ? "bg-success/10" : "bg-warning/10"}`}>
                    {approval.type === "Leave Request" ? <Calendar className="h-5 w-5 text-primary" /> : approval.type === "Training Request" ? <GraduationCap className="h-5 w-5 text-success" /> : <FileText className="h-5 w-5 text-warning" />}
                  </div>
                  <div><h4 className="font-medium">{approval.type}</h4><p className="text-sm text-muted-foreground">{approval.employee} • Submitted {approval.submitted}</p><p className="text-sm text-muted-foreground">{approval.dates || approval.training || approval.amount}</p></div>
                </div>
                <div className="flex gap-2"><Button variant="outline" size="sm">Decline</Button><Button size="sm" className="nordic-gradient">Approve</Button></div>
              </div>
            ))}
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <Card><CardHeader><CardTitle>Team Performance Metrics</CardTitle></CardHeader><CardContent>
            <div className="space-y-6">
              {teamMembers.map((member) => (
                <div key={member.id} className="flex items-center gap-4 p-4 rounded-lg bg-secondary/30">
                  <Avatar className="h-12 w-12"><AvatarFallback className="bg-primary text-primary-foreground">{member.avatar}</AvatarFallback></Avatar>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2"><div><h4 className="font-medium">{member.name}</h4><p className="text-sm text-muted-foreground">{member.role}</p></div><Badge variant="secondary">Score: {Math.round(Math.random() * 15 + 85)}</Badge></div>
                    <div className="grid grid-cols-4 gap-4">
                      {[{ label: "Goals", value: Math.round(Math.random() * 20 + 80) }, { label: "Training", value: Math.round(Math.random() * 20 + 80) }, { label: "Collaboration", value: Math.round(Math.random() * 20 + 80) }, { label: "Attendance", value: Math.round(Math.random() * 10 + 90) }].map((metric) => (
                        <div key={metric.label}><p className="text-xs text-muted-foreground">{metric.label}</p><Progress value={metric.value} className="h-1.5 mt-1" /></div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent></Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
