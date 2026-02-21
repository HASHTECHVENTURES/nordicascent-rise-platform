import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Building2,
  UserCheck,
  Briefcase,
  BarChart3,
  Shield,
  Settings,
} from "lucide-react";

const adminStages = [
  { id: 1, name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { id: 2, name: "Users", href: "/admin/users", icon: Users },
  { id: 3, name: "Employers", href: "/admin/employers", icon: Building2 },
  { id: 4, name: "Candidates", href: "/admin/candidates", icon: UserCheck },
  { id: 5, name: "Jobs", href: "/admin/jobs", icon: Briefcase },
  { id: 6, name: "Analytics", href: "/admin/analytics", icon: BarChart3 },
  { id: 7, name: "Security", href: "/admin/security", icon: Shield },
  { id: 8, name: "Settings", href: "/admin/settings", icon: Settings },
];

const AdminPipelineProgress = () => {
  const location = useLocation();

  return (
    <div className="bg-card border-b px-6 py-4 relative z-20">
      <div className="flex items-center justify-between overflow-x-auto">
        {adminStages.map((stage, index) => {
          const isCurrentPage = location.pathname === stage.href;
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
              {index < adminStages.length - 1 && (
                <div className="w-6 h-0.5 mx-1 bg-muted" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AdminPipelineProgress;
