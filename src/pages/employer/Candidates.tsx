import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, Star, MoreHorizontal, Eye, MessageSquare, UserPlus, MapPin, Briefcase, GraduationCap } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const candidates = [
  { id: 1, name: "Emma Lindqvist", role: "Frontend Developer", location: "Stockholm, SE", experience: "5 years", match: 95, status: "new", skills: ["React", "TypeScript", "Node.js"], appliedTo: "Senior Frontend Developer", shortlisted: true },
  { id: 2, name: "Lars Andersen", role: "Product Manager", location: "Copenhagen, DK", experience: "7 years", match: 88, status: "screening", skills: ["Agile", "Roadmapping", "Analytics"], appliedTo: "Product Manager", shortlisted: false },
  { id: 3, name: "Sofia Virtanen", role: "UX Designer", location: "Helsinki, FI", experience: "4 years", match: 82, status: "interview", skills: ["Figma", "User Research", "Prototyping"], appliedTo: "UX Designer", shortlisted: true },
  { id: 4, name: "Magnus Olsen", role: "Backend Engineer", location: "Oslo, NO", experience: "6 years", match: 78, status: "new", skills: ["Python", "Django", "PostgreSQL"], appliedTo: "Backend Engineer", shortlisted: false },
];

const EmployerCandidates = () => (
  <div className="space-y-6">
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Candidates</h1>
        <p className="text-muted-foreground">Review and manage applicants</p>
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card className="bg-gradient-to-br from-employer-accent/10 to-transparent border-employer-accent/20"><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Total Candidates</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">248</div></CardContent></Card>
      <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">New This Week</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-chart-success">42</div></CardContent></Card>
      <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Shortlisted</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">18</div></CardContent></Card>
      <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">In Interview</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">8</div></CardContent></Card>
    </div>

    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row gap-4 justify-between">
          <div className="relative flex-1 max-w-sm"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Search candidates..." className="pl-9" /></div>
          <div className="flex gap-2">
            <Select defaultValue="all"><SelectTrigger className="w-[140px]"><SelectValue placeholder="Job" /></SelectTrigger><SelectContent><SelectItem value="all">All Jobs</SelectItem><SelectItem value="frontend">Senior Frontend Developer</SelectItem><SelectItem value="pm">Product Manager</SelectItem></SelectContent></Select>
            <Select defaultValue="all"><SelectTrigger className="w-[140px]"><SelectValue placeholder="Status" /></SelectTrigger><SelectContent><SelectItem value="all">All Status</SelectItem><SelectItem value="new">New</SelectItem><SelectItem value="screening">Screening</SelectItem><SelectItem value="interview">Interview</SelectItem></SelectContent></Select>
            <Button variant="outline" size="icon"><Filter className="h-4 w-4" /></Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {candidates.map((c) => (
          <div key={c.id} className="flex items-center justify-between p-4 rounded-lg border hover:border-employer-accent/50 transition-colors">
            <div className="flex items-center gap-4">
              <Avatar className="h-12 w-12"><AvatarFallback className="bg-employer-accent/10 text-employer-accent">{c.name.split(' ').map(n => n[0]).join('')}</AvatarFallback></Avatar>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">{c.name}</h3>
                  {c.shortlisted && <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />}
                  <Badge className="bg-employer-accent/10 text-employer-accent border-0">{c.match}% match</Badge>
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1"><Briefcase className="h-3 w-3" />{c.role}</span>
                  <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{c.location}</span>
                  <span className="flex items-center gap-1"><GraduationCap className="h-3 w-3" />{c.experience}</span>
                </div>
                <div className="flex gap-1 mt-2">{c.skills.map(s => <Badge key={s} variant="outline" className="text-xs">{s}</Badge>)}</div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right hidden md:block">
                <p className="text-sm font-medium">{c.appliedTo}</p>
                <Badge variant={c.status === 'new' ? 'default' : c.status === 'screening' ? 'secondary' : 'outline'}>{c.status}</Badge>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem><Eye className="h-4 w-4 mr-2" />View Profile</DropdownMenuItem>
                  <DropdownMenuItem><Star className="h-4 w-4 mr-2" />Shortlist</DropdownMenuItem>
                  <DropdownMenuItem><MessageSquare className="h-4 w-4 mr-2" />Message</DropdownMenuItem>
                  <DropdownMenuItem><UserPlus className="h-4 w-4 mr-2" />Move to Pipeline</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  </div>
);

export default EmployerCandidates;
