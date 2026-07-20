import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { useFollowupCms, useUpsertMeetingLog } from "@/hooks/useFollowup";
import {
  topicsFromCms,
  meetingStateLabel,
  type FollowupMeetingLog,
  type MeetingParty,
  type MeetingState,
} from "@/lib/followupModule";
import { useToast } from "@/hooks/use-toast";

type Props = {
  log: FollowupMeetingLog;
  applicationId: string;
  monthNumber: number;
  party: MeetingParty;
  canEdit: boolean;
};

export default function MeetingLogForm({
  log,
  applicationId,
  monthNumber,
  party,
  canEdit,
}: Props) {
  const { toast } = useToast();
  const upsert = useUpsertMeetingLog();
  const { data: cms } = useFollowupCms();
  const topicsMap = topicsFromCms(cms?.topics);
  const topics = topicsMap[monthNumber as 1 | 2 | 3 | 6];
  const standing = party === "candidate" ? topics?.candidate : topics?.company;
  const confidential = party === "candidate" ? topics?.confidential : undefined;

  const [state, setState] = useState<MeetingState>(log.state);
  const [meetingDate, setMeetingDate] = useState(log.meeting_date ?? "");
  const [notes, setNotes] = useState(log.notes ?? "");
  const [confidentialNotes, setConfidentialNotes] = useState(log.confidential_notes ?? "");
  const [actions, setActions] = useState(log.follow_up_actions ?? "");
  const [atRisk, setAtRisk] = useState(false);

  const logged = Boolean(log.logged_at);
  const partyLabel = party === "candidate" ? "Candidate meeting" : "Company meeting";
  const accent =
    party === "candidate" ? "border-sky-200 bg-sky-50/50" : "border-emerald-200 bg-emerald-50/50";

  return (
    <div className={`rounded-lg border p-4 space-y-3 ${accent}`}>
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-medium">{partyLabel}</p>
        {logged && (
          <span className="text-xs text-muted-foreground">
            Logged · {meetingStateLabel(log.state)}
            {log.meeting_date ? ` · ${log.meeting_date}` : ""}
          </span>
        )}
      </div>

      {standing && standing.length > 0 && (
        <ul className="text-xs text-muted-foreground list-disc pl-4 space-y-0.5">
          {standing.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
      )}

      {canEdit && (
        <div className="space-y-3 border-t pt-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>State</Label>
              <Select value={state} onValueChange={(v) => setState(v as MeetingState)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="on_track">On track</SelectItem>
                  <SelectItem value="watch">Watch</SelectItem>
                  <SelectItem value="flag">Flag</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Meeting date</Label>
              <Input
                type="date"
                value={meetingDate}
                onChange={(e) => setMeetingDate(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Notes (internal)</Label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} />
          </div>
          {confidential && (
            <div className="space-y-1.5">
              <Label>Confidential — {confidential}</Label>
              <Textarea
                value={confidentialNotes}
                onChange={(e) => setConfidentialNotes(e.target.value)}
                rows={2}
                placeholder="Internal only — never shared with company"
              />
              {monthNumber === 6 && (
                <label className="flex items-center gap-2 text-xs text-destructive">
                  <input
                    type="checkbox"
                    checked={atRisk}
                    onChange={(e) => setAtRisk(e.target.checked)}
                  />
                  Set AT_RISK_RETENTION (placement may not hold)
                </label>
              )}
            </div>
          )}
          <div className="space-y-1.5">
            <Label>Follow-up actions</Label>
            <Textarea value={actions} onChange={(e) => setActions(e.target.value)} rows={2} />
          </div>
          <Button
            size="sm"
            disabled={upsert.isPending}
            onClick={async () => {
              try {
                await upsert.mutateAsync({
                  logId: log.id,
                  applicationId,
                  state,
                  meeting_date: meetingDate || null,
                  notes,
                  confidential_notes: confidentialNotes,
                  follow_up_actions: actions,
                  setAtRiskRetention: atRisk,
                });
                toast({ title: `${partyLabel} logged` });
              } catch (err) {
                toast({
                  title: "Could not save meeting",
                  description: err instanceof Error ? err.message : "Try again",
                  variant: "destructive",
                });
              }
            }}
          >
            {upsert.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save meeting log"}
          </Button>
        </div>
      )}

      {!canEdit && logged && log.notes && (
        <p className="text-sm whitespace-pre-wrap">{log.notes}</p>
      )}
    </div>
  );
}
