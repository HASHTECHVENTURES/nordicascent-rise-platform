import { useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Building2,
  Briefcase,
  Users,
  MessageSquare,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Bell,
  LogOut,
  Heart,
  ClipboardList,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import logoImage from "@/assets/nordic-ascent-logo.png";
import EmployerPipelineProgress from "@/components/employer/EmployerPipelineProgress";

// Company journey navigation
const navigation = [
  { name: "Pipeline Overview", href: "/employer/dashboard", icon: LayoutDashboard },
  { name: "Tasks", href: "/employer/tasks", icon: ClipboardList },
  { name: "Candidates", href: "/employer/candidates", icon: Users },
  { name: "Roles", href: "/employer/jobs", icon: Briefcase },
  { name: "Company Profile", href: "/employer/company", icon: Building2 },
  { name: "Mentoring", href: "/employer/mentoring", icon: Heart },
  { name: "Messages", href: "/employer/messages", icon: MessageSquare },
  { name: "Analytics", href: "/employer/analytics", icon: BarChart3 },
];

const EmployerLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

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
          {/* Logo */}
          <div className="flex h-32 items-center justify-between px-4 border-b border-border">
            {!collapsed && (
              <Link to="/employer/dashboard" className="flex items-center gap-2">
                <img src={logoImage} alt="Nordic Ascent" className="h-32 w-auto" style={{ filter: "brightness(0) saturate(100%) invert(19%) sepia(32%) saturate(1200%) hue-rotate(183deg) brightness(95%) contrast(92%)" }} />
              </Link>
            )}
            {collapsed && (
              <Link to="/employer/dashboard" className="mx-auto">
                <img src={logoImage} alt="Nordic Ascent" className="h-20 w-auto" style={{ filter: "brightness(0) saturate(100%) invert(19%) sepia(32%) saturate(1200%) hue-rotate(183deg) brightness(95%) contrast(92%)" }} />
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
              <div className="flex items-center gap-3 p-2 rounded bg-muted">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="https://logo.clearbit.com/spotify.com" />
                  <AvatarFallback className="bg-nordic-orange text-white">TC</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate text-foreground">TechCorp Nordic</p>
                  <p className="text-xs text-muted-foreground">Company</p>
                </div>
              </div>
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
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 h-4 w-4 bg-warning text-warning-foreground text-xs rounded-full flex items-center justify-center">
                  5
                </span>
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="https://i.pravatar.cc/150?img=12" />
                      <AvatarFallback>HR</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel>HR Manager</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/employer/company">Company Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/employer/messages">Messages</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/login" className="text-destructive">
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
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
