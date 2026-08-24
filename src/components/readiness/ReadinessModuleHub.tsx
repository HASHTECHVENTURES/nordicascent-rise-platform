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
  Video,
  ExternalLink,
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
} from "@/hooks/useMentorProgram";
import {
  meetingJoinLabel,
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
}: {
  meetingNumber: 1 | 2 | 3;
  meeting: MentorProgramMeeting | undefined;
}) {
  const status = meeting?.status ?? "locked";
  const done = status === "completed";
  const available = status === "available";

  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between gap-3 rounded-lg border p-4",
        done && "border-emerald-500/40 bg-emerald-50",
        !done && "border-[#CED4DA] bg-[#EBEDEF]"
      )}
    >
      <div className="space-y-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <div
            className={cn(
              "flex h-8 w-8 shrink-0 items-center justify-center rounded-md",
              done ? "bg-emerald-500/15 text-emerald-700" : "bg-[#102A4C]/10 text-[#102A4C]"
            )}
          >
            <CalendarCheck className="h-4 w-4" />
          </div>
          <p className="font-medium text-sm text-[#102A4C]">Mentor Meeting {meetingNumber}</p>
          {done ? (
            <Badge className="bg-emerald-600 text-white hover:bg-emerald-600 gap-1">
              <CheckCircle2 className="h-3 w-3" />
              Completed
            </Badge>
          ) : available ? (
            <Badge className="bg-[#102A4C] text-white hover:bg-[#102A4C] text-xs">
              Your next step
            </Badge>
          ) : (
            <Badge variant="outline" className="text-xs border-[#CED4DA] text-[#102A4C]">
              Locked
            </Badge>
          )}
        </div>
        {available && meeting?.scheduled_at && (
          <p className="text-xs text-[#102A4C]/75">
            Scheduled {new Date(meeting.scheduled_at).toLocaleString()}
          </p>
        )}
      </div>
      <div className="flex flex-wrap gap-2 justify-end">
        {done ? (
          <Button size="sm" variant="outline" className="border-emerald-500/40" asChild>
            <Link to={`/candidate/mentoring?meeting=${meetingNumber}`}>View Mentoring</Link>
          </Button>
        ) : available && meeting?.meeting_url ? (
          <>
            <Button
              size="sm"
              className="gap-1 bg-[#102A4C] hover:bg-[#102A4C]/90 text-white"
              asChild
            >
              <a href={meeting.meeting_url} target="_blank" rel="noopener noreferrer">
                <Video className="h-4 w-4" />
                {meetingJoinLabel(meeting.meeting_url)}
                <ExternalLink className="h-3 w-3 opacity-70" />
              </a>
            </Button>
            <Button size="sm" variant="outline" className="border-[#CED4DA] text-[#102A4C]" asChild>
              <Link to={`/candidate/mentoring?meeting=${meetingNumber}`}>Details</Link>
            </Button>
          </>
        ) : available ? (
          <Button
            size="sm"
            className="gap-1 bg-[#102A4C] hover:bg-[#102A4C]/90 text-white"
            asChild
          >
            <Link to={`/candidate/mentoring?meeting=${meetingNumber}`}>
              Open Mentoring
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        ) : (
          <Button size="sm" variant="outline" disabled className="gap-1 border-[#CED4DA] text-[#102A4C]/60">
            <Lock className="h-4 w-4" />
            Locked
          </Button>
        )}
      </div>
    </div>
  );
}

export default function ReadinessModuleHub({ compact = false, hideHeader = false }: Props) {
  const { data: tests, isLoading, isError, error } = useReadinessTests();
  const { data: attempts } = useMyReadinessAttempts();
  const { meetings, meetingsLoading } = useMyMentorProgramContext();

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

  const meetingList = meetings ?? [];

  const getAttemptStatus = (testId: string) => {
    const a = attempts?.find((x) => x.test_id === testId);
    if (!a) return "not_started";
    return a.status;
  };

  const renderMeeting = (meetingNumber: 1 | 2 | 3) => {
    const meeting = meetingList.find((m) => m.meeting_number === meetingNumber);
    return (
      <MeetingStepRow
        key={`meeting-${meetingNumber}`}
        meetingNumber={meetingNumber}
        meeting={meeting}
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
                Level 1 and 2
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
