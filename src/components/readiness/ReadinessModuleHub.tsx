import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  Loader2,
  Lock,
  PlayCircle,
  AlertCircle,
  CalendarCheck,
  CheckCircle2,
} from "lucide-react";
import { useReadinessTests, useMyReadinessAttempts } from "@/hooks/useReadiness";
import {
  isLevelUnlocked,
  readinessLevelLockReason,
  getAttemptExpiresAtMs,
  hasStrictTimer,
  getReadinessLevelSubtitle,
} from "@/lib/readiness";
import ReadinessCountdown from "@/components/readiness/ReadinessCountdown";
import {
  READINESS_AREA_LABELS,
  READINESS_LEVEL_LABELS,
} from "@/data/readinessModuleSeed";
import {
  useMyMentorProgramContext,
  useReadinessMentorGateForApplication,
} from "@/hooks/useMentorProgram";
import {
  EMPTY_READINESS_MENTOR_GATE,
  getMeetingLockedReason,
  mentorMeetingTitle,
  type MentorProgramMeeting,
} from "@/lib/mentorProgram";
import { cn } from "@/lib/utils";

type Props = {
  compact?: boolean;
  hideHeader?: boolean;
};

const AREAS = ["cultural_social", "technical"] as const;

function MeetingStepRow({
  meetingNumber,
  meeting,
  lockedReason,
  unlocksLabel,
}: {
  meetingNumber: 1 | 2 | 3;
  meeting: MentorProgramMeeting | undefined;
  lockedReason: string | null;
  unlocksLabel: string;
}) {
  const status = meeting?.status ?? "locked";
  const done = status === "completed";
  const available = status === "available";
  const title = mentorMeetingTitle(meetingNumber);

  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between gap-3 rounded-lg border p-4",
        available && !done && "border-primary/40 bg-primary/5",
        done && "border-success/30 bg-success/5"
      )}
    >
      <div className="space-y-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <CalendarCheck className="h-4 w-4 text-primary shrink-0" />
          <p className="font-medium text-sm">Mentor Meeting {meetingNumber}</p>
          {done ? (
            <Badge className="bg-success text-success-foreground gap-1">
              <CheckCircle2 className="h-3 w-3" />
              Completed
            </Badge>
          ) : available ? (
            <Badge variant="outline" className="text-xs border-primary text-primary">
              Your next step
            </Badge>
          ) : (
            <Badge variant="secondary" className="text-xs">
              Locked
            </Badge>
          )}
        </div>
        <p className="text-xs text-muted-foreground">{title}</p>
        <p className="text-xs text-muted-foreground">
          {done
            ? `Done — unlocked ${unlocksLabel}.`
            : available
              ? `Attend with your mentor. When they mark it complete, ${unlocksLabel} unlock.`
              : lockedReason ?? "Complete the previous step first."}
        </p>
      </div>
      <div>
        {done ? (
          <Button size="sm" variant="outline" asChild>
            <Link to="/candidate/mentoring">View Mentoring</Link>
          </Button>
        ) : available ? (
          <Button size="sm" className="gap-1" asChild>
            <Link to="/candidate/mentoring">
              Open Mentoring
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        ) : (
          <Button size="sm" variant="outline" disabled className="gap-1">
            <Lock className="h-4 w-4" />
            Locked
          </Button>
        )}
      </div>
    </div>
  );
}

function unlocksForMeeting(n: 1 | 2 | 3) {
  if (n === 1) return "Level 1";
  if (n === 2) return "Level 3";
  return "closing Readiness mentoring";
}

export default function ReadinessModuleHub({ compact = false, hideHeader = false }: Props) {
  const { data: tests, isLoading, isError, error } = useReadinessTests();
  const { data: attempts } = useMyReadinessAttempts();
  const { meetings, meetingsLoading, applicationId } = useMyMentorProgramContext();
  const { data: gate } = useReadinessMentorGateForApplication(applicationId);

  if (isLoading || meetingsLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isError) {
    return (
      <Card className="border-destructive/40 bg-destructive/5">
        <CardContent className="pt-6 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
          <div className="text-sm space-y-2">
            <p className="font-medium">Readiness not available</p>
            <p className="text-muted-foreground text-sm">Contact your admin to initialize tests.</p>
            {error instanceof Error && (
              <p className="text-xs text-muted-foreground">{error.message}</p>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!tests?.length) {
    return (
      <Card className="border-amber-200 bg-amber-50/50 dark:border-amber-900 dark:bg-amber-950/20">
        <CardContent className="pt-6 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-sm space-y-2">
            <p className="font-medium">Tests not loaded</p>
            <p className="text-muted-foreground text-sm">
              Ask your admin to initialize Readiness, then refresh.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const readinessGate = gate ?? EMPTY_READINESS_MENTOR_GATE;
  const meetingList = meetings ?? [];

  const getAttemptStatus = (testId: string) => {
    const a = attempts?.find((x) => x.test_id === testId);
    if (!a) return "not_started";
    return a.status;
  };

  const renderMeeting = (meetingNumber: 1 | 2 | 3) => {
    const meeting = meetingList.find((m) => m.meeting_number === meetingNumber);
    const lockedReason =
      meeting?.status === "locked"
        ? getMeetingLockedReason(meetingNumber, meetingList, readinessGate, false)
        : null;
    return (
      <MeetingStepRow
        key={`meeting-${meetingNumber}`}
        meetingNumber={meetingNumber}
        meeting={meeting}
        lockedReason={lockedReason}
        unlocksLabel={unlocksForMeeting(meetingNumber)}
      />
    );
  };

  const renderTest = (test: (typeof tests)[number]) => {
    const status = getAttemptStatus(test.id);
    const attempt = attempts?.find((a) => a.test_id === test.id);
    const unlocked = isLevelUnlocked(
      test.level,
      test.area,
      attempts ?? [],
      tests,
      meetingList
    );
    const lockReason = unlocked
      ? null
      : readinessLevelLockReason(
          test.level,
          test.area,
          attempts ?? [],
          tests,
          meetingList
        );
    const done = status === "submitted" || status === "expired";
    const inProgress = status === "in_progress";
    const strictTimer = hasStrictTimer(test);

    return (
      <div
        key={test.id}
        className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-4"
      >
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-medium text-sm">{READINESS_LEVEL_LABELS[test.level]}</p>
            {strictTimer ? (
              <Badge variant="outline" className="text-xs">
                60 min fixed limit
              </Badge>
            ) : (
              <Badge variant="secondary" className="text-xs">
                No time limit
              </Badge>
            )}
            {done && <Badge className="bg-success text-success-foreground">Submitted</Badge>}
            {inProgress && (
              <Badge className="bg-primary text-primary-foreground">In progress</Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            {getReadinessLevelSubtitle(test.level, test.subtitle)}
          </p>
          {inProgress && attempt && strictTimer && (
            <div className="pt-2">
              <ReadinessCountdown
                expiresAtMs={getAttemptExpiresAtMs(attempt, test.timer_minutes, strictTimer)}
                hard
                size="sm"
              />
            </div>
          )}
        </div>
        <div>
          {!unlocked && !inProgress && !done ? (
            <Button size="sm" variant="outline" disabled className="gap-1">
              <Lock className="h-4 w-4" />
              {lockReason ?? "Locked"}
            </Button>
          ) : done ? (
            <Button size="sm" variant="outline" disabled>
              Submitted
            </Button>
          ) : inProgress ? (
            <Button size="sm" asChild>
              <Link
                to={`/candidate/readiness/test/${test.id}`}
                state={attempt ? { attempt } : undefined}
              >
                Continue <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          ) : (
            <Button size="sm" className="gap-1" asChild>
              <Link to={`/candidate/readiness/test/${test.id}`}>
                <PlayCircle className="h-4 w-4" />
                Begin test
              </Link>
            </Button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {!compact && !hideHeader && (
        <div>
          <h2 className="text-xl font-medium">Readiness</h2>
        </div>
      )}

      {AREAS.map((area) => {
        const areaTests = tests
          .filter((t) => t.area === area)
          .sort((a, b) => a.level - b.level);
        const byLevel = (level: number) => areaTests.find((t) => t.level === level);

        return (
          <Card key={area}>
            <CardHeader className={compact ? "pb-2" : undefined}>
              <CardTitle className={compact ? "text-base" : "text-lg"}>
                {READINESS_AREA_LABELS[area]}
              </CardTitle>
              {!compact && (
                <p className="text-sm text-muted-foreground">
                  Meeting 1 → Level 1 → Level 2 → Meeting 2 → Level 3 → Meeting 3
                </p>
              )}
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Meeting 1 above Level 1 */}
              {renderMeeting(1)}
              {byLevel(1) && renderTest(byLevel(1)!)}
              {byLevel(2) && renderTest(byLevel(2)!)}
              {/* Meeting 2 above Level 3 */}
              {renderMeeting(2)}
              {byLevel(3) && renderTest(byLevel(3)!)}
              {/* Meeting 3 after Level 3 */}
              {renderMeeting(3)}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
