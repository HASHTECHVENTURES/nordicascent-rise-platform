import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, TrendingUp, Users, Clock, Target, BarChart3 } from "lucide-react";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

const hiringFunnel = [
  { stage: "Applied", count: 248 },
  { stage: "Screened", count: 142 },
  { stage: "Interviewed", count: 68 },
  { stage: "Offered", count: 24 },
  { stage: "Hired", count: 18 },
];

const timeToHire = [
  { month: "Jan", days: 32 },
  { month: "Feb", days: 28 },
  { month: "Mar", days: 25 },
  { month: "Apr", days: 22 },
  { month: "May", days: 24 },
  { month: "Jun", days: 21 },
];

const sourceData = [
  { name: "Platform", value: 45, color: "hsl(var(--employer-accent))" },
  { name: "LinkedIn", value: 25, color: "hsl(var(--chart-2))" },
  { name: "Referrals", value: 18, color: "hsl(var(--chart-3))" },
  { name: "Direct", value: 12, color: "hsl(var(--chart-4))" },
];

const EmployerAnalytics = () => (
  <div className="space-y-6">
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div><h1 className="text-3xl font-bold tracking-tight">Analytics</h1><p className="text-muted-foreground">Track your hiring performance</p></div>
      <div className="flex gap-2">
        <Select defaultValue="30"><SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="7">Last 7 days</SelectItem><SelectItem value="30">Last 30 days</SelectItem><SelectItem value="90">Last 90 days</SelectItem></SelectContent></Select>
        <Button variant="outline" className="gap-2"><Download className="h-4 w-4" />Export</Button>
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card className="bg-primary/5 border-primary/20">
        <CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Total Hires</CardTitle><Users className="h-4 w-4 text-employer-accent" /></CardHeader>
        <CardContent><div className="text-2xl font-bold">18</div><p className="text-xs text-chart-success flex items-center gap-1"><TrendingUp className="h-3 w-3" />+28% vs last period</p></CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Avg. Time to Hire</CardTitle><Clock className="h-4 w-4" /></CardHeader>
        <CardContent><div className="text-2xl font-bold">21 days</div><p className="text-xs text-chart-success">-5 days vs last period</p></CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Offer Acceptance</CardTitle><Target className="h-4 w-4" /></CardHeader>
        <CardContent><div className="text-2xl font-bold">75%</div><p className="text-xs text-muted-foreground">18 of 24 offers</p></CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Cost per Hire</CardTitle><BarChart3 className="h-4 w-4" /></CardHeader>
        <CardContent><div className="text-2xl font-bold">€2,450</div><p className="text-xs text-chart-success">-12% vs last period</p></CardContent>
      </Card>
    </div>

    <Tabs defaultValue="funnel" className="space-y-4">
      <TabsList><TabsTrigger value="funnel">Hiring Funnel</TabsTrigger><TabsTrigger value="time">Time to Hire</TabsTrigger><TabsTrigger value="sources">Sources</TabsTrigger></TabsList>

      <TabsContent value="funnel">
        <Card>
          <CardHeader><CardTitle>Hiring Funnel</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={hiringFunnel} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" />
                <YAxis type="category" dataKey="stage" width={100} />
                <Tooltip />
                <Bar dataKey="count" fill="hsl(var(--employer-accent))" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="time">
        <Card>
          <CardHeader><CardTitle>Average Time to Hire (Days)</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={timeToHire}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="days" stroke="hsl(var(--employer-accent))" strokeWidth={2} dot={{ fill: "hsl(var(--employer-accent))" }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="sources">
        <Card>
          <CardHeader><CardTitle>Candidate Sources</CardTitle></CardHeader>
          <CardContent>
            <div className="flex items-center justify-center">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={sourceData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    {sourceData.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color} />))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  </div>
);

export default EmployerAnalytics;
