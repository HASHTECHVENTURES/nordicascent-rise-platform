import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronRight } from "lucide-react";
import { PageSpinner } from "@/components/ui/PageSpinner";
import {
  useMyUniversityStaff,
  useUniversityCreditActivations,
} from "@/hooks/useUniversityPortal";
import { resolveProfile } from "@/lib/resolveProfile";
import { TRACK_META, type Track } from "@/lib/track";

export default function UniversityDashboard() {
  const { data: staff, isLoading: staffLoading } = useMyUniversityStaff();
  const { data: rows, isLoading } = useUniversityCreditActivations();

  if (staffLoading || isLoading) return <PageSpinner />;

  const list = rows ?? [];
  const pendingApproval = list.filter((r) => !r.activation?.academic_unlocked_at).length;
  const inProgress = list.filter(
    (r) => r.activation?.academic_unlocked_at && (r.academicProgress?.done ?? 0) < 7
  ).length;

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-medium">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {staff?.universities?.name
            ? `Academic credit workflow for ${staff.universities.name}. Hiring evaluation and Final Clearance are never shown here.`
            : "Your university account is not linked yet. Ask Nordic Ascent admin to invite you."}
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-4">
            <p className="text-2xl font-medium">{list.length}</p>
            <p className="text-xs text-muted-foreground">Credit internships</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-2xl font-medium">{pendingApproval}</p>
            <p className="text-xs text-muted-foreground">Awaiting step 1 approval</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-2xl font-medium">{inProgress}</p>
            <p className="text-xs text-muted-foreground">In academic progress</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Students on credit track</CardTitle>
        </CardHeader>
        <CardContent>
          {list.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4">
              No credit-required internships for your university yet. When a company enables
              university credit on Activation, students appear here.
            </p>
          ) : (
            <div className="space-y-2">
              {list.map((app) => {
                const profile = resolveProfile(app.candidates?.profiles);
                const track =
                  (app.track as Track | null) ??
                  ((app.candidates as { track?: Track } | null)?.track ?? "entry");
                const progress = app.academicProgress ?? { done: 0, total: 7 };
                return (
                  <Link
                    key={app.id}
                    to={`/university/students/${app.id}`}
                    className="flex items-center justify-between gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <div className="min-w-0">
                      <p className="font-medium truncate">
                        {profile?.full_name ?? app.candidates?.full_name ?? "Student"}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {app.jobs?.title} · {app.jobs?.companies?.name} · {TRACK_META[track].label}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge variant="outline">
                        {progress.done}/{progress.total}
                      </Badge>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
