import { useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  Building2,
  UserCheck,
  Briefcase,
  BarChart3,
  Shield,
  Settings,
  ChevronLeft,
  ChevronRight,
  Bell,
  LogOut,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import AdminPipelineProgress from "@/components/admin/AdminPipelineProgress";

const navigation = [
  { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { name: "Users", href: "/admin/users", icon: Users },
  { name: "Employers", href: "/admin/employers", icon: Building2 },
  { name: "Candidates", href: "/admin/candidates", icon: UserCheck },
  { name: "Jobs", href: "/admin/jobs", icon: Briefcase },
  { name: "Analytics", href: "/admin/analytics", icon: BarChart3 },
  { name: "Security", href: "/admin/security", icon: Shield },
  { name: "Settings", href: "/admin/settings", icon: Settings },
];

const AdminLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 h-screen bg-white border-r border-border transition-all duration-300",
          collapsed ? "w-16" : "w-64"
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-32 items-center justify-between px-4 border-b border-border">
            {!collapsed && (
              <Link to="/admin/dashboard" className="flex items-center gap-2">
                <img 
                  src={logoImage} 
                  alt="Nordic Ascent" 
                  className="h-32 w-auto"
                  style={{ filter: "brightness(0) saturate(100%) invert(19%) sepia(32%) saturate(1200%) hue-rotate(183deg) brightness(95%) contrast(92%)" }}
                />
              </Link>
            )}
            {collapsed && (
              <Link to="/admin/dashboard" className="mx-auto">
                <img 
                  src={logoImage} 
                  alt="Nordic Ascent" 
                  className="h-20 w-auto"
                  style={{ filter: "brightness(0) saturate(100%) invert(19%) sepia(32%) saturate(1200%) hue-rotate(183deg) brightness(95%) contrast(92%)" }}
                />
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

          {/* Collapse toggle when collapsed */}
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
          <nav className="flex-1 p-4 space-y-1">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors",
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

          {/* Admin section */}
          {!collapsed && (
            <div className="p-4 border-t border-border">
              <div className="flex items-center gap-3 p-2 rounded-lg bg-muted">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="https://i.pravatar.cc/150?img=68" />
                  <AvatarFallback className="bg-nordic-orange text-white">SA</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate text-foreground">Super Admin</p>
                  <p className="text-xs text-muted-foreground">Administrator</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Main content */}
      <div className={cn("transition-all duration-300", collapsed ? "ml-16" : "ml-64")}>
        {/* Header */}
        <header className="sticky top-0 z-30 h-16 bg-background/95 backdrop-blur border-b">
          <div className="flex h-full items-center justify-between px-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users, jobs, employers..."
                  className="w-80 pl-9 bg-muted/50"
                />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 h-4 w-4 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center">
                  2
                </span>
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="https://i.pravatar.cc/150?img=68" />
                      <AvatarFallback>SA</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel>Super Admin</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/admin/settings">Settings</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/admin/security">Security</Link>
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

export default AdminLayout;
