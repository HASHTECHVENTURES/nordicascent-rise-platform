import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Building2, TrendingUp, Briefcase, BarChart3 } from "lucide-react";

const AdminDashboard = () => (
  <div className="space-y-6">
    <div>
      <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
      <p className="text-muted-foreground">Platform overview and management</p>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card className="bg-gradient-to-br from-primary/10 to-transparent border-primary/20">
        <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle></CardHeader>
        <CardContent><div className="text-2xl font-bold">5,234</div><p className="text-xs text-chart-success">+12% this month</p></CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Active Employers</CardTitle></CardHeader>
        <CardContent><div className="text-2xl font-bold">342</div></CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Active Candidates</CardTitle></CardHeader>
        <CardContent><div className="text-2xl font-bold">2,847</div></CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Live Jobs</CardTitle></CardHeader>
        <CardContent><div className="text-2xl font-bold">892</div></CardContent>
      </Card>
    </div>
    <Card><CardHeader><CardTitle>Platform Activity</CardTitle></CardHeader><CardContent><p className="text-muted-foreground">Activity charts coming soon...</p></CardContent></Card>
  </div>
);

export default AdminDashboard;
