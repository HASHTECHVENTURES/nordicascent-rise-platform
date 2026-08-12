import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronRight } from "lucide-react";
import { PageSpinner } from "@/components/ui/PageSpinner";
import { useUniversityCreditActivations } from "@/hooks/useUniversityPortal";
import { resolveProfile } from "@/lib/resolveProfile";
import { TRACK_META, type Track } from "@/lib/track";

export default function UniversityStudents() {
  const { data: rows, isLoading } = useUniversityCreditActivations();

  if (isLoading) return <PageSpinner />;

  const list = rows ?? [];

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-medium">Credit internships</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Approve projects, monitor learning progress, and award credit. Company hiring evaluation is
          not visible here.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Students</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {list.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4">No credit internships yet.</p>
          ) : (
            list.map((app) => {
              const profile = resolveProfile(app.candidates?.profiles);
              const track =
                (app.track as Track | null) ??
                ((app.candidates as { track?: Track } | null)?.track ?? "entry");
              const progress = app.academicProgress ?? { done: 0, total: 7 };
              return (
                <Link
                  key={app.id}
                  to={`/university/students/${app.id}`}
                  className="flex items-center justify-between gap-3 p-3 rounded-lg border hover:bg-muted/50"
                >
                  <div className="min-w-0">
                    <p className="font-medium truncate">
                      {profile?.full_name ?? app.candidates?.full_name ?? "Student"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {app.jobs?.title} · {app.jobs?.companies?.name} · {TRACK_META[track].label}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">
                      Academic {progress.done}/{progress.total}
                    </Badge>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </Link>
              );
            })
          )}
        </CardContent>
      </Card>
    </div>
  );
}
