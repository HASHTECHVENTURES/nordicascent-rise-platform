import { useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  User,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Bell,
  Heart,
  LogOut,
  Info,
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
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import logoImage from "@/assets/nordic-ascent-logo.png";
import PipelineProgress from "@/components/candidate/PipelineProgress";

// My Journey group (dashboard + profile)
const journeyItems = [
  { name: "Overview", href: "/candidate/dashboard", icon: LayoutDashboard, tooltip: "Track your pipeline progress overview" },
  { name: "Profile", href: "/candidate/profile", icon: User, tooltip: "Manage your personal information and CV" },
];

// Standalone nav items
const standaloneNav = [
  { name: "Mentoring", href: "/candidate/mentoring", icon: Heart, tooltip: "Connect with your dedicated company mentor" },
  { name: "Messages", href: "/candidate/messages", icon: MessageSquare, tooltip: "Communication with employers and Nordic Ascent team" },
];

const CandidateLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [journeyOpen, setJourneyOpen] = useState(true);
  const location = useLocation();

  const isJourneyActive = journeyItems.some(s => location.pathname === s.href);

  const renderNavItem = (item: { name: string; href: string; icon: React.ElementType; tooltip?: string }, indented = false) => {
    const isActive = location.pathname === item.href;
    return (
      <div key={item.name} className="flex items-center gap-1">
        <Link
          to={item.href}
          className={cn(
            "flex items-center gap-3 py-2 rounded transition-colors flex-1",
            indented ? "pl-9 pr-3" : "px-3",
            isActive
              ? "bg-nordic-orange text-white"
              : "text-nordic-sand/80 hover:bg-white/10 hover:text-nordic-sand"
          )}
        >
          <item.icon className={cn("flex-shrink-0", indented ? "h-4 w-4" : "h-5 w-5")} />
          {!collapsed && <span className={cn("font-medium", indented ? "text-xs" : "text-sm")}>{item.name}</span>}
        </Link>
        {!collapsed && item.tooltip && (
          <Tooltip>
            <TooltipTrigger asChild>
              <button className="p-1 text-nordic-sand/40 hover:text-nordic-sand/70 transition-colors">
                <Info className="h-3.5 w-3.5" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" className="max-w-[220px]">
              <p className="text-xs">{item.tooltip}</p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 h-screen bg-nordic-deep border-r border-nordic-deep",
          collapsed ? "w-16" : "w-64"
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-32 items-center justify-between px-4 border-b border-white/10">
            {!collapsed && (
              <Link to="/candidate/dashboard" className="flex items-center gap-2">
                <img src={logoImage} alt="Nordic Ascent" className="h-32 w-auto brightness-0 invert" />
              </Link>
            )}
            {collapsed && (
              <Link to="/candidate/dashboard" className="mx-auto">
                <img src={logoImage} alt="Nordic Ascent" className="h-20 w-auto brightness-0 invert" />
              </Link>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCollapsed(!collapsed)}
              className={cn("text-nordic-sand hover:bg-white/10", collapsed && "hidden")}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </div>

          {collapsed && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCollapsed(false)}
              className="mx-auto mt-2 text-nordic-sand hover:bg-white/10"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {/* My Journey - Collapsible Group */}
            <div>
              {collapsed ? (
                <Link
                  to="/candidate/dashboard"
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded transition-colors",
                    isJourneyActive
                      ? "bg-nordic-orange text-white"
                      : "text-nordic-sand/80 hover:bg-white/10 hover:text-nordic-sand"
                  )}
                >
                  <LayoutDashboard className="h-5 w-5 flex-shrink-0" />
                </Link>
              ) : (
                <>
                  <button
                    onClick={() => setJourneyOpen(!journeyOpen)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded transition-colors w-full text-left",
                      isJourneyActive
                        ? "text-nordic-sand"
                        : "text-nordic-sand/80 hover:bg-white/10 hover:text-nordic-sand"
                    )}
                  >
                    <LayoutDashboard className="h-5 w-5 flex-shrink-0" />
                    <span className="text-sm font-medium flex-1">My Journey</span>
                    <ChevronDown className={cn("h-4 w-4 transition-transform", !journeyOpen && "-rotate-90")} />
                  </button>

                  {journeyOpen && (
                    <div className="mt-1 space-y-0.5">
                      {journeyItems.map((item) => renderNavItem(item, true))}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Separator */}
            {!collapsed && <div className="border-t border-white/10 my-3" />}

            {/* Standalone items */}
            {standaloneNav.map((item) => renderNavItem(item))}
          </nav>

          {/* User section */}
          {!collapsed && (
            <div className="p-4 border-t border-white/10">
              <div className="flex items-center gap-3 p-2 rounded bg-white/10">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="https://i.pravatar.cc/150?img=1" />
                  <AvatarFallback className="bg-nordic-orange text-white">RA</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate text-nordic-sand">Rahul Sharma</p>
                  <p className="text-xs text-nordic-sand/60">Candidate</p>
                </div>
              </div>
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
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 h-4 w-4 bg-warning text-warning-foreground text-xs rounded-full flex items-center justify-center">
                  3
                </span>
              </Button>

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
