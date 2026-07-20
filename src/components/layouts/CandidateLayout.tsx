import { useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  Bell,
  AlertTriangle,
  User,
  Briefcase,
  ClipboardList,
  Home,
} from "lucide-react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import JourneyProgress from "@/components/candidate/JourneyProgress";
import { PortalUserMenu, PortalUserSidebar } from "@/components/PortalUserMenu";
import { TRACK_META, useTrack } from "@/lib/track";
import { useAuth } from "@/contexts/AuthContext";
import { useNotifications, useMarkAllNotificationsRead } from "@/hooks/useData";
import { useSyncEligibleTasks } from "@/hooks/useSyncEligibleTasks";
import { useCandidateOnboardingRedirect } from "@/hooks/useCandidateOnboarding";
import { useWaitlistProfileLock } from "@/hooks/useWaitlistProfileLock";
import { useJobsAccessLock } from "@/hooks/useJobsAccessLock";
import { CANDIDATE_PROFILE_PATH } from "@/lib/candidateAccess";

// No sub-items needed; My Journey is a direct link

// Standalone nav items
const standaloneNav = [
  { name: "My Profile", href: "/candidate/profile", icon: User, tooltip: "Complete your profile, upload CV, and add skills" },
  { name: "Job Roles", href: "/candidate/jobs", icon: Briefcase, tooltip: "Browse open job roles — apply to multiple positions" },
  { name: "My Applications", href: "/candidate/applications", icon: ClipboardList, tooltip: "Track status of every job role you applied to" },
  { name: "Messages", href: "/candidate/messages", icon: MessageSquare, tooltip: "Communication with employers and Nordic Ascent team" },
  { name: "Support", href: "/candidate/support", icon: AlertTriangle, tooltip: "Open a support ticket with Nordic Ascent" },
];

const CandidateLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const [track] = useTrack();
  const { data: notifications } = useNotifications();
  const { jobsOpen } = useJobsAccessLock();
  const markAllRead = useMarkAllNotificationsRead();
  const unreadIssues = notifications?.filter((n) => !n.read_at).length ?? 0;
  useSyncEligibleTasks();
  useCandidateOnboardingRedirect();
  const waitlistLocked = useWaitlistProfileLock();
  const homePath = waitlistLocked ? CANDIDATE_PROFILE_PATH : "/candidate/dashboard";
  const visibleStandaloneNav = waitlistLocked
    ? standaloneNav.filter((item) => item.href === CANDIDATE_PROFILE_PATH)
    : standaloneNav.filter((item) => {
        if (item.href === CANDIDATE_PROFILE_PATH) return false;
        if (item.href === "/candidate/jobs" || item.href === "/candidate/applications") {
          return jobsOpen;
        }
        return true;
      });

  const renderNavItem = (item: { name: string; href: string; icon: React.ElementType; tooltip?: string }, indented = false) => {
    const isActive = location.pathname === item.href || location.pathname.startsWith(`${item.href}/`);
    return (
      <Link
        key={item.name}
        to={item.href}
        className={cn(
          "flex items-center gap-3 py-2 rounded transition-colors",
          indented ? "pl-9 pr-3" : "px-3",
          isActive
            ? "bg-nordic-orange text-white"
            : "text-foreground/70 hover:bg-muted hover:text-foreground"
        )}
      >
        <item.icon className={cn("flex-shrink-0", indented ? "h-4 w-4" : "h-5 w-5")} />
        {!collapsed && <span className={cn("font-medium", indented ? "text-xs" : "text-sm")}>{item.name}</span>}
      </Link>
    );
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
              <Link to={homePath} className="text-sm font-semibold text-foreground">
                Nordic Ascent
              </Link>
            )}
            {collapsed && (
              <Link to={homePath} className="mx-auto text-lg font-bold text-primary">N</Link>
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

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {!waitlistLocked && (
              <>
                <Link
                  to="/candidate/dashboard"
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded transition-colors",
                    location.pathname === "/candidate/dashboard"
                      ? "bg-nordic-orange text-white"
                      : "text-foreground/70 hover:bg-muted hover:text-foreground"
                  )}
                >
                  <LayoutDashboard className="h-5 w-5 flex-shrink-0" />
                  {!collapsed && <span className="text-sm font-medium">My Journey</span>}
                </Link>

                {!collapsed && <div className="border-t border-border my-3" />}
              </>
            )}

            {visibleStandaloneNav.map((item) => renderNavItem(item))}
          </nav>

          {/* User section */}
          {!collapsed && (
            <div className="p-4 border-t border-border">
              <PortalUserSidebar profilePath="/candidate/profile" roleLabel="Candidate" />
            </div>
          )}
        </div>
      </aside>

      {/* Main content */}
      <div className={cn(collapsed ? "ml-16" : "ml-64")}>
        <header className="sticky top-0 z-30 h-16 bg-background border-b">
          <div className="flex h-full items-center justify-between px-6">
            <div className="flex items-center gap-4 flex-wrap">
              <h1 className="text-lg font-medium text-foreground">
                {waitlistLocked ? "My Profile" : "My Journey"}
              </h1>
              {!waitlistLocked && (
                <>
                  <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded">{TRACK_META[track].label}</span>
                  <Button variant="ghost" size="sm" className="text-muted-foreground h-8 gap-1.5" asChild>
                    <Link to="/">
                      <Home className="h-4 w-4" />
                      Public site
                    </Link>
                  </Button>
                </>
              )}
            </div>

            <div className="flex items-center gap-4">
              {!waitlistLocked && (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="ghost" size="icon" className="relative">
                      <Bell className="h-5 w-5" />
                      {unreadIssues > 0 && (
                        <span className="absolute -top-1 -right-1 h-4 w-4 bg-warning text-warning-foreground text-xs rounded-full flex items-center justify-center">
                          {unreadIssues}
                        </span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80 p-0" align="end">
                    <div className="p-4 border-b flex items-center justify-between">
                      <h3 className="font-semibold text-base">Notifications</h3>
                      {unreadIssues > 0 && (
                        <Button variant="ghost" size="sm" onClick={() => markAllRead.mutate()}>Mark all read</Button>
                      )}
                    </div>
                    <div className="p-3 space-y-2">
                      {(notifications ?? []).slice(0, 3).map((n) => (
                        <div key={n.id} className="flex items-center gap-3 p-3 rounded-lg bg-warning/10">
                          <AlertTriangle className="h-5 w-5 text-warning flex-shrink-0" />
                          <span className="text-sm">{n.title}</span>
                        </div>
                      ))}
                      {(!notifications || notifications.length === 0) && (
                        <p className="text-sm text-muted-foreground p-3">No notifications</p>
                      )}
                    </div>
                  </PopoverContent>
                </Popover>
              )}

              <PortalUserMenu
                profilePath="/candidate/profile"
                messagesPath="/candidate/messages"
                hideMessages={waitlistLocked}
              />
            </div>
          </div>
        </header>

        {!waitlistLocked && <JourneyProgress />}
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default CandidateLayout;
