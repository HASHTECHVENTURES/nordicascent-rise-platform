import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Search, 
  Filter, 
  Star, 
  MoreHorizontal, 
  Eye, 
  MessageSquare, 
  UserPlus, 
  MapPin, 
  Briefcase, 
  GraduationCap,
  ClipboardCheck,
  UserCheck,
  CheckCircle2,
  Building2,
  Users,
  AlertTriangle,
} from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useMemo, useState } from "react";
import { TRACK_META, type Track } from "@/lib/track";

const pipelineStages = [
  { id: "preparation", name: "Preparation", icon: ClipboardCheck, color: "text-secondary" },
  { id: "selection", name: "Selection", icon: UserCheck, color: "text-primary" },
  { id: "readiness", name: "Readiness", icon: CheckCircle2, color: "text-warning" },
  { id: "internship", name: "Activation", icon: Briefcase, color: "text-primary" },
  { id: "relocation", name: "Relocation", icon: MapPin, color: "text-secondary" },
  { id: "onboarding", name: "Onboarding", icon: Building2, color: "text-success" },
  { id: "followup", name: "Follow-up", icon: Users, color: "text-muted-foreground" },
];

const candidatesByStage: Record<string, Array<{ id: number; name: string; role: string; location: string; experience: string; match: number; skills: string[]; readiness: number; status: string; needsAction: boolean; avatar: string; track: Track }>> = {
  preparation: [
    { id: 1, name: "Rahul Sharma", role: "Engineer", location: "Mumbai, IN", experience: "3 years", match: 92, skills: ["Design", "Analysis"], readiness: 45, status: "active", needsAction: false, avatar: "https://i.pravatar.cc/150?img=1", track: "entry" },
    { id: 2, name: "Priya Patel", role: "Backend Engineer", location: "Bangalore, IN", experience: "4 years", match: 88, skills: ["Node.js", "Python"], readiness: 30, status: "active", needsAction: true, avatar: "https://i.pravatar.cc/150?img=5", track: "entry" },
    { id: 3, name: "Amit Kumar", role: "Full Stack Developer", location: "Delhi, IN", experience: "5 years", match: 85, skills: ["React", "Node.js"], readiness: 60, status: "active", needsAction: false, avatar: "https://i.pravatar.cc/150?img=12", track: "entry" },
  ],
  selection: [
    { id: 4, name: "Sneha Reddy", role: "UX Designer", location: "Hyderabad, IN", experience: "3 years", match: 90, skills: ["Figma", "User Research"], readiness: 75, status: "active", needsAction: true, avatar: "https://i.pravatar.cc/150?img=9", track: "entry" },
    { id: 5, name: "Vikram Singh", role: "DevOps Engineer", location: "Pune, IN", experience: "4 years", match: 87, skills: ["AWS", "Docker"], readiness: 80, status: "active", needsAction: false, avatar: "https://i.pravatar.cc/150?img=15", track: "entry" },
  ],
  readiness: [
    { id: 6, name: "Anjali Mehta", role: "Data Engineer", location: "Bangalore, IN", experience: "4 years", match: 93, skills: ["Python", "Spark"], readiness: 90, status: "active", needsAction: false, avatar: "https://i.pravatar.cc/150?img=20", track: "fast" },
    { id: 7, name: "Rohan Desai", role: "Mobile Developer", location: "Mumbai, IN", experience: "3 years", match: 89, skills: ["React Native", "iOS"], readiness: 65, status: "active", needsAction: false, avatar: "https://i.pravatar.cc/150?img=18", track: "entry" },
  ],
  internship: [
    { id: 8, name: "Kavita Nair", role: "Product Manager", location: "Bangalore, IN", experience: "5 years", match: 95, skills: ["Agile", "Roadmapping"], readiness: 100, status: "active", needsAction: false, avatar: "https://i.pravatar.cc/150?img=25", track: "fast" },
  ],
  relocation: [],
  onboarding: [],
  followup: [
    { id: 9, name: "Arjun Menon", role: "Senior Developer", location: "Stockholm, SE", experience: "6 years", match: 98, skills: ["React", "TypeScript"], readiness: 100, status: "completed", needsAction: false, avatar: "https://i.pravatar.cc/150?img=30", track: "fast" },
  ],
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case "completed":
      return <Badge className="bg-success text-success-foreground">Completed</Badge>;
    case "active":
      return <Badge className="bg-primary text-primary-foreground">Active</Badge>;
    default:
      return <Badge variant="secondary">Not Started</Badge>;
  }
};

const EmployerCandidates = () => {
  const [activeStage, setActiveStage] = useState("preparation");
  const [trackFilter, setTrackFilter] = useState<"all" | Track>("all");

  const stageCandidates = candidatesByStage[activeStage as keyof typeof candidatesByStage] || [];
  const activeCandidates = useMemo(
    () => trackFilter === "all" ? stageCandidates : stageCandidates.filter((c) => c.track === trackFilter),
    [stageCandidates, trackFilter],
  );
  const activeStageInfo = pipelineStages.find(s => s.id === activeStage);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-medium text-foreground">Candidates</h1>
          <p className="text-muted-foreground">Monitor candidates across the mobility pipeline</p>
        </div>
        <div className="flex gap-2 items-center">
          <div className="flex gap-1 rounded-md border bg-card p-1">
            {(["all", "entry", "fast"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTrackFilter(t)}
                className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
                  trackFilter === t ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"
                }`}
              >
                {t === "all" ? "All tracks" : TRACK_META[t].label}
              </button>
            ))}
          </div>
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search candidates..." className="pl-9" />
          </div>
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Stage selector cards - horizontal */}
      <div className="grid grid-cols-7 gap-2">
        {pipelineStages.map((stage) => {
          const count = (candidatesByStage[stage.id as keyof typeof candidatesByStage] || []).length;
          const isActive = activeStage === stage.id;
          return (
            <button
              key={stage.id}
              onClick={() => setActiveStage(stage.id)}
              className={`
                flex flex-col items-center gap-1.5 p-3 rounded-lg border-2 transition-all cursor-pointer
                ${isActive 
                  ? 'border-primary bg-primary/5 shadow-sm' 
                  : 'border-border hover:border-primary/30 bg-card'}
              `}
            >
              <stage.icon className={`h-5 w-5 ${isActive ? 'text-primary' : stage.color}`} />
              <span className={`text-xl font-bold ${isActive ? 'text-primary' : 'text-foreground'}`}>{count}</span>
              <span className={`text-[10px] font-medium text-center leading-tight ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>{stage.name}</span>
            </button>
          );
        })}
      </div>

      {/* Candidate list for active stage */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-medium flex items-center gap-2">
            {activeStageInfo && <activeStageInfo.icon className={`h-5 w-5 ${activeStageInfo.color}`} />}
            {activeStageInfo?.name} Stage
            <Badge variant="secondary" className="ml-2">{activeCandidates.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {activeCandidates.length > 0 ? (
            <div className="space-y-3">
              {activeCandidates.map((candidate) => (
                <div key={candidate.id} className="flex items-center justify-between p-4 border border-border rounded-lg hover:border-primary/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={candidate.avatar} />
                      <AvatarFallback>{candidate.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-medium">{candidate.name}</h3>
                        {candidate.needsAction && (
                          <AlertTriangle className="h-4 w-4 text-warning" />
                        )}
                        <Badge className="bg-primary/10 text-primary border-0">{candidate.match}% match</Badge>
                        <Badge variant="outline" className="border-primary/40 text-primary">{TRACK_META[candidate.track].label}</Badge>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                        <span className="flex items-center gap-1">
                          <Briefcase className="h-3 w-3" />
                          {candidate.role}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {candidate.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <GraduationCap className="h-3 w-3" />
                          {candidate.experience}
                        </span>
                      </div>
                      <div className="flex gap-1 mt-2">
                        {candidate.skills.map(skill => (
                          <Badge key={skill} variant="outline" className="text-xs">{skill}</Badge>
                        ))}
                      </div>
                      <div className="mt-2 max-w-xs">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-muted-foreground">Stage Readiness</span>
                          <span className="font-medium">{candidate.readiness}%</span>
                        </div>
                        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary transition-all" 
                            style={{ width: `${candidate.readiness}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right hidden md:block">
                      {getStatusBadge(candidate.status)}
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Eye className="h-4 w-4 mr-2" />
                          View Profile
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Star className="h-4 w-4 mr-2" />
                          Shortlist
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Message
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <UserPlus className="h-4 w-4 mr-2" />
                          Move Stage
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              {activeStageInfo && <activeStageInfo.icon className="h-12 w-12 mx-auto mb-3 opacity-50" />}
              <p className="text-sm">No candidates in {activeStageInfo?.name} stage</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EmployerCandidates;
