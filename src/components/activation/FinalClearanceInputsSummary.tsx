import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { employerBoardSummary, type SelectionApplication } from "@/lib/selectionModule";
import EmployerReadinessSummary from "@/components/employer/EmployerReadinessSummary";
import MentorCompanyNotesPanel from "@/components/mentor/MentorCompanyNotesPanel";
import { InternshipEvaluationReadOnly } from "@/components/activation/InternshipEvaluationForm";
import {
  useInternshipCheckpoints,
  useInternshipEvaluation,
} from "@/hooks/useActivation";
import { useMentorProgramMeetings } from "@/hooks/useMentorProgram";
import { allInternshipCheckpointsComplete, internshipCheckpointProgress } from "@/lib/activationModule";
import type { Track } from "@/lib/track";
import { CheckCircle2, XCircle, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { openStoredDocument } from "@/lib/documentAccess";
import { useToast } from "@/hooks/use-toast";

type Props = {
  application: SelectionApplication;
  track: Track;
};

function ScoreRow({ label, value }: { label: string; value: string | number | null | undefined }) {
  if (value == null || value === "") return null;
  return (
    <p>
      <span className="text-muted-foreground">{label}:</span> {value}
    </p>
  );
}

export default function FinalClearanceInputsSummary({ application, track }: Props) {
  const { toast } = useToast();
  const applicationId = application.id;
  const isEntry = track === "entry";
  const { data: checkpoints = [] } = useInternshipCheckpoints(isEntry ? applicationId : undefined);
  const { data: evaluation } = useInternshipEvaluation(isEntry ? applicationId : undefined);
  const { data: meetings = [] } = useMentorProgramMeetings(applicationId);

  const board = employerBoardSummary(application);
  const cpProgress = internshipCheckpointProgress(checkpoints);
  const allCpDone = allInternshipCheckpointsComplete(checkpoints);
  const offeeReportPath = (application as { offee_report_path?: string | null }).offee_report_path;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Module 2 — Selection scores</CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-1">
          <ScoreRow label="Offee technical" value={application.offee_technical_score} />
          <ScoreRow label="Offee open-mindedness" value={application.offee_open_mindedness_score} />
          {offeeReportPath && (
            <div className="pt-1">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-1"
                onClick={async () => {
                  try {
                    await openStoredDocument(offeeReportPath);
                  } catch (err) {
                    toast({
                      title: "Could not open Offee report",
                      description: err instanceof Error ? err.message : "Try again",
                      variant: "destructive",
                    });
                  }
                }}
              >
                <FileText className="h-3.5 w-3.5" />
                View full Offee report
              </Button>
            </div>
          )}
          <ScoreRow label="Technical assessment" value={board.technical_score} />
          <ScoreRow label="Cognitive / communication" value={board.cognitive_score} />
          <ScoreRow label="Motivation" value={board.motivation_score} />
          {board.admin_recommendation && (
            <p>
              <span className="text-muted-foreground">Admin recommendation:</span>{" "}
              {board.admin_recommendation}
            </p>
          )}
        </CardContent>
      </Card>

      {application.candidate_id && (
        <EmployerReadinessSummary candidateId={application.candidate_id} />
      )}

      <MentorCompanyNotesPanel applicationId={applicationId} track={track} />

      {isEntry && (
        <>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Internship checkpoints</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center gap-2 text-sm">
              {allCpDone ? (
                <CheckCircle2 className="h-4 w-4 text-success" />
              ) : (
                <XCircle className="h-4 w-4 text-muted-foreground" />
              )}
              <span>
                {cpProgress.done}/{cpProgress.total} confirmed
              </span>
              {allCpDone && (
                <Badge className="bg-success text-success-foreground">All complete</Badge>
              )}
            </CardContent>
          </Card>

          {evaluation && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Company internship evaluation</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Not shared with the university or candidate.
                </p>
              </CardHeader>
              <CardContent>
                <InternshipEvaluationReadOnly evaluation={evaluation} />
              </CardContent>
            </Card>
          )}
        </>
      )}

      <Card className="border-muted">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-muted-foreground">Mentor programme status</CardTitle>
        </CardHeader>
        <CardContent className="text-sm flex flex-wrap gap-2">
          {[3, ...(isEntry ? [4, 5, 6] : [])].map((n) => {
            const m = meetings.find((x) => x.meeting_number === n);
            const done = m?.status === "completed";
            return (
              <Badge key={n} variant={done ? "default" : "secondary"}>
                M{n} {done ? "✓" : "pending"}
              </Badge>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
