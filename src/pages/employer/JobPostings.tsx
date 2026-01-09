import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Plus, MoreHorizontal, Eye, Pencil, Copy, Pause, Trash2, MapPin, Users, Clock, Briefcase } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const jobs = [
  { id: 1, title: "Senior Frontend Developer", location: "Stockholm, SE", type: "Full-time", applicants: 47, status: "active", posted: "2024-03-01", views: 234 },
  { id: 2, title: "Product Manager", location: "Copenhagen, DK", type: "Full-time", applicants: 32, status: "active", posted: "2024-03-05", views: 189 },
  { id: 3, title: "UX Designer", location: "Remote", type: "Contract", applicants: 18, status: "paused", posted: "2024-02-20", views: 156 },
  { id: 4, title: "Backend Engineer", location: "Stockholm, SE", type: "Full-time", applicants: 0, status: "draft", posted: "2024-03-12", views: 0 },
  { id: 5, title: "Data Scientist", location: "Helsinki, FI", type: "Full-time", applicants: 89, status: "closed", posted: "2024-01-15", views: 445 },
];

const EmployerJobPostings = () => {
  const getStatusJobs = (status: string) => jobs.filter(j => j.status === status);
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Job Postings</h1>
          <p className="text-muted-foreground">Manage your job listings</p>
        </div>
        <Button className="gap-2 bg-employer-accent hover:bg-employer-accent/90"><Plus className="h-4 w-4" />Create New Job</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Active Jobs</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{getStatusJobs('active').length}</div></CardContent>
        </Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Total Applicants</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{jobs.reduce((a, j) => a + j.applicants, 0)}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Drafts</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{getStatusJobs('draft').length}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Total Views</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{jobs.reduce((a, j) => a + j.views, 0)}</div></CardContent></Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-4 justify-between">
            <div className="relative flex-1 max-w-sm"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Search jobs..." className="pl-9" /></div>
            <Select defaultValue="all"><SelectTrigger className="w-[140px]"><SelectValue placeholder="Status" /></SelectTrigger><SelectContent><SelectItem value="all">All Status</SelectItem><SelectItem value="active">Active</SelectItem><SelectItem value="paused">Paused</SelectItem><SelectItem value="draft">Draft</SelectItem><SelectItem value="closed">Closed</SelectItem></SelectContent></Select>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {jobs.map((job) => (
            <div key={job.id} className="flex items-center justify-between p-4 rounded border hover:border-employer-accent/50 transition-colors">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">{job.title}</h3>
                  <Badge variant={job.status === 'active' ? 'default' : job.status === 'paused' ? 'secondary' : job.status === 'draft' ? 'outline' : 'destructive'}>{job.status}</Badge>
                </div>
                <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{job.location}</span>
                  <span className="flex items-center gap-1"><Briefcase className="h-3 w-3" />{job.type}</span>
                  <span className="flex items-center gap-1"><Clock className="h-3 w-3" />Posted {job.posted}</span>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-right hidden md:block">
                  <p className="font-medium flex items-center gap-1"><Users className="h-4 w-4" />{job.applicants} applicants</p>
                  <p className="text-sm text-muted-foreground">{job.views} views</p>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem><Eye className="h-4 w-4 mr-2" />View</DropdownMenuItem>
                    <DropdownMenuItem><Pencil className="h-4 w-4 mr-2" />Edit</DropdownMenuItem>
                    <DropdownMenuItem><Copy className="h-4 w-4 mr-2" />Duplicate</DropdownMenuItem>
                    <DropdownMenuItem><Pause className="h-4 w-4 mr-2" />Pause</DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive"><Trash2 className="h-4 w-4 mr-2" />Delete</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default EmployerJobPostings;
