import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import {
  useMentorActivationNote,
  useMentorProgramMeetings,
  useMentorSignalNote,
} from "@/hooks/useMentorProgram";
import type { Track } from "@/lib/track";

type Props = {
  applicationId: string;
  track?: Track | null;
};

/** Company decision-maker view — Signal note (M3) and Activation note (M6) only. No meeting observations. */
export default function MentorCompanyNotesPanel({ applicationId, track }: Props) {
  const { data: meetings, isLoading: meetingsLoading } = useMentorProgramMeetings(applicationId);
  const { data: signalNote, isLoading: signalLoading } = useMentorSignalNote(applicationId);
  const { data: activationNote, isLoading: activationLoading } = useMentorActivationNote(applicationId);

  const meetingList = meetings ?? [];
  const meeting3Done = meetingList.find((m) => m.meeting_number === 3)?.status === "completed";
  const meeting6Done = meetingList.find((m) => m.meeting_number === 6)?.status === "completed";

  if (meetingsLoading || signalLoading || activationLoading) {
    return (
      <div className="flex justify-center py-6">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
      </div>
    );
  }

  if (!meeting3Done && !signalNote && !(track === "entry" && (meeting6Done || activationNote))) {
    return null;
  }

  return (
    <div className="space-y-4">
      {(meeting3Done || signalNote) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Signal note (after Meeting 3)</CardTitle>
            <p className="text-sm text-muted-foreground">
              Summary for company decision-makers. Individual meeting observations are not shown here.
            </p>
          </CardHeader>
          <CardContent className="text-sm space-y-2">
            {signalNote ? (
              <>
                <p><span className="text-muted-foreground">Communication clarity:</span> {signalNote.communication_clarity}</p>
                <p><span className="text-muted-foreground">Thinking structure:</span> {signalNote.thinking_structure}</p>
                <p><span className="text-muted-foreground">Collaboration readiness:</span> {signalNote.collaboration_readiness}</p>
                <p><span className="text-muted-foreground">Cultural alignment:</span> {signalNote.cultural_alignment_signals}</p>
                {signalNote.red_flag && (
                  <p className="text-destructive font-medium">Red flag: {signalNote.red_flag_note}</p>
                )}
              </>
            ) : (
              <p className="text-muted-foreground">Pending — mentor completes this after Meeting 3.</p>
            )}
          </CardContent>
        </Card>
      )}

      {track === "entry" && (meeting6Done || activationNote) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Activation note (after Meeting 6)</CardTitle>
            <p className="text-sm text-muted-foreground">Feeds into the final Go/No-Go decision.</p>
          </CardHeader>
          <CardContent className="text-sm space-y-2">
            {activationNote ? (
              <>
                <p><span className="text-muted-foreground">Behavioural observations:</span> {activationNote.behavioural_observations}</p>
                <p><span className="text-muted-foreground">Communication quality:</span> {activationNote.communication_quality}</p>
                <p><span className="text-muted-foreground">Collaboration signals:</span> {activationNote.collaboration_signals}</p>
                <p><span className="text-muted-foreground">Perceived strengths:</span> {activationNote.perceived_strengths}</p>
                <p><span className="text-muted-foreground">Perceived risks:</span> {activationNote.perceived_risks}</p>
              </>
            ) : (
              <p className="text-muted-foreground">Pending — mentor completes this after Meeting 6.</p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
