import { Card, CardContent } from "@/components/ui/card";
import { UserCheck, Building2, Mail, AlertTriangle, TrendingUp, TrendingDown } from "lucide-react";
import { Link } from "react-router-dom";
import { AreaChart, Area, ResponsiveContainer, BarChart, Bar } from "recharts";

const candidatesTrend = [
  { v: 2100 }, { v: 2240 }, { v: 2380 }, { v: 2510 }, { v: 2650 }, { v: 2780 }, { v: 2847 },
];
const companiesTrend = [
  { v: 280 }, { v: 300 }, { v: 315 }, { v: 325 }, { v: 332 }, { v: 338 }, { v: 342 },
];
const issuesTrend = [
  { v: 12 }, { v: 10 }, { v: 9 }, { v: 8 }, { v: 7 }, { v: 6 }, { v: 7 },
];
const supportTrend = [
  { v: 4 }, { v: 5 }, { v: 3 }, { v: 6 }, { v: 5 }, { v: 4 }, { v: 3 },
];

const AdminDashboard = () => (
  <div className="space-y-8">
    <div>
      <h1 className="text-2xl font-medium text-foreground">Admin Dashboard</h1>
      <p className="text-muted-foreground">Portal overview — candidates and companies</p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Link to="/admin/candidates">
        <Card className="hover:border-primary/50 transition-colors cursor-pointer overflow-hidden h-full">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center">
                  <UserCheck className="h-7 w-7 text-primary" />
                </div>
                <div>
                  <p className="text-4xl font-bold">2,847</p>
                  <p className="text-sm text-muted-foreground mt-0.5">Total Candidates</p>
                </div>
              </div>
              <div className="flex items-center gap-1 text-success text-xs font-medium">
                <TrendingUp className="h-3.5 w-3.5" />
                +156 this month
              </div>
            </div>
            <div className="h-16 mt-4 -mx-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={candidatesTrend}>
                  <defs>
                    <linearGradient id="adminCandGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area
                    type="monotone"
                    dataKey="v"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    fill="url(#adminCandGrad)"
                    dot={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </Link>

      <Link to="/admin/employers">
        <Card className="hover:border-primary/50 transition-colors cursor-pointer overflow-hidden h-full">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-xl bg-secondary/20 flex items-center justify-center">
                  <Building2 className="h-7 w-7 text-secondary" />
                </div>
                <div>
                  <p className="text-4xl font-bold">342</p>
                  <p className="text-sm text-muted-foreground mt-0.5">Total Companies</p>
                </div>
              </div>
              <div className="flex items-center gap-1 text-muted-foreground text-xs font-medium">
                298 verified
              </div>
            </div>
            <div className="h-16 mt-4 -mx-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={companiesTrend}>
                  <Bar dataKey="v" fill="hsl(var(--secondary))" radius={[2, 2, 0, 0]} opacity={0.6} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </Link>

      <Link to="/admin/issues">
        <Card className="hover:border-primary/50 transition-colors cursor-pointer overflow-hidden h-full">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-xl bg-warning/10 flex items-center justify-center">
                  <AlertTriangle className="h-7 w-7 text-warning" />
                </div>
                <div>
                  <p className="text-4xl font-bold">7</p>
                  <p className="text-sm text-muted-foreground mt-0.5">Open Issues</p>
                </div>
              </div>
              <div className="flex items-center gap-1 text-success text-xs font-medium">
                <TrendingDown className="h-3.5 w-3.5" />
                Trending down
              </div>
            </div>
            <div className="h-16 mt-4 -mx-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={issuesTrend}>
                  <defs>
                    <linearGradient id="adminIssuesGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(var(--warning))" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="hsl(var(--warning))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area
                    type="monotone"
                    dataKey="v"
                    stroke="hsl(var(--warning))"
                    strokeWidth={2}
                    fill="url(#adminIssuesGrad)"
                    dot={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </Link>

      <Link to="/admin/support">
        <Card className="hover:border-primary/50 transition-colors cursor-pointer overflow-hidden h-full">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-xl bg-success/10 flex items-center justify-center">
                  <Mail className="h-7 w-7 text-success" />
                </div>
                <div>
                  <p className="text-4xl font-bold">3</p>
                  <p className="text-sm text-muted-foreground mt-0.5">Support Inbox</p>
                </div>
              </div>
              <div className="flex items-center gap-1 text-muted-foreground text-xs font-medium">
                Awaiting reply
              </div>
            </div>
            <div className="h-16 mt-4 -mx-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={supportTrend}>
                  <Bar dataKey="v" fill="hsl(var(--success))" radius={[2, 2, 0, 0]} opacity={0.6} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </Link>
    </div>
  </div>
);

export default AdminDashboard;
