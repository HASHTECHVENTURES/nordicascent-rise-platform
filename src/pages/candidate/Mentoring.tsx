import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Lock, MessageSquare, UserCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useMyApplications } from "@/hooks/useData";
import { canAccessMentoring } from "@/lib/candidateJourney";
import {
  useMentorMeetingThemes,
  useMyMentorProgramContext,
} from "@/hooks/useMentorProgram";
import { agendaBulletsFromThemeBody, mentorMeetingCountForTrack } from "@/lib/mentorProgram";
import MentorMeetingDots from "@/components/mentor/MentorMeetingDots";

export default function CandidateMentoring() {
  const { profile, candidate } = useAuth();
  const { data: applications, isLoading: appsLoading } = useMyApplications();
  const { applicationId, mentor, company, meetings, track, isLoading } =
    useMyMentorProgramContext();
  const { data: themes } = useMentorMeetingThemes();

  if (appsLoading || isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const mentoringOpen = canAccessMentoring(profile, candidate, false, applications ?? []);
  if (!mentoringOpen || !mentor) {
    return (
      <div className="space-y-4 max-w-2xl">
        <h1 className="text-2xl font-medium">Mentoring</h1>
        <Card>
          <CardContent className="pt-6 text-sm text-muted-foreground">
            Your mentor programme opens once a company assigns you a mentor after Selection.
            Mentoring runs alongside Readiness and Activation — not as a separate journey step.
          </CardContent>
        </Card>
      </div>
    );
  }

  const themeByNumber = new Map((themes ?? []).map((t) => [t.meeting_number, t]));
  const activeMeetings = (meetings ?? []).filter((m) => m.status !== "not_applicable");
  const completed = activeMeetings.filter((m) => m.status === "completed").length;
  const total = mentorMeetingCountForTrack(track);
  const progressPct = total > 0 ? Math.round((completed / total) * 100) : 0;
  const nextMeeting = activeMeetings.find((m) => m.status === "available" || m.status === "locked");

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-medium">Mentoring</h1>
        <p className="text-muted-foreground text-sm">
          Your mentor relationship and meeting agendas. Observations stay with your mentor and Nordic Ascent.
        </p>
      </div>

      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="pt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <UserCircle className="h-12 w-12 text-primary shrink-0" />
            <div>
              <p className="text-sm font-medium text-primary">Your mentor</p>
              <p className="text-lg font-semibold mt-0.5">{mentor.name}</p>
              <p className="text-sm text-muted-foreground">
                {[mentor.role_title, company?.name].filter(Boolean).join(" · ")}
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link to="/candidate/messages">
              <MessageSquare className="h-4 w-4 mr-2" />
              Message
            </Link>
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-3">
            <CardTitle className="text-base">Mentoring programme progress</CardTitle>
            <span className="text-sm text-muted-foreground">{progressPct}%</span>
          </div>
          <div className="h-2 rounded-full bg-muted overflow-hidden mt-2">
            <div
              className="h-full bg-nordic-orange transition-all"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <MentorMeetingDots meetings={meetings} track={track} />
          <ul className="space-y-2 mt-4">
            {activeMeetings.map((m) => {
              const theme = themeByNumber.get(m.meeting_number);
              const done = m.status === "completed";
              const locked = m.status === "locked";
              return (
                <li
                  key={m.id}
                  className="flex items-center justify-between gap-3 text-sm border rounded-md px-3 py-2"
                >
                  <span className={done ? "text-foreground" : "text-muted-foreground"}>
                    Meeting {m.meeting_number}: {theme?.title ?? `Session ${m.meeting_number}`}
                  </span>
                  {done ? (
                    <Badge className="bg-success text-success-foreground">Done</Badge>
                  ) : locked ? (
                    <Badge variant="secondary" className="gap-1">
                      <Lock className="h-3 w-3" /> Locked
                    </Badge>
                  ) : (
                    <Badge variant="outline">Next</Badge>
                  )}
                </li>
              );
            })}
          </ul>
        </CardContent>
      </Card>

      {nextMeeting && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {nextMeeting.status === "available" ? "Prepare for your next meeting" : "Upcoming meeting"}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Meeting {nextMeeting.meeting_number}:{" "}
              {themeByNumber.get(nextMeeting.meeting_number)?.title ?? "Mentor session"}
            </p>
          </CardHeader>
          <CardContent>
            {(() => {
              const theme = themeByNumber.get(nextMeeting.meeting_number);
              const bullets = agendaBulletsFromThemeBody(theme?.theme_body ?? "");
              if (bullets.length === 0) {
                return (
                  <p className="text-sm text-muted-foreground">
                    Your mentor will share the date when the invite is sent.
                  </p>
                );
              }
              return (
                <div className="rounded-md bg-muted/50 p-4">
                  <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground mb-2">
                    Session agenda
                  </p>
                  <ul className="list-disc pl-5 space-y-1.5 text-sm text-foreground">
                    {bullets.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                  {nextMeeting.status === "locked" && (
                    <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1">
                      <Lock className="h-3 w-3" />
                      This meeting unlocks when the previous step in your journey is complete.
                    </p>
                  )}
                </div>
              );
            })()}
            {!applicationId && null}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
