import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import type { UserRole } from "@/types/database";
import { Loader2 } from "lucide-react";
import { buildLoginPathWithRedirect } from "@/lib/pendingJobApplication";

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!session) {
    const returnPath = `${location.pathname}${location.search}`;
    let loginTarget = loginPath;
    if (!loginTarget) {
      if (allowedRoles.length === 1 && allowedRoles[0] === "admin") {
        loginTarget = `/admin/login?redirect=${encodeURIComponent(returnPath)}`;
      } else if (allowedRoles.length === 1 && allowedRoles[0] === "candidate") {
        loginTarget = buildLoginPathWithRedirect(returnPath, { role: "candidate" });
      } else if (allowedRoles.length === 1 && allowedRoles[0] === "employer") {
        loginTarget = buildLoginPathWithRedirect(returnPath, { role: "employer" });
      } else {
        loginTarget = buildLoginPathWithRedirect(returnPath);
      }
    }
    return <Navigate to={loginTarget} replace />;
  }

  if (profile && !allowedRoles.includes(profile.role)) {
    return <Navigate to={roleDashboard[profile.role]} replace />;
  }

  return <Outlet />;
}
