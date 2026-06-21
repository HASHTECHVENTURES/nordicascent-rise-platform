import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import type { UserRole } from "@/types/database";
import { Loader2 } from "lucide-react";

const roleDashboard: Record<UserRole, string> = {
  candidate: "/candidate/dashboard",
  employer: "/employer/dashboard",
  admin: "/admin/dashboard",
};

export function ProtectedRoute({
  allowedRoles,
  loginPath,
}: {
  allowedRoles: UserRole[];
  loginPath?: string;
}) {
  const { session, profile, loading } = useAuth();
  const location = useLocation();

  const defaultLoginPath =
    allowedRoles.length === 1 && allowedRoles[0] === "admin" ? "/admin/login" : "/login";

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!session) {
    return <Navigate to={loginPath ?? defaultLoginPath} state={{ from: location }} replace />;
  }

  if (profile && !allowedRoles.includes(profile.role)) {
    return <Navigate to={roleDashboard[profile.role]} replace />;
  }

  return <Outlet />;
}
