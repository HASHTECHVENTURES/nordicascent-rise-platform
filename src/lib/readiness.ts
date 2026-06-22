import { supabase } from "@/lib/supabase";
import { READINESS_TESTS_SEED } from "@/data/readinessModuleSeed";

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

export function getAttemptExpiresAtMs(
  attempt: { expires_at: string | null; started_at: string },
  timerMinutes: number
): number | null {
  if (attempt.expires_at) return new Date(attempt.expires_at).getTime();
  if (!attempt.started_at || !timerMinutes) return null;
  return new Date(attempt.started_at).getTime() + timerMinutes * 60 * 1000;
}
