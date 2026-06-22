export type ReadinessQuestionSeed = {
  scenario_label?: string;
  prompt: string;
  answer_type: "short" | "long" | "bullets" | "video";
};

export type ReadinessTestSeed = {
  area: "cultural_social" | "technical";
  level: 1 | 2 | 3;
  title: string;
  subtitle: string;
  timer_minutes: number;
  timer_hard: boolean;
  questions: ReadinessQuestionSeed[];
};

export const READINESS_TESTS_SEED: ReadinessTestSeed[] = [
  {
    area: "cultural_social",
    level: 1,
    title: "Cultural & Social — Level 1",
    subtitle: "Awareness · Structured reflection (45–60 min)",
    timer_minutes: 60,
    timer_hard: false,
    questions: [
      {
        scenario_label: "Scenario 1: Taking Initiative",
        prompt:
          "You join a Nordic team. Your manager gives you a task with limited instructions and says: \"Just make a first version and we'll refine it.\" People on the team speak informally, even to senior colleagues.\n\nQ1. How would you naturally behave in the first week — both professionally and socially? (3–5 sentences)",
        answer_type: "long",
      },
      {
        prompt:
          "Q2. What is expected in a Nordic team in this situation? (give 2–3 examples)",
        answer_type: "long",
      },
      {
        prompt:
          "Q3. What could go wrong if you wait for more instructions or keep a professional distance socially?",
        answer_type: "long",
      },
      {
        scenario_label: "Scenario 2: Speaking Up",
        prompt:
          "In a meeting, your manager proposes a solution you believe is not optimal. No one asks for your opinion. The team culture is direct and informal.\n\nQ1. Write exactly what you would say in the meeting. (1–3 sentences)",
        answer_type: "long",
      },
      {
        prompt: "Q2. Why might staying silent reduce trust in a Nordic team? (2–3 sentences)",
        answer_type: "long",
      },
      {
        prompt: "Q3. What is the risk of speaking up in the wrong way? (2–3 sentences)",
        answer_type: "long",
      },
      {
        scenario_label: "Scenario 3: Saying No and Staying Connected",
        prompt:
          "You are given a deadline you believe is unrealistic. At the same time, you notice you are not being included in informal team conversations.\n\nQ1. Write your response to your manager about the deadline. (2–3 sentences)",
        answer_type: "long",
      },
      {
        prompt: "Q2. What would you do about the social exclusion — actively or passively? (2–3 sentences)",
        answer_type: "long",
      },
      {
        prompt:
          "Q3. What is the connection between being direct professionally and being trusted socially in Nordic teams?",
        answer_type: "long",
      },
    ],
  },
  {
    area: "cultural_social",
    level: 2,
    title: "Cultural & Social — Level 2",
    subtitle: "Application · Applied case work (60–90 min)",
    timer_minutes: 90,
    timer_hard: false,
    questions: [
      {
        scenario_label: "Case 1: Remote Integration Under Uncertainty",
        prompt:
          "You join a remote Nordic team. Your manager gives you a vague first task and says: \"Start somewhere and we'll refine it.\" You have not yet been included in informal team communication.\n\nQ1. Write your first message introducing yourself to the team.",
        answer_type: "long",
      },
      {
        prompt:
          "Q2. List your first 5–8 action points, covering both the task and the social integration.",
        answer_type: "bullets",
      },
      {
        prompt: "Q3. How and when do you communicate progress to your manager?",
        answer_type: "long",
      },
      {
        prompt: "Q4. What do you do if you realize halfway that your task assumptions were wrong?",
        answer_type: "long",
      },
      {
        scenario_label: "Case 2: Disagreement and Relationship",
        prompt:
          "A colleague you have been building a relationship with proposes a solution in a meeting that you believe is not the best approach. Your manager seems to agree with the colleague.\n\nQ1. What do you do in the meeting? (exact behaviour, not theory)",
        answer_type: "long",
      },
      {
        prompt: "Q2. Write what you would say to express your view. (1–4 sentences)",
        answer_type: "long",
      },
      {
        prompt: "Q3. How do you maintain the relationship with the colleague afterwards?",
        answer_type: "long",
      },
      {
        prompt: "Q4. When would you choose NOT to push back? Explain briefly.",
        answer_type: "long",
      },
      {
        scenario_label: "Case 3: Pressure, Silence and Ownership",
        prompt:
          "You are responsible for a task. Midway: requirements change, feedback is delayed, deadline is fixed. At the same time the team seems quiet — little informal engagement, no social check-ins.\n\nQ1. What are your next 3 action points on the task immediately?",
        answer_type: "bullets",
      },
      {
        prompt: "Q2. How do you communicate the risk to your manager?",
        answer_type: "long",
      },
      {
        prompt:
          "Q3. What do you do about the social silence — do you interpret it as a problem or not? Why?",
        answer_type: "long",
      },
      {
        prompt: "Q4. What does ownership mean here, both professionally and socially?",
        answer_type: "long",
      },
    ],
  },
  {
    area: "cultural_social",
    level: 3,
    title: "Cultural & Social — Level 3",
    subtitle: "Behaviour · Live / simulated behaviour (60 min hard limit)",
    timer_minutes: 60,
    timer_hard: true,
    questions: [
      {
        scenario_label: "Phase 1: Entry (Unclear task + team entry)",
        prompt:
          "You join a Slack channel. The team says: \"Welcome! Jump in whenever.\" You are also assigned a task with no detailed requirements: \"Can you put together a first version of this? Just start and we will iterate.\"\n\nQ1. Write your first message to the team. (2–4 sentences)",
        answer_type: "long",
      },
      {
        prompt: "Q2. Write your immediate response to the manager about the task. (2–4 sentences)",
        answer_type: "long",
      },
      {
        prompt:
          "Q3. What are your first actions in the next 30–60 minutes, covering both the social and the work? (bullet points)",
        answer_type: "bullets",
      },
      {
        scenario_label: "Phase 2: Change and Signal",
        prompt:
          "System releases two updates simultaneously: \"We might need this earlier than expected.\" and \"Not fully sure yet.\" A colleague reacts to your first message with: \"Looks good 👍\" No further engagement.\n\nQ4. How do you adjust your work plan? (step-by-step)",
        answer_type: "bullets",
      },
      {
        prompt: "Q5. What do you communicate to the manager now? (exact message)",
        answer_type: "long",
      },
      {
        prompt: "Q6. What do you assume about the colleague's reaction — and what do you do about it?",
        answer_type: "long",
      },
      {
        scenario_label: "Phase 3: Pressure and Integration",
        prompt:
          "Final update: \"Client asked for a progress update. We don't have full clarity yet.\" The team chat has jokes and informal banter you are not yet part of.\n\nQ7. What do you do and communicate immediately about the client situation?",
        answer_type: "long",
      },
      {
        prompt: "Q8. How do you enter the informal team layer without forcing it?",
        answer_type: "long",
      },
      {
        prompt: "Q9. At what point do you escalate the work situation, and how?",
        answer_type: "long",
      },
      {
        scenario_label: "Phase 4: Combined Snapshot",
        prompt:
          "Record a 2–3-minute video explaining how you handle uncertainty and build relationships when working with a Nordic team remotely. Cover both dimensions — the work and the people.\n\nUpload your video below (or paste a link if you recorded elsewhere).",
        answer_type: "video",
      },
    ],
  },
  {
    area: "technical",
    level: 1,
    title: "Technical — Level 1",
    subtitle: "Awareness · Structured reflection (45–60 min)",
    timer_minutes: 60,
    timer_hard: false,
    questions: [
      {
        scenario_label: "Scenario 1: Unclear Problem Definition",
        prompt:
          "You are given a task: \"We need a solution for reducing system downtime / improving efficiency / optimizing performance.\" (No detailed specification)\n\nQ1. What would you most likely do in the first 30 minutes? (3–5 sentences)",
        answer_type: "long",
      },
      {
        prompt: "Q2. What is expected in a Nordic engineering team in this situation? (give 2–3 examples)",
        answer_type: "long",
      },
      {
        prompt:
          "Q3. What could go wrong if you start solving immediately without clarification?",
        answer_type: "long",
      },
      {
        scenario_label: "Scenario 2: Feedback on Work",
        prompt:
          "You present a solution or work plan and receive: \"This is okay, but think simpler and more modular.\"\n\nQ1. How would you interpret this feedback?",
        answer_type: "long",
      },
      {
        prompt: "Q2. What is expected in Nordic engineering culture when receiving feedback?",
        answer_type: "long",
      },
      {
        prompt: "Q3. What is the risk of over-defending your solution?",
        answer_type: "long",
      },
      {
        scenario_label: "Scenario 3: Responsibility Without Clarity",
        prompt:
          "You are responsible for a task, but: inputs are incomplete; stakeholders disagree; timeline is fixed.\n\nQ1. What is your default reaction?",
        answer_type: "long",
      },
      {
        prompt: "Q2. What is expected in Nordic teams?",
        answer_type: "long",
      },
      {
        prompt: "Q3. What is the risk of waiting for full clarity before acting?",
        answer_type: "long",
      },
    ],
  },
  {
    area: "technical",
    level: 2,
    title: "Technical — Level 2",
    subtitle: "Application · Applied case work (60–90 min)",
    timer_minutes: 90,
    timer_hard: false,
    questions: [
      {
        scenario_label: "Case 1: Vague Engineering Task",
        prompt:
          "You are assigned: \"Improve the efficiency of an existing system/process/product.\"\n\nQ1. How do you break this down into actionable steps?",
        answer_type: "bullets",
      },
      {
        prompt: "Q2. What information do you need before starting execution?",
        answer_type: "long",
      },
      {
        prompt: "Q3. How do you structure your work to avoid rework?",
        answer_type: "long",
      },
      {
        scenario_label: "Case 2: Change in Requirements",
        prompt:
          "Midway through execution: \"We now need to prioritize cost reduction over performance.\"\n\nQ1. What changes in your approach immediately?",
        answer_type: "long",
      },
      {
        prompt: "Q2. How do you communicate the impact to stakeholders?",
        answer_type: "long",
      },
      {
        prompt: "Q3. What do you NOT do in this situation?",
        answer_type: "long",
      },
      {
        scenario_label: "Case 3: Technical Disagreement",
        prompt:
          "A senior engineer/manager says: \"Your approach is not optimal. We should simplify it.\"\n\nQ1. How do you respond?",
        answer_type: "long",
      },
      {
        prompt: "Q2. What is the goal of a technical discussion in Nordic teams?",
        answer_type: "long",
      },
      {
        prompt: "Q3. What is the risk of defending your solution too strongly?",
        answer_type: "long",
      },
    ],
  },
  {
    area: "technical",
    level: 3,
    title: "Technical — Level 3",
    subtitle: "Behaviour · Live / simulated behaviour (60 min hard limit)",
    timer_minutes: 60,
    timer_hard: true,
    questions: [
      {
        scenario_label: "Phase 1: Task Start",
        prompt:
          "You are assigned: \"We need you to improve an existing system/process. No clear requirements yet.\"\n\nQ1. Write your immediate response",
        answer_type: "long",
      },
      {
        prompt: "Q2. What are your first 5–8 action points?",
        answer_type: "bullets",
      },
      {
        prompt: "Q3. What clarifying questions do you ask, if any?",
        answer_type: "long",
      },
      {
        scenario_label: "Phase 2: Requirement Change",
        prompt:
          "Later: \"We now need to prioritize speed over quality due to business urgency.\"\n\nQ4. How do you adjust your plan and what do you communicate immediately?",
        answer_type: "long",
      },
      {
        prompt: "Q5. What trade-offs do you consider?",
        answer_type: "long",
      },
      {
        scenario_label: "Phase 3: Incident/Failure",
        prompt:
          "A problem occurs: the system fails or underperforms and stakeholders are affected.\n\nQ6. What do you do in the first hour?",
        answer_type: "long",
      },
      {
        prompt: "Q7. How do you communicate internally and externally?",
        answer_type: "long",
      },
      {
        prompt: "Q8. When do you escalate and why?",
        answer_type: "long",
      },
      {
        scenario_label: "Phase 4: Engineering Thinking",
        prompt:
          "Record a 2–3-minute video explaining how you approach solving unclear engineering problems when working with a Nordic team remotely.\n\nUpload your video below (or paste a link if you recorded elsewhere).",
        answer_type: "video",
      },
    ],
  },
];

export const READINESS_AREA_LABELS: Record<string, string> = {
  cultural_social: "Cultural & Social Readiness",
  technical: "Technical Readiness",
};

export const READINESS_LEVEL_LABELS: Record<number, string> = {
  1: "Level 1 — Awareness",
  2: "Level 2 — Application",
  3: "Level 3 — Behaviour",
};

export const READINESS_SIGNAL_LABELS: Record<string, string> = {
  strong: "Strong",
  acceptable: "Acceptable",
  weak: "Weak",
};
