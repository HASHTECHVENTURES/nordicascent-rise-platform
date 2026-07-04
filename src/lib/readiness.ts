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

export function isLevelUnlocked(
  level: number,
  area: string,
  attempts: { test_id: string; status: string }[],
  tests: { id: string; level: number; area: string }[]
) {
  if (level <= 1) return true;
  const prevTest = tests.find((t) => t.area === area && t.level === level - 1);
  if (!prevTest) return true;
  const attempt = attempts.find((a) => a.test_id === prevTest.id);
  return attempt?.status === "submitted" || attempt?.status === "expired";
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
