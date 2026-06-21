import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { isJobHuntProfileReady } from "@/lib/profileCompleteness";

/** Shown only until profile is complete; full path is on ApplicationJourneyCard. */
export default function ProfileCompletionBanner() {
  const { profile, candidate } = useAuth();

  if (isJobHuntProfileReady(profile, candidate)) return null;

  return (
    <Card className="border-warning/40 bg-warning/5">
      <CardContent className="pt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="font-medium">Step 1: Complete your profile</p>
          <p className="text-sm text-muted-foreground mt-1">
            Add your details, skills, and CV — then you can apply to jobs.
          </p>
        </div>
        <Button className="gap-2 shrink-0" asChild>
          <Link to="/candidate/profile">
            Go to My Profile
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
