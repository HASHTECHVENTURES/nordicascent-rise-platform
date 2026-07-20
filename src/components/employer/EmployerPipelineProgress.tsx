import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  ClipboardList,
  Users,
  Briefcase,
  UserCheck,
  Building2,
  MessageSquare,
  BarChart3,
  ClipboardCheck,
  MapPin,
} from "lucide-react";

const employerStages = [
  { id: 1, name: "Overview", href: "/employer/dashboard", icon: LayoutDashboard },
  { id: 2, name: "Tasks", href: "/employer/tasks", icon: ClipboardList },
  { id: 3, name: "Candidates", href: "/employer/candidates", icon: Users },
  { id: 4, name: "Job Roles", href: "/employer/jobs", icon: Briefcase },
  { id: 5, name: "Selection", href: "/employer/selection", icon: UserCheck },
  { id: 6, name: "Activation", href: "/employer/activation", icon: ClipboardCheck },
  { id: 7, name: "Relocation", href: "/employer/relocation", icon: MapPin },
  { id: 8, name: "Company", href: "/employer/company", icon: Building2 },
  { id: 9, name: "Messages", href: "/employer/messages", icon: MessageSquare },
  { id: 10, name: "Analytics", href: "/employer/analytics", icon: BarChart3 },
];

const EmployerPipelineProgress = () => {
  const location = useLocation();

  return (
    <div className="bg-card border-b px-6 py-4 relative z-20">
      <div className="flex items-center justify-between overflow-x-auto">
        {employerStages.map((stage, index) => {
          const isCurrentPage =
            location.pathname === stage.href || location.pathname.startsWith(`${stage.href}/`);
          return (
            <div key={stage.id} className="flex items-center">
              <Link
                to={stage.href}
                className="flex flex-col items-center min-w-[80px] group"
              >
                <div className={`
                  w-10 h-10 rounded-full flex items-center justify-center border-2 mb-1 transition-opacity
                  ${isCurrentPage
                    ? 'bg-primary border-primary text-primary-foreground ring-2 ring-offset-2 ring-primary'
                    : 'bg-muted border-muted-foreground/30 text-muted-foreground'}
                  group-hover:opacity-80
                `}>
                  <stage.icon className="h-4 w-4" />
                </div>
                <span className={`text-xs font-medium text-center ${
                  isCurrentPage ? 'text-primary' : 'text-muted-foreground'
                }`}>
                  {stage.name}
                </span>
              </Link>
              {index < employerStages.length - 1 && (
                <div className="w-6 h-0.5 mx-1 bg-muted" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default EmployerPipelineProgress;
