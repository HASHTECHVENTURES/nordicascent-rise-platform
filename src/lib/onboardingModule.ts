import { supabase } from "@/lib/supabase";
import { APPLICATION_JOURNEY_STATUSES } from "@/lib/applicationStatusFlow";

export type OnboardingStepState = "in_progress" | "flag" | "done";
export type OnboardingResponsible =
  | "candidate"
  | "nordic_ascent"
  | "relocation_partner"
  | "real_estate"
  | "company"
  | "buddy"
  | "system";

export type OnboardingRollupStatus =
  | "onboarding_active"
  | "onboarding_flag"
  | "onboarding_complete";

export type OnboardingStep = {
  id: string;
  application_id: string;
  step_number: number;
  title: string;
  responsible: OnboardingResponsible;
  state: OnboardingStepState;
  event_date: string | null;
  event_time: string | null;
  notes: string | null;
  contact_name: string | null;
  target_due_date: string | null;
  flagged_at: string | null;
  completed_at: string | null;
  updated_by: string | null;
};

export type OnboardingChecklistItem = {
  id: string;
  application_id: string;
  item_key: string;
  title: string;
  who_confirms: "candidate" | "company" | "partner" | "nordic_ascent";
  family_only: boolean;
  state: OnboardingStepState;
  event_date: string | null;
  notes: string | null;
  target_due_date: string | null;
  flagged_at: string | null;
  completed_at: string | null;
  updated_by: string | null;
};

export const ONBOARDING_STEP_DEFS = [
  {
    step_number: 1,
    title: "Arrival in Norway",
    responsible: "candidate" as const,
    hint: "Confirmed on arrival from Module 5.",
    systemDriven: true,
  },
  {
    step_number: 2,
    title: "Airport pickup and transport",
    responsible: "nordic_ascent" as const,
    hint: "Day 1 pickup coordinated with relocation partner.",
    timeField: true,
  },
  {
    step_number: 3,
    title: "Housing move-in confirmed",
    responsible: "candidate" as const,
    hint: "Confirm move-in; flag any issues.",
  },
  {
    step_number: 4,
    title: "Administrative completion",
    responsible: "relocation_partner" as const,
    hint: "D-number, tax card, bank — Week 1.",
  },
  {
    step_number: 5,
    title: "Practical checklist tracked",
    responsible: "nordic_ascent" as const,
    hint: "Item-by-item checklist below.",
    checklistLink: true,
  },
  {
    step_number: 6,
    title: "Workplace onboarding begins",
    responsible: "company" as const,
    hint: "Company confirms workplace onboarding has started.",
    companyOwned: true,
  },
  {
    step_number: 7,
    title: "Buddy connection activated locally",
    responsible: "buddy" as const,
    hint: "INDONORD buddy — date + name.",
    contactField: true,
    contactLabel: "Buddy name",
  },
  {
    step_number: 8,
    title: "Cultural and social adjustment support",
    responsible: "buddy" as const,
    hint: "Ongoing through week 4 — no single confirmation required.",
    ongoing: true,
  },
  {
    step_number: 9,
    title: "Onboarding completion",
    responsible: "system" as const,
    hint: "Opens automatically when completion criteria are met.",
    systemDriven: true,
  },
] as const;

export type OnboardingCms = {
  step_1: string;
  step_2: string;
  step_3: string;
  step_4: string;
  step_5: string;
  step_6: string;
  step_7: string;
  step_8: string;
  step_9: string;
  contact_directory: string;
};

export const DEFAULT_ONBOARDING_CMS: OnboardingCms = {
  step_1: "You have arrived in Norway. Welcome — your first weeks of settling in start now.",
  step_2: "Airport pickup and transport to housing is being coordinated.",
  step_3: "Confirm you have moved into your housing and note any issues.",
  step_4: "Administrative items on Norwegian soil (D-number, tax, bank) are being completed.",
  step_5: "Work through your practical checklist — housing, SIM, bank, commute, and more.",
  step_6: "Your company is starting workplace onboarding — introductions, systems, and role.",
  step_7: "Your local buddy through INDONORD is being activated.",
  step_8: "Cultural and social adjustment support continues through your first month.",
  step_9: "When everything is in place, follow-up support opens automatically.",
  contact_directory: `Who to contact
• Housing / keys — Relocation / real estate partner
• Visa / D-number / tax / bank — Relocation partner
• Workplace access & role — Your company HR / team lead
• Buddy / local life — INDONORD buddy
• Anything stuck — Nordic Ascent (we follow up within 24 hours)`,
};

export function responsibleLabel(r: OnboardingResponsible): string {
  switch (r) {
    case "candidate":
      return "Candidate";
    case "nordic_ascent":
      return "Nordic Ascent";
    case "relocation_partner":
      return "Relocation partner";
    case "real_estate":
      return "Real estate";
    case "company":
      return "Company";
    case "buddy":
      return "Buddy / INDONORD";
    default:
      return "System";
  }
}

/** Candidate-facing: soften flag language */
export function candidateStepStatusLabel(state: OnboardingStepState): string {
  if (state === "done") return "Complete";
  if (state === "flag") return "Needs attention";
  return "In progress";
}

export function coordinatorStepStatusLabel(state: OnboardingStepState): string {
  switch (state) {
    case "done":
      return "Done";
    case "flag":
      return "Flag";
    default:
      return "In progress";
  }
}

export function rollupStatusLabel(status: OnboardingRollupStatus | null | undefined): string {
  switch (status) {
    case "onboarding_complete":
      return "Complete";
    case "onboarding_flag":
      return "Flagged";
    case "onboarding_active":
      return "Active";
    default:
      return "Not started";
  }
}

/** Hours since flagged_at for 24h follow-up clock */
export function flagAgeHours(flaggedAt: string | null | undefined): number | null {
  if (!flaggedAt) return null;
  const ms = Date.now() - new Date(flaggedAt).getTime();
  return Math.max(0, Math.floor(ms / (1000 * 60 * 60)));
}

export function flagClockLabel(flaggedAt: string | null | undefined): string {
  const h = flagAgeHours(flaggedAt);
  if (h === null) return "";
  if (h < 24) return `${h}h / 24h follow-up`;
  return `${h}h — overdue follow-up`;
}

export function onboardingStepProgress(steps: OnboardingStep[]) {
  const trackable = steps.filter((s) => s.step_number !== 8 && s.step_number !== 9);
  const done = trackable.filter((s) => s.state === "done").length;
  const total = trackable.length || 7;
  return { done, total, percent: total ? Math.round((done / total) * 100) : 0 };
}

export function checklistProgress(
  items: OnboardingChecklistItem[],
  familyRelocating: boolean
) {
  const visible = items.filter((i) => familyRelocating || !i.family_only);
  const done = visible.filter((i) => i.state === "done").length;
  const total = visible.length;
  return { done, total, percent: total ? Math.round((done / total) * 100) : 0 };
}

export function isOnboardingUnlocked(input: {
  onboardingStatus: string | null | undefined;
  applicationStatus: string | null | undefined;
  arrivalDate?: string | null;
}) {
  if (input.onboardingStatus || input.arrivalDate) return true;
  return (
    input.applicationStatus === APPLICATION_JOURNEY_STATUSES.ONBOARDING ||
    input.applicationStatus === APPLICATION_JOURNEY_STATUSES.FOLLOWUP ||
    input.applicationStatus === APPLICATION_JOURNEY_STATUSES.JOURNEY_COMPLETE
  );
}

export async function initializeOnboarding(
  applicationId: string,
  arrivalDate?: string | null
) {
  const { error } = await supabase.rpc("initialize_onboarding", {
    p_application_id: applicationId,
    p_arrival_date: arrivalDate ?? null,
  });
  if (error) throw error;
}

export async function refreshOnboardingTimeline(applicationId: string) {
  const { error } = await supabase.rpc("refresh_onboarding_timeline", {
    p_application_id: applicationId,
  });
  if (error) throw error;
}

export async function updateOnboardingStep(input: {
  stepId: string;
  applicationId: string;
  state: OnboardingStepState;
  event_date?: string | null;
  event_time?: string | null;
  notes?: string | null;
  contact_name?: string | null;
  updated_by?: string | null;
}) {
  const now = new Date().toISOString();
  const patch: Record<string, unknown> = {
    state: input.state,
    event_date: input.event_date ?? null,
    event_time: input.event_time ?? null,
    notes: input.notes?.trim() || null,
    contact_name: input.contact_name?.trim() || null,
    updated_by: input.updated_by ?? null,
    updated_at: now,
  };
  if (input.state === "done") {
    patch.completed_at = now;
    patch.flagged_at = null;
  } else if (input.state === "flag") {
    patch.flagged_at = now;
    patch.completed_at = null;
  } else {
    patch.completed_at = null;
    patch.flagged_at = null;
  }

  const { error } = await supabase.from("onboarding_steps").update(patch).eq("id", input.stepId);
  if (error) throw error;

  await refreshOnboardingTimeline(input.applicationId);
  const { error: completeErr } = await supabase.rpc("complete_onboarding_if_ready", {
    p_application_id: input.applicationId,
  });
  if (completeErr) throw completeErr;
}

export async function updateOnboardingChecklistItem(input: {
  itemId: string;
  applicationId: string;
  state: OnboardingStepState;
  event_date?: string | null;
  notes?: string | null;
  updated_by?: string | null;
}) {
  const now = new Date().toISOString();
  const patch: Record<string, unknown> = {
    state: input.state,
    event_date: input.event_date ?? null,
    notes: input.notes?.trim() || null,
    updated_by: input.updated_by ?? null,
    updated_at: now,
  };
  if (input.state === "done") {
    patch.completed_at = now;
    patch.flagged_at = null;
  } else if (input.state === "flag") {
    patch.flagged_at = now;
    patch.completed_at = null;
  } else {
    patch.completed_at = null;
    patch.flagged_at = null;
  }

  const { error } = await supabase
    .from("onboarding_checklist_items")
    .update(patch)
    .eq("id", input.itemId);
  if (error) throw error;

  await refreshOnboardingTimeline(input.applicationId);
  const { error: completeErr } = await supabase.rpc("complete_onboarding_if_ready", {
    p_application_id: input.applicationId,
  });
  if (completeErr) throw completeErr;
}

export async function fetchOnboardingCms(): Promise<OnboardingCms> {
  const { data, error } = await supabase.rpc("get_onboarding_cms");
  if (error) throw error;
  const cms = (data ?? {}) as Partial<OnboardingCms>;
  return { ...DEFAULT_ONBOARDING_CMS, ...cms };
}

export async function updateOnboardingCms(cms: OnboardingCms) {
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
      settings: { ...settings, onboardingCms: cms },
      updated_at: new Date().toISOString(),
    })
    .eq("id", "default");
  if (error) throw error;
}
