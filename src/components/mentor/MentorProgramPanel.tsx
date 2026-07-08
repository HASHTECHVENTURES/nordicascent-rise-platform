import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Lock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  useMentorMeetingThemes,
  useMentorProgramMeetings,
  useMentorSignalNote,
  useMentorActivationNote,
  useSaveMentorObservation,
  useSaveMentorSignalNote,
  useSaveMentorActivationNote,
  refreshMeetingUnlocks,
} from "@/hooks/useMentorProgram";
import type { MentorMeetingObservation } from "@/lib/mentorProgram";
import { mentorMeetingCountForTrack } from "@/lib/mentorProgram";
import type { Track } from "@/lib/track";
import MentorMeetingDots from "@/components/mentor/MentorMeetingDots";

type Props = {
  applicationId: string;
  track?: Track | null;
  canEdit?: boolean;
  showObservations?: boolean;
};

function normalizeObservation(
  raw: MentorMeetingObservation[] | MentorMeetingObservation | null | undefined
) {
  if (!raw) return null;
  return Array.isArray(raw) ? raw[0] ?? null : raw;
}

export default function MentorProgramPanel({
  applicationId,
  track,
  canEdit = true,
  showObservations = true,
}: Props) {
  const { toast } = useToast();
  const { data: themes } = useMentorMeetingThemes();
  const { data: meetings, isLoading, refetch } = useMentorProgramMeetings(applicationId);
  const { data: signalNote } = useMentorSignalNote(applicationId);
  const { data: activationNote } = useMentorActivationNote(applicationId);
  const saveObservation = useSaveMentorObservation();
  const saveSignal = useSaveMentorSignalNote();
  const saveActivation = useSaveMentorActivationNote();

  const [activeMeeting, setActiveMeeting] = useState<number | null>(null);
  const [meetingDate, setMeetingDate] = useState("");
  const [duration, setDuration] = useState("60");
  const [observations, setObservations] = useState("");
  const [concerns, setConcerns] = useState("");
  const [addonTopics, setAddonTopics] = useState("");

  const [signalForm, setSignalForm] = useState({
    communication_clarity: "",
    thinking_structure: "",
    collaboration_readiness: "",
    cultural_alignment_signals: "",
    red_flag: false,
    red_flag_note: "",
  });

  const [activationForm, setActivationForm] = useState({
    behavioural_observations: "",
    communication_quality: "",
    collaboration_signals: "",
    perceived_strengths: "",
    perceived_risks: "",
  });

  useEffect(() => {
    if (!applicationId || !track) return;
    refreshMeetingUnlocks(applicationId, track).then(() => refetch());
  }, [applicationId, track, refetch]);

  useEffect(() => {
    if (!signalNote) return;
    setSignalForm({
      communication_clarity: signalNote.communication_clarity,
      thinking_structure: signalNote.thinking_structure,
      collaboration_readiness: signalNote.collaboration_readiness,
      cultural_alignment_signals: signalNote.cultural_alignment_signals,
      red_flag: signalNote.red_flag,
      red_flag_note: signalNote.red_flag_note ?? "",
    });
  }, [signalNote]);

  useEffect(() => {
    if (!activationNote) return;
    setActivationForm({
      behavioural_observations: activationNote.behavioural_observations,
      communication_quality: activationNote.communication_quality,
      collaboration_signals: activationNote.collaboration_signals,
      perceived_strengths: activationNote.perceived_strengths,
      perceived_risks: activationNote.perceived_risks,
    });
  }, [activationNote]);

  const themeByNumber = useMemo(
    () => new Map((themes ?? []).map((t) => [t.meeting_number, t])),
    [themes]
  );

  const meetingList = meetings ?? [];
  const meeting3Done = meetingList.find((m) => m.meeting_number === 3)?.status === "completed";
  const meeting6Done = meetingList.find((m) => m.meeting_number === 6)?.status === "completed";
  const totalDots = mentorMeetingCountForTrack(track);

  const openMeetingForm = (n: number) => {
    const m = meetingList.find((x) => x.meeting_number === n);
    const obs = normalizeObservation(m?.mentor_meeting_observations);
    setActiveMeeting(n);
    setMeetingDate(obs?.meeting_date ?? "");
    setDuration(String(obs?.duration_minutes ?? 60));
    setObservations(obs?.key_observations ?? "");
    setConcerns(obs?.concerns ?? "");
    setAddonTopics(obs?.addon_topics ?? "");
  };

  const submitObservation = async (meetingNumber: number) => {
    const m = meetingList.find((x) => x.meeting_number === meetingNumber);
    if (!m) return;
    if (!meetingDate || !observations.trim()) {
      toast({ title: "Date and key observations are required", variant: "destructive" });
      return;
    }
    try {
      await saveObservation.mutateAsync({
        meetingId: m.id,
        applicationId,
        track,
        meeting_number: meetingNumber,
        meeting_date: meetingDate,
        duration_minutes: Number(duration) || 60,
        key_observations: observations.trim(),
        concerns: concerns.trim() || undefined,
        addon_topics: addonTopics.trim() || undefined,
      });
      toast({ title: `Meeting ${meetingNumber} saved` });
      setActiveMeeting(null);
      await refetch();
    } catch (err) {
      toast({
        title: "Save failed",
        description: err instanceof Error ? err.message : "Try again",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!meetingList.length) {
    return (
      <Card>
        <CardContent className="pt-6 text-sm text-muted-foreground">
          Mentor meetings will appear once a mentor is assigned.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Mentor programme — {totalDots} meetings</CardTitle>
          <p className="text-sm text-muted-foreground">
            Complete meetings in order. Observation form is the same for each meeting.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <MentorMeetingDots meetings={meetingList} track={track} />
          <div className="space-y-3">
            {meetingList
              .filter((m) => m.status !== "not_applicable")
              .map((m) => {
                const theme = themeByNumber.get(m.meeting_number);
                const obs = normalizeObservation(m.mentor_meeting_observations);
                const locked = m.status === "locked";
                const done = m.status === "completed";
                return (
                  <div key={m.id} className="rounded-lg border p-4 space-y-3">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <p className="font-medium text-sm">
                          Meeting {m.meeting_number}: {theme?.title ?? `Level ${m.meeting_number}`}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">{theme?.theme_body}</p>
                      </div>
                      <Badge
                        variant={done ? "default" : locked ? "secondary" : "outline"}
                        className={done ? "bg-success text-success-foreground" : undefined}
                      >
                        {done ? "Completed" : locked ? "Locked" : "Available"}
                      </Badge>
                    </div>

                    {showObservations && done && obs && (
                      <div className="text-xs text-muted-foreground bg-muted/40 rounded p-3 space-y-1">
                        <p>
                          {obs.meeting_date} · {obs.duration_minutes} min
                        </p>
                        <p className="whitespace-pre-wrap text-foreground">{obs.key_observations}</p>
                        {obs.addon_topics && <p>Add-on topics: {obs.addon_topics}</p>}
                        {obs.concerns && <p>Concerns: {obs.concerns}</p>}
                      </div>
                    )}

                    {canEdit && !locked && (
                      <Button
                        size="sm"
                        variant={done ? "outline" : "default"}
                        onClick={() => openMeetingForm(m.meeting_number)}
                      >
                        {done ? "Edit observation" : "Complete meeting"}
                      </Button>
                    )}

                    {canEdit && locked && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Lock className="h-3 w-3" /> Complete the previous meeting first
                      </p>
                    )}

                    {activeMeeting === m.meeting_number && canEdit && (
                      <div className="border-t pt-4 space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <Label>Date</Label>
                            <Input
                              type="date"
                              value={meetingDate}
                              onChange={(e) => setMeetingDate(e.target.value)}
                            />
                          </div>
                          <div className="space-y-1">
                            <Label>Duration (minutes)</Label>
                            <Input
                              type="number"
                              min={15}
                              value={duration}
                              onChange={(e) => setDuration(e.target.value)}
                            />
                          </div>
                        </div>
                        <div className="space-y-1">
                          <Label>Key observations</Label>
                          <Textarea
                            rows={4}
                            value={observations}
                            onChange={(e) => setObservations(e.target.value)}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label>Any concerns?</Label>
                          <Textarea
                            rows={2}
                            value={concerns}
                            onChange={(e) => setConcerns(e.target.value)}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label>Add-on topics (optional)</Label>
                          <Textarea
                            rows={2}
                            value={addonTopics}
                            onChange={(e) => setAddonTopics(e.target.value)}
                            placeholder="Extra topics you covered beyond the standard session theme..."
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => submitObservation(m.meeting_number)}
                            disabled={saveObservation.isPending}
                          >
                            Save observation
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => setActiveMeeting(null)}>
                            Cancel
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        </CardContent>
      </Card>

      {(meeting3Done || signalNote) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Signal note (after Meeting 3)</CardTitle>
            <p className="text-sm text-muted-foreground">
              Visible to company decision-makers. Individual meeting observations stay internal.
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            {canEdit && meeting3Done ? (
              <>
                {(
                  [
                    ["communication_clarity", "Communication clarity"],
                    ["thinking_structure", "Thinking structure"],
                    ["collaboration_readiness", "Collaboration readiness"],
                    ["cultural_alignment_signals", "Cultural alignment signals"],
                  ] as const
                ).map(([key, label]) => (
                  <div key={key} className="space-y-1">
                    <Label>{label}</Label>
                    <Textarea
                      rows={2}
                      value={signalForm[key]}
                      onChange={(e) =>
                        setSignalForm((f) => ({ ...f, [key]: e.target.value }))
                      }
                    />
                  </div>
                ))}
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="signal-red-flag"
                    checked={signalForm.red_flag}
                    onCheckedChange={(v) =>
                      setSignalForm((f) => ({ ...f, red_flag: v === true }))
                    }
                  />
                  <Label htmlFor="signal-red-flag">Red flags?</Label>
                </div>
                {signalForm.red_flag && (
                  <Textarea
                    placeholder="Red flag details"
                    value={signalForm.red_flag_note}
                    onChange={(e) =>
                      setSignalForm((f) => ({ ...f, red_flag_note: e.target.value }))
                    }
                    rows={2}
                  />
                )}
                <Button
                  size="sm"
                  disabled={saveSignal.isPending}
                  onClick={async () => {
                    try {
                      await saveSignal.mutateAsync({
                        applicationId,
                        ...signalForm,
                      });
                      toast({ title: "Signal note saved" });
                    } catch (err) {
                      toast({
                        title: "Save failed",
                        description: err instanceof Error ? err.message : "Try again",
                        variant: "destructive",
                      });
                    }
                  }}
                >
                  Save signal note
                </Button>
              </>
            ) : signalNote ? (
              <div className="text-sm space-y-2">
                <p>{signalNote.communication_clarity}</p>
                <p>{signalNote.thinking_structure}</p>
                <p>{signalNote.collaboration_readiness}</p>
                <p>{signalNote.cultural_alignment_signals}</p>
                {signalNote.red_flag && (
                  <p className="text-destructive font-medium">
                    Red flag: {signalNote.red_flag_note}
                  </p>
                )}
              </div>
            ) : null}
          </CardContent>
        </Card>
      )}

      {track === "entry" && (meeting6Done || activationNote) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Activation note (after Meeting 6)</CardTitle>
            <p className="text-sm text-muted-foreground">Feeds into the final Go/No-Go decision.</p>
          </CardHeader>
          <CardContent className="space-y-3">
            {canEdit && meeting6Done ? (
              <>
                {(
                  [
                    ["behavioural_observations", "Behavioural observations from real work"],
                    ["communication_quality", "Communication quality in live team"],
                    ["collaboration_signals", "Collaboration signals"],
                    ["perceived_strengths", "Perceived strengths"],
                    ["perceived_risks", "Perceived risks"],
                  ] as const
                ).map(([key, label]) => (
                  <div key={key} className="space-y-1">
                    <Label>{label}</Label>
                    <Textarea
                      rows={2}
                      value={activationForm[key]}
                      onChange={(e) =>
                        setActivationForm((f) => ({ ...f, [key]: e.target.value }))
                      }
                    />
                  </div>
                ))}
                <Button
                  size="sm"
                  disabled={saveActivation.isPending}
                  onClick={async () => {
                    try {
                      await saveActivation.mutateAsync({ applicationId, ...activationForm });
                      toast({ title: "Activation note saved" });
                    } catch (err) {
                      toast({
                        title: "Save failed",
                        description: err instanceof Error ? err.message : "Try again",
                        variant: "destructive",
                      });
                    }
                  }}
                >
                  Save activation note
                </Button>
              </>
            ) : activationNote ? (
              <div className="text-sm space-y-2">
                <p>{activationNote.behavioural_observations}</p>
                <p>{activationNote.communication_quality}</p>
                <p>{activationNote.collaboration_signals}</p>
                <p>{activationNote.perceived_strengths}</p>
                <p>{activationNote.perceived_risks}</p>
              </div>
            ) : null}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
