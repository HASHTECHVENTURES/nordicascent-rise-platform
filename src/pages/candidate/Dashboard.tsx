import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Briefcase, FileText, Calendar, Gift, MapPin, TrendingUp, Clock, Building2 } from "lucide-react";

const recommendedJobs = [
  { id: 1, title: "Senior Frontend Developer", company: "TechNordic AB", location: "Stockholm, SE", type: "Full-time", match: 95 },
  { id: 2, title: "React Developer", company: "Nordic Innovations", location: "Copenhagen, DK", type: "Full-time", match: 88 },
  { id: 3, title: "UI Engineer", company: "DesignHub Finland", location: "Helsinki, FI", type: "Contract", match: 82 },
];

const applications = [
  { id: 1, role: "Software Engineer", company: "TechNordic AB", status: "interview", date: "2024-03-10" },
  { id: 2, role: "Frontend Developer", company: "Nordic Innovations", status: "screening", date: "2024-03-08" },
  { id: 3, role: "Full Stack Developer", company: "DataFlow Norway", status: "applied", date: "2024-03-05" },
];

const CandidateDashboard = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Welcome back, Emma!</h1>
        <p className="text-muted-foreground">Here's what's happening with your job search</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-candidate-accent/10 to-transparent border-candidate-accent/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Applications</CardTitle>
            <FileText className="h-4 w-4 text-candidate-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">+2 this week</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Interviews Scheduled</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">Next: Tomorrow 2PM</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Profile Views</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">47</div>
            <p className="text-xs text-chart-success">+12% this week</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Offers</CardTitle>
            <Gift className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1</div>
            <p className="text-xs text-chart-warning">Expires in 5 days</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              Recommended Jobs
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {recommendedJobs.map((job) => (
              <div key={job.id} className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors">
                <div>
                  <h3 className="font-medium">{job.title}</h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Building2 className="h-3 w-3" />
                    <span>{job.company}</span>
                    <span>•</span>
                    <MapPin className="h-3 w-3" />
                    <span>{job.location}</span>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant="secondary" className="bg-candidate-accent/10 text-candidate-accent">
                    {job.match}% match
                  </Badge>
                </div>
              </div>
            ))}
            <Button variant="outline" className="w-full">View All Jobs</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Recent Applications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {applications.map((app) => (
              <div key={app.id} className="flex items-center justify-between p-3 rounded-lg border bg-card">
                <div>
                  <h3 className="font-medium">{app.role}</h3>
                  <p className="text-sm text-muted-foreground">{app.company}</p>
                </div>
                <div className="text-right">
                  <Badge variant={
                    app.status === 'interview' ? 'default' :
                    app.status === 'screening' ? 'secondary' : 'outline'
                  }>
                    {app.status}
                  </Badge>
                  <p className="text-xs text-muted-foreground mt-1">{app.date}</p>
                </div>
              </div>
            ))}
            <Button variant="outline" className="w-full">View All Applications</Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile Completeness</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Your profile is 75% complete</span>
              <span className="text-sm font-medium">75%</span>
            </div>
            <Progress value={75} className="h-2" />
            <div className="flex gap-2 flex-wrap">
              <Badge variant="outline" className="gap-1">
                <Clock className="h-3 w-3" />
                Add work experience
              </Badge>
              <Badge variant="outline" className="gap-1">
                <Clock className="h-3 w-3" />
                Upload portfolio
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CandidateDashboard;
