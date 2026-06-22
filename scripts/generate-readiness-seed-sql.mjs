import { READINESS_TESTS_SEED } from "../src/data/readinessModuleSeed.ts";

function esc(s) {
  return (s ?? "").replace(/'/g, "''");
}

const lines = [
  `DO $seed$
DECLARE
  tid UUID;
  existing INT;
BEGIN
  SELECT COUNT(*)::INT INTO existing FROM public.readiness_tests;
  IF existing > 0 THEN
    RAISE NOTICE 'Readiness already seeded (% tests)', existing;
    RETURN;
  END IF;
`,
];

for (const test of READINESS_TESTS_SEED) {
  lines.push(`
  INSERT INTO public.readiness_tests (area, level, title, subtitle, intro_body, timer_minutes, timer_hard, sort_order, active)
  VALUES (
    '${esc(test.area)}',
    ${test.level},
    '${esc(test.title)}',
    '${esc(test.subtitle)}',
    NULL,
    ${test.timer_minutes},
    ${test.timer_hard},
    ${test.level},
    true
  )
  RETURNING id INTO tid;
`);
  for (const [i, q] of test.questions.entries()) {
    lines.push(`
  INSERT INTO public.readiness_questions (test_id, scenario_label, prompt, answer_type, sort_order)
  VALUES (
    tid,
    ${q.scenario_label ? `'${esc(q.scenario_label)}'` : "NULL"},
    '${esc(q.prompt)}',
    '${esc(q.answer_type)}',
    ${i + 1}
  );`);
  }
}

lines.push(`
END $seed$;`);
process.stdout.write(lines.join("\n"));
