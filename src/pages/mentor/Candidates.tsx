import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronRight } from "lucide-react";
import { PageSpinner } from "@/components/ui/PageSpinner";
import { useMyMentorAssignments } from "@/hooks/useMentorPortal";
import { resolveProfile } from "@/lib/resolveProfile";
import { TRACK_META, type Track } from "@/lib/track";
import MentorMeetingDots from "@/components/mentor/MentorMeetingDots";

export default function MentorCandidates() {
  const { data, isLoading } = useMyMentorAssignments();

  if (isLoading) return <PageSpinner />;

  const assignments = data?.assignments ?? [];

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-medium">Assigned candidates</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Open a candidate to view the shared agenda, schedule sessions, and complete observation
          forms.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Programmes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {assignments.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4">No assigned candidates.</p>
          ) : (
            assignments.map((app) => {
              const profile = resolveProfile(app.candidates?.profiles);
              const track =
                (app.track as Track | null) ??
                ((app.candidates as { track?: Track } | null)?.track ?? "entry");
              return (
                <Link
                  key={app.id}
                  to={`/mentor/candidates/${app.id}`}
                  className="flex items-center justify-between gap-3 p-3 rounded-lg border hover:bg-muted/50"
                >
                  <div className="min-w-0">
                    <p className="font-medium truncate">
                      {profile?.full_name ?? app.candidates?.full_name ?? "Candidate"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {app.jobs?.title} · {TRACK_META[track].label}
                    </p>
                    <div className="mt-2">
                      <MentorMeetingDots meetings={app.meetings ?? []} track={track} />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">Open</Badge>
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
