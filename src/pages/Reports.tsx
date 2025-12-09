import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart3, TrendingUp, Users, GraduationCap, Download, Calendar, FileText, ArrowRight, Plus, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { reports } from "@/data/mockData";

const reportTypes = [
  { id: "training", label: "Training Reports", icon: GraduationCap, count: 12, color: "text-primary" },
  { id: "engagement", label: "Engagement Reports", icon: Users, count: 8, color: "text-success" },
  { id: "performance", label: "Performance Reports", icon: TrendingUp, count: 15, color: "text-warning" },
  { id: "custom", label: "Custom Reports", icon: BarChart3, count: 5, color: "text-accent-foreground" },
];

export default function Reports() {
  const [selectedType, setSelectedType] = useState("all");
  const [dateRange, setDateRange] = useState("30d");

  const filteredReports = reports.filter((report) => selectedType === "all" || report.type.toLowerCase() === selectedType);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div><h1 className="text-3xl font-bold">Reports</h1><p className="text-muted-foreground">Access insights and analytics about your workforce.</p></div>
        <div className="flex gap-3">
          <Select value={dateRange} onValueChange={setDateRange}><SelectTrigger className="w-40"><Calendar className="mr-2 h-4 w-4" /><SelectValue /></SelectTrigger><SelectContent><SelectItem value="7d">Last 7 days</SelectItem><SelectItem value="30d">Last 30 days</SelectItem><SelectItem value="90d">Last 90 days</SelectItem><SelectItem value="1y">Last year</SelectItem></SelectContent></Select>
          <Button className="nordic-gradient"><Plus className="mr-2 h-4 w-4" />Create Report</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {reportTypes.map((type) => (
          <Card key={type.id} className="cursor-pointer hover:border-primary/50 transition-colors" onClick={() => setSelectedType(type.id)}>
            <CardContent className="pt-6"><div className="flex items-center justify-between"><div className={`h-10 w-10 rounded-lg bg-secondary flex items-center justify-center ${type.color}`}><type.icon className="h-5 w-5" /></div><Badge variant="secondary">{type.count}</Badge></div><h3 className="font-medium mt-3">{type.label}</h3></CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="all" className="space-y-6">
        <TabsList><TabsTrigger value="all" onClick={() => setSelectedType("all")}>All Reports</TabsTrigger><TabsTrigger value="scheduled">Scheduled</TabsTrigger><TabsTrigger value="favorites">Favorites</TabsTrigger></TabsList>

        <TabsContent value="all" className="space-y-4">
          <div className="grid lg:grid-cols-3 gap-6 mb-6">
            <Card className="lg:col-span-2"><CardHeader><CardTitle>Quick Overview</CardTitle></CardHeader><CardContent>
              <div className="grid grid-cols-4 gap-4">
                {[{ label: "Training Rate", value: "87%", color: "text-primary" }, { label: "Engagement", value: "4.2", color: "text-success" }, { label: "Performance", value: "92%", color: "text-warning" }, { label: "Employees", value: "156", color: "" }].map((stat) => (
                  <div key={stat.label} className="text-center p-4 bg-secondary/50 rounded-lg"><p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p><p className="text-sm text-muted-foreground">{stat.label}</p></div>
                ))}
              </div>
            </CardContent></Card>
            <Card><CardHeader><CardTitle>Quick Actions</CardTitle></CardHeader><CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start"><Download className="mr-2 h-4 w-4" />Export All Data</Button>
              <Button variant="outline" className="w-full justify-start"><Calendar className="mr-2 h-4 w-4" />Schedule Report</Button>
              <Button variant="outline" className="w-full justify-start"><BarChart3 className="mr-2 h-4 w-4" />Custom Dashboard</Button>
            </CardContent></Card>
          </div>

          <Card><CardHeader className="flex flex-row items-center justify-between"><CardTitle>Recent Reports</CardTitle>
            <Select value={selectedType} onValueChange={setSelectedType}><SelectTrigger className="w-40"><SelectValue placeholder="Filter by type" /></SelectTrigger><SelectContent><SelectItem value="all">All Types</SelectItem><SelectItem value="training">Training</SelectItem><SelectItem value="engagement">Engagement</SelectItem><SelectItem value="performance">Performance</SelectItem><SelectItem value="custom">Custom</SelectItem></SelectContent></Select>
          </CardHeader><CardContent>
            <div className="space-y-4">
              {filteredReports.map((report) => (
                <div key={report.id} className="flex items-center justify-between p-4 rounded-lg border border-border hover:border-primary/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${report.status === "completed" ? "bg-success/10" : report.status === "pending" ? "bg-warning/10" : "bg-primary/10"}`}>
                      {report.status === "completed" ? <CheckCircle className="h-5 w-5 text-success" /> : report.status === "pending" ? <Clock className="h-5 w-5 text-warning" /> : <AlertCircle className="h-5 w-5 text-primary" />}
                    </div>
                    <div><h4 className="font-medium">{report.title}</h4><p className="text-sm text-muted-foreground">{report.type} • {new Date(report.date).toLocaleDateString()}</p></div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={report.status === "completed" ? "default" : report.status === "pending" ? "secondary" : "outline"}>{report.status}</Badge>
                    <Button variant="ghost" size="sm" asChild><Link to={`/reports/${report.id}`}>View<ArrowRight className="ml-2 h-4 w-4" /></Link></Button>
                    <Button variant="ghost" size="icon"><Download className="h-4 w-4" /></Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="scheduled" className="space-y-4">
          <Card><CardHeader><CardTitle>Scheduled Reports</CardTitle></CardHeader><CardContent>
            <div className="space-y-4">
              {[{ name: "Weekly Training Summary", frequency: "Every Monday", next: "Dec 16, 2024" }, { name: "Monthly Engagement Report", frequency: "1st of month", next: "Jan 1, 2025" }, { name: "Quarterly Performance Review", frequency: "Quarterly", next: "Jan 1, 2025" }].map((schedule, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-lg border border-border">
                  <div className="flex items-center gap-4"><div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center"><Calendar className="h-5 w-5 text-primary" /></div><div><h4 className="font-medium">{schedule.name}</h4><p className="text-sm text-muted-foreground">{schedule.frequency} • Next: {schedule.next}</p></div></div>
                  <Button variant="outline" size="sm">Edit Schedule</Button>
                </div>
              ))}
            </div>
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="favorites" className="space-y-4">
          <Card><CardContent className="pt-6">
            <div className="text-center py-12"><FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" /><h3 className="font-medium mb-2">No Favorite Reports</h3><p className="text-sm text-muted-foreground mb-4">Star reports to add them to your favorites for quick access.</p><Button variant="outline">Browse Reports</Button></div>
          </CardContent></Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
