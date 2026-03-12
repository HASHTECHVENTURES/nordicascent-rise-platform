import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LayoutDashboard, UserCheck, Building2, AlertTriangle, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const needsAttention = [
  { type: "candidate" as const, name: "Emma Lindqvist", issue: "Readiness incomplete 14 days", href: "/admin/candidates" },
  { type: "company" as const, name: "StartupHub Finland", issue: "Pending verification", href: "/admin/employers" },
  { type: "candidate" as const, name: "Lars Andersen", issue: "Document upload pending", href: "/admin/candidates" },
];

const AdminDashboard = () => (
  <div className="space-y-6">
    <div>
      <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
      <p className="text-muted-foreground">Portal overview — candidates and companies</p>
    </div>

    {/* Quick counts */}
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card className="bg-gradient-to-br from-primary/10 to-transparent border-primary/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <UserCheck className="h-4 w-4" /> Total Candidates
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">2,847</div>
          <p className="text-xs text-chart-success">+156 this month</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Building2 className="h-4 w-4" /> Total Companies
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">342</div>
          <p className="text-xs text-muted-foreground">298 verified</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-chart-warning">266</div>
          <p className="text-xs text-muted-foreground">Candidates + companies</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Needs action</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-destructive">5</div>
          <p className="text-xs text-muted-foreground">Stuck or overdue</p>
        </CardContent>
      </Card>
    </div>

    {/* Needs attention */}
    <Card className="border-warning/30 bg-warning/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-warning" />
          Needs attention
        </CardTitle>
        <p className="text-sm text-muted-foreground">Fix these from the linked page</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {needsAttention.map((item) => (
            <div
              key={`${item.type}-${item.name}`}
              className="flex items-center justify-between p-3 rounded-lg border bg-card"
            >
              <div>
                <p className="font-medium text-sm">{item.name}</p>
                <p className="text-xs text-muted-foreground">{item.issue}</p>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link to={item.href}>
                  Fix <ArrowRight className="ml-1 h-3 w-3" />
                </Link>
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>

    {/* Shortcuts */}
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Quick links</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" asChild className="gap-2">
            <Link to="/admin/candidates">
              <UserCheck className="h-4 w-4" />
              Candidates
            </Link>
          </Button>
          <Button variant="outline" asChild className="gap-2">
            <Link to="/admin/employers">
              <Building2 className="h-4 w-4" />
              Companies
            </Link>
          </Button>
          <Button variant="outline" asChild className="gap-2">
            <Link to="/admin/issues">
              <AlertTriangle className="h-4 w-4" />
              Issues
            </Link>
          </Button>
          <Button variant="outline" asChild className="gap-2">
            <Link to="/admin/analytics">
              <LayoutDashboard className="h-4 w-4" />
              Analytics
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  </div>
);

export default AdminDashboard;
