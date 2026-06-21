import { Card, CardContent } from "@/components/ui/card";
import { UserCheck, Building2, Mail, AlertTriangle, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { usePlatformStats } from "@/hooks/useData";

const AdminDashboard = () => {
  const { data: stats, isLoading } = usePlatformStats();

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-medium text-foreground">Admin Dashboard</h1>
        <p className="text-muted-foreground">Portal overview — live counts from Supabase</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link to="/admin/candidates">
          <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center">
                  <UserCheck className="h-7 w-7 text-primary" />
                </div>
                <div>
                  <p className="text-4xl font-bold">{stats?.candidates ?? 0}</p>
                  <p className="text-sm text-muted-foreground mt-0.5">Total Candidates</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link to="/admin/employers">
          <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-xl bg-secondary/20 flex items-center justify-center">
                  <Building2 className="h-7 w-7 text-secondary" />
                </div>
                <div>
                  <p className="text-4xl font-bold">{stats?.companies ?? 0}</p>
                  <p className="text-sm text-muted-foreground mt-0.5">Total Companies</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link to="/admin/issues">
          <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-xl bg-warning/10 flex items-center justify-center">
                  <AlertTriangle className="h-7 w-7 text-warning" />
                </div>
                <div>
                  <p className="text-4xl font-bold">{stats?.openIssues ?? 0}</p>
                  <p className="text-sm text-muted-foreground mt-0.5">Open Issues</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link to="/admin/support">
          <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-xl bg-success/10 flex items-center justify-center">
                  <Mail className="h-7 w-7 text-success" />
                </div>
                <div>
                  <p className="text-4xl font-bold">{stats?.openSupportTickets ?? 0}</p>
                  <p className="text-sm text-muted-foreground mt-0.5">Open Support Tickets</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
};

export default AdminDashboard;
