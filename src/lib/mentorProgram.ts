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

export function isMentorAssignmentOverdue(boardDecidedAt: string | null | undefined) {
  if (!boardDecidedAt) return false;
  const decided = new Date(boardDecidedAt).getTime();
  const fiveDaysMs = 5 * 24 * 60 * 60 * 1000;
  return Date.now() - decided > fiveDaysMs;
}
