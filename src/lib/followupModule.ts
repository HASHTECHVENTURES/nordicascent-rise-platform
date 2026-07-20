import { supabase } from "@/lib/supabase";
import { APPLICATION_JOURNEY_STATUSES } from "@/lib/applicationStatusFlow";

export type FollowupRollupStatus =
  | "followup_active"
  | "followup_watch"
  | "followup_flag"
  | "followup_complete"
  | "at_risk_retention";

export type MeetingState = "on_track" | "watch" | "flag";
export type MeetingParty = "candidate" | "company";

export type FollowupTouchpoint = {
  id: string;
  application_id: string;
  month_number: 1 | 2 | 3 | 6;
  title: string;
  focus: string | null;
  target_due_date: string;
  window_end: string;
  questionnaire_opens_at: string | null;
};

export type FollowupMeetingLog = {
  id: string;
  touchpoint_id: string;
  application_id: string;
  party: MeetingParty;
  state: MeetingState;
  meeting_date: string | null;
  notes: string | null;
  confidential_notes: string | null;
  follow_up_actions: string | null;
  logged_by: string | null;
  logged_at: string | null;
};

export type FollowupQuestionnaire = {
  id: string;
  application_id: string;
  touchpoint_id: string | null;
  month_number: 3 | 6;
  party: MeetingParty;
  status: "pending" | "open" | "submitted";
  opens_at: string | null;
  submitted_at: string | null;
};

export type FollowupAnswer = {
  id: string;
  questionnaire_id: string;
  application_id: string;
  question_key: string;
  readiness_dimension: string | null;
  option_key: string | null;
  score: number | null;
  open_text: string | null;
};

export type FollowupAddonRequest = {
  id: string;
  application_id: string;
  addon_key:
    | "extended_family_support"
    | "extended_language"
    | "extended_followup"
    | "school_kindergarten";
  notes: string | null;
  status: "requested" | "acknowledged" | "fulfilled" | "declined";
};

export type QuestionDef = {
  key: string;
  prompt: string;
  dimension: string;
  type: "likert" | "open";
  options?: { key: string; label: string; score: number }[];
  openFollowUp?: boolean;
};

export const TOUCHPOINT_TOPICS: Record<
  number,
  { candidate: string[]; company: string[]; confidential?: string }
> = {
  1: {
    candidate: [
      "Practical setup (housing, bank, ID, transport)",
      "First impressions and surprises",
      "Communication / team dynamics",
      "Immediate needs",
    ],
    company: [
      "How has the candidate been received by the team?",
      "Any early signals — positive or concerning?",
      "Is anything on your side not working as expected?",
    ],
  },
  2: {
    candidate: [
      "Is the work going as expected? Are expectations clear?",
      "Are you getting feedback?",
      "Social side — part of the team or alongside it?",
      "Anything about Nordic work culture that still feels difficult?",
    ],
    company: [
      "Is the candidate performing as expected?",
      "How do they handle autonomy and ambiguity?",
      "Anything worth addressing now?",
    ],
  },
  3: {
    candidate: [
      "Progress over three months — what works, what is still hard?",
      "Life outside work — settling socially and practically?",
      "How useful were Readiness and the mentor, really?",
    ],
    company: [
      "Performance and integration so far",
      "Risks going into the next quarter",
      "Did selection and Bangalore assessment predict what you see?",
    ],
    confidential:
      "Is there anything you are worried about that you have not raised with your employer?",
  },
  6: {
    candidate: [
      "Six months in — how do you feel about the decision to move?",
      "Where do you see yourself in 6–12 months?",
      "What made the biggest difference? What would you change?",
    ],
    company: [
      "How has the candidate developed? Meeting or exceeding expectations?",
      "Retention confidence — do you expect them to stay?",
      "Did we select the right person? Would you use Nordic Ascent again?",
    ],
    confidential: "Is there anything that would put your continued stay at risk?",
  },
};

const LIKERT_5 = (labels: string[]) =>
  labels.map((label, i) => ({ key: `o${i + 1}`, label, score: 5 - i }));

export const QUESTIONNAIRE_DEFS: Record<"candidate_3" | "company_3" | "candidate_6" | "company_6", QuestionDef[]> = {
  candidate_3: [
    {
      key: "c3_speak_up",
      prompt: "How comfortable do you feel speaking up in meetings, including when you disagree?",
      dimension: "cultural_social",
      type: "likert",
      options: LIKERT_5(["Very comfortable", "Mostly comfortable", "Sometimes", "Rarely", "Not comfortable"]),
    },
    {
      key: "c3_social_dynamics",
      prompt: "How well do you understand the informal social dynamics of your team?",
      dimension: "cultural_social",
      type: "likert",
      options: LIKERT_5(["Very well", "Mostly well", "Somewhat", "Not very well", "Not at all"]),
    },
    {
      key: "c3_ownership",
      prompt: "Have you shown initiative to take ownership without waiting for detailed instructions?",
      dimension: "cultural_social",
      type: "likert",
      options: LIKERT_5(["Very natural", "Mostly natural", "Sometimes", "Self-challenging", "Very challenging"]),
    },
    {
      key: "c3_tech_clarity",
      prompt: "How clear are expectations of you technically?",
      dimension: "technical",
      type: "likert",
      options: LIKERT_5(["Very clear", "Mostly clear", "Somewhat", "Unclear", "Very unclear"]),
    },
    {
      key: "c3_contribute",
      prompt: "Have you been able to contribute technically at the level you expected?",
      dimension: "technical",
      type: "likert",
      options: LIKERT_5(["Fully", "Mostly", "Partially", "Rarely", "No"]),
    },
    {
      key: "c3_settled",
      prompt: "How settled do you feel practically — housing, transport, admin?",
      dimension: "life_norway",
      type: "likert",
      options: LIKERT_5(["Fully settled", "Mostly settled", "Partially", "Still some issues", "Significant problems"]),
    },
    {
      key: "c3_family",
      prompt: "If your family is with you — how are they settling in?",
      dimension: "life_norway",
      type: "likert",
      options: LIKERT_5(["Very well", "Mostly well", "Somewhat", "Struggling", "Not applicable"]),
    },
    {
      key: "c3_readiness",
      prompt: "How well did Readiness prepare you for a Nordic team?",
      dimension: "process",
      type: "likert",
      options: LIKERT_5(["Very well", "Mostly well", "Somewhat", "Not very well", "Not at all"]),
      openFollowUp: true,
    },
    {
      key: "c3_open",
      prompt: "Anything Nordic Ascent could do differently to support you better right now?",
      dimension: "process",
      type: "open",
    },
  ],
  company_3: [
    {
      key: "co3_social",
      prompt: "How well is the candidate integrating into the team socially?",
      dimension: "cultural_social",
      type: "likert",
      options: LIKERT_5(["Extremely well", "Mostly well", "Somewhat", "Poorly", "Not well"]),
    },
    {
      key: "co3_ownership",
      prompt: "Is the candidate taking ownership independently?",
      dimension: "cultural_social",
      type: "likert",
      options: LIKERT_5(["Consistently", "Mostly", "Sometimes", "Rarely", "Never"]),
    },
    {
      key: "co3_tech",
      prompt: "Technical performance against the Role Requirement Profile?",
      dimension: "technical",
      type: "likert",
      options: LIKERT_5(["Exceeding", "Meeting", "Mostly meeting", "Below", "Significantly below"]),
    },
    {
      key: "co3_selection",
      prompt: "Did we select the right candidate for this role?",
      dimension: "process",
      type: "likert",
      options: LIKERT_5(["Definitely", "Mostly", "Uncertain", "Probably not", "No"]),
    },
    {
      key: "co3_retention",
      prompt: "How confident are you in long-term retention of this candidate?",
      dimension: "retention",
      type: "likert",
      options: LIKERT_5(["Very confident", "Mostly", "Uncertain", "Concerned", "Very concerned"]),
    },
    {
      key: "co3_flags",
      prompt: "Any urgent red flags Nordic Ascent should be aware of?",
      dimension: "retention",
      type: "open",
    },
  ],
  candidate_6: [
    {
      key: "c6_readiness",
      prompt: "Looking back — how well did Readiness prepare you for a Nordic team?",
      dimension: "process",
      type: "likert",
      options: LIKERT_5(["Very well", "Mostly well", "Somewhat", "Not very well", "Not at all"]),
    },
    {
      key: "c6_natural",
      prompt: "How natural does it feel to operate in a Nordic work environment?",
      dimension: "cultural_social",
      type: "likert",
      options: LIKERT_5(["Very natural", "Mostly", "Still adapting", "Still challenging", "Very challenging"]),
    },
    {
      key: "c6_team",
      prompt: "Do you feel genuinely part of your team — professionally and socially?",
      dimension: "cultural_social",
      type: "likert",
      options: LIKERT_5(["Fully", "Mostly", "Partially", "Not really", "No"]),
    },
    {
      key: "c6_contribute",
      prompt: "How would you rate your own technical contribution over six months?",
      dimension: "technical",
      type: "likert",
      options: LIKERT_5(["Excellent", "Good", "Adequate", "Below what I expected", "Poor"]),
    },
    {
      key: "c6_decision",
      prompt: "How do you feel about your decision to move to Norway?",
      dimension: "retention",
      type: "likert",
      options: LIKERT_5(["Best decision", "Positive", "Mixed", "Some regrets", "Significant regrets"]),
    },
    {
      key: "c6_future",
      prompt: "Where do you see yourself in the next 12 months?",
      dimension: "retention",
      type: "likert",
      options: [
        { key: "o1", label: "Continuing in this role", score: 5 },
        { key: "o2", label: "Seeking growth within company", score: 4 },
        { key: "o3", label: "Considering other opportunities in Norway", score: 3 },
        { key: "o4", label: "Considering returning to India", score: 2 },
        { key: "o5", label: "Other", score: 1 },
      ],
    },
    {
      key: "c6_recommend",
      prompt: "Would you recommend Nordic Ascent to a friend/colleague?",
      dimension: "process",
      type: "likert",
      options: LIKERT_5(["Definitely", "Probably", "Maybe", "Probably not", "Definitely not"]),
    },
  ],
  company_6: [
    {
      key: "co6_integrate",
      prompt: "How well has the candidate integrated culturally and socially over six months?",
      dimension: "cultural_social",
      type: "likert",
      options: LIKERT_5(["Excellently", "Well", "Adequately", "Slowly", "Poorly"]),
    },
    {
      key: "co6_tech",
      prompt: "Overall technical performance?",
      dimension: "technical",
      type: "likert",
      options: LIKERT_5(["Exceeding", "Meeting", "Mostly meeting", "Below", "Significantly below"]),
    },
    {
      key: "co6_selection",
      prompt: "Did we select the right candidate?",
      dimension: "process",
      type: "likert",
      options: LIKERT_5(["Definitely", "Mostly", "Uncertain", "Probably not", "No"]),
    },
    {
      key: "co6_retention",
      prompt: "Confidence in long-term retention?",
      dimension: "retention",
      type: "likert",
      options: LIKERT_5(["Very high", "High", "Moderate", "Low", "Very low"]),
    },
    {
      key: "co6_hire_again",
      prompt: "Would you hire through Nordic Ascent again?",
      dimension: "process",
      type: "likert",
      options: LIKERT_5(["Definitely", "Probably", "Maybe", "Probably not", "Definitely not"]),
    },
    {
      key: "co6_open",
      prompt: "What would you change about the process?",
      dimension: "process",
      type: "open",
    },
  ],
};

export const ADDON_LABELS: Record<FollowupAddonRequest["addon_key"], string> = {
  extended_family_support: "Extended family support",
  extended_language: "Extended language training",
  extended_followup: "Extended follow-up beyond 6 months",
  school_kindergarten: "School / kindergarten coordination",
};

export function rollupStatusLabel(s: FollowupRollupStatus | null | undefined): string {
  switch (s) {
    case "followup_complete":
      return "Complete";
    case "at_risk_retention":
      return "At risk (retention)";
    case "followup_flag":
      return "Flagged";
    case "followup_watch":
      return "Watch";
    case "followup_active":
      return "Active";
    default:
      return "Not started";
  }
}

export function meetingStateLabel(s: MeetingState): string {
  switch (s) {
    case "flag":
      return "Flag";
    case "watch":
      return "Watch";
    default:
      return "On track";
  }
}

export function isTouchpointOverdue(tp: FollowupTouchpoint, bothLogged: boolean): boolean {
  if (bothLogged) return false;
  return tp.window_end < new Date().toISOString().slice(0, 10);
}

export function isFollowupUnlocked(input: {
  arrivalDate?: string | null;
  followupStatus?: string | null;
  applicationStatus?: string | null;
}) {
  if (input.arrivalDate || input.followupStatus) return true;
  return (
    input.applicationStatus === APPLICATION_JOURNEY_STATUSES.FOLLOWUP ||
    input.applicationStatus === APPLICATION_JOURNEY_STATUSES.JOURNEY_COMPLETE ||
    input.applicationStatus === APPLICATION_JOURNEY_STATUSES.ONBOARDING
  );
}

export function questionnaireDefKey(
  month: 3 | 6,
  party: MeetingParty
): keyof typeof QUESTIONNAIRE_DEFS {
  return `${party}_${month}` as keyof typeof QUESTIONNAIRE_DEFS;
}

/** Standing topics CMS — newline-separated prompts per month × party */
export type FollowupTopicsCms = {
  m1_candidate: string;
  m1_company: string;
  m2_candidate: string;
  m2_company: string;
  m3_candidate: string;
  m3_company: string;
  m3_confidential: string;
  m6_candidate: string;
  m6_company: string;
  m6_confidential: string;
};

function joinTopics(items: string[]) {
  return items.join("\n");
}

export const DEFAULT_FOLLOWUP_TOPICS_CMS: FollowupTopicsCms = {
  m1_candidate: joinTopics(TOUCHPOINT_TOPICS[1].candidate),
  m1_company: joinTopics(TOUCHPOINT_TOPICS[1].company),
  m2_candidate: joinTopics(TOUCHPOINT_TOPICS[2].candidate),
  m2_company: joinTopics(TOUCHPOINT_TOPICS[2].company),
  m3_candidate: joinTopics(TOUCHPOINT_TOPICS[3].candidate),
  m3_company: joinTopics(TOUCHPOINT_TOPICS[3].company),
  m3_confidential: TOUCHPOINT_TOPICS[3].confidential ?? "",
  m6_candidate: joinTopics(TOUCHPOINT_TOPICS[6].candidate),
  m6_company: joinTopics(TOUCHPOINT_TOPICS[6].company),
  m6_confidential: TOUCHPOINT_TOPICS[6].confidential ?? "",
};

export type FollowupQuestionnaireCms = typeof QUESTIONNAIRE_DEFS;

export const DEFAULT_FOLLOWUP_QUESTIONNAIRE_CMS: FollowupQuestionnaireCms = QUESTIONNAIRE_DEFS;

export function topicsFromCms(cms: FollowupTopicsCms | null | undefined): typeof TOUCHPOINT_TOPICS {
  const c = { ...DEFAULT_FOLLOWUP_TOPICS_CMS, ...cms };
  const lines = (s: string) =>
    s
      .split("\n")
      .map((x) => x.trim())
      .filter(Boolean);
  return {
    1: { candidate: lines(c.m1_candidate), company: lines(c.m1_company) },
    2: { candidate: lines(c.m2_candidate), company: lines(c.m2_company) },
    3: {
      candidate: lines(c.m3_candidate),
      company: lines(c.m3_company),
      confidential: c.m3_confidential.trim() || undefined,
    },
    6: {
      candidate: lines(c.m6_candidate),
      company: lines(c.m6_company),
      confidential: c.m6_confidential.trim() || undefined,
    },
  };
}

export async function fetchFollowupCms(): Promise<{
  topics: FollowupTopicsCms;
  questionnaires: FollowupQuestionnaireCms;
}> {
  const { data, error } = await supabase
    .from("platform_settings")
    .select("settings")
    .eq("id", "default")
    .maybeSingle();
  if (error) throw error;
  const settings = (data?.settings as Record<string, unknown> | null) ?? {};
  const topics = {
    ...DEFAULT_FOLLOWUP_TOPICS_CMS,
    ...((settings.followupTopicsCms as Partial<FollowupTopicsCms> | undefined) ?? {}),
  };
  const questionnaires = {
    ...DEFAULT_FOLLOWUP_QUESTIONNAIRE_CMS,
    ...((settings.followupQuestionnaireCms as Partial<FollowupQuestionnaireCms> | undefined) ?? {}),
  };
  return { topics, questionnaires };
}

export async function updateFollowupCms(input: {
  topics: FollowupTopicsCms;
  questionnaires: FollowupQuestionnaireCms;
}) {
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
      settings: {
        ...settings,
        followupTopicsCms: input.topics,
        followupQuestionnaireCms: input.questionnaires,
      },
      updated_at: new Date().toISOString(),
    })
    .eq("id", "default");
  if (error) throw error;
}

export async function initializeFollowup(applicationId: string, arrivalDate?: string | null) {
  const { error } = await supabase.rpc("initialize_followup", {
    p_application_id: applicationId,
    p_arrival_date: arrivalDate ?? null,
  });
  if (error) throw error;
}

export async function refreshFollowupQuestionnaires(applicationId: string) {
  const { error } = await supabase.rpc("refresh_followup_questionnaires", {
    p_application_id: applicationId,
  });
  if (error) throw error;
}

export async function syncFollowupStatus(applicationId: string) {
  const { error } = await supabase.rpc("sync_followup_status", {
    p_application_id: applicationId,
  });
  if (error) throw error;
}

export async function upsertMeetingLog(input: {
  logId: string;
  applicationId: string;
  state: MeetingState;
  meeting_date?: string | null;
  notes?: string | null;
  confidential_notes?: string | null;
  follow_up_actions?: string | null;
  logged_by?: string | null;
  setAtRiskRetention?: boolean;
}) {
  const now = new Date().toISOString();
  const { error } = await supabase
    .from("followup_meeting_logs")
    .update({
      state: input.state,
      meeting_date: input.meeting_date ?? null,
      notes: input.notes?.trim() || null,
      confidential_notes: input.confidential_notes?.trim() || null,
      follow_up_actions: input.follow_up_actions?.trim() || null,
      logged_by: input.logged_by ?? null,
      logged_at: now,
      updated_at: now,
    })
    .eq("id", input.logId);
  if (error) throw error;

  if (input.setAtRiskRetention) {
    await supabase
      .from("activation_records")
      .update({
        at_risk_retention: true,
        at_risk_retention_at: now,
        followup_status: "at_risk_retention",
        updated_at: now,
      })
      .eq("application_id", input.applicationId);
  }

  await syncFollowupStatus(input.applicationId);
  await supabase.rpc("complete_followup_if_ready", { p_application_id: input.applicationId });
}

export async function setAtRiskRetention(applicationId: string, value: boolean) {
  const now = new Date().toISOString();
  const { error } = await supabase
    .from("activation_records")
    .update({
      at_risk_retention: value,
      at_risk_retention_at: value ? now : null,
      updated_at: now,
    })
    .eq("application_id", applicationId);
  if (error) throw error;
  await syncFollowupStatus(applicationId);
}

export async function submitQuestionnaire(input: {
  questionnaireId: string;
  applicationId: string;
  month: 3 | 6;
  party: MeetingParty;
  answers: Record<string, { option_key?: string; score?: number; open_text?: string }>;
  submitted_by?: string | null;
}) {
  const cms = await fetchFollowupCms();
  const defs =
    cms.questionnaires[questionnaireDefKey(input.month, input.party)] ??
    QUESTIONNAIRE_DEFS[questionnaireDefKey(input.month, input.party)];
  const rows = defs.map((d) => {
    const a = input.answers[d.key] ?? {};
    return {
      questionnaire_id: input.questionnaireId,
      application_id: input.applicationId,
      question_key: d.key,
      readiness_dimension: d.dimension,
      option_key: a.option_key ?? null,
      score: a.score ?? null,
      open_text: a.open_text?.trim() || null,
      updated_at: new Date().toISOString(),
    };
  });

  const { error: ansErr } = await supabase.from("followup_answers").upsert(rows, {
    onConflict: "questionnaire_id,question_key",
  });
  if (ansErr) throw ansErr;

  const now = new Date().toISOString();
  const { error } = await supabase
    .from("followup_questionnaires")
    .update({
      status: "submitted",
      submitted_at: now,
      submitted_by: input.submitted_by ?? null,
      updated_at: now,
    })
    .eq("id", input.questionnaireId);
  if (error) throw error;

  // Retention signal from company low confidence
  if (input.party === "company") {
    const retentionKey = input.month === 3 ? "co3_retention" : "co6_retention";
    const score = input.answers[retentionKey]?.score;
    if (score != null && score <= 2) {
      await setAtRiskRetention(input.applicationId, true);
    }
  }

  // Candidate 6-mo confidential open text can signal retention risk
  if (input.party === "candidate" && input.month === 6) {
    const riskText = Object.entries(input.answers).find(([k, a]) => {
      const def = defs.find((d) => d.key === k);
      return def?.dimension === "retention" && Boolean(a.open_text?.trim());
    });
    if (riskText && (input.answers[riskText[0]]?.open_text ?? "").toLowerCase().includes("risk")) {
      await setAtRiskRetention(input.applicationId, true);
    }
  }

  await syncFollowupStatus(input.applicationId);
  await supabase.rpc("complete_followup_if_ready", { p_application_id: input.applicationId });
}

export async function createAddonRequest(input: {
  applicationId: string;
  addon_key: FollowupAddonRequest["addon_key"];
  notes?: string;
  requested_by?: string | null;
}) {
  const { error } = await supabase.from("followup_addon_requests").insert({
    application_id: input.applicationId,
    addon_key: input.addon_key,
    notes: input.notes?.trim() || null,
    requested_by: input.requested_by ?? null,
  });
  if (error) throw error;
}

export async function logAdhocSupport(input: {
  applicationId: string;
  urgency: "urgent" | "standard";
  subject: string;
  body: string;
  opened_by_role: "candidate" | "company" | "admin";
  opened_by?: string | null;
}) {
  const { error } = await supabase.from("followup_adhoc_logs").insert({
    application_id: input.applicationId,
    urgency: input.urgency,
    subject: input.subject.trim(),
    body: input.body.trim(),
    opened_by_role: input.opened_by_role,
    opened_by: input.opened_by ?? null,
  });
  if (error) throw error;
}
