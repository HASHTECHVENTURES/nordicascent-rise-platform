import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Calendar, Clock, Video, MapPin, User, Plus, MoreHorizontal, FileText } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const interviews = [
  { id: 1, candidate: "Emma Lindqvist", role: "Senior Frontend Developer", type: "Technical Interview", date: "2024-03-15", time: "14:00", duration: "60 min", format: "video", interviewer: "Johan Eriksson", status: "scheduled" },
  { id: 2, candidate: "Sofia Virtanen", role: "UX Designer", type: "Portfolio Review", date: "2024-03-16", time: "10:00", duration: "45 min", format: "video", interviewer: "Maria Hansen", status: "scheduled" },
  { id: 3, candidate: "Lars Andersen", role: "Product Manager", type: "Final Interview", date: "2024-03-18", time: "15:30", duration: "60 min", format: "onsite", interviewer: "CEO Panel", status: "scheduled" },
  { id: 4, candidate: "Magnus Olsen", role: "Backend Engineer", type: "Initial Screen", date: "2024-03-10", time: "11:00", duration: "30 min", format: "video", interviewer: "Tech Lead", status: "completed" },
];

const EmployerInterviews = () => {
  const upcoming = interviews.filter(i => i.status === 'scheduled');
  const past = interviews.filter(i => i.status === 'completed');

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Interviews</h1>
          <p className="text-muted-foreground">Schedule and manage candidate interviews</p>
        </div>
        <Button className="gap-2 bg-employer-accent hover:bg-employer-accent/90"><Plus className="h-4 w-4" />Schedule Interview</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-employer-accent/10 to-transparent border-employer-accent/20"><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Upcoming</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{upcoming.length}</div><p className="text-xs text-muted-foreground">This week</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Today</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">1</div><p className="text-xs text-muted-foreground">Next: 2:00 PM</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Completed</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{past.length}</div><p className="text-xs text-muted-foreground">This month</p></CardContent></Card>
      </div>

      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold mb-4">Upcoming Interviews</h2>
          <div className="space-y-4">
            {upcoming.map((interview) => (
              <Card key={interview.id} className="hover:border-employer-accent/50 transition-colors">
                <CardContent className="pt-6">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <Avatar className="h-12 w-12"><AvatarFallback className="bg-employer-accent/10 text-employer-accent">{interview.candidate.split(' ').map(n => n[0]).join('')}</AvatarFallback></Avatar>
                      <div>
                        <h3 className="font-semibold">{interview.candidate}</h3>
                        <p className="text-sm text-muted-foreground">{interview.role} • {interview.type}</p>
                        <div className="flex items-center gap-4 mt-2 text-sm">
                          <span className="flex items-center gap-1 text-muted-foreground"><Calendar className="h-4 w-4" />{interview.date}</span>
                          <span className="flex items-center gap-1 text-muted-foreground"><Clock className="h-4 w-4" />{interview.time} ({interview.duration})</span>
                          <span className="flex items-center gap-1 text-muted-foreground"><User className="h-4 w-4" />{interview.interviewer}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={interview.format === 'video' ? 'default' : 'secondary'}>{interview.format === 'video' ? <><Video className="h-3 w-3 mr-1" />Video</> : <><MapPin className="h-3 w-3 mr-1" />On-site</>}</Badge>
                      {interview.format === 'video' && <Button className="bg-employer-accent hover:bg-employer-accent/90 gap-2"><Video className="h-4 w-4" />Start Call</Button>}
                      <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem><FileText className="h-4 w-4 mr-2" />Add Scorecard</DropdownMenuItem>
                          <DropdownMenuItem>Reschedule</DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">Cancel</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Completed</h2>
          <div className="space-y-4">
            {past.map((interview) => (
              <Card key={interview.id} className="opacity-75">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Avatar><AvatarFallback className="bg-muted">{interview.candidate.split(' ').map(n => n[0]).join('')}</AvatarFallback></Avatar>
                      <div>
                        <h3 className="font-medium">{interview.candidate}</h3>
                        <p className="text-sm text-muted-foreground">{interview.type} • {interview.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">Completed</Badge>
                      <Button variant="outline" size="sm"><FileText className="h-4 w-4 mr-2" />View Scorecard</Button>
                    </div>
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

export default EmployerInterviews;
