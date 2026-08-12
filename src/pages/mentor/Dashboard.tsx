import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronRight } from "lucide-react";
import { PageSpinner } from "@/components/ui/PageSpinner";
import { useMyMentorAssignments } from "@/hooks/useMentorPortal";
import { resolveProfile } from "@/lib/resolveProfile";
import { TRACK_META, type Track } from "@/lib/track";
import MentorMeetingDots from "@/components/mentor/MentorMeetingDots";
import { mentorMeetingCountForTrack } from "@/lib/mentorProgram";

export default function MentorDashboard() {
  const { data, isLoading } = useMyMentorAssignments();

  if (isLoading) return <PageSpinner />;

  const assignments = data?.assignments ?? [];
  const mentor = data?.mentor;

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-medium">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {mentor
            ? `${mentor.name}${mentor.role_title ? ` · ${mentor.role_title}` : ""} — standardised mentor programme (agendas + observation forms).`
            : "Your assigned candidates appear here once a company links you as mentor."}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Assigned candidates</CardTitle>
        </CardHeader>
        <CardContent>
          {assignments.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4">
              No candidates assigned yet. When your company assigns you in Selection, programmes open
              here.
            </p>
          ) : (
            <div className="space-y-2">
              {assignments.map((app) => {
                const profile = resolveProfile(app.candidates?.profiles);
                const track =
                  (app.track as Track | null) ??
                  ((app.candidates as { track?: Track } | null)?.track ?? "entry");
                const meetings = app.meetings ?? [];
                const current = meetings.find((m) => m.status === "available");
                return (
                  <Link
                    key={app.id}
                    to={`/mentor/candidates/${app.id}`}
                    className="flex items-center justify-between gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <div className="min-w-0 space-y-1">
                      <p className="font-medium truncate">
                        {profile?.full_name ?? app.candidates?.full_name ?? "Candidate"}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {app.jobs?.title} · {TRACK_META[track].label} ·{" "}
                        {mentorMeetingCountForTrack(track)} meetings
                      </p>
                      <MentorMeetingDots meetings={meetings} track={track} />
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {current ? (
                        <Badge variant="outline">Meeting {current.meeting_number} open</Badge>
                      ) : (
                        <Badge variant="secondary">In progress</Badge>
                      )}
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
