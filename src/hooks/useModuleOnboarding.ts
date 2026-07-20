import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { ADMIN_SELECTION_SELECT } from "@/hooks/useSelection";
import type { SelectionApplication } from "@/lib/selectionModule";
import {
  fetchOnboardingCms,
  initializeOnboarding,
  refreshOnboardingTimeline,
  updateOnboardingChecklistItem,
  updateOnboardingCms,
  updateOnboardingStep,
  type OnboardingChecklistItem,
  type OnboardingCms,
  type OnboardingStep,
  type OnboardingStepState,
} from "@/lib/onboardingModule";

function invalidateOnboarding(qc: ReturnType<typeof useQueryClient>, applicationId?: string) {
  if (applicationId) {
    qc.invalidateQueries({ queryKey: ["onboarding-steps", applicationId] });
    qc.invalidateQueries({ queryKey: ["onboarding-checklist", applicationId] });
    qc.invalidateQueries({ queryKey: ["activation-record", applicationId] });
  }
  qc.invalidateQueries({ queryKey: ["my-onboarding-context"] });
  qc.invalidateQueries({ queryKey: ["admin-onboarding-applications"] });
  qc.invalidateQueries({ queryKey: ["employer-onboarding-applications"] });
}

export function useOnboardingSteps(applicationId: string | undefined) {
  return useQuery({
    queryKey: ["onboarding-steps", applicationId],
    enabled: Boolean(applicationId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("onboarding_steps")
        .select("*")
        .eq("application_id", applicationId!)
        .order("step_number");
      if (error) throw error;
      return (data ?? []) as OnboardingStep[];
    },
  });
}

export function useOnboardingChecklist(applicationId: string | undefined) {
  return useQuery({
    queryKey: ["onboarding-checklist", applicationId],
    enabled: Boolean(applicationId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("onboarding_checklist_items")
        .select("*")
        .eq("application_id", applicationId!)
        .order("item_key");
      if (error) throw error;
      return (data ?? []) as OnboardingChecklistItem[];
    },
  });
}

export function useEnsureOnboardingInitialized(applicationId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (arrivalDate?: string | null) => {
      if (!applicationId) return;
      await initializeOnboarding(applicationId, arrivalDate);
    },
    onSuccess: () => invalidateOnboarding(qc, applicationId),
  });
}

export function useRefreshOnboardingTimeline(applicationId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!applicationId) return;
      await refreshOnboardingTimeline(applicationId);
    },
    onSuccess: () => invalidateOnboarding(qc, applicationId),
  });
}

export function useUpdateOnboardingStep() {
  const qc = useQueryClient();
  const { profile } = useAuth();
  return useMutation({
    mutationFn: async (input: {
      stepId: string;
      applicationId: string;
      state: OnboardingStepState;
      event_date?: string | null;
      event_time?: string | null;
      notes?: string | null;
      contact_name?: string | null;
    }) => {
      await updateOnboardingStep({
        ...input,
        updated_by: profile?.id ?? null,
      });
    },
    onSuccess: (_, vars) => invalidateOnboarding(qc, vars.applicationId),
  });
}

export function useUpdateOnboardingChecklistItem() {
  const qc = useQueryClient();
  const { profile } = useAuth();
  return useMutation({
    mutationFn: async (input: {
      itemId: string;
      applicationId: string;
      state: OnboardingStepState;
      event_date?: string | null;
      notes?: string | null;
    }) => {
      await updateOnboardingChecklistItem({
        ...input,
        updated_by: profile?.id ?? null,
      });
    },
    onSuccess: (_, vars) => invalidateOnboarding(qc, vars.applicationId),
  });
}

export function useOnboardingCms() {
  return useQuery({
    queryKey: ["onboarding-cms"],
    queryFn: fetchOnboardingCms,
  });
}

export function useUpdateOnboardingCms() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (cms: OnboardingCms) => updateOnboardingCms(cms),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["onboarding-cms"] }),
  });
}

export function useMyOnboardingContext() {
  const { profile } = useAuth();
  return useQuery({
    queryKey: ["my-onboarding-context", profile?.id],
    enabled: profile?.role === "candidate",
    queryFn: async () => {
      const { data: candidate } = await supabase
        .from("candidates")
        .select("id, jobs_unlocked, track, family_relocating, family_member_count")
        .eq("profile_id", profile!.id)
        .maybeSingle();
      if (!candidate?.jobs_unlocked) return null;

      const { data: app } = await supabase
        .from("applications")
        .select("id, status, track, jobs(title, companies(name))")
        .eq("candidate_id", candidate.id)
        .in("status", ["onboarding", "followup", "journey_complete"])
        .order("applied_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!app) return null;

      const { data: activation } = await supabase
        .from("activation_records")
        .select(
          "arrival_date, onboarding_status, onboarding_completed_at, planned_arrival_date, relocation_status"
        )
        .eq("application_id", app.id)
        .maybeSingle();

      return {
        applicationId: app.id as string,
        applicationStatus: app.status as string,
        track: (app.track as string | null) ?? candidate.track,
        jobTitle: (app.jobs as { title?: string } | null)?.title,
        companyName: (app.jobs as { companies?: { name?: string } | null } | null)?.companies
          ?.name,
        arrivalDate: activation?.arrival_date as string | null,
        onboardingStatus: activation?.onboarding_status as string | null,
        onboardingCompletedAt: activation?.onboarding_completed_at as string | null,
        familyRelocating: Boolean(candidate.family_relocating),
        familyMemberCount: candidate.family_member_count as number | null,
      };
    },
  });
}

async function filterOnboardingApps(apps: SelectionApplication[]) {
  const out: SelectionApplication[] = [];
  for (const app of apps) {
    if (app.status === "onboarding" || app.status === "followup") {
      out.push(app);
      continue;
    }
    const { data: rec } = await supabase
      .from("activation_records")
      .select("onboarding_status, arrival_date")
      .eq("application_id", app.id)
      .maybeSingle();
    if (rec?.onboarding_status || rec?.arrival_date) out.push(app);
  }
  return out;
}

export function useEmployerOnboardingApplications() {
  const { profile } = useAuth();
  return useQuery({
    queryKey: ["employer-onboarding-applications", profile?.id],
    enabled: profile?.role === "employer",
    queryFn: async () => {
      const { data: employer } = await supabase
        .from("employers")
        .select("company_id")
        .eq("profile_id", profile!.id)
        .single();
      if (!employer) return [];

      const { data, error } = await supabase
        .from("applications")
        .select(`${ADMIN_SELECTION_SELECT}, jobs!inner(company_id)`)
        .eq("jobs.company_id", employer.company_id)
        .in("status", ["onboarding", "followup"])
        .order("applied_at", { ascending: false });
      if (error) throw error;
      return filterOnboardingApps((data ?? []) as SelectionApplication[]);
    },
  });
}

export function useAdminOnboardingApplications() {
  return useQuery({
    queryKey: ["admin-onboarding-applications"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("applications")
        .select(ADMIN_SELECTION_SELECT)
        .in("status", ["onboarding", "followup"])
        .order("applied_at", { ascending: false });
      if (error) throw error;
      return filterOnboardingApps((data ?? []) as SelectionApplication[]);
    },
  });
}
