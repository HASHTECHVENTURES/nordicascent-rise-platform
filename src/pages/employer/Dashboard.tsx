import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Briefcase, Users, Calendar, TrendingUp, FileText, Clock } from "lucide-react";

const EmployerDashboard = () => (
  <div className="space-y-6">
    <div>
      <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
      <p className="text-muted-foreground">Welcome back, TechNordic AB</p>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card className="bg-gradient-to-br from-employer-accent/10 to-transparent border-employer-accent/20">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Active Jobs</CardTitle>
          <Briefcase className="h-4 w-4 text-employer-accent" />
        </CardHeader>
        <CardContent><div className="text-2xl font-bold">12</div></CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Total Candidates</CardTitle>
          <Users className="h-4 w-4" />
        </CardHeader>
        <CardContent><div className="text-2xl font-bold">248</div></CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Interviews This Week</CardTitle>
          <Calendar className="h-4 w-4" />
        </CardHeader>
        <CardContent><div className="text-2xl font-bold">8</div></CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Offers Pending</CardTitle>
          <FileText className="h-4 w-4" />
        </CardHeader>
        <CardContent><div className="text-2xl font-bold">3</div></CardContent>
      </Card>
    </div>
    <Card><CardHeader><CardTitle>Recent Activity</CardTitle></CardHeader><CardContent><p className="text-muted-foreground">Activity feed coming soon...</p></CardContent></Card>
  </div>
);

export default EmployerDashboard;
