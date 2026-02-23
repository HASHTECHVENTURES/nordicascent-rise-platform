import { useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  Bell,
  Heart,
  LogOut,
  AlertTriangle,
} from "lucide-react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
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
import logoBlue from "@/assets/nordic-ascent-logo-blue.png";
import PipelineProgress from "@/components/candidate/PipelineProgress";

// No sub-items needed; My Journey is a direct link

// Standalone nav items
const standaloneNav = [
  { name: "Mentoring", href: "/candidate/mentoring", icon: Heart, tooltip: "Connect with your dedicated company mentor" },
  { name: "Messages", href: "/candidate/messages", icon: MessageSquare, tooltip: "Communication with employers and Nordic Ascent team" },
];

const CandidateLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  const renderNavItem = (item: { name: string; href: string; icon: React.ElementType; tooltip?: string }, indented = false) => {
    const isActive = location.pathname === item.href;
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
          {/* Logo */}
          <div className="flex h-32 items-center justify-between px-4 border-b border-border">
            {!collapsed && (
              <Link to="/candidate/dashboard" className="flex items-center gap-2">
                <img src={logoBlue} alt="Nordic Ascent" className="h-32 w-auto" />
              </Link>
            )}
            {collapsed && (
              <Link to="/candidate/dashboard" className="mx-auto">
                <img src={logoBlue} alt="Nordic Ascent" className="h-20 w-auto" />
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

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {/* My Journey - Direct Link */}
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

            {/* Separator */}
            {!collapsed && <div className="border-t border-border my-3" />}

            {/* Standalone items */}
            {standaloneNav.map((item) => renderNavItem(item))}
          </nav>

          {/* User section */}
          {!collapsed && (
            <div className="p-4 border-t border-border">
              <Link
                to="/candidate/profile"
                className={cn(
                  "flex items-center gap-3 p-2 rounded transition-colors",
                  location.pathname === "/candidate/profile"
                    ? "bg-nordic-orange text-white"
                    : "bg-muted hover:bg-muted/80"
                )}
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src="https://i.pravatar.cc/150?img=1" />
                  <AvatarFallback className="bg-nordic-orange text-white">RA</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate text-foreground">Rahul Sharma</p>
                  <p className="text-xs text-muted-foreground">Candidate</p>
                </div>
              </Link>
            </div>
          )}
        </div>
      </aside>

      {/* Main content */}
      <div className={cn(collapsed ? "ml-16" : "ml-64")}>
        <header className="sticky top-0 z-30 h-16 bg-background border-b">
          <div className="flex h-full items-center justify-between px-6">
            <div className="flex items-center gap-4">
              <h1 className="text-lg font-medium text-foreground">Candidate Journey</h1>
            </div>

            <div className="flex items-center gap-4">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    <span className="absolute -top-1 -right-1 h-4 w-4 bg-warning text-warning-foreground text-xs rounded-full flex items-center justify-center">
                      3
                    </span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-0" align="end">
                  <div className="p-4 border-b">
                    <h3 className="font-semibold text-base">Open Issues</h3>
                  </div>
                  <div className="p-3 space-y-2">
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-warning/10">
                      <AlertTriangle className="h-5 w-5 text-warning flex-shrink-0" />
                      <span className="text-sm">Technical assessment deadline in 5 days</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-warning/10">
                      <AlertTriangle className="h-5 w-5 text-warning flex-shrink-0" />
                      <span className="text-sm">Document upload pending for Preparation stage</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-warning/10">
                      <AlertTriangle className="h-5 w-5 text-warning flex-shrink-0" />
                      <span className="text-sm">New message from your mentor</span>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="https://i.pravatar.cc/150?img=1" />
                      <AvatarFallback>RA</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/candidate/profile">Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/candidate/messages">Messages</Link>
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

        <PipelineProgress />
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default CandidateLayout;
