import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Calendar,
  CheckCircle,
  Circle,
  ExternalLink,
  Loader2,
  Lock,
  MessageSquare,
  Phone,
  UserCircle,
  Video,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useMyApplications } from "@/hooks/useData";
import { canAccessMentoring } from "@/lib/candidateJourney";
import {
  useMentorMeetingThemes,
  useMyMentorProgramContext,
  useReadinessMentorGateForApplication,
} from "@/hooks/useMentorProgram";
import { useActivationRecord } from "@/hooks/useActivation";
import {
  agendaBulletsFromThemeBody,
  getMeetingLockedReason,
  mentorMeetingCountForTrack,
  mentorMeetingTitle,
  type ActivationMentorGate,
  type MentorProgramMeeting,
} from "@/lib/mentorProgram";
import MentorMeetingDots from "@/components/mentor/MentorMeetingDots";
import { PageSpinner } from "@/components/ui/PageSpinner";

function formatSessionWhen(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZoneName: "short",
  });
}

export default function CandidateMentoring() {
  const { profile, candidate } = useAuth();
  const { data: applications, isLoading: appsLoading } = useMyApplications();
  const { applicationId, mentor, company, meetings, track, isLoading } =
    useMyMentorProgramContext();
  const { data: themes } = useMentorMeetingThemes();
  const { data: gate } = useReadinessMentorGateForApplication(applicationId);
  const { data: activationRecord } = useActivationRecord(applicationId);

  if (appsLoading || isLoading) {
    return <PageSpinner />;
  }

  const mentoringOpen = canAccessMentoring(profile, candidate, false, applications ?? []);
  if (!mentoringOpen || !mentor) {
    return (
      <div className="space-y-4 max-w-2xl">
        <h1 className="text-2xl font-medium">Mentoring</h1>
        <Card>
          <CardContent className="pt-6 text-sm text-muted-foreground">
            Your mentor programme opens once a company assigns you a mentor after Selection.
            Mentoring runs alongside Readiness and Activation — it is a separate area in the sidebar,
            not a step in My Journey. Readiness stays locked until your mentor is assigned.
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
  const readinessGate = gate ?? { level2BothSubmitted: false, allTestsSubmitted: false };
  const activationGate: ActivationMentorGate = {
    activationUnlocked: Boolean(activationRecord),
    internshipStartDate: activationRecord?.internship_start_date ?? null,
  };

  const nextMeeting =
    activeMeetings.find((m) => m.status === "available") ??
    activeMeetings.find((m) => m.status === "locked") ??
    null;

  const lockedReason = (m: MentorProgramMeeting) =>
    getMeetingLockedReason(m.meeting_number, activeMeetings, readinessGate, activationGate);

  const role = mentor.role_title?.trim();
  const companyName = company?.name?.trim();

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-medium">Mentoring</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Parallel with Readiness and Activation. Your mentor follows a shared agenda — you prepare
          from it; observations stay with your mentor.
        </p>
      </div>

      <Card className="border-primary/20 bg-primary/5 overflow-hidden">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-5">
            <UserCircle className="h-16 w-16 text-primary shrink-0" />
            <div className="flex-1 min-w-0 space-y-3">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-primary">Your mentor</p>
                <p className="text-base mt-1">
                  Your mentor is <strong>{mentor.name}</strong>
                  {role ? `, ${role}` : ""}
                  {companyName ? ` at ${companyName}` : ""}.
                </p>
              </div>
              {mentor.bio?.trim() && (
                <p className="text-sm text-foreground/90 leading-relaxed">{mentor.bio.trim()}</p>
              )}
              {mentor.expertise_tags && mentor.expertise_tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {mentor.expertise_tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="font-normal">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
              <div className="flex flex-wrap gap-2 pt-1">
                <Button variant="outline" size="sm" asChild>
                  <Link to="/candidate/messages">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Message
                  </Link>
                </Button>
                {mentor.email && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={`mailto:${mentor.email}`}>
                      <Calendar className="h-4 w-4 mr-2" />
                      Email mentor
                    </a>
                  </Button>
                )}
                {mentor.phone && (
                  <Button variant="ghost" size="sm" asChild>
                    <a href={`tel:${mentor.phone}`}>
                      <Phone className="h-4 w-4 mr-2" />
                      Call
                    </a>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {nextMeeting && (
        <Card className="border-nordic-orange/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">
              {nextMeeting.status === "available" ? "Next mentor meeting" : "Upcoming mentor meeting"}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Meeting {nextMeeting.meeting_number}:{" "}
              {mentorMeetingTitle(
                nextMeeting.meeting_number,
                themeByNumber.get(nextMeeting.meeting_number)?.title
              )}
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            {nextMeeting.scheduled_at ? (
              <p className="text-sm flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                {formatSessionWhen(nextMeeting.scheduled_at)}
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">
                {nextMeeting.status === "locked"
                  ? lockedReason(nextMeeting)
                  : "Date appears once your mentor sends the invite."}
              </p>
            )}
            {nextMeeting.meeting_url && nextMeeting.status === "available" && (
              <Button size="sm" asChild>
                <a href={nextMeeting.meeting_url} target="_blank" rel="noopener noreferrer">
                  <Video className="h-4 w-4 mr-2" />
                  Join call
                  <ExternalLink className="h-3 w-3 ml-1 opacity-60" />
                </a>
              </Button>
            )}
            {(() => {
              const bullets = agendaBulletsFromThemeBody(
                themeByNumber.get(nextMeeting.meeting_number)?.theme_body
              );
              if (bullets.length === 0) return null;
              return (
                <div className="rounded-md bg-muted/50 p-3">
                  <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground mb-1">
                    Session agenda
                  </p>
                  <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                    {bullets.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              );
            })()}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-3">
            <CardTitle className="text-base">Programme progress</CardTitle>
            <span className="text-sm font-medium">
              {completed}/{total} · {progressPct}%
            </span>
          </div>
          <Progress value={progressPct} className="h-2 mt-2" />
          <p className="text-xs text-muted-foreground mt-2">
            {track === "fast"
              ? "Fast track ends after Meeting 3."
              : "Meetings 1–3 during Readiness · Meetings 4–6 during Activation."}
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <MentorMeetingDots meetings={meetings} track={track} />
          <ul className="space-y-2">
            {activeMeetings.map((m) => {
              const theme = themeByNumber.get(m.meeting_number);
              const done = m.status === "completed";
              const locked = m.status === "locked";
              const available = m.status === "available";
              const label = mentorMeetingTitle(m.meeting_number, theme?.title);
              return (
                <li
                  key={m.id}
                  className="flex items-center gap-3 text-sm border rounded-md px-3 py-2.5"
                >
                  {done ? (
                    <CheckCircle className="h-4 w-4 text-success shrink-0" />
                  ) : locked ? (
                    <Lock className="h-4 w-4 text-muted-foreground shrink-0" />
                  ) : (
                    <Circle className="h-4 w-4 text-primary shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className={done ? "text-foreground" : "text-muted-foreground"}>
                      Meeting {m.meeting_number}: {label}
                    </p>
                    {locked && (
                      <p className="text-[11px] text-muted-foreground mt-0.5">{lockedReason(m)}</p>
                    )}
                    {available && m.scheduled_at && (
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        {formatSessionWhen(m.scheduled_at)}
                      </p>
                    )}
                  </div>
                  {done ? (
                    <Badge className="bg-success text-success-foreground shrink-0">Completed</Badge>
                  ) : locked ? (
                    <Badge variant="secondary" className="shrink-0">Locked</Badge>
                  ) : (
                    <Badge variant="outline" className="shrink-0">Open</Badge>
                  )}
                </li>
              );
            })}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
