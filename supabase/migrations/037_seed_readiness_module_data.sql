DO $seed$
DECLARE
  tid UUID;
  existing INT;
BEGIN
  SELECT COUNT(*)::INT INTO existing FROM public.readiness_tests;
  IF existing > 0 THEN
    RAISE NOTICE 'Readiness already seeded (% tests)', existing;
    RETURN;
  END IF;


  INSERT INTO public.readiness_tests (area, level, title, subtitle, intro_body, timer_minutes, timer_hard, sort_order, active)
  VALUES (
    'cultural_social',
    1,
    'Cultural & Social — Level 1',
    'Awareness · Structured reflection (45–60 min)',
    NULL,
    60,
    false,
    1,
    true
  )
  RETURNING id INTO tid;


  INSERT INTO public.readiness_questions (test_id, scenario_label, prompt, answer_type, sort_order)
  VALUES (
    tid,
    'Scenario 1: Taking Initiative',
    'You join a Nordic team. Your manager gives you a task with limited instructions and says: "Just make a first version and we''ll refine it." People on the team speak informally, even to senior colleagues.

Q1. How would you naturally behave in the first week — both professionally and socially? (3–5 sentences)',
    'long',
    1
  );

  INSERT INTO public.readiness_questions (test_id, scenario_label, prompt, answer_type, sort_order)
  VALUES (
    tid,
    NULL,
    'Q2. What is expected in a Nordic team in this situation? (give 2–3 examples)',
    'long',
    2
  );

  INSERT INTO public.readiness_questions (test_id, scenario_label, prompt, answer_type, sort_order)
  VALUES (
    tid,
    NULL,
    'Q3. What could go wrong if you wait for more instructions or keep a professional distance socially?',
    'long',
    3
  );

  INSERT INTO public.readiness_questions (test_id, scenario_label, prompt, answer_type, sort_order)
  VALUES (
    tid,
    'Scenario 2: Speaking Up',
    'In a meeting, your manager proposes a solution you believe is not optimal. No one asks for your opinion. The team culture is direct and informal.

Q1. Write exactly what you would say in the meeting. (1–3 sentences)',
    'long',
    4
  );

  INSERT INTO public.readiness_questions (test_id, scenario_label, prompt, answer_type, sort_order)
  VALUES (
    tid,
    NULL,
    'Q2. Why might staying silent reduce trust in a Nordic team? (2–3 sentences)',
    'long',
    5
  );

  INSERT INTO public.readiness_questions (test_id, scenario_label, prompt, answer_type, sort_order)
  VALUES (
    tid,
    NULL,
    'Q3. What is the risk of speaking up in the wrong way? (2–3 sentences)',
    'long',
    6
  );

  INSERT INTO public.readiness_questions (test_id, scenario_label, prompt, answer_type, sort_order)
  VALUES (
    tid,
    'Scenario 3: Saying No and Staying Connected',
    'You are given a deadline you believe is unrealistic. At the same time, you notice you are not being included in informal team conversations.

Q1. Write your response to your manager about the deadline. (2–3 sentences)',
    'long',
    7
  );

  INSERT INTO public.readiness_questions (test_id, scenario_label, prompt, answer_type, sort_order)
  VALUES (
    tid,
    NULL,
    'Q2. What would you do about the social exclusion — actively or passively? (2–3 sentences)',
    'long',
    8
  );

  INSERT INTO public.readiness_questions (test_id, scenario_label, prompt, answer_type, sort_order)
  VALUES (
    tid,
    NULL,
    'Q3. What is the connection between being direct professionally and being trusted socially in Nordic teams?',
    'long',
    9
  );

  INSERT INTO public.readiness_tests (area, level, title, subtitle, intro_body, timer_minutes, timer_hard, sort_order, active)
  VALUES (
    'cultural_social',
    2,
    'Cultural & Social — Level 2',
    'Application · Applied case work (60–90 min)',
    NULL,
    90,
    false,
    2,
    true
  )
  RETURNING id INTO tid;


  INSERT INTO public.readiness_questions (test_id, scenario_label, prompt, answer_type, sort_order)
  VALUES (
    tid,
    'Case 1: Remote Integration Under Uncertainty',
    'You join a remote Nordic team. Your manager gives you a vague first task and says: "Start somewhere and we''ll refine it." You have not yet been included in informal team communication.

Q1. Write your first message introducing yourself to the team.',
    'long',
    1
  );

  INSERT INTO public.readiness_questions (test_id, scenario_label, prompt, answer_type, sort_order)
  VALUES (
    tid,
    NULL,
    'Q2. List your first 5–8 action points, covering both the task and the social integration.',
    'bullets',
    2
  );

  INSERT INTO public.readiness_questions (test_id, scenario_label, prompt, answer_type, sort_order)
  VALUES (
    tid,
    NULL,
    'Q3. How and when do you communicate progress to your manager?',
    'long',
    3
  );

  INSERT INTO public.readiness_questions (test_id, scenario_label, prompt, answer_type, sort_order)
  VALUES (
    tid,
    NULL,
    'Q4. What do you do if you realize halfway that your task assumptions were wrong?',
    'long',
    4
  );

  INSERT INTO public.readiness_questions (test_id, scenario_label, prompt, answer_type, sort_order)
  VALUES (
    tid,
    'Case 2: Disagreement and Relationship',
    'A colleague you have been building a relationship with proposes a solution in a meeting that you believe is not the best approach. Your manager seems to agree with the colleague.

Q1. What do you do in the meeting? (exact behaviour, not theory)',
    'long',
    5
  );

  INSERT INTO public.readiness_questions (test_id, scenario_label, prompt, answer_type, sort_order)
  VALUES (
    tid,
    NULL,
    'Q2. Write what you would say to express your view. (1–4 sentences)',
    'long',
    6
  );

  INSERT INTO public.readiness_questions (test_id, scenario_label, prompt, answer_type, sort_order)
  VALUES (
    tid,
    NULL,
    'Q3. How do you maintain the relationship with the colleague afterwards?',
    'long',
    7
  );

  INSERT INTO public.readiness_questions (test_id, scenario_label, prompt, answer_type, sort_order)
  VALUES (
    tid,
    NULL,
    'Q4. When would you choose NOT to push back? Explain briefly.',
    'long',
    8
  );

  INSERT INTO public.readiness_questions (test_id, scenario_label, prompt, answer_type, sort_order)
  VALUES (
    tid,
    'Case 3: Pressure, Silence and Ownership',
    'You are responsible for a task. Midway: requirements change, feedback is delayed, deadline is fixed. At the same time the team seems quiet — little informal engagement, no social check-ins.

Q1. What are your next 3 action points on the task immediately?',
    'bullets',
    9
  );

  INSERT INTO public.readiness_questions (test_id, scenario_label, prompt, answer_type, sort_order)
  VALUES (
    tid,
    NULL,
    'Q2. How do you communicate the risk to your manager?',
    'long',
    10
  );

  INSERT INTO public.readiness_questions (test_id, scenario_label, prompt, answer_type, sort_order)
  VALUES (
    tid,
    NULL,
    'Q3. What do you do about the social silence — do you interpret it as a problem or not? Why?',
    'long',
    11
  );

  INSERT INTO public.readiness_questions (test_id, scenario_label, prompt, answer_type, sort_order)
  VALUES (
    tid,
    NULL,
    'Q4. What does ownership mean here, both professionally and socially?',
    'long',
    12
  );

  INSERT INTO public.readiness_tests (area, level, title, subtitle, intro_body, timer_minutes, timer_hard, sort_order, active)
  VALUES (
    'cultural_social',
    3,
    'Cultural & Social — Level 3',
    'Behaviour · Live / simulated behaviour (60 min hard limit)',
    NULL,
    60,
    true,
    3,
    true
  )
  RETURNING id INTO tid;


  INSERT INTO public.readiness_questions (test_id, scenario_label, prompt, answer_type, sort_order)
  VALUES (
    tid,
    'Phase 1: Entry (Unclear task + team entry)',
    'You join a Slack channel. The team says: "Welcome! Jump in whenever." You are also assigned a task with no detailed requirements: "Can you put together a first version of this? Just start and we will iterate."

Q1. Write your first message to the team. (2–4 sentences)',
    'long',
    1
  );

  INSERT INTO public.readiness_questions (test_id, scenario_label, prompt, answer_type, sort_order)
  VALUES (
    tid,
    NULL,
    'Q2. Write your immediate response to the manager about the task. (2–4 sentences)',
    'long',
    2
  );

  INSERT INTO public.readiness_questions (test_id, scenario_label, prompt, answer_type, sort_order)
  VALUES (
    tid,
    NULL,
    'Q3. What are your first actions in the next 30–60 minutes, covering both the social and the work? (bullet points)',
    'bullets',
    3
  );

  INSERT INTO public.readiness_questions (test_id, scenario_label, prompt, answer_type, sort_order)
  VALUES (
    tid,
    'Phase 2: Change and Signal',
    'System releases two updates simultaneously: "We might need this earlier than expected." and "Not fully sure yet." A colleague reacts to your first message with: "Looks good 👍" No further engagement.

Q4. How do you adjust your work plan? (step-by-step)',
    'bullets',
    4
  );

  INSERT INTO public.readiness_questions (test_id, scenario_label, prompt, answer_type, sort_order)
  VALUES (
    tid,
    NULL,
    'Q5. What do you communicate to the manager now? (exact message)',
    'long',
    5
  );

  INSERT INTO public.readiness_questions (test_id, scenario_label, prompt, answer_type, sort_order)
  VALUES (
    tid,
    NULL,
    'Q6. What do you assume about the colleague''s reaction — and what do you do about it?',
    'long',
    6
  );

  INSERT INTO public.readiness_questions (test_id, scenario_label, prompt, answer_type, sort_order)
  VALUES (
    tid,
    'Phase 3: Pressure and Integration',
    'Final update: "Client asked for a progress update. We don''t have full clarity yet." The team chat has jokes and informal banter you are not yet part of.

Q7. What do you do and communicate immediately about the client situation?',
    'long',
    7
  );

  INSERT INTO public.readiness_questions (test_id, scenario_label, prompt, answer_type, sort_order)
  VALUES (
    tid,
    NULL,
    'Q8. How do you enter the informal team layer without forcing it?',
    'long',
    8
  );

  INSERT INTO public.readiness_questions (test_id, scenario_label, prompt, answer_type, sort_order)
  VALUES (
    tid,
    NULL,
    'Q9. At what point do you escalate the work situation, and how?',
    'long',
    9
  );

  INSERT INTO public.readiness_questions (test_id, scenario_label, prompt, answer_type, sort_order)
  VALUES (
    tid,
    'Phase 4: Combined Snapshot',
    'Record a 2–3-minute video explaining how you handle uncertainty and build relationships when working with a Nordic team remotely. Cover both dimensions — the work and the people.

Upload your video below (or paste a link if you recorded elsewhere).',
    'video',
    10
  );

  INSERT INTO public.readiness_tests (area, level, title, subtitle, intro_body, timer_minutes, timer_hard, sort_order, active)
  VALUES (
    'technical',
    1,
    'Technical — Level 1',
    'Awareness · Structured reflection (45–60 min)',
    NULL,
    60,
    false,
    1,
    true
  )
  RETURNING id INTO tid;


  INSERT INTO public.readiness_questions (test_id, scenario_label, prompt, answer_type, sort_order)
  VALUES (
    tid,
    'Scenario 1: Unclear Problem Definition',
    'You are given a task: "We need a solution for reducing system downtime / improving efficiency / optimizing performance." (No detailed specification)

Q1. What would you most likely do in the first 30 minutes? (3–5 sentences)',
    'long',
    1
  );

  INSERT INTO public.readiness_questions (test_id, scenario_label, prompt, answer_type, sort_order)
  VALUES (
    tid,
    NULL,
    'Q2. What is expected in a Nordic engineering team in this situation? (give 2–3 examples)',
    'long',
    2
  );

  INSERT INTO public.readiness_questions (test_id, scenario_label, prompt, answer_type, sort_order)
  VALUES (
    tid,
    NULL,
    'Q3. What could go wrong if you start solving immediately without clarification?',
    'long',
    3
  );

  INSERT INTO public.readiness_questions (test_id, scenario_label, prompt, answer_type, sort_order)
  VALUES (
    tid,
    'Scenario 2: Feedback on Work',
    'You present a solution or work plan and receive: "This is okay, but think simpler and more modular."

Q1. How would you interpret this feedback?',
    'long',
    4
  );

  INSERT INTO public.readiness_questions (test_id, scenario_label, prompt, answer_type, sort_order)
  VALUES (
    tid,
    NULL,
    'Q2. What is expected in Nordic engineering culture when receiving feedback?',
    'long',
    5
  );

  INSERT INTO public.readiness_questions (test_id, scenario_label, prompt, answer_type, sort_order)
  VALUES (
    tid,
    NULL,
    'Q3. What is the risk of over-defending your solution?',
    'long',
    6
  );

  INSERT INTO public.readiness_questions (test_id, scenario_label, prompt, answer_type, sort_order)
  VALUES (
    tid,
    'Scenario 3: Responsibility Without Clarity',
    'You are responsible for a task, but: inputs are incomplete; stakeholders disagree; timeline is fixed.

Q1. What is your default reaction?',
    'long',
    7
  );

  INSERT INTO public.readiness_questions (test_id, scenario_label, prompt, answer_type, sort_order)
  VALUES (
    tid,
    NULL,
    'Q2. What is expected in Nordic teams?',
    'long',
    8
  );

  INSERT INTO public.readiness_questions (test_id, scenario_label, prompt, answer_type, sort_order)
  VALUES (
    tid,
    NULL,
    'Q3. What is the risk of waiting for full clarity before acting?',
    'long',
    9
  );

  INSERT INTO public.readiness_tests (area, level, title, subtitle, intro_body, timer_minutes, timer_hard, sort_order, active)
  VALUES (
    'technical',
    2,
    'Technical — Level 2',
    'Application · Applied case work (60–90 min)',
    NULL,
    90,
    false,
    2,
    true
  )
  RETURNING id INTO tid;


  INSERT INTO public.readiness_questions (test_id, scenario_label, prompt, answer_type, sort_order)
  VALUES (
    tid,
    'Case 1: Vague Engineering Task',
    'You are assigned: "Improve the efficiency of an existing system/process/product."

Q1. How do you break this down into actionable steps?',
    'bullets',
    1
  );

  INSERT INTO public.readiness_questions (test_id, scenario_label, prompt, answer_type, sort_order)
  VALUES (
    tid,
    NULL,
    'Q2. What information do you need before starting execution?',
    'long',
    2
  );

  INSERT INTO public.readiness_questions (test_id, scenario_label, prompt, answer_type, sort_order)
  VALUES (
    tid,
    NULL,
    'Q3. How do you structure your work to avoid rework?',
    'long',
    3
  );

  INSERT INTO public.readiness_questions (test_id, scenario_label, prompt, answer_type, sort_order)
  VALUES (
    tid,
    'Case 2: Change in Requirements',
    'Midway through execution: "We now need to prioritize cost reduction over performance."

Q1. What changes in your approach immediately?',
    'long',
    4
  );

  INSERT INTO public.readiness_questions (test_id, scenario_label, prompt, answer_type, sort_order)
  VALUES (
    tid,
    NULL,
    'Q2. How do you communicate the impact to stakeholders?',
    'long',
    5
  );

  INSERT INTO public.readiness_questions (test_id, scenario_label, prompt, answer_type, sort_order)
  VALUES (
    tid,
    NULL,
    'Q3. What do you NOT do in this situation?',
    'long',
    6
  );

  INSERT INTO public.readiness_questions (test_id, scenario_label, prompt, answer_type, sort_order)
  VALUES (
    tid,
    'Case 3: Technical Disagreement',
    'A senior engineer/manager says: "Your approach is not optimal. We should simplify it."

Q1. How do you respond?',
    'long',
    7
  );

  INSERT INTO public.readiness_questions (test_id, scenario_label, prompt, answer_type, sort_order)
  VALUES (
    tid,
    NULL,
    'Q2. What is the goal of a technical discussion in Nordic teams?',
    'long',
    8
  );

  INSERT INTO public.readiness_questions (test_id, scenario_label, prompt, answer_type, sort_order)
  VALUES (
    tid,
    NULL,
    'Q3. What is the risk of defending your solution too strongly?',
    'long',
    9
  );

  INSERT INTO public.readiness_tests (area, level, title, subtitle, intro_body, timer_minutes, timer_hard, sort_order, active)
  VALUES (
    'technical',
    3,
    'Technical — Level 3',
    'Behaviour · Live / simulated behaviour (60 min hard limit)',
    NULL,
    60,
    true,
    3,
    true
  )
  RETURNING id INTO tid;


  INSERT INTO public.readiness_questions (test_id, scenario_label, prompt, answer_type, sort_order)
  VALUES (
    tid,
    'Phase 1: Task Start',
    'You are assigned: "We need you to improve an existing system/process. No clear requirements yet."

Q1. Write your immediate response',
    'long',
    1
  );

  INSERT INTO public.readiness_questions (test_id, scenario_label, prompt, answer_type, sort_order)
  VALUES (
    tid,
    NULL,
    'Q2. What are your first 5–8 action points?',
    'bullets',
    2
  );

  INSERT INTO public.readiness_questions (test_id, scenario_label, prompt, answer_type, sort_order)
  VALUES (
    tid,
    NULL,
    'Q3. What clarifying questions do you ask, if any?',
    'long',
    3
  );

  INSERT INTO public.readiness_questions (test_id, scenario_label, prompt, answer_type, sort_order)
  VALUES (
    tid,
    'Phase 2: Requirement Change',
    'Later: "We now need to prioritize speed over quality due to business urgency."

Q4. How do you adjust your plan and what do you communicate immediately?',
    'long',
    4
  );

  INSERT INTO public.readiness_questions (test_id, scenario_label, prompt, answer_type, sort_order)
  VALUES (
    tid,
    NULL,
    'Q5. What trade-offs do you consider?',
    'long',
    5
  );

  INSERT INTO public.readiness_questions (test_id, scenario_label, prompt, answer_type, sort_order)
  VALUES (
    tid,
    'Phase 3: Incident/Failure',
    'A problem occurs: the system fails or underperforms and stakeholders are affected.

Q6. What do you do in the first hour?',
    'long',
    6
  );

  INSERT INTO public.readiness_questions (test_id, scenario_label, prompt, answer_type, sort_order)
  VALUES (
    tid,
    NULL,
    'Q7. How do you communicate internally and externally?',
    'long',
    7
  );

  INSERT INTO public.readiness_questions (test_id, scenario_label, prompt, answer_type, sort_order)
  VALUES (
    tid,
    NULL,
    'Q8. When do you escalate and why?',
    'long',
    8
  );

  INSERT INTO public.readiness_questions (test_id, scenario_label, prompt, answer_type, sort_order)
  VALUES (
    tid,
    'Phase 4: Engineering Thinking',
    'Record a 2–3-minute video explaining how you approach solving unclear engineering problems when working with a Nordic team remotely.

Upload your video below (or paste a link if you recorded elsewhere).',
    'video',
    9
  );

END $seed$;