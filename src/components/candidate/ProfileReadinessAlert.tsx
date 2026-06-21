import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, ArrowRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import {
  getMissingJobHuntProfileFields,
  isJobHuntProfileReady,
} from "@/lib/profileCompleteness";

type Props = {
  /** Compact one-liner for job pages */
  compact?: boolean;
};

export default function ProfileReadinessAlert({ compact = false }: Props) {
  const { profile, candidate } = useAuth();

  if (isJobHuntProfileReady(profile, candidate)) return null;

  const missing = getMissingJobHuntProfileFields(profile, candidate);
  const missingList = missing.map((m) => m.label).join(", ");

  if (compact) {
    return (
      <Card className="border-warning/40 bg-warning/5">
        <CardContent className="pt-6 text-sm space-y-2">
          <p>
            <strong>Still needed to apply:</strong> {missingList}
          </p>
          <p className="text-muted-foreground">
            Open My Profile, fill these in, then click <strong>Save Changes</strong> at the bottom.
          </p>
          <Button size="sm" variant="outline" asChild>
            <Link to="/candidate/profile">Go to My Profile</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-warning/40 bg-warning/5">
      <CardContent className="pt-6 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="flex gap-3">
          <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">Add these in My Profile, then Save Changes</p>
            <ul className="text-sm text-muted-foreground mt-2 space-y-1 list-disc pl-4">
              {missing.map((m) => (
                <li key={m.label}>{m.label}</li>
              ))}
            </ul>
          </div>
        </div>
        <Button className="gap-2 shrink-0" asChild>
          <Link to="/candidate/profile">
            Complete profile
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
