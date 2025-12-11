import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2, MapPin, Clock, ExternalLink, MessageSquare, Calendar } from "lucide-react";

const applications = [
  { id: 1, title: "Senior Frontend Developer", company: "TechNordic AB", location: "Stockholm, SE", status: "interview", appliedDate: "2024-03-10", lastUpdate: "2024-03-12", nextStep: "Technical Interview on Mar 15" },
  { id: 2, title: "React Developer", company: "Nordic Innovations", location: "Copenhagen, DK", status: "screening", appliedDate: "2024-03-08", lastUpdate: "2024-03-09", nextStep: "CV Review in progress" },
  { id: 3, title: "Full Stack Developer", company: "DataFlow Norway", location: "Oslo, NO", status: "applied", appliedDate: "2024-03-05", lastUpdate: "2024-03-05", nextStep: "Application submitted" },
  { id: 4, title: "UI Engineer", company: "DesignHub Finland", location: "Helsinki, FI", status: "offer", appliedDate: "2024-02-20", lastUpdate: "2024-03-11", nextStep: "Offer expires Mar 18" },
  { id: 5, title: "Frontend Lead", company: "ScaleUp Sweden", location: "Gothenburg, SE", status: "rejected", appliedDate: "2024-02-15", lastUpdate: "2024-02-28", nextStep: "Position filled" },
];

const statusConfig = {
  applied: { label: "Applied", variant: "outline" as const, color: "text-muted-foreground" },
  screening: { label: "Screening", variant: "secondary" as const, color: "text-chart-warning" },
  interview: { label: "Interview", variant: "default" as const, color: "text-candidate-accent" },
  offer: { label: "Offer", variant: "default" as const, color: "text-chart-success" },
  rejected: { label: "Rejected", variant: "destructive" as const, color: "text-destructive" },
  hired: { label: "Hired", variant: "default" as const, color: "text-chart-success" },
};

const CandidateApplications = () => {
  const filterByStatus = (status: string | null) => {
    if (!status) return applications;
    return applications.filter(app => app.status === status);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Applications</h1>
        <p className="text-muted-foreground">Track your job applications</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {Object.entries(statusConfig).slice(0, 5).map(([key, config]) => (
          <Card key={key} className={key === 'interview' ? 'border-candidate-accent/50' : ''}>
            <CardContent className="pt-4 pb-4">
              <div className="text-2xl font-bold">{filterByStatus(key).length}</div>
              <p className={`text-sm ${config.color}`}>{config.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All ({applications.length})</TabsTrigger>
          <TabsTrigger value="active">Active ({applications.filter(a => !['rejected', 'hired'].includes(a.status)).length})</TabsTrigger>
          <TabsTrigger value="offers">Offers ({filterByStatus('offer').length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {applications.map((app) => (
            <Card key={app.id} className="hover:border-candidate-accent/30 transition-colors">
              <CardContent className="pt-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start gap-3">
                      <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center">
                        <Building2 className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <div>
                        <h2 className="text-lg font-semibold">{app.title}</h2>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          <span>{app.company}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {app.location}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 p-3 rounded-lg bg-muted/50">
                      <p className="text-sm">
                        <span className="font-medium">Next step:</span> {app.nextStep}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-3">
                    <Badge variant={statusConfig[app.status as keyof typeof statusConfig].variant}>
                      {statusConfig[app.status as keyof typeof statusConfig].label}
                    </Badge>
                    <div className="text-sm text-muted-foreground text-right">
                      <p className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Applied {app.appliedDate}
                      </p>
                      <p className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Updated {app.lastUpdate}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="gap-1">
                        <MessageSquare className="h-4 w-4" />
                        Message
                      </Button>
                      <Button variant="outline" size="sm" className="gap-1">
                        <ExternalLink className="h-4 w-4" />
                        View Job
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="active" className="space-y-4">
          {applications.filter(a => !['rejected', 'hired'].includes(a.status)).map((app) => (
            <Card key={app.id}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-semibold">{app.title}</h2>
                    <p className="text-sm text-muted-foreground">{app.company}</p>
                  </div>
                  <Badge variant={statusConfig[app.status as keyof typeof statusConfig].variant}>
                    {statusConfig[app.status as keyof typeof statusConfig].label}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="offers" className="space-y-4">
          {filterByStatus('offer').map((app) => (
            <Card key={app.id} className="border-chart-success/50">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-semibold">{app.title}</h2>
                    <p className="text-sm text-muted-foreground">{app.company}</p>
                    <p className="text-sm text-chart-warning mt-2">{app.nextStep}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline">Decline</Button>
                    <Button className="bg-chart-success hover:bg-chart-success/90">Accept Offer</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CandidateApplications;
