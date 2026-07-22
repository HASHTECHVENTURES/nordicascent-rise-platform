import { supabase } from "@/lib/supabase";
import { APPLICATION_JOURNEY_STATUSES } from "@/lib/applicationStatusFlow";

export type RelocationStepState = "on_track" | "at_risk" | "blocked" | "done";
export type RelocationOwnerLayer =
  | "nordic_ascent"
  | "relocation_partner"
  | "language_partner"
  | "real_estate"
  | "none";

export type RelocationRollupStatus =
  | "relocation_active"
  | "relocation_at_risk"
  | "relocation_blocked"
  | "arrived";

export type RelocationStep = {
  id: string;
  application_id: string;
  step_number: number;
  title: string;
  owner_layer: RelocationOwnerLayer;
  state: RelocationStepState;
  event_date: string | null;
  notes: string | null;
  upload_path: string | null;
  address: string | null;
  contact_name: string | null;
  target_due_date: string | null;
  completed_at: string | null;
  updated_by: string | null;
  created_at?: string;
  updated_at?: string;
};

export const RELOCATION_STEP_DEFS = [
  {
    step_number: 1,
    title: "Contract signed, process initiated",
    owner_layer: "nordic_ascent" as const,
    hint: "Employment contract signed; relocation coordination started.",
    allowsUpload: true,
    uploadLabel: "Signed contract",
  },
  {
    step_number: 2,
    title: "Visa / immigration",
    owner_layer: "relocation_partner" as const,
    hint: "Work permit and visa steps with the relocation partner.",
  },
  {
    step_number: 3,
    title: "Norwegian A1 begins",
    owner_layer: "language_partner" as const,
    hint: "Language course starts within two weeks of clearance.",
  },
  {
    step_number: 4,
    title: "Pre-arrival preparation",
    owner_layer: "relocation_partner" as const,
    hint: "Partner-led prep running in parallel with visa and A1.",
  },
  {
    step_number: 5,
    title: "Housing",
    owner_layer: "real_estate" as const,
    hint: "Accommodation arranged 4–8 weeks before arrival.",
    addressField: true,
  },
  {
    step_number: 6,
    title: "Admin setup (D-number, tax, bank)",
    owner_layer: "relocation_partner" as const,
    hint: "Administrative setup around arrival.",
  },
  {
    step_number: 7,
    title: "Family support",
    owner_layer: "nordic_ascent" as const,
    hint: "Family relocation support — only when family is relocating.",
    familyOnly: true,
    notesRequired: true,
    notesLabel: "Family support needs",
  },
  {
    step_number: 8,
    title: "Buddy (INDONORD)",
    owner_layer: "nordic_ascent" as const,
    hint: "Local buddy match 2–3 weeks before arrival.",
    contactField: true,
    contactLabel: "Buddy name / contact",
  },
  {
    step_number: 9,
    title: "Final prep + employer toolkit",
    owner_layer: "nordic_ascent" as const,
    hint: "Arrival guide and employer onboarding toolkit 1–2 weeks before.",
    toolkitVisible: true,
  },
  {
    step_number: 10,
    title: "Arrival confirmed",
    owner_layer: "none" as const,
    hint: "Confirm arrival day — opens Module 6 onboarding.",
  },
] as const;

export type RelocationCms = {
  step_1: string;
  step_2: string;
  step_3: string;
  step_4: string;
  step_5: string;
  step_6: string;
  step_7: string;
  step_8: string;
  step_9: string;
  step_10: string;
};

export const DEFAULT_RELOCATION_CMS: RelocationCms = {
  step_1: "Your employment contract is signed and relocation coordination has started.",
  step_2: "Your visa and immigration process is underway with our relocation partner.",
  step_3: "Your Norwegian A1 language course is starting.",
  step_4: "Pre-arrival preparation is in progress with the relocation partner.",
  step_5: "Housing arrangements are being made for your arrival.",
  step_6: "Administrative setup (D-number, tax, bank) is being prepared.",
  step_7: "Family support is being coordinated for your accompanying family members.",
  step_8: "You will be connected with a local buddy through INDONORD.",
  step_9: "Final arrival guide and employer onboarding toolkit are being prepared.",
  step_10: "Confirm your arrival in Norway — onboarding starts next.",
};

export function ownerLayerLabel(layer: RelocationOwnerLayer): string {
  switch (layer) {
    case "nordic_ascent":
      return "Nordic Ascent";
    case "relocation_partner":
      return "Relocation partner";
    case "language_partner":
      return "Language partner";
    case "real_estate":
      return "Real estate";
    default:
      return "—";
  }
}

/** Candidate-facing: never show at_risk / blocked labels */
export function candidateStepStatusLabel(state: RelocationStepState): string {
  if (state === "done") return "Complete";
  return "In progress";
}

export function coordinatorStepStatusLabel(state: RelocationStepState): string {
  switch (state) {
    case "done":
      return "Done";
    case "at_risk":
      return "At risk";
    case "blocked":
      return "Blocked";
    default:
      return "On track";
  }
}

export function rollupStatusLabel(status: RelocationRollupStatus | null | undefined): string {
  switch (status) {
    case "arrived":
      return "Arrived";
    case "relocation_blocked":
      return "Blocked";
    case "relocation_at_risk":
      return "At risk";
    case "relocation_active":
      return "Active";
    default:
      return "Not started";
  }
}

export function deriveRelocationStatus(steps: RelocationStep[]): RelocationRollupStatus {
  if (steps.some((s) => s.step_number === 10 && s.state === "done")) return "arrived";
  if (steps.some((s) => s.state === "blocked" && s.step_number !== 7)) return "relocation_blocked";
  if (steps.some((s) => s.state === "at_risk")) return "relocation_at_risk";
  return "relocation_active";
}

export function relocationStepProgress(
  steps: RelocationStep[],
  familyRelocating: boolean
) {
  const visible = steps.filter((s) => familyRelocating || s.step_number !== 7);
  const done = visible.filter((s) => s.state === "done").length;
  const total = visible.length || (familyRelocating ? 10 : 9);
  return { done, total, percent: total ? Math.round((done / total) * 100) : 0 };
}

export function isRelocationUnlocked(input: {
  finalClearanceDate: string | null | undefined;
  applicationStatus: string | null | undefined;
  activationStatus?: string | null | undefined;
}) {
  const statusOk =
    input.applicationStatus === APPLICATION_JOURNEY_STATUSES.PRE_ARRIVAL ||
    input.applicationStatus === APPLICATION_JOURNEY_STATUSES.RELOCATION ||
    input.applicationStatus === APPLICATION_JOURNEY_STATUSES.ONBOARDING ||
    input.applicationStatus === APPLICATION_JOURNEY_STATUSES.FOLLOWUP ||
    input.applicationStatus === APPLICATION_JOURNEY_STATUSES.JOURNEY_COMPLETE;

  if (statusOk) return true;
  if (input.activationStatus === "cleared" && input.finalClearanceDate) return true;
  return false;
}

export async function initializeRelocationSteps(
  applicationId: string,
  opts?: { finalClearanceDate?: string | null; plannedArrivalDate?: string | null }
) {
  const clearance = opts?.finalClearanceDate ?? new Date().toISOString().slice(0, 10);

  const { error } = await supabase.rpc("initialize_relocation_after_clearance", {
    p_application_id: applicationId,
    p_clearance_date: clearance,
  });
  if (error) throw error;

  if (opts?.plannedArrivalDate) {
    const { error: arrivalErr } = await supabase
      .from("activation_records")
      .update({
        planned_arrival_date: opts.plannedArrivalDate,
        updated_at: new Date().toISOString(),
      })
      .eq("application_id", applicationId);
    if (arrivalErr) throw arrivalErr;
    await refreshRelocationTimeline(applicationId);
  }
}

function addDays(isoDate: string, days: number): string {
  const d = new Date(`${isoDate}T12:00:00`);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export function computeTargetDueDate(
  stepNumber: number,
  clearance: string | null,
  arrival: string | null
): string | null {
  if (stepNumber === 1) return clearance;
  if (!clearance && [2, 3, 4].includes(stepNumber)) return null;
  if (stepNumber === 2 || stepNumber === 4) return clearance ? addDays(clearance, 21) : null;
  if (stepNumber === 3) return clearance ? addDays(clearance, 14) : null;
  if (!arrival) return null;
  if (stepNumber === 5) return addDays(arrival, -28);
  if (stepNumber === 6 || stepNumber === 10) return arrival;
  if (stepNumber === 8) return addDays(arrival, -21);
  if (stepNumber === 9) return addDays(arrival, -14);
  return null;
}

export async function refreshRelocationTimeline(applicationId: string) {
  const { error } = await supabase.rpc("refresh_relocation_timeline", {
    p_application_id: applicationId,
  });
  if (error) throw error;
}

export async function updatePlannedArrivalDate(input: {
  applicationId: string;
  plannedArrivalDate: string | null;
}) {
  const { error } = await supabase
    .from("activation_records")
    .update({
      planned_arrival_date: input.plannedArrivalDate,
      updated_at: new Date().toISOString(),
    })
    .eq("application_id", input.applicationId);
  if (error) throw error;
  await refreshRelocationTimeline(input.applicationId);
}

export async function updateFamilyRelocating(input: {
  candidateId: string;
  familyRelocating: boolean;
  familyMemberCount?: number | null;
  applicationId?: string;
}) {
  const { error } = await supabase
    .from("candidates")
    .update({
      family_relocating: input.familyRelocating,
      family_member_count: input.familyRelocating
        ? (input.familyMemberCount ?? null)
        : null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", input.candidateId);
  if (error) throw error;
  if (input.applicationId) {
    await refreshRelocationTimeline(input.applicationId);
  }
}

export async function updateRelocationStep(input: {
  stepId: string;
  applicationId: string;
  state: RelocationStepState;
  event_date?: string | null;
  notes?: string | null;
  address?: string | null;
  contact_name?: string | null;
  upload_path?: string | null;
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
  if (input.address !== undefined) patch.address = input.address?.trim() || null;
  if (input.contact_name !== undefined) patch.contact_name = input.contact_name?.trim() || null;
  if (input.upload_path !== undefined) patch.upload_path = input.upload_path;
  if (input.state === "done") {
    patch.completed_at = now;
  } else {
    patch.completed_at = null;
  }

  const { error } = await supabase.from("relocation_steps").update(patch).eq("id", input.stepId);
  if (error) throw error;

  await refreshRelocationTimeline(input.applicationId);

  if (input.state === "done") {
    const { data: step } = await supabase
      .from("relocation_steps")
      .select("step_number")
      .eq("id", input.stepId)
      .maybeSingle();
    if (step?.step_number === 10) {
      const { error: arriveErr } = await supabase.rpc("complete_relocation_on_arrival", {
        p_application_id: input.applicationId,
      });
      if (arriveErr) throw arriveErr;
    }
  }
}

export async function uploadRelocationDocument(
  applicationId: string,
  stepNumber: number,
  file: File
) {
  const ext = file.name.split(".").pop() || "pdf";
  const path = `relocation/${applicationId}/step-${stepNumber}-${Date.now()}.${ext}`;
  const { error } = await supabase.storage.from("documents").upload(path, file, {
    contentType: file.type || "application/pdf",
    upsert: false,
  });
  if (error) throw error;
  return path;
}

export async function fetchRelocationCms(): Promise<RelocationCms> {
  const { data, error } = await supabase.rpc("get_relocation_cms");
  if (error) throw error;
  const cms = (data ?? {}) as Partial<RelocationCms>;
  return { ...DEFAULT_RELOCATION_CMS, ...cms };
}

export async function updateRelocationCms(cms: RelocationCms) {
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
      settings: { ...settings, relocationCms: cms },
      updated_at: new Date().toISOString(),
    })
    .eq("id", "default");
  if (error) throw error;
}

/** @deprecated use initializeRelocationSteps */
export const initializeRelocationCheckpoints = initializeRelocationSteps;
