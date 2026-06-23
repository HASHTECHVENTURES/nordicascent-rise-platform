import { Link, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import ReadinessModuleHub from "@/components/readiness/ReadinessModuleHub";
import { canAccessReadiness } from "@/lib/candidateJourney";
import { useMyReadinessAttempts, useReadinessTests } from "@/hooks/useReadiness";
import { allTestsSubmitted } from "@/lib/readiness";

export default function CandidateReadiness() {
  const navigate = useNavigate();
  const { profile, candidate } = useAuth();
  const ready = canAccessReadiness(profile, candidate);
  const { data: tests } = useReadinessTests();
  const { data: attempts } = useMyReadinessAttempts();

  const submitted = tests && attempts ? allTestsSubmitted(tests, attempts) : false;

  useEffect(() => {
    if (!ready || !submitted) return;
    if (candidate?.jobs_unlocked) {
      navigate("/candidate/jobs", { replace: true });
      return;
    }
    navigate("/candidate/mentoring", { replace: true });
  }, [ready, submitted, candidate?.jobs_unlocked, navigate]);

  if (ready && submitted) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!ready) {
    return (
      <div className="space-y-6 max-w-lg">
        <h1 className="text-2xl font-medium">Readiness</h1>
        <Card>
          <CardContent className="pt-6 space-y-3">
            <p className="text-sm text-muted-foreground">Complete your profile and university first.</p>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" asChild>
                <Link to="/candidate/profile">Profile</Link>
              </Button>
              <Button size="sm" variant="outline" asChild>
                <Link to="/candidate/university">University</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-medium">Readiness</h1>
      <ReadinessModuleHub hideHeader />
    </div>
  );
}
