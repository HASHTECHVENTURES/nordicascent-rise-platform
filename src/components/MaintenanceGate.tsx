import { usePublicConfig } from "@/hooks/useData";
import { Loader2, Wrench } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function MaintenanceGate({ children }: { children: React.ReactNode }) {
  const { data: config, isLoading } = usePublicConfig();
  const { profile, loading: authLoading } = useAuth();

  if (isLoading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (config?.maintenanceMode && profile?.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
        <div className="max-w-md text-center space-y-4">
          <Wrench className="h-12 w-12 mx-auto text-primary" />
          <h1 className="text-2xl font-bold">{config.platformName ?? "Nordic Ascent"}</h1>
          <p className="text-muted-foreground">
            We&apos;re performing scheduled maintenance. Please check back shortly.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
