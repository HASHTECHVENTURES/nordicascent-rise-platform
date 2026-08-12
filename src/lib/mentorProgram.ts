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
  scheduled_at?: string | null;
  meeting_url?: string | null;
  available_at?: string | null;
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

/** Spec default titles when CMS theme is missing. */
export const MENTOR_MEETING_TITLES: Record<number, string> = {
  1: "Introduction and mindset",
  2: "Readiness reflection",
  3: "Final reflection",
  4: "Early experience",
  5: "Work reflection",
  6: "Final reflection",
};

/** Week windows from internship start (inclusive). */
export const MENTOR_ACTIVATION_WEEK_WINDOWS: Record<
  4 | 5 | 6,
  { minWeek: number; maxWeek: number; label: string }
> = {
  4: { minWeek: 1, maxWeek: 2, label: "weeks 1–2 of internship" },
  5: { minWeek: 3, maxWeek: 5, label: "weeks 3–5 of internship" },
  6: { minWeek: 6, maxWeek: 99, label: "end of internship (before Final Clearance)" },
};

export function mentorMeetingCountForTrack(track: Track | null | undefined) {
  return track === "fast" ? MENTOR_MEETING_COUNT_FAST : MENTOR_MEETING_COUNT_ENTRY;
}

export function mentorMeetingTitle(meetingNumber: number, cmsTitle?: string | null) {
  return cmsTitle?.trim() || MENTOR_MEETING_TITLES[meetingNumber] || `Meeting ${meetingNumber}`;
}

/** Split theme_body into agenda bullets (newline / bullet / semicolon separated). */
export function agendaBulletsFromThemeBody(body: string | null | undefined): string[] {
  if (!body?.trim()) return [];
  const raw = body.trim();
  const byLine = raw
    .split(/\n+/)
    .map((l) => l.replace(/^[\s•\-\*\d.)]+/, "").trim())
    .filter(Boolean);
  if (byLine.length > 1) return byLine;

  const byBullet = raw
    .split(/\s*[•|;]\s*/)
    .map((l) => l.replace(/^[\s\-\*\d.)]+/, "").trim())
    .filter(Boolean);
  if (byBullet.length > 1) return byBullet;

  const bySentence = raw
    .split(/(?<=[.!?])\s+(?=[A-Z])/)
    .map((l) => l.trim())
    .filter((l) => l.length > 8);
  if (bySentence.length > 1) return bySentence;

  return [raw];
}

/** Count business days between two dates (Mon–Fri), excluding start day. */
export function businessDaysBetween(from: Date, to: Date = new Date()): number {
  const start = new Date(from);
  start.setHours(0, 0, 0, 0);
  const end = new Date(to);
  end.setHours(0, 0, 0, 0);
  if (end <= start) return 0;

  let days = 0;
  const cursor = new Date(start);
  cursor.setDate(cursor.getDate() + 1);
  while (cursor <= end) {
    const dow = cursor.getDay();
    if (dow !== 0 && dow !== 6) days += 1;
    cursor.setDate(cursor.getDate() + 1);
  }
  return days;
}

/** Weeks since internship start date (1-based; week 1 = days 0–6). */
export function internshipWeekNumber(
  internshipStartDate: string | null | undefined,
  now: Date = new Date()
): number | null {
  if (!internshipStartDate) return null;
  const start = new Date(`${internshipStartDate}T00:00:00`);
  if (Number.isNaN(start.getTime())) return null;
  const diffMs = now.getTime() - start.getTime();
  if (diffMs < 0) return 0;
  return Math.floor(diffMs / (7 * 24 * 60 * 60 * 1000)) + 1;
}

export function isActivationMeetingWeekOpen(
  meetingNumber: number,
  internshipStartDate: string | null | undefined,
  now: Date = new Date()
): boolean {
  if (meetingNumber < 4 || meetingNumber > 6) return true;
  const week = internshipWeekNumber(internshipStartDate, now);
  // Until internship start is set, keep M4–6 locked even if activation record exists
  if (week == null || week <= 0) return false;
  const window = MENTOR_ACTIVATION_WEEK_WINDOWS[meetingNumber as 4 | 5 | 6];
  return week >= window.minWeek;
}

export async function initializeMentorMeetings(
  applicationId: string,
  track: Track | null | undefined
) {
  const max = MENTOR_MEETING_COUNT_ENTRY;
  const now = new Date().toISOString();
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
      available_at: status === "available" ? now : null,
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

export type ReadinessMentorGate = {
  /** Both cultural & technical Readiness level-2 tests submitted (spec: part 2A + 2B). */
  level2BothSubmitted: boolean;
  /** All Readiness tests (both areas × 3 levels) submitted. */
  allTestsSubmitted: boolean;
};

export type ActivationMentorGate = {
  activationUnlocked: boolean;
  internshipStartDate: string | null;
};

export function buildReadinessMentorGate(
  attempts: { test_id: string; status: string }[],
  tests: { id: string; area: string; level: number }[]
): ReadinessMentorGate {
  const isSubmitted = (testId: string) => {
    const a = attempts.find((x) => x.test_id === testId);
    return a?.status === "submitted" || a?.status === "expired";
  };

  const level2Tests = tests.filter((t) => t.level === 2);
  const level2BothSubmitted =
    level2Tests.length >= 2 && level2Tests.every((t) => isSubmitted(t.id));

  const allTestsSubmitted =
    tests.length > 0 && tests.every((t) => isSubmitted(t.id));

  return { level2BothSubmitted, allTestsSubmitted };
}

export function computeNextMeetingUnlocks(
  meetings: MentorProgramMeeting[],
  track: Track | null | undefined,
  gate: ReadinessMentorGate,
  activation: ActivationMentorGate | boolean = false
): { id: string; status: MentorMeetingStatus }[] {
  const activationGate: ActivationMentorGate =
    typeof activation === "boolean"
      ? { activationUnlocked: activation, internshipStartDate: null }
      : activation;

  const byNum = new Map(meetings.map((m) => [m.meeting_number, m]));
  const updates: { id: string; status: MentorMeetingStatus }[] = [];
  const isCompleted = (n: number) => byNum.get(n)?.status === "completed";

  for (const m of meetings) {
    if (m.status === "completed" || m.status === "not_applicable") continue;

    let shouldBeAvailable = false;
    if (m.meeting_number === 1) {
      shouldBeAvailable = true;
    } else if (m.meeting_number === 2) {
      shouldBeAvailable = isCompleted(1) && gate.level2BothSubmitted;
    } else if (m.meeting_number === 3) {
      shouldBeAvailable = isCompleted(2) && gate.allTestsSubmitted;
    } else if (m.meeting_number === 4) {
      shouldBeAvailable =
        track === "entry" &&
        isCompleted(3) &&
        activationGate.activationUnlocked &&
        isActivationMeetingWeekOpen(4, activationGate.internshipStartDate);
    } else if (m.meeting_number === 5) {
      shouldBeAvailable =
        track === "entry" &&
        isCompleted(4) &&
        activationGate.activationUnlocked &&
        isActivationMeetingWeekOpen(5, activationGate.internshipStartDate);
    } else if (m.meeting_number === 6) {
      shouldBeAvailable =
        track === "entry" &&
        isCompleted(5) &&
        activationGate.activationUnlocked &&
        isActivationMeetingWeekOpen(6, activationGate.internshipStartDate);
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
  gate: ReadinessMentorGate,
  activation: ActivationMentorGate | boolean = false
): string {
  const activationGate: ActivationMentorGate =
    typeof activation === "boolean"
      ? { activationUnlocked: activation, internshipStartDate: null }
      : activation;

  const byNum = new Map(meetings.map((m) => [m.meeting_number, m]));
  const isCompleted = (n: number) => byNum.get(n)?.status === "completed";

  if (meetingNumber >= 4) {
    if (!activationGate.activationUnlocked) {
      return "Unlocks when the candidate is accepted into Activation (Entry Track internship)";
    }
    if (!activationGate.internshipStartDate) {
      return "Unlocks once the internship start date is confirmed";
    }
    if (!isActivationMeetingWeekOpen(meetingNumber, activationGate.internshipStartDate)) {
      const window = MENTOR_ACTIVATION_WEEK_WINDOWS[meetingNumber as 4 | 5 | 6];
      return `Opens during ${window.label}`;
    }
  }

  if (meetingNumber === 1) {
    return "Available once your mentor is assigned";
  }

  if (meetingNumber === 2) {
    if (!isCompleted(1)) return "Complete Meeting 1 first";
    if (!gate.level2BothSubmitted) {
      return "Unlocks after Readiness part 2 (technical and cultural)";
    }
  } else if (meetingNumber === 3) {
    if (!isCompleted(2)) return "Complete Meeting 2 first";
    if (!gate.allTestsSubmitted) {
      return "Unlocks when Readiness is complete — take time to reflect first";
    }
  } else if (meetingNumber > 1) {
    const prev = byNum.get(meetingNumber - 1);
    if (prev && prev.status !== "completed") {
      return `Complete Meeting ${meetingNumber - 1} first`;
    }
  }
  return "Complete the previous step first";
}

/** Meeting available but not completed for 7+ days — admin flag. Uses available_at. */
export function isMentorMeetingOverdue(
  meeting: MentorProgramMeeting,
  overdueDays = 7
): boolean {
  if (meeting.status !== "available") return false;
  const started = new Date(
    meeting.available_at ?? meeting.created_at ?? meeting.updated_at ?? Date.now()
  ).getTime();
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

  let gate: ReadinessMentorGate = {
    level2BothSubmitted: false,
    allTestsSubmitted: false,
  };
  if (app?.candidate_id) {
    const [{ data: attempts }, { data: tests }] = await Promise.all([
      supabase
        .from("readiness_attempts")
        .select("test_id, status")
        .eq("candidate_id", app.candidate_id),
      supabase.from("readiness_tests").select("id, area, level").eq("active", true),
    ]);
    gate = buildReadinessMentorGate(attempts ?? [], tests ?? []);
  }

  const { data: activation } = await supabase
    .from("activation_records")
    .select("application_id, internship_start_date")
    .eq("application_id", applicationId)
    .maybeSingle();

  const activationGate: ActivationMentorGate = {
    activationUnlocked: Boolean(activation?.application_id),
    internshipStartDate: activation?.internship_start_date ?? null,
  };

  const updates = computeNextMeetingUnlocks(
    (meetings ?? []) as MentorProgramMeeting[],
    track,
    gate,
    activationGate
  );

  const now = new Date().toISOString();
  for (const u of updates) {
    const patch: Record<string, unknown> = { status: u.status, updated_at: now };
    if (u.status === "available") {
      patch.available_at = now;
    }
    await supabase.from("mentor_program_meetings").update(patch).eq("id", u.id);
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

/** Spec: 5 business days after board decision without mentor assignment. */
export function isMentorAssignmentOverdue(boardDecidedAt: string | null | undefined) {
  if (!boardDecidedAt) return false;
  return businessDaysBetween(new Date(boardDecidedAt)) > 5;
}
