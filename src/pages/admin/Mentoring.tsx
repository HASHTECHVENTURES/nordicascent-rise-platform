import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, ChevronRight, AlertTriangle } from "lucide-react";
import { useAdminMentoringApplications } from "@/hooks/useSelection";
import { useAdminMentorOverdueFlags } from "@/hooks/useMentorProgram";
import { resolveProfile } from "@/lib/resolveProfile";
import { TRACK_META, type Track } from "@/lib/track";
import { mentorMeetingCountForTrack } from "@/lib/mentorProgram";
import { PageSpinner } from "@/components/ui/PageSpinner";

export default function AdminMentoring({ embedded = false }: { embedded?: boolean }) {
  const { data: applications, isLoading } = useAdminMentoringApplications();
  const { data: overdue } = useAdminMentorOverdueFlags();

  const meetingOverdueCount = Object.keys(overdue?.meetingOverdueByApp ?? {}).length;
  const assignmentOverdueCount = overdue?.assignmentOverdueIds.size ?? 0;

  return (
    <div className="space-y-6">
      {!embedded && (
        <div>
          <h1 className="text-2xl font-medium">Mentoring</h1>
          <p className="text-muted-foreground">
            Module 3B — parallel with Readiness (Meetings 1–3) and Activation (Meetings 4–6).
            Mentors use shared agendas and a reusable observation form. Signal and Activation notes
            feed Final Clearance.
          </p>
        </div>
      )}

      {(assignmentOverdueCount > 0 || meetingOverdueCount > 0) && (
        <Card className="border-destructive/40 bg-destructive/5">
          <CardContent className="pt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Mentoring SLA flags</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {assignmentOverdueCount > 0 && (
                    <span>
                      {assignmentOverdueCount} mentor assignment{assignmentOverdueCount > 1 ? "s" : ""}{" "}
                      overdue (5+ business days)
                      {meetingOverdueCount > 0 ? " · " : ""}
                    </span>
                  )}
                  {meetingOverdueCount > 0 && (
                    <span>
                      {meetingOverdueCount} programme{meetingOverdueCount > 1 ? "s" : ""} with overdue
                      open meetings (7+ days)
                    </span>
                  )}
                </p>
              </div>
            </div>
            {assignmentOverdueCount > 0 && (
              <Button variant="outline" size="sm" asChild className="shrink-0">
                <Link to="/admin/selection?step=5">Open Selection</Link>
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="pt-6 space-y-3 text-sm text-muted-foreground">
          <p className="font-medium text-foreground">Meeting structure</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              <strong>Meetings 1–3 (Readiness):</strong> Introduction → reflection after part 2 →
              final reflection + Signal note
            </li>
            <li>
              <strong>Meetings 4–6 (Activation, Entry only):</strong> Weeks 1–2, 3–5, end of
              internship + Activation note
            </li>
            <li>
              <strong>Fast track:</strong> Programme ends after Meeting 3 — Meetings 4–6 are not
              applicable
            </li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Active mentor programmes</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <PageSpinner size="section" />
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
                const overdueMeetings = overdue?.meetingOverdueByApp[app.id] ?? [];
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
                      {overdueMeetings.length > 0 && (
                        <Badge variant="destructive" className="gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          M{overdueMeetings.join(", M")} overdue
                        </Badge>
                      )}
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
