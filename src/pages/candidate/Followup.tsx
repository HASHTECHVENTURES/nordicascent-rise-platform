import FollowupTrackerPanel from "@/components/followup/FollowupTrackerPanel";
import { useMyFollowupContext } from "@/hooks/useFollowup";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export default function CandidateFollowup() {
  const { data: ctx, isLoading } = useMyFollowupContext();

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!ctx?.applicationId) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-medium">Follow-up & Support</h1>
        <Card>
          <CardContent className="py-8 text-sm text-muted-foreground text-center">
            Follow-up opens after your arrival is confirmed. Your six-month support schedule will
            appear here.
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-medium">Follow-up & Support</h1>
        <p className="text-muted-foreground">
          Six months of support after arrival — separate check-ins with you and your company.
          {ctx.companyName ? ` · ${ctx.companyName}` : ""}
        </p>
      </div>
      <FollowupTrackerPanel
        applicationId={ctx.applicationId}
        applicationStatus={ctx.applicationStatus}
        role="candidate"
        canEdit={false}
        embedded
      />
    </div>
  );
}
