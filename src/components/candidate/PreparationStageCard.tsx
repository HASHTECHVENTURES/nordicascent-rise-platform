import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle, Circle, GraduationCap } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import {
  PROFILE_REQUIREMENTS,
  isJobHuntProfileReady,
  isProfileFieldComplete,
} from "@/lib/profileCompleteness";
import { isUniversitySelected, isPreparationComplete } from "@/lib/candidateJourney";
import { isRegistrationDetailsComplete } from "@/lib/candidateRegistration";
import { isOnUniversityWaitlist } from "@/lib/candidateAccess";

/** Preparation = profile + university + registration details (before applying to roles). */
export default function PreparationStageCard() {
  const { profile, candidate } = useAuth();
  const profileReady = isJobHuntProfileReady(profile, candidate);
  const uniDone = isUniversitySelected(candidate);
  const regDone = isRegistrationDetailsComplete(candidate);
  const prepDone = isPreparationComplete(profile, candidate);
  const onWaitlist = isOnUniversityWaitlist(candidate);

  const profilePct = Math.round(
    (PROFILE_REQUIREMENTS.filter((req) => isProfileFieldComplete(req.key, profile, candidate)).length /
      PROFILE_REQUIREMENTS.length) *
      100
  );

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3 rounded-lg border p-4">
          <div className="flex items-start gap-3">
            {profileReady ? (
              <CheckCircle className="h-5 w-5 text-success shrink-0 mt-0.5" />
            ) : (
              <Circle className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
            )}
            <div>
              <p className="font-medium text-sm">1. Profile</p>
              <p className="text-xs text-muted-foreground mt-0.5">{profilePct}% complete</p>
            </div>
          </div>
          {!profileReady && (
            <Button size="sm" asChild>
              <Link to="/candidate/profile">Complete</Link>
            </Button>
          )}
        </div>

        <div className="flex items-center justify-between gap-3 rounded-lg border p-4">
          <div className="flex items-start gap-3">
            {uniDone ? (
              <CheckCircle className="h-5 w-5 text-success shrink-0 mt-0.5" />
            ) : (
              <GraduationCap className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
            )}
            <div>
              <p className="font-medium text-sm">2. University</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {onWaitlist
                  ? "On waitlist — admin review in progress"
                  : uniDone
                    ? "University linked"
                    : "Required before applying to roles"}
              </p>
            </div>
          </div>
          {!uniDone && !onWaitlist && profileReady && (
            <Button size="sm" asChild>
              <Link to="/candidate/university">Select</Link>
            </Button>
          )}
        </div>
      </div>

      {profileReady && uniDone && !prepDone && (
        <Button className="w-full btn-professional" asChild>
          <Link to="/candidate/registration-details">
            {regDone ? "Continue" : "Complete registration (step 3)"}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      )}

      {prepDone && (
        <Button className="w-full btn-professional" asChild>
          <Link to="/candidate/jobs">
            Browse roles
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      )}
    </div>
  );
}
