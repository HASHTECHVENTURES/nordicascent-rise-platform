import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Users, GraduationCap, BarChart3, TrendingUp, UserPlus, BookOpen, FileText, Award, Clock, CheckCircle, ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import { stats, activities, leaderboard } from "@/data/mockData";

const quickActions = [
  { icon: UserPlus, label: "Add Employee", href: "/employees", color: "bg-primary" },
  { icon: BookOpen, label: "Assign Training", href: "/training", color: "bg-success" },
  { icon: FileText, label: "View Reports", href: "/reports", color: "bg-warning" },
];

const statCards = [
  { label: "Total Employees", value: stats.totalEmployees, icon: Users, trend: "+12%", color: "text-primary" },
  { label: "Active Trainings", value: stats.activeTrainings, icon: GraduationCap, trend: "+8%", color: "text-success" },
  { label: "Completion Rate", value: `${stats.completionRate}%`, icon: BarChart3, trend: "+5%", color: "text-warning" },
  { label: "Avg. Engagement", value: stats.avgEngagement.toFixed(1), icon: TrendingUp, trend: "+0.3", color: "text-accent-foreground" },
];

export default function Dashboard() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, Astrid. Here's what's happening today.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">Download Report</Button>
          <Button className="nordic-gradient"><UserPlus className="mr-2 h-4 w-4" />Add Employee</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, i) => (
          <Card key={stat.label} className="animate-fade-in-up" style={{ animationDelay: `${i * 0.05}s` }}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-3xl font-bold mt-1">{stat.value}</p>
                </div>
                <div className={`h-12 w-12 rounded-lg bg-secondary flex items-center justify-center ${stat.color}`}>
                  <stat.icon className="h-6 w-6" />
                </div>
              </div>
              <div className="flex items-center gap-1 mt-3 text-sm">
                <ArrowUpRight className="h-4 w-4 text-success" />
                <span className="text-success font-medium">{stat.trend}</span>
                <span className="text-muted-foreground">vs last month</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle className="flex items-center gap-2"><Award className="h-5 w-5 text-primary" />Company Score Overview</CardTitle></CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center h-32 w-32 rounded-full nordic-gradient">
                    <span className="text-4xl font-bold text-primary-foreground">87</span>
                  </div>
                  <p className="text-muted-foreground mt-2">Overall Score</p>
                </div>
              </div>
              <div className="space-y-4">
                {[{ label: "Training Completion", value: 92 }, { label: "Employee Engagement", value: 85 }, { label: "Performance Goals", value: 78 }, { label: "Compliance Rate", value: 96 }].map((item) => (
                  <div key={item.label} className="space-y-2">
                    <div className="flex justify-between text-sm"><span>{item.label}</span><span className="font-medium">{item.value}%</span></div>
                    <Progress value={item.value} className="h-2" />
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Quick Actions</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {quickActions.map((action) => (
              <Button key={action.label} variant="outline" className="w-full justify-start" asChild>
                <Link to={action.href}>
                  <div className={`mr-3 h-8 w-8 rounded-lg ${action.color} flex items-center justify-center`}>
                    <action.icon className="h-4 w-4 text-primary-foreground" />
                  </div>
                  {action.label}
                </Link>
              </Button>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5 text-primary" />Activity Score Leaderboard</CardTitle>
            <Button variant="ghost" size="sm" asChild><Link to="/employees">View All</Link></Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {leaderboard.map((person, i) => (
                <div key={person.name} className="flex items-center gap-4 p-3 rounded-lg bg-secondary/50">
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold ${i === 0 ? "bg-yellow-500 text-white" : i === 1 ? "bg-gray-400 text-white" : i === 2 ? "bg-amber-600 text-white" : "bg-muted text-muted-foreground"}`}>
                    {person.rank}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{person.name}</p>
                    <p className="text-sm text-muted-foreground">{person.department}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg">{person.score}</p>
                    <p className="text-xs text-muted-foreground">{person.trainings} trainings</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2"><Clock className="h-5 w-5 text-primary" />Recent Activity</CardTitle>
            <Button variant="ghost" size="sm">View All</Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activities.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3">
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 ${activity.type === "training" ? "bg-success/10 text-success" : activity.type === "employee" ? "bg-primary/10 text-primary" : activity.type === "report" ? "bg-warning/10 text-warning" : "bg-accent text-accent-foreground"}`}>
                    {activity.type === "training" ? <GraduationCap className="h-4 w-4" /> : activity.type === "employee" ? <UserPlus className="h-4 w-4" /> : activity.type === "report" ? <FileText className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm"><span className="font-medium">{activity.user}</span> <span className="text-muted-foreground">{activity.action}</span> <span className="font-medium">{activity.target}</span></p>
                    <p className="text-xs text-muted-foreground mt-0.5">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2">Pending Actions<Badge variant="secondary">{stats.pendingApprovals}</Badge></CardTitle></CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            {[{ label: "3 Leave Requests", sub: "Awaiting approval", icon: Clock, color: "bg-warning/10 text-warning" }, { label: "2 Reports Due", sub: "This week", icon: FileText, color: "bg-primary/10 text-primary" }, { label: "5 Trainings Overdue", sub: "Require follow-up", icon: GraduationCap, color: "bg-destructive/10 text-destructive" }].map((item) => (
              <div key={item.label} className="p-4 rounded-lg border border-border bg-card">
                <div className="flex items-center gap-3">
                  <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${item.color}`}><item.icon className="h-5 w-5" /></div>
                  <div><p className="font-medium">{item.label}</p><p className="text-sm text-muted-foreground">{item.sub}</p></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
