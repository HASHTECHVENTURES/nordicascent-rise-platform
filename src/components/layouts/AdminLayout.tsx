import { useState, useMemo } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Building2,
  UserCheck,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  Bell,
  Search,
  AlertTriangle,
  Mail,
  Megaphone,
  History,
  ListChecks,
  Briefcase,
  Users,
  GraduationCap,
  ClipboardCheck,
  Heart,
  MapPin,
  ClipboardList,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PortalUserMenu, PortalUserSidebar } from "@/components/PortalUserMenu";
import AdminJourneyProgress from "@/components/admin/AdminJourneyProgress";
import { useAdminCandidates, useAdminEmployers, useNotifications } from "@/hooks/useData";

type NavItem = { name: string; href: string; icon: React.ElementType };

const journeyNav: NavItem[] = [
  { name: "Universities", href: "/admin/universities", icon: GraduationCap },
  { name: "Selection", href: "/admin/selection", icon: ClipboardList },
  { name: "Readiness", href: "/admin/readiness", icon: ClipboardCheck },
  { name: "Mentoring", href: "/admin/mentoring", icon: Heart },
  { name: "Relocation", href: "/admin/relocation", icon: MapPin },
  { name: "Onboarding", href: "/admin/onboarding", icon: Building2 },
];

const peopleNav: NavItem[] = [
  { name: "Candidates", href: "/admin/candidates", icon: UserCheck },
  { name: "Companies", href: "/admin/employers", icon: Building2 },
];

const platformNav: NavItem[] = [
  { name: "Roles", href: "/admin/jobs", icon: Briefcase },
  { name: "Program Tasks", href: "/admin/stage-tasks", icon: ListChecks },
  { name: "Portal admins", href: "/admin/users", icon: Users },
  { name: "Insights", href: "/admin/insights", icon: Megaphone },
  { name: "Announcements", href: "/admin/notifications", icon: Megaphone },
  { name: "Analytics", href: "/admin/analytics", icon: BarChart3 },
  { name: "Settings", href: "/admin/settings", icon: Settings },
];

const operationsNav: NavItem[] = [
  { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { name: "Issues", href: "/admin/issues", icon: AlertTriangle },
  { name: "Support", href: "/admin/support", icon: Mail },
  { name: "Contacts", href: "/admin/contacts", icon: Mail },
  { name: "Activity", href: "/admin/activity", icon: History },
];

const AdminLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [search, setSearch] = useState("");
  const [showResults, setShowResults] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { data: candidates } = useAdminCandidates();
  const { data: employers } = useAdminEmployers();
  const { data: notifications } = useNotifications();
  const unreadCount = notifications?.filter((n) => !n.read_at).length ?? 0;

  const searchResults = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return [];
    const cand = (candidates ?? [])
      .filter((c) => {
        const p = c.profiles as { full_name: string | null; email: string | null } | null;
        return p?.full_name?.toLowerCase().includes(q) || p?.email?.toLowerCase().includes(q);
      })
      .slice(0, 5)
      .map((c) => ({
        type: "candidate" as const,
        id: c.id,
        label: (c.profiles as { full_name: string | null })?.full_name ?? "Candidate",
      }));
    const emp = (employers ?? [])
      .filter((e) => e.name.toLowerCase().includes(q))
      .slice(0, 5)
      .map((e) => ({ type: "company" as const, id: e.id, label: e.name }));
    return [...cand, ...emp];
  }, [search, candidates, employers]);

  const renderNavItem = (item: NavItem) => {
    const isActive =
      location.pathname === item.href ||
      (item.href !== "/admin/dashboard" && location.pathname.startsWith(`${item.href}/`));
    return (
      <Link
        key={item.name}
        to={item.href}
        className={cn(
          "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
          isActive
            ? "bg-nordic-orange text-white"
            : "text-foreground/70 hover:bg-muted hover:text-foreground"
        )}
      >
        <item.icon className="h-5 w-5 flex-shrink-0" />
        {!collapsed && <span className="text-sm font-medium">{item.name}</span>}
      </Link>
    );
  };

  const renderSection = (label: string, items: NavItem[]) => (
    <div className="space-y-1">
      {!collapsed && (
        <p className="px-3 pt-3 pb-1 text-xs font-medium text-muted-foreground uppercase tracking-wide">
          {label}
        </p>
      )}
      {items.map(renderNavItem)}
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 h-screen bg-white border-r border-border transition-all duration-300",
          collapsed ? "w-16" : "w-64"
        )}
      >
        <div className="flex h-full flex-col">
          <div className="flex h-14 items-center justify-between px-4 border-b border-border">
            {!collapsed && (
              <Link to="/admin/dashboard" className="text-sm font-semibold text-foreground">
                Nordic Ascent
              </Link>
            )}
            {collapsed && (
              <Link to="/admin/dashboard" className="mx-auto text-lg font-bold text-primary">
                N
              </Link>
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

          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {renderSection("Overview", operationsNav.slice(0, 1))}
            {renderSection("Candidate journey", journeyNav)}
            {renderSection("People", peopleNav)}
            {renderSection("Platform", platformNav)}
            {renderSection("Operations", operationsNav.slice(1))}
          </nav>

          {!collapsed && (
            <div className="p-4 border-t border-border">
              <PortalUserSidebar profilePath="/admin/settings" roleLabel="Portal admin" />
            </div>
          )}
        </div>
      </aside>

      <div className={cn("transition-all duration-300", collapsed ? "ml-16" : "ml-64")}>
        <header className="sticky top-0 z-30 h-16 bg-background/95 backdrop-blur border-b">
          <div className="flex h-full items-center justify-between px-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search candidates, companies..."
                className="w-80 pl-9 bg-muted/50"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setShowResults(true);
                }}
                onFocus={() => setShowResults(true)}
                onBlur={() => setTimeout(() => setShowResults(false), 150)}
              />
              {showResults && searchResults.length > 0 && (
                <div className="absolute top-full mt-1 w-80 bg-popover border rounded-md shadow-lg z-50 py-1">
                  {searchResults.map((r) => (
                    <button
                      key={`${r.type}-${r.id}`}
                      type="button"
                      className="w-full text-left px-3 py-2 text-sm hover:bg-muted"
                      onMouseDown={() => {
                        navigate(
                          r.type === "candidate"
                            ? `/admin/candidates/${r.id}`
                            : `/admin/employers/${r.id}`
                        );
                        setSearch("");
                        setShowResults(false);
                      }}
                    >
                      <span className="text-muted-foreground text-xs uppercase">{r.type}</span>
                      <p>{r.label}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" className="relative" asChild>
                <Link to="/admin/messages">
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-4 w-4 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </Link>
              </Button>
              <PortalUserMenu profilePath="/admin/settings" messagesPath="/admin/messages" />
            </div>
          </div>
        </header>

        <AdminJourneyProgress />

        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
