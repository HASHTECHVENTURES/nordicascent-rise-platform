import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Download, Share2, Calendar, Filter, TrendingUp, TrendingDown, BarChart3, PieChart } from "lucide-react";
import { reports } from "@/data/mockData";

export default function ReportDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const report = reports.find((r) => r.id === Number(id));

  if (!report) {
    return (<div className="text-center py-20"><h1 className="text-2xl font-bold mb-4">Report not found</h1><Button onClick={() => navigate("/reports")}>Back to Reports</Button></div>);
  }

  const kpis = [{ label: "Training Completion", value: "87%", change: "+5%", trend: "up" }, { label: "Avg. Score", value: "4.2/5", change: "+0.3", trend: "up" }, { label: "Active Learners", value: "142", change: "+12", trend: "up" }, { label: "Overdue Trainings", value: "8", change: "-3", trend: "down" }];
  const departmentData = [{ name: "Engineering", completion: 92, enrolled: 45 }, { name: "Sales", completion: 88, enrolled: 32 }, { name: "Marketing", completion: 85, enrolled: 18 }, { name: "HR", completion: 96, enrolled: 12 }, { name: "Finance", completion: 78, enrolled: 15 }];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/reports")}><ArrowLeft className="h-5 w-5" /></Button>
          <div>
            <div className="flex items-center gap-3"><h1 className="text-2xl font-bold">{report.title}</h1><Badge variant={report.status === "completed" ? "default" : "secondary"}>{report.status}</Badge></div>
            <p className="text-muted-foreground">{report.type} Report • Generated {new Date(report.date).toLocaleDateString()}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Select defaultValue="30d"><SelectTrigger className="w-40"><Calendar className="mr-2 h-4 w-4" /><SelectValue /></SelectTrigger><SelectContent><SelectItem value="7d">Last 7 days</SelectItem><SelectItem value="30d">Last 30 days</SelectItem><SelectItem value="90d">Last 90 days</SelectItem></SelectContent></Select>
          <Button variant="outline"><Share2 className="mr-2 h-4 w-4" />Share</Button>
          <Button className="nordic-gradient"><Download className="mr-2 h-4 w-4" />Export</Button>
        </div>
      </div>

      <Card><CardContent className="pt-6"><p className="text-lg">{report.summary}</p></CardContent></Card>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <Card key={kpi.label}><CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">{kpi.label}</p>
            <div className="flex items-end justify-between mt-2"><p className="text-3xl font-bold">{kpi.value}</p><div className={`flex items-center gap-1 text-sm ${kpi.trend === "up" ? "text-success" : "text-destructive"}`}>{kpi.trend === "up" ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}{kpi.change}</div></div>
          </CardContent></Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card><CardHeader><CardTitle className="flex items-center gap-2"><BarChart3 className="h-5 w-5" />Completion by Department</CardTitle></CardHeader><CardContent>
          <div className="space-y-4">
            {departmentData.map((dept) => (<div key={dept.name} className="space-y-2"><div className="flex justify-between text-sm"><span className="font-medium">{dept.name}</span><span className="text-muted-foreground">{dept.completion}%</span></div><Progress value={dept.completion} className="h-2" /><p className="text-xs text-muted-foreground">{dept.enrolled} enrolled</p></div>))}
          </div>
        </CardContent></Card>

        <Card><CardHeader><CardTitle className="flex items-center gap-2"><PieChart className="h-5 w-5" />Training Distribution</CardTitle></CardHeader><CardContent>
          <div className="space-y-4">
            {[{ category: "Compliance", percentage: 35, color: "bg-primary" }, { category: "Leadership", percentage: 25, color: "bg-success" }, { category: "Technical", percentage: 20, color: "bg-warning" }, { category: "Soft Skills", percentage: 15, color: "bg-accent-foreground" }, { category: "Other", percentage: 5, color: "bg-muted-foreground" }].map((item) => (
              <div key={item.category} className="flex items-center gap-4"><div className={`h-4 w-4 rounded ${item.color}`} /><div className="flex-1"><div className="flex justify-between"><span className="text-sm font-medium">{item.category}</span><span className="text-sm text-muted-foreground">{item.percentage}%</span></div><Progress value={item.percentage} className="h-1.5 mt-1" /></div></div>
            ))}
          </div>
        </CardContent></Card>
      </div>

      <Card><CardHeader className="flex flex-row items-center justify-between"><CardTitle>Detailed Breakdown</CardTitle><Button variant="outline" size="sm"><Filter className="mr-2 h-4 w-4" />Filter</Button></CardHeader><CardContent>
        <div className="overflow-x-auto">
          <table className="w-full"><thead><tr className="border-b border-border"><th className="text-left py-3 px-4 font-medium">Department</th><th className="text-left py-3 px-4 font-medium">Enrolled</th><th className="text-left py-3 px-4 font-medium">Completed</th><th className="text-left py-3 px-4 font-medium">In Progress</th><th className="text-left py-3 px-4 font-medium">Overdue</th><th className="text-left py-3 px-4 font-medium">Completion Rate</th></tr></thead>
            <tbody>{departmentData.map((dept) => (<tr key={dept.name} className="border-b border-border/50"><td className="py-3 px-4 font-medium">{dept.name}</td><td className="py-3 px-4">{dept.enrolled}</td><td className="py-3 px-4 text-success">{Math.round(dept.enrolled * dept.completion / 100)}</td><td className="py-3 px-4 text-warning">{Math.round(dept.enrolled * 0.1)}</td><td className="py-3 px-4 text-destructive">{Math.round(dept.enrolled * 0.05)}</td><td className="py-3 px-4"><div className="flex items-center gap-2"><Progress value={dept.completion} className="h-2 w-20" /><span>{dept.completion}%</span></div></td></tr>))}</tbody>
          </table>
        </div>
      </CardContent></Card>

      <Card><CardHeader><CardTitle>Export Options</CardTitle></CardHeader><CardContent className="flex gap-4">
        <Button variant="outline"><Download className="mr-2 h-4 w-4" />Download PDF</Button>
        <Button variant="outline"><Download className="mr-2 h-4 w-4" />Download CSV</Button>
        <Button variant="outline"><Download className="mr-2 h-4 w-4" />Download Excel</Button>
      </CardContent></Card>
    </div>
  );
}
