import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, ChevronRight } from "lucide-react";
import { useAdminMentoringApplications } from "@/hooks/useSelection";
import { resolveProfile } from "@/lib/resolveProfile";
import { TRACK_META, type Track } from "@/lib/track";
import { mentorMeetingCountForTrack } from "@/lib/mentorProgram";

export default function AdminMentoring() {
  const { data: applications, isLoading } = useAdminMentoringApplications();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-medium">Mentoring</h1>
        <p className="text-muted-foreground">
          Standard 3+3 programme — Entry track: 3 readiness + 3 activation meetings. Fast track: 3 meetings.
          Complete observations here. Optional add-on topics per session — custom meetings are not used.
        </p>
      </div>

      <Card>
        <CardContent className="pt-6 space-y-3 text-sm text-muted-foreground">
          <p className="font-medium text-foreground">3+3 meeting structure</p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Readiness phase (Meetings 1–3):</strong> Introduction, reflection, final readiness review</li>
            <li><strong>Activation phase (Meetings 4–6, Entry track only):</strong> On-the-job mentoring sessions</li>
            <li><strong>Fast track:</strong> Meetings 4–6 are not applicable — only 3 readiness meetings</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Active mentor programmes</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : (applications ?? []).length === 0 ? (
            <p className="text-sm text-muted-foreground py-4">
              No active mentor programmes yet. Assign a mentor in Selection to start.
            </p>
          ) : (
            <div className="space-y-2">
              {(applications ?? []).map((app) => {
                const profile = resolveProfile(app.candidates?.profiles);
                const track =
                  (app.track as Track | null) ??
                  ((app.candidates as { track?: Track } | null)?.track ?? "entry");
                const meetingCount = mentorMeetingCountForTrack(track);
                return (
                  <Link
                    key={app.id}
                    to={`/admin/mentoring/${app.id}`}
                    className="flex items-center justify-between gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <div className="min-w-0">
                      <p className="font-medium truncate">{profile?.full_name ?? "Candidate"}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {app.jobs?.title} · {TRACK_META[track].label} · {meetingCount} meetings
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {app.assigned_mentor_id ? (
                        <Badge variant="secondary">Mentor assigned</Badge>
                      ) : (
                        <Badge variant="outline">No mentor</Badge>
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
