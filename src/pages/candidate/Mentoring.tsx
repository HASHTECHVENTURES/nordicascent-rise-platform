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
import {
  agendaBulletsFromThemeBody,
  getMeetingLockedReason,
  mentorMeetingCountForTrack,
  type MentorProgramMeeting,
} from "@/lib/mentorProgram";
import MentorMeetingDots from "@/components/mentor/MentorMeetingDots";

const DEFAULT_MENTOR_TAGS = ["Career Development", "Cultural Integration", "Leadership"];

function milestoneLabel(meetingNumber: number, title?: string) {
  const defaults: Record<number, string> = {
    1: "Initial Meeting",
    2: "Goal Setting",
    3: "Cultural Orientation",
    4: "Mid-Program Review",
    5: "Career Planning",
    6: "Program Completion",
  };
  return title ?? defaults[meetingNumber] ?? `Meeting ${meetingNumber}`;
}

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
            Mentoring runs alongside Readiness and Activation — it is a separate area in the sidebar,
            not a step in My Journey.
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

  const tags =
    mentor.expertise_tags && mentor.expertise_tags.length > 0
      ? mentor.expertise_tags
      : DEFAULT_MENTOR_TAGS;

  const bio =
    mentor.bio?.trim() ||
    `${mentor.name} supports your transition into Nordic work culture${company?.name ? ` at ${company.name}` : ""}.`;

  const upcomingSessions = activeMeetings.filter(
    (m) =>
      m.status !== "completed" &&
      (m.status === "available" || Boolean(m.scheduled_at))
  );

  const lockedReason = (m: MentorProgramMeeting) =>
    getMeetingLockedReason(m.meeting_number, activeMeetings, readinessGate, false);

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-medium">Mentoring</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Your dedicated mentor guides you from Readiness through Onboarding.
        </p>
      </div>

      <Card className="border-primary/20 bg-primary/5 overflow-hidden">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-5">
            <UserCircle className="h-16 w-16 text-primary shrink-0" />
            <div className="flex-1 min-w-0 space-y-3">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-primary">Your mentor</p>
                <p className="text-xl font-semibold mt-0.5">{mentor.name}</p>
                <p className="text-sm text-muted-foreground">
                  {[mentor.role_title, company?.name].filter(Boolean).join(" · ")}
                </p>
              </div>
              <p className="text-sm text-foreground/90 leading-relaxed">{bio}</p>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="font-normal">
                    {tag}
                  </Badge>
                ))}
              </div>
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
                      Schedule call
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

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-3">
            <CardTitle className="text-base">Mentoring programme progress</CardTitle>
            <span className="text-sm font-medium">{progressPct}%</span>
          </div>
          <Progress value={progressPct} className="h-2 mt-2" />
          <p className="text-xs text-muted-foreground mt-2">Overall progress</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <MentorMeetingDots meetings={meetings} track={track} />
          <ul className="space-y-2">
            {activeMeetings.map((m) => {
              const theme = themeByNumber.get(m.meeting_number);
              const done = m.status === "completed";
              const locked = m.status === "locked";
              const label = milestoneLabel(m.meeting_number, theme?.title);
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
                  <span className={done ? "text-foreground flex-1" : "text-muted-foreground flex-1"}>
                    {label}
                  </span>
                  {done ? (
                    <Badge className="bg-success text-success-foreground shrink-0">Completed</Badge>
                  ) : locked ? (
                    <Badge variant="secondary" className="shrink-0">Locked</Badge>
                  ) : (
                    <Badge variant="outline" className="shrink-0">Next</Badge>
                  )}
                </li>
              );
            })}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Upcoming sessions</CardTitle>
          <p className="text-sm text-muted-foreground">
            Meeting 1 opens before Readiness tests. Meeting 2 after test 2. Meeting 3 after Readiness is complete.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {upcomingSessions.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No sessions scheduled yet. Your mentor will share dates and join links here.
            </p>
          ) : (
            upcomingSessions.map((m) => {
              const theme = themeByNumber.get(m.meeting_number);
              const bullets = agendaBulletsFromThemeBody(theme?.theme_body ?? "");
              return (
                <div key={m.id} className="rounded-lg border p-4 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-sm">
                        Meeting {m.meeting_number}: {theme?.title ?? "Mentor session"}
                      </p>
                      {m.scheduled_at ? (
                        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatSessionWhen(m.scheduled_at)}
                        </p>
                      ) : (
                        <p className="text-xs text-muted-foreground mt-1">
                          {m.status === "locked" ? lockedReason(m) : "Awaiting schedule from your mentor"}
                        </p>
                      )}
                    </div>
                    {m.meeting_url && m.status === "available" && (
                      <Button size="sm" asChild>
                        <a href={m.meeting_url} target="_blank" rel="noopener noreferrer">
                          <Video className="h-4 w-4 mr-2" />
                          Join call
                          <ExternalLink className="h-3 w-3 ml-1 opacity-60" />
                        </a>
                      </Button>
                    )}
                  </div>
                  {bullets.length > 0 && (
                    <ul className="list-disc pl-5 space-y-1 text-xs text-muted-foreground">
                      {bullets.slice(0, 4).map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })
          )}
        </CardContent>
      </Card>
    </div>
  );
}
