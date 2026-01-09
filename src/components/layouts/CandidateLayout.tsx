import { useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  User,
  ClipboardCheck,
  UserCheck,
  GraduationCap,
  Briefcase,
  MapPin,
  Building2,
  Users,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  Bell,
  LogOut,
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

// Navigation aligned with 7-stage pipeline
const navigation = [
  { name: "My Journey", href: "/candidate/dashboard", icon: LayoutDashboard },
  { name: "Preparation", href: "/candidate/preparation", icon: ClipboardCheck },
  { name: "Selection", href: "/candidate/selection", icon: UserCheck },
  { name: "Trainee", href: "/candidate/trainee", icon: GraduationCap },
  { name: "Internship", href: "/candidate/internship", icon: Briefcase },
  { name: "Relocation", href: "/candidate/relocation", icon: MapPin },
  { name: "Onboarding", href: "/candidate/onboarding", icon: Building2 },
  { name: "Follow-up", href: "/candidate/followup", icon: Users },
  { name: "Profile", href: "/candidate/profile", icon: User },
  { name: "Messages", href: "/candidate/messages", icon: MessageSquare },
];

const CandidateLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

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
                <img 
                  src={logoImage} 
                  alt="Nordic Ascent" 
                  className="h-32 w-auto logo-boost"
                />
              </Link>
            )}
            {collapsed && (
              <Link to="/candidate/dashboard" className="mx-auto">
                <img 
                  src={logoImage} 
                  alt="Nordic Ascent" 
                  className="h-20 w-auto logo-boost"
                />
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

          {/* Collapse toggle when collapsed */}
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
                      : "text-nordic-sand/80 hover:bg-white/10 hover:text-nordic-sand"
                  )}
                >
                  <item.icon className="h-5 w-5 flex-shrink-0" />
                  {!collapsed && <span className="text-sm font-medium">{item.name}</span>}
                </Link>
              );
            })}
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
        {/* Header */}
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

        {/* Page content */}
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default CandidateLayout;
