import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CheckCircle2, Loader2 } from "lucide-react";
import {
  useInPersonVisit,
  useConfirmInPersonVisit,
  useActivationCms,
  useFinalClearanceDecision,
  useActivationRecord,
  useInternshipCheckpoints,
} from "@/hooks/useActivation";
import { useMentorProgramMeetings } from "@/hooks/useMentorProgram";
import {
  allInternshipCheckpointsComplete,
  canShowInPersonVisitPanel,
} from "@/lib/activationModule";
import type { Track } from "@/lib/track";
import { useToast } from "@/hooks/use-toast";

type Props = {
  applicationId: string;
  track: Track;
  companyName: string;
  candidateProfileId: string;
  canEdit?: boolean;
};

export default function InPersonVisitPanel({
  applicationId,
  track,
  companyName,
  candidateProfileId,
  canEdit = false,
}: Props) {
  const { toast } = useToast();
  const { data: visit } = useInPersonVisit(applicationId);
  const { data: record } = useActivationRecord(applicationId);
  const { data: clearance } = useFinalClearanceDecision(applicationId);
  const { data: checkpoints = [] } = useInternshipCheckpoints(
    track === "entry" ? applicationId : undefined
  );
  const { data: meetings = [] } = useMentorProgramMeetings(applicationId);
  const { data: cms } = useActivationCms();
  const confirmVisit = useConfirmInPersonVisit();

  const meeting3Complete =
    meetings.find((m) => m.meeting_number === 3)?.status === "completed";
  const visible = canShowInPersonVisitPanel({
    track,
    activationStatus: record?.status,
    internshipComplete: allInternshipCheckpointsComplete(checkpoints),
    meeting3Complete: Boolean(meeting3Complete),
    clearanceDecided: Boolean(clearance),
  });

  const [visitChosen, setVisitChosen] = useState<string>("");
  const [visitFormat, setVisitFormat] = useState<"in_person" | "video">("in_person");
  const [visitDate, setVisitDate] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (!visit) return;
    if (visit.visit_chosen === true) setVisitChosen("yes");
    else if (visit.visit_chosen === false) setVisitChosen("no");
    if (visit.visit_format === "in_person" || visit.visit_format === "video") {
      setVisitFormat(visit.visit_format);
    }
    if (visit.visit_date) setVisitDate(visit.visit_date);
    if (visit.notes) setNotes(visit.notes);
  }, [visit]);

  if (!visible) return null;

  const confirmed = Boolean(visit?.confirmed_at);

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex flex-wrap items-center gap-2">
          <CardTitle className="text-base">In-person visit (optional)</CardTitle>
          {confirmed && (
            <Badge variant="secondary" className="gap-1">
              <CheckCircle2 className="h-3 w-3" />
              Recorded
            </Badge>
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          Company-only — candidate is notified only when you confirm a visit. Not shown to
          universities.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {confirmed && visit ? (
          <div className="text-sm space-y-1 bg-muted/40 rounded-lg p-3">
            <p>
              <span className="text-muted-foreground">Visit planned:</span>{" "}
              {visit.visit_chosen ? "Yes" : "No"}
            </p>
            {visit.visit_chosen && (
              <>
                <p>
                  <span className="text-muted-foreground">Format:</span>{" "}
                  {visit.visit_format === "video" ? "Video" : "In person"}
                </p>
                {visit.visit_date && (
                  <p>
                    <span className="text-muted-foreground">Date:</span> {visit.visit_date}
                  </p>
                )}
                {visit.notes && (
                  <p>
                    <span className="text-muted-foreground">Notes:</span> {visit.notes}
                  </p>
                )}
              </>
            )}
            {visit.candidate_notified_at && (
              <p className="text-xs text-muted-foreground pt-1">
                Candidate notified{" "}
                {new Date(visit.candidate_notified_at).toLocaleDateString()}
              </p>
            )}
          </div>
        ) : canEdit ? (
          <form
            className="space-y-4"
            onSubmit={async (e) => {
              e.preventDefault();
              if (!visitChosen) return;
              const chosen = visitChosen === "yes";
              if (chosen && !visitDate) return;
              try {
                await confirmVisit.mutateAsync({
                  applicationId,
                  candidateProfileId,
                  companyName,
                  visit_chosen: chosen,
                  visit_format: chosen ? visitFormat : "none",
                  visit_date: chosen ? visitDate : null,
                  notes: notes.trim() || null,
                  visitConfirmedTemplate: cms?.visit_confirmed ?? "",
                });
                toast({
                  title: chosen ? "Visit confirmed" : "Recorded — no visit",
                  description: chosen ? "Candidate has been notified." : undefined,
                });
              } catch (err) {
                toast({
                  title: "Could not save",
                  description: err instanceof Error ? err.message : "Try again",
                  variant: "destructive",
                });
              }
            }}
          >
            <RadioGroup value={visitChosen} onValueChange={setVisitChosen}>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="yes" id="visit-yes" />
                <Label htmlFor="visit-yes">Yes — schedule a visit</Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="no" id="visit-no" />
                <Label htmlFor="visit-no">No visit needed</Label>
              </div>
            </RadioGroup>

            {visitChosen === "yes" && (
              <div className="grid gap-3 sm:grid-cols-2 pl-1">
                <div className="space-y-1.5">
                  <Label>Format</Label>
                  <RadioGroup
                    value={visitFormat}
                    onValueChange={(v) => setVisitFormat(v as "in_person" | "video")}
                    className="flex gap-4"
                  >
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="in_person" id="fmt-ip" />
                      <Label htmlFor="fmt-ip">In person</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="video" id="fmt-video" />
                      <Label htmlFor="fmt-video">Video</Label>
                    </div>
                  </RadioGroup>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="visit-date">Date</Label>
                  <Input
                    id="visit-date"
                    type="date"
                    value={visitDate}
                    onChange={(e) => setVisitDate(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="visit-notes">Notes (optional)</Label>
                  <Textarea
                    id="visit-notes"
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Location, agenda, contact person…"
                  />
                </div>
              </div>
            )}

            <Button type="submit" size="sm" disabled={!visitChosen || confirmVisit.isPending}>
              {confirmVisit.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Confirm"
              )}
            </Button>
          </form>
        ) : (
          <p className="text-sm text-muted-foreground">Your company records visit details here.</p>
        )}
      </CardContent>
    </Card>
  );
}
