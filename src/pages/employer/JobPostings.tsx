import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Search, Plus, MoreHorizontal, Eye, MapPin, Users, Clock, Briefcase, Loader2 } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useEmployerJobs, useCreateJob, useUpdateJob, useMyCompany } from "@/hooks/useData";
import { useToast } from "@/hooks/use-toast";
import { isCompanyProfileComplete, type CompanyProfile } from "@/lib/companyProfileCompleteness";

const EmployerJobPostings = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: jobs, isLoading } = useEmployerJobs();
  const { data: employerData } = useMyCompany();
  const createJob = useCreateJob();
  const updateJob = useUpdateJob();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({
    title: "",
    location: "",
    job_type: "Full-time",
    description: "",
    salary_range: "",
  });

  const companyId = employerData?.company_id;
  const company = employerData?.companies as CompanyProfile | null;
  const profileReady = isCompanyProfileComplete(company);
  const list = (jobs ?? []).filter((j) => {
    const q = search.toLowerCase().trim();
    if (!q) return true;
    return j.title.toLowerCase().includes(q) || (j.location ?? "").toLowerCase().includes(q);
  });

  useEffect(() => {
    if (searchParams.get("new") === "1" && profileReady) {
      setOpen(true);
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, profileReady, setSearchParams]);

  const applicantCount = (job: { applications?: { count: number }[] }) =>
    job.applications?.[0]?.count ?? 0;

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyId) return;
    try {
      await createJob.mutateAsync({
        company_id: companyId,
        title: form.title,
        location: form.location,
        job_type: form.job_type,
        description: form.description,
        salary_range: form.salary_range,
        status: "open",
        posted_at: new Date().toISOString(),
      });
      toast({ title: "Job created", description: "Your job posting is now live." });
      setOpen(false);
      setForm({ title: "", location: "", job_type: "Full-time", description: "", salary_range: "" });
    } catch (err) {
      toast({ title: "Failed", description: err instanceof Error ? err.message : "Try again", variant: "destructive" });
    }
  };

  const setStatus = async (id: string, status: string) => {
    try {
      await updateJob.mutateAsync({ id, status });
      toast({ title: "Job updated" });
    } catch (err) {
      toast({ title: "Failed", description: err instanceof Error ? err.message : "Try again", variant: "destructive" });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Job Postings</h1>
          <p className="text-muted-foreground">Manage your job listings</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button
              className="gap-2 bg-nordic-orange hover:bg-nordic-orange/90 text-white"
              disabled={!profileReady}
              onClick={(e) => {
                if (!profileReady) {
                  e.preventDefault();
                  toast({
                    title: "Complete company profile first",
                    description: "Finish Company Profile before posting roles.",
                    variant: "destructive",
                  });
                }
              }}
            >
              <Plus className="h-4 w-4" />Create New Job
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Create job posting</DialogTitle></DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2"><Label>Title</Label><Input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
              <div className="space-y-2"><Label>Location</Label><Input required value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} /></div>
              <div className="space-y-2"><Label>Job type</Label><Input value={form.job_type} onChange={(e) => setForm({ ...form, job_type: e.target.value })} /></div>
              <div className="space-y-2"><Label>Salary range</Label><Input value={form.salary_range} onChange={(e) => setForm({ ...form, salary_range: e.target.value })} /></div>
              <div className="space-y-2"><Label>Description</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
              <Button type="submit" disabled={createJob.isPending} className="w-full">Publish job</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Open Jobs</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{list.filter((j) => j.status === "open").length}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Total Applicants</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{list.reduce((a, j) => a + applicantCount(j), 0)}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Drafts</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{list.filter((j) => j.status === "draft").length}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Closed</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{list.filter((j) => j.status === "closed").length}</div></CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search jobs..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {list.length === 0 && (
            <div className="text-center py-10 space-y-4">
              <p className="text-muted-foreground">No jobs posted yet. Create one so candidates can apply.</p>
              <Button
                className="gap-2 bg-nordic-orange hover:bg-nordic-orange/90 text-white"
                onClick={() => setOpen(true)}
              >
                <Plus className="h-4 w-4" />
                Post your first job
              </Button>
            </div>
          )}
          {list.map((job) => (
            <div key={job.id} className="flex items-center justify-between p-4 rounded border hover:border-employer-accent/50 transition-colors">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">{job.title}</h3>
                  <Badge variant={job.status === "open" ? "default" : job.status === "draft" ? "outline" : "secondary"}>{job.status}</Badge>
                </div>
                <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{job.location ?? "—"}</span>
                  <span className="flex items-center gap-1"><Briefcase className="h-3 w-3" />{job.job_type ?? "—"}</span>
                  {job.posted_at && (
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" />Posted {job.posted_at.split("T")[0]}</span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-6">
                <p className="font-medium flex items-center gap-1 hidden md:flex"><Users className="h-4 w-4" />{applicantCount(job)} applicants</p>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link to={`/employer/jobs/${job.id}`}><Eye className="h-4 w-4 mr-2" />View</Link>
                    </DropdownMenuItem>
                    {job.status !== "open" && (
                      <DropdownMenuItem onClick={() => setStatus(job.id, "open")}>Publish</DropdownMenuItem>
                    )}
                    {job.status === "open" && (
                      <DropdownMenuItem onClick={() => setStatus(job.id, "closed")}>Close</DropdownMenuItem>
                    )}
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
