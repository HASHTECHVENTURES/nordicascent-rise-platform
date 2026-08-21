import { supabase } from "@/lib/supabase";
import { READINESS_TESTS_SEED, READINESS_LEVEL_SUBTITLES } from "@/data/readinessModuleSeed";

/** Idempotent seed — inserts Module 3 tests and questions if none exist (admin / service role only). */
export async function seedReadinessModuleIfEmpty(): Promise<{ seeded: boolean; count: number }> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { seeded: false, count: 0 };

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") {
    return { seeded: false, count: 0 };
  }

  const { count, error: countError } = await supabase
    .from("readiness_tests")
    .select("id", { count: "exact", head: true });
  if (countError) throw countError;
  if ((count ?? 0) > 0) return { seeded: false, count: count ?? 0 };

  let testsCreated = 0;
  for (const test of READINESS_TESTS_SEED) {
    const { data: inserted, error: testError } = await supabase
      .from("readiness_tests")
      .insert({
        area: test.area,
        level: test.level,
        title: test.title,
        subtitle: test.subtitle,
        intro_body: null,
        timer_minutes: test.timer_minutes,
        timer_hard: test.timer_hard,
        sort_order: test.level,
        active: true,
      })
      .select("id")
      .single();
    if (testError) throw testError;

    const questions = test.questions.map((q, i) => ({
      test_id: inserted.id,
      scenario_label: q.scenario_label ?? null,
      prompt: q.prompt,
      answer_type: q.answer_type,
      sort_order: i + 1,
    }));

    const { error: qError } = await supabase.from("readiness_questions").insert(questions);
    if (qError) throw qError;
    testsCreated++;
  }

  return { seeded: true, count: testsCreated };
}

export function allTestsSubmitted(
  tests: { id: string }[],
  attempts: { test_id: string; status: string }[]
) {
  if (!tests.length) return false;
  return tests.every((t) => {
    const a = attempts.find((x) => x.test_id === t.id);
    return a?.status === "submitted" || a?.status === "expired";
  });
}

export type MentorMeetingLockInput = {
  meeting_number: number;
  status: string;
};

/**
 * Meeting 1 → Level 1 → Level 2 → Meeting 2 → Level 3 → Meeting 3.
 * Candidates never start exams until the mentor completes the required meeting.
 * - Meeting 1 (mentor completes) unlocks Level 1
 * - Level 1 both areas unlocks Level 2 — no extra meeting
 * - Level 2 both areas unlocks Meeting 2
 * - Meeting 2 (mentor completes) unlocks Level 3
 * - Level 3 both areas unlocks Meeting 3
 */
export function mentorMeetingRequiredForLevel(level: number): number | null {
  if (level === 1) return 1;
  if (level === 3) return 2;
  return null; // Level 2 opens after Level 1 only
}

export function isMentorMeetingDone(
  meetingNumber: number,
  meetings: MentorMeetingLockInput[]
) {
  return meetings.some((m) => m.meeting_number === meetingNumber && m.status === "completed");
}

function bothAreasSubmittedAtLevel(
  level: number,
  attempts: { test_id: string; status: string }[],
  tests: { id: string; level: number; area: string }[]
) {
  const atLevel = tests.filter((t) => t.level === level);
  if (atLevel.length < 2) return false;
  return atLevel.every((t) => {
    const a = attempts.find((x) => x.test_id === t.id);
    return a?.status === "submitted" || a?.status === "expired";
  });
}

export function readinessLevelLockReason(
  level: number,
  _area: string,
  attempts: { test_id: string; status: string }[],
  tests: { id: string; level: number; area: string }[],
  meetings: MentorMeetingLockInput[]
): string | null {
  const meeting = mentorMeetingRequiredForLevel(level);
  if (meeting && !isMentorMeetingDone(meeting, meetings)) {
    return `Mentor Meeting ${meeting} first`;
  }

  if (level > 1 && !bothAreasSubmittedAtLevel(level - 1, attempts, tests)) {
    return `Complete Level ${level - 1} (cultural & technical) first`;
  }

  return null;
}

export type ReadinessNextAction =
  | { kind: "meeting"; meetingNumber: 1 | 2 | 3; unlocks: string }
  | { kind: "level"; level: 1 | 2 | 3; detail: string }
  | { kind: "done" };

/** What the candidate (or mentor) should do next in the Readiness sequence. */
export function getReadinessNextAction(
  attempts: { test_id: string; status: string }[],
  tests: { id: string; level: number; area: string }[],
  meetings: MentorMeetingLockInput[]
): ReadinessNextAction {
  if (!isMentorMeetingDone(1, meetings)) {
    return {
      kind: "meeting",
      meetingNumber: 1,
      unlocks: "Level 1 tests (cultural & technical)",
    };
  }
  if (!bothAreasSubmittedAtLevel(1, attempts, tests)) {
    return {
      kind: "level",
      level: 1,
      detail: "Complete both Cultural and Technical Level 1",
    };
  }
  if (!bothAreasSubmittedAtLevel(2, attempts, tests)) {
    return {
      kind: "level",
      level: 2,
      detail: "Complete both Cultural and Technical Level 2",
    };
  }
  if (!isMentorMeetingDone(2, meetings)) {
    return {
      kind: "meeting",
      meetingNumber: 2,
      unlocks: "Level 3 tests (cultural & technical)",
    };
  }
  if (!bothAreasSubmittedAtLevel(3, attempts, tests)) {
    return {
      kind: "level",
      level: 3,
      detail: "Complete both Cultural and Technical Level 3",
    };
  }
  if (!isMentorMeetingDone(3, meetings)) {
    return {
      kind: "meeting",
      meetingNumber: 3,
      unlocks: "closing the Readiness mentor programme",
    };
  }
  return { kind: "done" };
}

/** Level unlocked after mentor marks this meeting complete. */
export function levelUnlockedByMeeting(meetingNumber: number): number | null {
  if (meetingNumber === 1) return 1;
  if (meetingNumber === 2) return 3;
  return null;
}

export function isLevelUnlocked(
  level: number,
  area: string,
  attempts: { test_id: string; status: string }[],
  tests: { id: string; level: number; area: string }[],
  meetings: MentorMeetingLockInput[] = []
) {
  return readinessLevelLockReason(level, area, attempts, tests, meetings) === null;
}

export function formatTimer(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) {
    return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  }
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function hasStrictTimer(test: {
  timer_hard?: boolean;
  timer_minutes?: number;
  level?: number;
}) {
  return Boolean(test.timer_hard && (test.timer_minutes ?? 0) > 0);
}

export function getReadinessLevelSubtitle(level: number, fallback?: string | null) {
  return READINESS_LEVEL_SUBTITLES[level] ?? fallback ?? "";
}

export const READINESS_PRE_TEST_NOTE = `You have made it through a demanding selection process. That means we already believe you have what it takes.

Readiness is not another exam. It tests you on something specific, the real differences between how people work in India and how people work in Nordic teams.

These differences are not small. Nordic workplaces are flat and direct. You are expected to take ownership without being told, speak up when you disagree, including to your manager and move forward without waiting for clear instructions.

Before you start, research Nordic work culture yourself. Not to find the right answers, but to genuinely understand what is different and why it matters. Focus on how decisions are made, how feedback is given, and how people relate to each other at work.

The candidates who do best here are not the ones with the most polished answers. They are the ones who think clearly and answer honestly.

The scenarios describe real workplace situations. If you have work experience, draw on it. If you do not, answer based on how you think you would handle the situation. There are no wrong answers, only honest and dishonest ones.`;

export type ReadinessCms = {
  pre_test_note: string;
  timer_hard_note: string;
  timer_soft_note: string;
};

export const DEFAULT_READINESS_CMS: ReadinessCms = {
  pre_test_note: READINESS_PRE_TEST_NOTE,
  timer_hard_note:
    "Level 3 tests have a fixed 60-minute time limit. The timer starts when you click Next and the test opens.",
  timer_soft_note:
    "This level has no fixed time limit. Take the time you need to answer thoughtfully.",
};

export async function fetchReadinessCms(): Promise<ReadinessCms> {
  const { data, error } = await supabase
    .from("platform_settings")
    .select("settings")
    .eq("id", "default")
    .maybeSingle();
  if (error) throw error;
  const settings = (data?.settings as Record<string, unknown> | null) ?? {};
  const stored = (settings.readinessCms as Partial<ReadinessCms> | undefined) ?? {};
  return { ...DEFAULT_READINESS_CMS, ...stored };
}

export async function updateReadinessCms(cms: ReadinessCms) {
  const { data: row, error: readErr } = await supabase
    .from("platform_settings")
    .select("settings")
    .eq("id", "default")
    .maybeSingle();
  if (readErr) throw readErr;
  const settings = (row?.settings as Record<string, unknown> | null) ?? {};
  const { error } = await supabase
    .from("platform_settings")
    .update({
      settings: { ...settings, readinessCms: cms },
      updated_at: new Date().toISOString(),
    })
    .eq("id", "default");
  if (error) throw error;
}

export function getAttemptExpiresAtMs(
  attempt: { expires_at: string | null; started_at: string },
  timerMinutes: number,
  timerHard = true
): number | null {
  if (!timerHard || !timerMinutes) return null;
  if (attempt.expires_at) return new Date(attempt.expires_at).getTime();
  if (!attempt.started_at || !timerMinutes) return null;
  return new Date(attempt.started_at).getTime() + timerMinutes * 60 * 1000;
}
