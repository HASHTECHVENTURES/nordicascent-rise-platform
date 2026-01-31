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
  CheckCircle2,
  MapPin,
  Building2
} from "lucide-react";
import { Link } from "react-router-dom";

const pipelineStages = [
  { id: 1, name: "Preparation", count: 3, icon: ClipboardCheck },
  { id: 2, name: "Selection", count: 5, icon: UserCheck },
  { id: 3, name: "Readiness", count: 4, icon: CheckCircle2 },
  { id: 4, name: "Internship", count: 2, icon: Briefcase },
  { id: 5, name: "Relocation", count: 1, icon: MapPin },
  { id: 6, name: "Onboarding", count: 0, icon: Building2 },
  { id: 7, name: "Follow-up", count: 2, icon: Users },
];

const candidatesNeedingAction = [
  { id: 1, name: "Rahul Sharma", avatar: "https://i.pravatar.cc/150?img=1", stage: "Readiness", action: "Review technical assessment", urgent: true },
  { id: 2, name: "Priya Patel", avatar: "https://i.pravatar.cc/150?img=5", stage: "Selection", action: "Schedule interview", urgent: false },
];

const EmployerDashboard = () => {
  const totalCandidates = pipelineStages.reduce((sum, stage) => sum + stage.count, 0);
  const bottlenecks = pipelineStages.filter(stage => stage.count > 4);
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-medium text-foreground">Pipeline Overview</h1>
        <p className="text-muted-foreground">Monitor candidates across all stages</p>
      </div>

      {/* Pipeline Progress - Horizontal at Top */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium">Pipeline Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between overflow-x-auto pb-2">
            {pipelineStages.map((stage, index) => {
              const isBottleneck = stage.count > 4;
              return (
                <div key={stage.id} className="flex items-center">
                  <div className="flex flex-col items-center min-w-[90px]">
                    <div className={`
                      w-12 h-12 rounded-full flex items-center justify-center border-2 mb-2
                      ${isBottleneck ? 'bg-warning/10 border-warning text-warning' : 
                        stage.count > 0 ? 'bg-primary/10 border-primary text-primary' : 
                        'bg-muted border-muted-foreground/30 text-muted-foreground'}
                    `}>
                      <stage.icon className="h-5 w-5" />
                    </div>
                    <span className="text-lg font-semibold">{stage.count}</span>
                    <span className="text-xs text-muted-foreground text-center">{stage.name}</span>
                  </div>
                  {index < pipelineStages.length - 1 && (
                    <div className={`w-8 h-0.5 mx-1 ${
                      stage.count > 0 ? 'bg-primary/50' : 'bg-muted'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Compact Bottleneck Indicator */}
      {bottlenecks.length > 0 && (
        <div className="flex items-center gap-2 p-3 rounded border border-warning/50 bg-warning/5">
          <AlertTriangle className="h-4 w-4 text-warning flex-shrink-0" />
          <span className="text-sm">
            <strong className="text-warning">Bottleneck:</strong>{' '}
            {bottlenecks.map(s => `${s.name} (${s.count})`).join(', ')} — High volume requires attention
          </span>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded bg-primary/10 flex items-center justify-center">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-medium">{totalCandidates}</p>
                <p className="text-sm text-muted-foreground">Total Candidates</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded bg-secondary/20 flex items-center justify-center">
                <Briefcase className="h-6 w-6 text-secondary" />
              </div>
              <div>
                <p className="text-2xl font-medium">3</p>
                <p className="text-sm text-muted-foreground">Open Roles</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded bg-warning/10 flex items-center justify-center">
                <Clock className="h-6 w-6 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-medium">{candidatesNeedingAction.length}</p>
                <p className="text-sm text-muted-foreground">Awaiting Action</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded bg-success/10 flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-2xl font-medium">2</p>
                <p className="text-sm text-muted-foreground">Recently Onboarded</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Required */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-medium">Action Required</CardTitle>
          <Badge variant="secondary">{candidatesNeedingAction.length}</Badge>
        </CardHeader>
        <CardContent className="space-y-3">
          {candidatesNeedingAction.map((candidate) => (
            <div key={candidate.id} className={`flex items-center justify-between p-4 rounded border ${candidate.urgent ? 'border-warning/50 bg-warning/5' : 'border-border'}`}>
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={candidate.avatar} />
                  <AvatarFallback>{candidate.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{candidate.name}</p>
                  <p className="text-xs text-muted-foreground">{candidate.stage} · {candidate.action}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {candidate.urgent && <AlertTriangle className="h-4 w-4 text-warning" />}
                <Button size="sm" variant="outline">Review</Button>
              </div>
            </div>
          ))}
          <Button variant="outline" className="w-full" asChild>
            <Link to="/employer/candidates">
              View All Candidates
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmployerDashboard;
