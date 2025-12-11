import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Video, MapPin, Building2, User, FileText, ExternalLink } from "lucide-react";

const interviews = [
  { id: 1, company: "TechNordic AB", role: "Senior Frontend Developer", type: "Technical Interview", date: "2024-03-15", time: "14:00", duration: "60 min", format: "video", interviewer: "Johan Eriksson", status: "upcoming" },
  { id: 2, company: "Nordic Innovations", role: "React Developer", type: "Cultural Fit", date: "2024-03-18", time: "10:00", duration: "45 min", format: "video", interviewer: "Maria Hansen", status: "upcoming" },
  { id: 3, company: "DesignHub Finland", role: "UI Engineer", type: "Final Interview", date: "2024-03-20", time: "15:30", duration: "60 min", format: "onsite", interviewer: "Mikko Virtanen", status: "upcoming" },
  { id: 4, company: "DataFlow Norway", role: "Full Stack Developer", type: "Initial Screen", date: "2024-03-08", time: "11:00", duration: "30 min", format: "video", interviewer: "Erik Olsen", status: "completed" },
];

const CandidateInterviews = () => {
  const upcomingInterviews = interviews.filter(i => i.status === 'upcoming');
  const pastInterviews = interviews.filter(i => i.status === 'completed');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Interviews</h1>
        <p className="text-muted-foreground">Manage your scheduled interviews</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-candidate-accent/10 to-transparent border-candidate-accent/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Upcoming</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingInterviews.length}</div>
            <p className="text-xs text-muted-foreground">Next: Tomorrow 2PM</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">This Week</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
            <p className="text-xs text-muted-foreground">Mar 15, Mar 18</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pastInterviews.length}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold mb-4">Upcoming Interviews</h2>
          <div className="space-y-4">
            {upcomingInterviews.map((interview) => (
              <Card key={interview.id} className="hover:border-candidate-accent/50 transition-colors">
                <CardContent className="pt-6">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start gap-4">
                        <div className="h-14 w-14 rounded-lg bg-candidate-accent/10 flex items-center justify-center">
                          {interview.format === 'video' ? (
                            <Video className="h-6 w-6 text-candidate-accent" />
                          ) : (
                            <MapPin className="h-6 w-6 text-candidate-accent" />
                          )}
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{interview.type}</h3>
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <Building2 className="h-3 w-3" />
                            {interview.company} • {interview.role}
                          </p>
                          <div className="flex items-center gap-4 mt-2 text-sm">
                            <span className="flex items-center gap-1 text-muted-foreground">
                              <Calendar className="h-4 w-4" />
                              {interview.date}
                            </span>
                            <span className="flex items-center gap-1 text-muted-foreground">
                              <Clock className="h-4 w-4" />
                              {interview.time} ({interview.duration})
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-2 flex items-center gap-1">
                            <User className="h-3 w-3" />
                            Interviewer: {interview.interviewer}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Badge variant={interview.format === 'video' ? 'default' : 'secondary'}>
                        {interview.format === 'video' ? 'Video Call' : 'On-site'}
                      </Badge>
                      <div className="flex gap-2">
                        {interview.format === 'video' && (
                          <Button className="bg-candidate-accent hover:bg-candidate-accent/90 gap-2">
                            <Video className="h-4 w-4" />
                            Join Call
                          </Button>
                        )}
                        <Button variant="outline" size="icon">
                          <FileText className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Past Interviews</h2>
          <div className="space-y-4">
            {pastInterviews.map((interview) => (
              <Card key={interview.id} className="opacity-75">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                        <Video className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <h3 className="font-medium">{interview.type}</h3>
                        <p className="text-sm text-muted-foreground">{interview.company} • {interview.date}</p>
                      </div>
                    </div>
                    <Badge variant="outline">Completed</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CandidateInterviews;
