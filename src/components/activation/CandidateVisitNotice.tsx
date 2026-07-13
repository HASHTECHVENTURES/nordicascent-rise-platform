import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useInPersonVisit } from "@/hooks/useActivation";
import { Calendar } from "lucide-react";

type Props = {
  applicationId: string;
};

/** Candidate sees visit details only after company confirms and notification is sent. */
export default function CandidateVisitNotice({ applicationId }: Props) {
  const { data: visit } = useInPersonVisit(applicationId);

  if (!visit?.candidate_notified_at || !visit.visit_chosen) return null;

  return (
    <Card className="border-primary/20">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          Visit confirmed
        </CardTitle>
      </CardHeader>
      <CardContent className="text-sm space-y-1">
        <p>
          Format: {visit.visit_format === "video" ? "Video call" : "In person"}
        </p>
        {visit.visit_date && <p>Date: {visit.visit_date}</p>}
        {visit.notes && <p className="text-muted-foreground">{visit.notes}</p>}
      </CardContent>
    </Card>
  );
}
