import { useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Building2,
  Briefcase,
  Users,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  Bell,
  Heart,
  ClipboardList,
  BarChart3,
  AlertTriangle,
  FileCheck,
  ClipboardCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { PortalUserMenu, PortalUserSidebar } from "@/components/PortalUserMenu";
import { useMyCompany, useNotifications, useMarkAllNotificationsRead } from "@/hooks/useData";
import { useEmployerOnboardingRedirect } from "@/hooks/useEmployerOnboarding";

// Company journey navigation
const navigation = [
  { name: "Pipeline Overview", href: "/employer/dashboard", icon: LayoutDashboard },
  { name: "Tasks", href: "/employer/tasks", icon: ClipboardList },
  { name: "Candidates", href: "/employer/candidates", icon: Users },
  { name: "Internship", href: "/employer/internship", icon: FileCheck },
  { name: "Activation", href: "/employer/activation", icon: ClipboardCheck },
  { name: "Role postings", href: "/employer/jobs", icon: Briefcase },
  { name: "Company Profile", href: "/employer/company", icon: Building2 },
  { name: "Mentoring", href: "/employer/mentoring", icon: Heart },
  { name: "Messages", href: "/employer/messages", icon: MessageSquare },
  { name: "Analytics", href: "/employer/analytics", icon: BarChart3 },
];

const EmployerLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { data: employerData } = useMyCompany();
  const { data: notifications } = useNotifications();
  const markAllRead = useMarkAllNotificationsRead();
  const companyName = (employerData?.companies as { name: string } | null)?.name ?? "Company";
  const unreadCount = notifications?.filter((n) => !n.read_at).length ?? 0;
  useEmployerOnboardingRedirect();

  const openNotification = (n: {
    metadata: { candidateId?: string } | null;
  }) => {
    if (n.metadata?.candidateId) {
      navigate(`/employer/candidates/${n.metadata.candidateId}`);
    } else {
      navigate("/employer/candidates");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 h-screen bg-white border-r border-border",
          collapsed ? "w-16" : "w-64"
        )}
      >
        <div className="flex h-full flex-col">
          {/* Nav header – no logo; compact for normal back/forth navigation */}
          <div className="flex h-14 items-center justify-between px-4 border-b border-border">
            {!collapsed && (
              <Link to="/employer/dashboard" className="text-sm font-semibold text-foreground">
                Nordic Ascent
              </Link>
            )}
            {collapsed && (
              <Link to="/employer/dashboard" className="mx-auto text-lg font-bold text-primary">N</Link>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCollapsed(!collapsed)}
              className={cn("text-muted-foreground hover:bg-muted", collapsed && "hidden")}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </div>

          {collapsed && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCollapsed(false)}
              className="mx-auto mt-2 text-muted-foreground hover:bg-muted"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}

          <nav className="flex-1 p-4 space-y-1">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded transition-colors",
                    isActive
                      ? "bg-nordic-orange text-white"
                      : "text-foreground/70 hover:bg-muted hover:text-foreground"
                  )}
                >
                  <item.icon className="h-5 w-5 flex-shrink-0" />
                  {!collapsed && <span className="text-sm font-medium">{item.name}</span>}
                </Link>
              );
            })}
          </nav>

          {!collapsed && (
            <div className="p-4 border-t border-border">
              <PortalUserSidebar profilePath="/employer/company" roleLabel={companyName} />
            </div>
          )}
        </div>
      </aside>

      <div className={cn(collapsed ? "ml-16" : "ml-64")}>
        <header className="sticky top-0 z-30 h-16 bg-background border-b">
          <div className="flex h-full items-center justify-between px-6">
            <div className="flex items-center gap-4">
              <h1 className="text-lg font-medium text-foreground">Company Journey</h1>
            </div>

            <div className="flex items-center gap-4">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 h-4 w-4 bg-warning text-warning-foreground text-xs rounded-full flex items-center justify-center">
                        {unreadCount}
                      </span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-0" align="end">
                  <div className="p-4 border-b flex items-center justify-between">
                    <h3 className="font-semibold text-base">Notifications</h3>
                    {unreadCount > 0 && (
                      <Button variant="ghost" size="sm" onClick={() => markAllRead.mutate()}>
                        Mark all read
                      </Button>
                    )}
                  </div>
                  <div className="p-3 space-y-2 max-h-80 overflow-y-auto">
                    {(notifications ?? []).slice(0, 8).map((n) => (
                      <button
                        key={n.id}
                        type="button"
                        onClick={() => openNotification(n)}
                        className={`w-full text-left flex items-start gap-3 p-3 rounded-lg transition-colors hover:bg-muted ${
                          n.read_at ? "opacity-70" : "bg-warning/10"
                        }`}
                      >
                        <AlertTriangle className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium">{n.title}</p>
                          {n.body && <p className="text-xs text-muted-foreground mt-0.5">{n.body}</p>}
                        </div>
                      </button>
                    ))}
                    {(!notifications || notifications.length === 0) && (
                      <p className="text-sm text-muted-foreground p-3">No notifications yet</p>
                    )}
                  </div>
                </PopoverContent>
              </Popover>

              <PortalUserMenu profilePath="/employer/company" messagesPath="/employer/messages" />
            </div>
          </div>
        </header>

        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default EmployerLayout;
