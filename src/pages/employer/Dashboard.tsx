import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Users, 
  Briefcase, 
  Clock, 
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  ClipboardCheck,
  UserCheck,
  GraduationCap,
  MapPin,
  Building2
} from "lucide-react";
import { Link } from "react-router-dom";

const pipelineStages = [
  { id: 1, name: "Preparation", count: 3, icon: ClipboardCheck },
  { id: 2, name: "Selection", count: 5, icon: UserCheck },
  { id: 3, name: "Trainee", count: 4, icon: GraduationCap },
  { id: 4, name: "Internship", count: 2, icon: Briefcase },
  { id: 5, name: "Relocation", count: 1, icon: MapPin },
  { id: 6, name: "Onboarding", count: 0, icon: Building2 },
  { id: 7, name: "Follow-up", count: 2, icon: Users },
];

const candidatesNeedingAction = [
  { id: 1, name: "Rahul Sharma", avatar: "https://i.pravatar.cc/150?img=1", stage: "Trainee", action: "Review technical assessment", urgent: true },
  { id: 2, name: "Priya Patel", avatar: "https://i.pravatar.cc/150?img=5", stage: "Selection", action: "Schedule interview", urgent: false },
];

const EmployerDashboard = () => {
  const totalCandidates = pipelineStages.reduce((sum, stage) => sum + stage.count, 0);
  
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-medium text-foreground">Pipeline Overview</h1>
        <p className="text-muted-foreground">Monitor candidates across all stages</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card><CardContent className="pt-6"><div className="flex items-center gap-4"><div className="h-12 w-12 rounded bg-primary/10 flex items-center justify-center"><Users className="h-6 w-6 text-primary" /></div><div><p className="text-2xl font-medium">{totalCandidates}</p><p className="text-sm text-muted-foreground">Total Candidates</p></div></div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="flex items-center gap-4"><div className="h-12 w-12 rounded bg-secondary/20 flex items-center justify-center"><Briefcase className="h-6 w-6 text-secondary" /></div><div><p className="text-2xl font-medium">3</p><p className="text-sm text-muted-foreground">Open Roles</p></div></div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="flex items-center gap-4"><div className="h-12 w-12 rounded bg-warning/10 flex items-center justify-center"><Clock className="h-6 w-6 text-warning" /></div><div><p className="text-2xl font-medium">{candidatesNeedingAction.length}</p><p className="text-sm text-muted-foreground">Awaiting Action</p></div></div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="flex items-center gap-4"><div className="h-12 w-12 rounded bg-success/10 flex items-center justify-center"><CheckCircle className="h-6 w-6 text-success" /></div><div><p className="text-2xl font-medium">2</p><p className="text-sm text-muted-foreground">Recently Onboarded</p></div></div></CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-lg font-medium">Pipeline Stages</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-4">
            {pipelineStages.map((stage) => (
              <div key={stage.id} className="text-center">
                <div className={`p-4 rounded border mb-2 ${stage.count > 0 ? 'bg-card border-border' : 'bg-muted/50 border-muted'}`}>
                  <stage.icon className={`h-6 w-6 mx-auto mb-2 ${stage.count > 0 ? 'text-primary' : 'text-muted-foreground'}`} />
                  <p className="text-2xl font-medium">{stage.count}</p>
                </div>
                <p className="text-xs text-muted-foreground">{stage.name}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-medium">Action Required</CardTitle>
          <Badge variant="secondary">{candidatesNeedingAction.length}</Badge>
        </CardHeader>
        <CardContent className="space-y-4">
          {candidatesNeedingAction.map((candidate) => (
            <div key={candidate.id} className={`flex items-center justify-between p-4 rounded border ${candidate.urgent ? 'border-warning/50 bg-warning/5' : 'border-border'}`}>
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10"><AvatarImage src={candidate.avatar} /><AvatarFallback>{candidate.name.split(' ').map(n => n[0]).join('')}</AvatarFallback></Avatar>
                <div><p className="text-sm font-medium">{candidate.name}</p><p className="text-xs text-muted-foreground">{candidate.stage} · {candidate.action}</p></div>
              </div>
              <div className="flex items-center gap-3">
                {candidate.urgent && <AlertTriangle className="h-4 w-4 text-warning" />}
                <Button size="sm" variant="outline">Review</Button>
              </div>
            </div>
          ))}
          <Button variant="outline" className="w-full" asChild><Link to="/employer/candidates">View All Candidates<ArrowRight className="ml-2 h-4 w-4" /></Link></Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmployerDashboard;
