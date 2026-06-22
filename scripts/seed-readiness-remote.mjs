import { createClient } from "@supabase/supabase-js";
import { READINESS_TESTS_SEED } from "../src/data/readinessModuleSeed.ts";

const url = process.env.VITE_SUPABASE_URL;
const anon = process.env.VITE_SUPABASE_ANON_KEY;
if (!url || !anon) {
  console.error("Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY");
  process.exit(1);
}
const email = process.env.SEED_ADMIN_EMAIL ?? "admin@nordicascent.com";
const password = process.env.SEED_ADMIN_PASSWORD ?? "NordicAdmin2026!";

const supabase = createClient(url, anon);

const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
if (signInError) {
  console.error("Sign in failed:", signInError.message);
  process.exit(1);
}

const { count } = await supabase.from("readiness_tests").select("id", { count: "exact", head: true });
if ((count ?? 0) > 0) {
  console.log("Already seeded:", count, "tests");
  process.exit(0);
}

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

const { count: qCount } = await supabase
  .from("readiness_questions")
  .select("id", { count: "exact", head: true });

console.log(`Seeded ${testsCreated} tests, ${qCount ?? 0} questions`);
