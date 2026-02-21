import { Link, useLocation } from "react-router-dom";
import {
  ClipboardCheck,
  UserCheck,
  CheckCircle2,
  Briefcase,
  MapPin,
  Building2,
  Users,
} from "lucide-react";

const pipelineStages = [
  { id: 1, name: "Preparation", status: "completed", href: "/candidate/preparation", icon: ClipboardCheck },
  { id: 2, name: "Selection", status: "completed", href: "/candidate/selection", icon: UserCheck },
  { id: 3, name: "Readiness", status: "active", href: "/candidate/readiness", icon: CheckCircle2 },
  { id: 4, name: "Internship", status: "not_started", href: "/candidate/internship", icon: Briefcase },
  { id: 5, name: "Relocation", status: "not_started", href: "/candidate/relocation", icon: MapPin },
  { id: 6, name: "Onboarding", status: "not_started", href: "/candidate/onboarding", icon: Building2 },
  { id: 7, name: "Follow-up", status: "not_started", href: "/candidate/followup", icon: Users },
];

const PipelineProgress = () => {
  const location = useLocation();

  return (
    <div className="bg-card border-b px-6 py-4 relative z-20">
      <div className="flex items-center justify-between overflow-x-auto">
        {pipelineStages.map((stage, index) => {
          const isCurrentPage = location.pathname === stage.href;
          return (
            <div key={stage.id} className="flex items-center">
              <Link
                to={stage.href}
                className="flex flex-col items-center min-w-[80px] group"
              >
                <div className={`
                  w-10 h-10 rounded-full flex items-center justify-center border-2 mb-1
                  ${stage.status === 'completed' ? 'bg-success border-success text-success-foreground' : ''}
                  ${stage.status === 'active' ? 'bg-primary border-primary text-primary-foreground' : ''}
                  ${stage.status === 'not_started' ? 'bg-muted border-muted-foreground/30 text-muted-foreground' : ''}
                  ${isCurrentPage ? 'ring-2 ring-offset-2 ring-primary' : ''}
                  group-hover:opacity-80 transition-opacity
                `}>
                  <stage.icon className="h-4 w-4" />
                </div>
                <span className={`text-xs font-medium text-center ${
                  isCurrentPage ? 'text-primary' : stage.status === 'active' ? 'text-primary' : 'text-muted-foreground'
                }`}>
                  {stage.name}
                </span>
              </Link>
              {index < pipelineStages.length - 1 && (
                <div className={`w-6 h-0.5 mx-1 ${
                  stage.status === 'completed' ? 'bg-success' : 'bg-muted'
                }`} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PipelineProgress;
