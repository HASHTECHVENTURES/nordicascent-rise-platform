import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, MapPin, Building2, Clock, Bookmark, ExternalLink, Filter, Briefcase, DollarSign } from "lucide-react";

const jobs = [
  { id: 1, title: "Senior Frontend Developer", company: "TechNordic AB", location: "Stockholm, SE", type: "Full-time", salary: "€60-80k", posted: "2 days ago", match: 95, saved: true, description: "Join our team to build modern React applications..." },
  { id: 2, title: "React Developer", company: "Nordic Innovations", location: "Copenhagen, DK", type: "Full-time", salary: "€55-70k", posted: "3 days ago", match: 88, saved: false, description: "Looking for an experienced React developer..." },
  { id: 3, title: "UI Engineer", company: "DesignHub Finland", location: "Helsinki, FI", type: "Contract", salary: "€500/day", posted: "1 week ago", match: 82, saved: true, description: "Contract role for UI development..." },
  { id: 4, title: "Full Stack Developer", company: "DataFlow Norway", location: "Oslo, NO", type: "Full-time", salary: "€65-85k", posted: "5 days ago", match: 78, saved: false, description: "Full stack development with React and Node.js..." },
  { id: 5, title: "Frontend Lead", company: "ScaleUp Sweden", location: "Gothenburg, SE", type: "Full-time", salary: "€75-95k", posted: "1 day ago", match: 91, saved: false, description: "Lead our frontend team and architecture..." },
];

const CandidateJobs = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Find Jobs</h1>
        <p className="text-muted-foreground">Discover opportunities matching your profile</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Job title, skills, or company" className="pl-9" />
            </div>
            <div className="relative flex-1">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Location" className="pl-9" />
            </div>
            <Select defaultValue="all">
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Job Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="fulltime">Full-time</SelectItem>
                <SelectItem value="contract">Contract</SelectItem>
                <SelectItem value="parttime">Part-time</SelectItem>
              </SelectContent>
            </Select>
            <Button className="bg-candidate-accent hover:bg-candidate-accent/90">Search</Button>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Showing {jobs.length} jobs matching your profile</p>
        <Select defaultValue="match">
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="match">Best Match</SelectItem>
            <SelectItem value="recent">Most Recent</SelectItem>
            <SelectItem value="salary">Salary</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-4">
        {jobs.map((job) => (
          <Card key={job.id} className="hover:border-candidate-accent/50 transition-colors">
            <CardContent className="pt-6">
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-xl font-semibold">{job.title}</h2>
                      <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Building2 className="h-4 w-4" />
                          {job.company}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {job.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Briefcase className="h-4 w-4" />
                          {job.type}
                        </span>
                      </div>
                    </div>
                    <Badge className="bg-candidate-accent/10 text-candidate-accent border-0">
                      {job.match}% match
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-3">{job.description}</p>
                  <div className="flex items-center gap-4 mt-4">
                    <Badge variant="outline" className="gap-1">
                      <DollarSign className="h-3 w-3" />
                      {job.salary}
                    </Badge>
                    <span className="text-sm text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {job.posted}
                    </span>
                  </div>
                </div>
                <div className="flex lg:flex-col gap-2">
                  <Button className="flex-1 bg-candidate-accent hover:bg-candidate-accent/90">
                    Apply Now
                  </Button>
                  <Button variant="outline" size="icon" className={job.saved ? "text-candidate-accent" : ""}>
                    <Bookmark className={`h-4 w-4 ${job.saved ? "fill-current" : ""}`} />
                  </Button>
                  <Button variant="outline" size="icon">
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex justify-center">
        <Button variant="outline">Load More Jobs</Button>
      </div>
    </div>
  );
};

export default CandidateJobs;
