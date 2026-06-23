import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Loader2, Lock, PlayCircle, AlertCircle } from "lucide-react";
import {
  useReadinessTests,
  useMyReadinessAttempts,
  useStartReadinessAttempt,
} from "@/hooks/useReadiness";
import { isLevelUnlocked, getAttemptExpiresAtMs } from "@/lib/readiness";
import ReadinessCountdown from "@/components/readiness/ReadinessCountdown";
import {
  READINESS_AREA_LABELS,
  READINESS_LEVEL_LABELS,
} from "@/data/readinessModuleSeed";

type Props = {
  compact?: boolean;
  hideHeader?: boolean;
};

export default function ReadinessModuleHub({ compact = false, hideHeader = false }: Props) {
  const navigate = useNavigate();
  const { data: tests, isLoading, isError, error } = useReadinessTests();
  const { data: attempts } = useMyReadinessAttempts();
  const startAttempt = useStartReadinessAttempt();

  if (isLoading) {
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
            <p className="text-muted-foreground text-sm">Ask your admin to initialize Readiness, then refresh.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const areas = ["cultural_social", "technical"] as const;

  const getAttemptStatus = (testId: string) => {
    const a = attempts?.find((x) => x.test_id === testId);
    if (!a) return "not_started";
    return a.status;
  };

  return (
    <div className="space-y-6">
      {!compact && !hideHeader && (
        <div>
          <h2 className="text-xl font-medium">Readiness</h2>
        </div>
      )}

      {areas.map((area) => {
        const areaTests = (tests ?? []).filter((t) => t.area === area).sort((a, b) => a.level - b.level);
        return (
          <Card key={area}>
            <CardHeader className={compact ? "pb-2" : undefined}>
              <CardTitle className={compact ? "text-base" : "text-lg"}>
                {READINESS_AREA_LABELS[area]}
              </CardTitle>
              {!compact && (
                <p className="text-sm text-muted-foreground">Levels 1–3</p>
              )}
            </CardHeader>
            <CardContent className="space-y-3">
              {areaTests.map((test) => {
                const status = getAttemptStatus(test.id);
                const attempt = attempts?.find((a) => a.test_id === test.id);
                const unlocked = isLevelUnlocked(test.level, area, attempts ?? [], tests ?? []);
                const done = status === "submitted" || status === "expired";
                const inProgress = status === "in_progress";

                return (
                  <div
                    key={test.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium text-sm">{READINESS_LEVEL_LABELS[test.level]}</p>
                        <Badge variant="outline" className="text-xs">{test.timer_minutes} min limit</Badge>
                        {done && <Badge className="bg-success text-success-foreground">Submitted</Badge>}
                        {inProgress && <Badge className="bg-primary text-primary-foreground">In progress</Badge>}
                      </div>
                      <p className="text-xs text-muted-foreground">{test.subtitle}</p>
                      {inProgress && attempt && (
                        <div className="pt-2">
                          <ReadinessCountdown
                            expiresAtMs={getAttemptExpiresAtMs(attempt, test.timer_minutes)}
                            hard
                            size="sm"
                          />
                        </div>
                      )}
                    </div>
                    <div>
                      {!unlocked ? (
                        <Button size="sm" variant="outline" disabled className="gap-1">
                          <Lock className="h-4 w-4" />
                          Level {test.level - 1} first
                        </Button>
                      ) : done ? (
                        <Button size="sm" variant="outline" disabled>Submitted</Button>
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
                        <Button
                          size="sm"
                          disabled={startAttempt.isPending}
                          className="gap-1"
                          onClick={async () => {
                            const started = await startAttempt.mutateAsync(test);
                            navigate(`/candidate/readiness/test/${test.id}`, {
                              state: { attempt: started },
                            });
                          }}
                        >
                          <PlayCircle className="h-4 w-4" />
                          Begin test
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
