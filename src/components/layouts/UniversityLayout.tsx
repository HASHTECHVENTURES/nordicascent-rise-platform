import { useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { LayoutDashboard, GraduationCap, ChevronLeft, ChevronRight, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useMyUniversityStaff } from "@/hooks/useUniversityPortal";

const navigation = [
  { name: "Dashboard", href: "/university/dashboard", icon: LayoutDashboard },
  { name: "Credit internships", href: "/university/students", icon: GraduationCap },
];

export default function UniversityLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { profile, signOut } = useAuth();
  const { data: staff } = useMyUniversityStaff();
  const universityName = staff?.universities?.name;

  return (
    <div className="min-h-screen bg-background">
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 h-screen bg-white border-r border-border",
          collapsed ? "w-16" : "w-64"
        )}
      >
        <div className="flex h-full flex-col">
          <div className="flex h-14 items-center justify-between px-4 border-b border-border">
            {!collapsed && (
              <Link to="/university/dashboard" className="text-sm font-semibold text-foreground">
                Nordic Ascent
              </Link>
            )}
            {collapsed && (
              <Link to="/university/dashboard" className="mx-auto text-lg font-bold text-primary">
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

          <nav className="flex-1 p-4 space-y-1">
            {navigation.map((item) => {
              const isActive =
                location.pathname === item.href ||
                (item.href !== "/university/dashboard" &&
                  location.pathname.startsWith(`${item.href}/`));
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
                  <item.icon className="h-5 w-5 shrink-0" />
                  {!collapsed && <span className="text-sm font-medium">{item.name}</span>}
                </Link>
              );
            })}
          </nav>

          {!collapsed && (
            <div className="p-4 border-t border-border space-y-2">
              <p className="text-sm font-medium truncate">{profile?.full_name ?? staff?.name ?? "University"}</p>
              <p className="text-xs text-muted-foreground truncate">
                {universityName ?? "University portal"}
              </p>
              <Button
                variant="outline"
                size="sm"
                className="w-full gap-2"
                onClick={async () => {
                  await signOut();
                  navigate("/login?role=university");
                }}
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </Button>
            </div>
          )}
        </div>
      </aside>

      <div className={cn(collapsed ? "ml-16" : "ml-64")}>
        <header className="sticky top-0 z-30 h-16 bg-background border-b">
          <div className="flex h-full items-center px-6">
            <h1 className="text-lg font-medium text-foreground">Academic credit workflow</h1>
          </div>
        </header>
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
