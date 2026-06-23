import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Info } from "lucide-react";
import ReadinessTestRunner from "@/components/readiness/ReadinessTestRunner";
import { useAuth } from "@/contexts/AuthContext";
import { canAccessReadiness } from "@/lib/candidateJourney";
import {
  useReadinessTests,
  useMyReadinessAttempts,
  useStartReadinessAttempt,
  type ReadinessAttempt,
} from "@/hooks/useReadiness";

type TestLocationState = {
  attempt?: ReadinessAttempt;
};

export default function CandidateReadinessTest() {
  const { testId } = useParams();
  const location = useLocation();
  const routeAttempt = (location.state as TestLocationState | null)?.attempt;
  const { profile, candidate, loading: authLoading } = useAuth();
  const ready = canAccessReadiness(profile, candidate);
  const {
    data: tests,
    isLoading: testsLoading,
    isError: testsError,
    error: testsQueryError,
  } = useReadinessTests();
  const {
    data: attempts,
    isLoading: attemptsLoading,
    isFetching: attemptsFetching,
    isError: attemptsError,
    error: attemptsQueryError,
    refetch: refetchAttempts,
  } = useMyReadinessAttempts();
  const startAttempt = useStartReadinessAttempt();
  const [startError, setStartError] = useState<string | null>(null);
  const startRequestedRef = useRef<string | null>(null);

  const test = tests?.find((t) => t.id === testId);
  const attempt =
    attempts?.find((a) => a.test_id === testId) ??
    (routeAttempt?.test_id === testId ? routeAttempt : undefined);

  useEffect(() => {
    if (authLoading || !candidate?.id || !test || attempt || startAttempt.isPending) return;
    if (startRequestedRef.current === test.id) return;

    startRequestedRef.current = test.id;
    setStartError(null);

    startAttempt
      .mutateAsync(test)
      .catch((err) => {
        startRequestedRef.current = null;
        setStartError(err instanceof Error ? err.message : "Could not start this test.");
      });
  }, [authLoading, candidate?.id, test, attempt, startAttempt]);

  if (!ready) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/candidate/readiness">Back to Readiness</Link>
        </Button>
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="pt-6 flex items-start gap-3">
            <Info className="h-5 w-5 text-primary mt-0.5 shrink-0" />
            <p className="text-sm text-muted-foreground">
              Complete your profile and select your university before starting tests.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (authLoading || testsLoading || (attemptsLoading && !attempts)) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (testsError || attemptsError) {
    return (
      <div className="space-y-4 max-w-lg">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/candidate/readiness">Back to Readiness</Link>
        </Button>
        <Card className="border-destructive/40 bg-destructive/5">
          <CardContent className="pt-6 space-y-3">
            <p className="font-medium">Could not load this test</p>
            <p className="text-sm text-muted-foreground">
              {(testsQueryError ?? attemptsQueryError) instanceof Error
                ? (testsQueryError ?? attemptsQueryError)?.message
                : "Please refresh and try again."}
            </p>
            <Button size="sm" onClick={() => refetchAttempts()}>
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!test) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/candidate/readiness">Back to Readiness</Link>
        </Button>
        <p className="text-muted-foreground">Test not found.</p>
      </div>
    );
  }

  if (!attempt) {
    return (
      <div className="space-y-4 max-w-lg">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/candidate/readiness">Back to Readiness</Link>
        </Button>
        {startError ? (
          <Card className="border-destructive/40 bg-destructive/5">
            <CardContent className="pt-6 space-y-3">
              <p className="font-medium">Could not open this test</p>
              <p className="text-sm text-muted-foreground">{startError}</p>
              <Button
                size="sm"
                onClick={() => {
                  startRequestedRef.current = null;
                  setStartError(null);
                  startAttempt.mutate(test);
                }}
              >
                Try again
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}
        {attemptsFetching && !startError && (
          <p className="text-xs text-center text-muted-foreground">Loading your test session…</p>
        )}
      </div>
    );
  }

  if (attempt.status === "submitted" || attempt.status === "expired") {
    return (
      <div className="space-y-4 max-w-lg">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/candidate/readiness">Back to Readiness</Link>
        </Button>
        <p className="font-medium">This test has already been submitted.</p>
        <p className="text-sm text-muted-foreground">
          Your answers are under review. Continue with other levels if available.
        </p>
      </div>
    );
  }

  return <ReadinessTestRunner test={test} attempt={attempt} />;
}
