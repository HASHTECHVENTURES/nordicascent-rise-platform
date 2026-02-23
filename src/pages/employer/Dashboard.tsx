import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Users, 
  Briefcase, 
  Clock, 
  CheckCircle,
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

const EmployerDashboard = () => {
  const totalCandidates = pipelineStages.reduce((sum, stage) => sum + stage.count, 0);
  
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-medium text-foreground">Pipeline Overview</h1>
        <p className="text-muted-foreground">Monitor candidates across all stages</p>
      </div>

      {/* Candidates per Stage - Always on top */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium">Candidates per Stage</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between overflow-x-auto pb-2">
            {pipelineStages.map((stage, index) => (
              <Link key={stage.id} to={`/employer/candidates?stage=${stage.name.toLowerCase()}`} className="flex items-center">
                <div className="flex flex-col items-center min-w-[90px] hover:opacity-80 transition-opacity cursor-pointer">
                  <div className={`
                    w-14 h-14 rounded-full flex items-center justify-center border-2 mb-2
                    ${stage.count > 4 ? 'bg-warning/10 border-warning text-warning' : 
                      stage.count > 0 ? 'bg-primary/10 border-primary text-primary' : 
                      'bg-muted border-muted-foreground/30 text-muted-foreground'}
                  `}>
                    <stage.icon className="h-6 w-6" />
                  </div>
                  <span className="text-2xl font-bold">{stage.count}</span>
                  <span className="text-xs text-muted-foreground text-center">{stage.name}</span>
                </div>
                {index < pipelineStages.length - 1 && (
                  <div className={`w-8 h-0.5 mx-1 ${
                    stage.count > 0 ? 'bg-primary/50' : 'bg-muted'
                  }`} />
                )}
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* KPI Cards - 2x2 Grid, bigger */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link to="/employer/candidates">
          <Card className="hover:border-primary/50 transition-colors cursor-pointer">
            <CardContent className="p-8">
              <div className="flex items-center gap-5">
                <div className="h-16 w-16 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Users className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <p className="text-4xl font-bold">{totalCandidates}</p>
                  <p className="text-base text-muted-foreground mt-1">Total Candidates</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link to="/employer/jobs">
          <Card className="hover:border-primary/50 transition-colors cursor-pointer">
            <CardContent className="p-8">
              <div className="flex items-center gap-5">
                <div className="h-16 w-16 rounded-xl bg-secondary/20 flex items-center justify-center">
                  <Briefcase className="h-8 w-8 text-secondary" />
                </div>
                <div>
                  <p className="text-4xl font-bold">3</p>
                  <p className="text-base text-muted-foreground mt-1">Open Roles</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link to="/employer/tasks">
          <Card className="hover:border-primary/50 transition-colors cursor-pointer">
            <CardContent className="p-8">
              <div className="flex items-center gap-5">
                <div className="h-16 w-16 rounded-xl bg-warning/10 flex items-center justify-center">
                  <Clock className="h-8 w-8 text-warning" />
                </div>
                <div>
                  <p className="text-4xl font-bold">2</p>
                  <p className="text-base text-muted-foreground mt-1">Awaiting Action</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Card>
          <CardContent className="p-8">
            <div className="flex items-center gap-5">
              <div className="h-16 w-16 rounded-xl bg-success/10 flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-success" />
              </div>
              <div>
                <p className="text-4xl font-bold">2</p>
                <p className="text-base text-muted-foreground mt-1">Recently Onboarded</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EmployerDashboard;
