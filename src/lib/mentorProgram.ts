import { supabase } from "@/lib/supabase";
import type { Track } from "@/lib/track";

export type MentorMeetingStatus = "locked" | "available" | "completed" | "not_applicable";
export type MentorMeetingPhase = "readiness" | "activation";

export type MentorMeetingTheme = {
  meeting_number: number;
  phase: MentorMeetingPhase;
  title: string;
  theme_body: string;
  sort_order: number;
};

export type MentorProgramMeeting = {
  id: string;
  application_id: string;
  meeting_number: number;
  phase: MentorMeetingPhase;
  status: MentorMeetingStatus;
  completed_at: string | null;
  created_at?: string;
  updated_at?: string;
};

export type MentorMeetingObservation = {
  id: string;
  meeting_id: string;
  meeting_date: string;
  duration_minutes: number;
  key_observations: string;
  concerns: string | null;
  addon_topics: string | null;
  submitted_at: string;
};

export type MentorSignalNote = {
  id: string;
  application_id: string;
  communication_clarity: string;
  thinking_structure: string;
  collaboration_readiness: string;
  cultural_alignment_signals: string;
  red_flag: boolean;
  red_flag_note: string | null;
  submitted_at: string;
};

export type MentorActivationNote = {
  id: string;
  application_id: string;
  behavioural_observations: string;
  communication_quality: string;
  collaboration_signals: string;
  perceived_strengths: string;
  perceived_risks: string;
  submitted_at: string;
};

export const MENTOR_MEETING_COUNT_ENTRY = 6;
export const MENTOR_MEETING_COUNT_FAST = 3;

export function mentorMeetingCountForTrack(track: Track | null | undefined) {
  return track === "fast" ? MENTOR_MEETING_COUNT_FAST : MENTOR_MEETING_COUNT_ENTRY;
}

export async function initializeMentorMeetings(
  applicationId: string,
  track: Track | null | undefined
) {
  const max = MENTOR_MEETING_COUNT_ENTRY;
  const rows = [];
  for (let n = 1; n <= max; n++) {
    const phase: MentorMeetingPhase = n <= 3 ? "readiness" : "activation";
    let status: MentorMeetingStatus = n === 1 ? "available" : "locked";
    if (n > 3 && track === "fast") status = "not_applicable";
    rows.push({
      application_id: applicationId,
      meeting_number: n,
      phase,
      status,
    });
  }

  const { error } = await supabase.from("mentor_program_meetings").upsert(rows, {
    onConflict: "application_id,meeting_number",
    ignoreDuplicates: true,
  });
  if (error) throw error;
}

export function countReadinessAreasSubmitted(
  attempts: { status: string; readiness_tests?: { area: string } | null }[]
) {
  const areas = new Set<string>();
  for (const a of attempts) {
    if (a.status !== "submitted" && a.status !== "expired") continue;
    const area = (a.readiness_tests as { area?: string } | null)?.area;
    if (area) areas.add(area);
  }
  return areas.size;
}

export function computeNextMeetingUnlocks(
  meetings: MentorProgramMeeting[],
  track: Track | null | undefined,
  readinessAreasSubmitted: number
): { id: string; status: MentorMeetingStatus }[] {
  const byNum = new Map(meetings.map((m) => [m.meeting_number, m]));
  const updates: { id: string; status: MentorMeetingStatus }[] = [];

  const isCompleted = (n: number) => byNum.get(n)?.status === "completed";

  for (const m of meetings) {
    if (m.status === "completed" || m.status === "not_applicable") continue;

    let shouldBeAvailable = false;
    if (m.meeting_number === 1) {
      shouldBeAvailable = true;
    } else if (m.meeting_number === 2) {
      shouldBeAvailable = isCompleted(1) && readinessAreasSubmitted >= 1;
    } else if (m.meeting_number === 3) {
      shouldBeAvailable = isCompleted(2);
    } else if (m.meeting_number === 4) {
      shouldBeAvailable = track === "entry" && isCompleted(3);
    } else if (m.meeting_number === 5) {
      shouldBeAvailable = track === "entry" && isCompleted(4);
    } else if (m.meeting_number === 6) {
      shouldBeAvailable = track === "entry" && isCompleted(5);
    }

    if (m.meeting_number > 3 && track === "fast") {
      if (m.status !== "not_applicable") {
        updates.push({ id: m.id, status: "not_applicable" });
      }
      continue;
    }

    if (shouldBeAvailable && m.status === "locked") {
      updates.push({ id: m.id, status: "available" });
    }
  }

  return updates;
}

export function getMeetingLockedReason(
  meetingNumber: number,
  meetings: MentorProgramMeeting[],
  readinessAreasSubmitted: number
): string {
  const byNum = new Map(meetings.map((m) => [m.meeting_number, m]));
  const isCompleted = (n: number) => byNum.get(n)?.status === "completed";

  if (meetingNumber === 2) {
    if (!isCompleted(1)) return "Complete Meeting 1 first";
    if (readinessAreasSubmitted < 1) {
      return "Unlocks when the candidate completes at least one Readiness area";
    }
  } else if (meetingNumber > 1) {
    const prev = byNum.get(meetingNumber - 1);
    if (prev && prev.status !== "completed") {
      return `Complete Meeting ${meetingNumber - 1} first`;
    }
  }
  return "Complete the previous meeting first";
}

/** Meeting available but not completed for 7+ days — admin flag. */
export function isMentorMeetingOverdue(
  meeting: MentorProgramMeeting,
  overdueDays = 7
): boolean {
  if (meeting.status !== "available") return false;
  const started = new Date(meeting.updated_at ?? meeting.created_at).getTime();
  return Date.now() - started > overdueDays * 24 * 60 * 60 * 1000;
}

export async function refreshMeetingUnlocks(
  applicationId: string,
  track: Track | null | undefined
) {
  const { data: meetings, error: mErr } = await supabase
    .from("mentor_program_meetings")
    .select("*")
    .eq("application_id", applicationId);
  if (mErr) throw mErr;

  const { data: app } = await supabase
    .from("applications")
    .select("candidate_id")
    .eq("id", applicationId)
    .single();

  let readinessAreas = 0;
  if (app?.candidate_id) {
    const { data: attempts } = await supabase
      .from("readiness_attempts")
      .select("status, readiness_tests(area)")
      .eq("candidate_id", app.candidate_id);
    readinessAreas = countReadinessAreasSubmitted(attempts ?? []);
  }

  const updates = computeNextMeetingUnlocks(
    (meetings ?? []) as MentorProgramMeeting[],
    track,
    readinessAreas
  );

  const now = new Date().toISOString();
  for (const u of updates) {
    await supabase
      .from("mentor_program_meetings")
      .update({ status: u.status, updated_at: now })
      .eq("id", u.id);
  }
}

/** Re-evaluate unlocks after candidate submits a Readiness test area. */
export async function refreshMentorMeetingUnlocksForCandidate(candidateId: string) {
  const { data: apps, error } = await supabase
    .from("applications")
    .select("id, track, candidates(track)")
    .eq("candidate_id", candidateId)
    .not("readiness_unlocked_at", "is", null);
  if (error) throw error;

  for (const app of apps ?? []) {
    const track =
      (app.track as Track | null) ??
      ((app.candidates as { track?: Track } | null)?.track ?? "entry");
    await refreshMeetingUnlocks(app.id, track);
  }
}

export function isMentorAssignmentOverdue(boardDecidedAt: string | null | undefined) {
  if (!boardDecidedAt) return false;
  const decided = new Date(boardDecidedAt).getTime();
  const fiveDaysMs = 5 * 24 * 60 * 60 * 1000;
  return Date.now() - decided > fiveDaysMs;
}
