import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, Building2, MoreHorizontal, Eye, CheckCircle, Ban, Download } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Link } from "react-router-dom";

const employers = [
  { id: 1, name: "TechNordic AB", email: "hr@technordic.com", location: "Stockholm, SE", jobs: 12, status: "verified", joined: "2024-01-10" },
  { id: 2, name: "Nordic Innovations", email: "hiring@nordic.dk", location: "Copenhagen, DK", jobs: 8, status: "verified", joined: "2024-02-15" },
  { id: 3, name: "StartupHub Finland", email: "jobs@startuphub.fi", location: "Helsinki, FI", jobs: 3, status: "pending", joined: "2024-03-05" },
];

const AdminEmployers = () => (
  <div className="space-y-6">
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
    <div><h1 className="text-3xl font-bold tracking-tight">Company Management</h1><p className="text-muted-foreground">See and fix company issues</p></div>
    <Button variant="outline" className="gap-2 w-fit" onClick={() => {
      const headers = ["Name", "Email", "Location", "Jobs", "Status", "Joined"];
      const rows = employers.map(e => [e.name, e.email, e.location, e.jobs, e.status, e.joined]);
      const csv = [headers, ...rows].map(r => r.join(",")).join("\n");
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a"); a.href = url; a.download = "companies-export.csv"; a.click();
      URL.revokeObjectURL(url);
    }}>
      <Download className="h-4 w-4" />
      Export companies
    </Button>
  </div>
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card className="bg-gradient-to-br from-employer-accent/10 to-transparent border-employer-accent/20"><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Total Employers</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">342</div></CardContent></Card>
      <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Verified</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-chart-success">298</div></CardContent></Card>
      <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-chart-warning">32</div></CardContent></Card>
      <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Suspended</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-destructive">12</div></CardContent></Card>
    </div>
    <Card>
      <CardHeader><div className="flex gap-4"><div className="relative flex-1 max-w-sm"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Search companies..." className="pl-9" /></div><Button variant="outline" size="icon"><Filter className="h-4 w-4" /></Button></div></CardHeader>
      <CardContent>
        <div className="space-y-4">
          {employers.map((emp) => (
            <div key={emp.id} className="flex items-center justify-between p-4 rounded-lg border">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-employer-accent/10 flex items-center justify-center"><Building2 className="h-6 w-6 text-employer-accent" /></div>
                <div><div className="flex items-center gap-2"><h3 className="font-semibold">{emp.name}</h3>{emp.status === 'verified' && <CheckCircle className="h-4 w-4 text-chart-success" />}</div><p className="text-sm text-muted-foreground">{emp.location} • {emp.jobs} active jobs</p></div>
              </div>
              <div className="flex items-center gap-4">
                <Badge variant={emp.status === 'verified' ? 'default' : 'secondary'}>{emp.status}</Badge>
                <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild><Link to={`/admin/employers/${emp.id}`}><Eye className="h-4 w-4 mr-2" />View & fix</Link></DropdownMenuItem><DropdownMenuItem><CheckCircle className="h-4 w-4 mr-2" />Verify</DropdownMenuItem><DropdownMenuItem className="text-destructive"><Ban className="h-4 w-4 mr-2" />Suspend</DropdownMenuItem></DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  </div>
);

export default AdminEmployers;
