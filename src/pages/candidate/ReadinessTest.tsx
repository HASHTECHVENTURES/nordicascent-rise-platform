import { useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
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
} from "@/hooks/useReadiness";

export default function CandidateReadinessTest() {
  const { testId } = useParams();
  const navigate = useNavigate();
  const { profile, candidate } = useAuth();
  const ready = canAccessReadiness(profile, candidate);
  const { data: tests, isLoading: testsLoading } = useReadinessTests();
  const { data: attempts, isLoading: attemptsLoading, refetch } = useMyReadinessAttempts();
  const startAttempt = useStartReadinessAttempt();

  const test = tests?.find((t) => t.id === testId);
  const attempt = attempts?.find((a) => a.test_id === testId);

  useEffect(() => {
    if (!test || attempt || startAttempt.isPending) return;
    startAttempt.mutate(test, { onSuccess: () => refetch() });
  }, [test, attempt, startAttempt, refetch]);

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

  if (testsLoading || attemptsLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
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
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
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
