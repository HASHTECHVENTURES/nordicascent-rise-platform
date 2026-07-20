import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { ADMIN_SELECTION_SELECT } from "@/hooks/useSelection";
import type { SelectionApplication } from "@/lib/selectionModule";
import {
  fetchRelocationCms,
  initializeRelocationSteps,
  refreshRelocationTimeline,
  updateFamilyRelocating,
  updatePlannedArrivalDate,
  updateRelocationCms,
  updateRelocationStep,
  uploadRelocationDocument,
  type RelocationCms,
  type RelocationStep,
  type RelocationStepState,
} from "@/lib/relocationModule";

export function useRelocationSteps(applicationId: string | undefined) {
  return useQuery({
    queryKey: ["relocation-steps", applicationId],
    enabled: Boolean(applicationId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("relocation_steps")
        .select("*")
        .eq("application_id", applicationId!)
        .order("step_number");
      if (error) throw error;
      return (data ?? []) as RelocationStep[];
    },
  });
}

/** @deprecated alias */
export const useRelocationCheckpoints = useRelocationSteps;

export function useEnsureRelocationInitialized(applicationId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (opts?: { finalClearanceDate?: string | null }) => {
      if (!applicationId) return;
      await initializeRelocationSteps(applicationId, opts);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["relocation-steps", applicationId] });
      qc.invalidateQueries({ queryKey: ["activation-record", applicationId] });
    },
  });
}

export function useRefreshRelocationTimeline(applicationId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!applicationId) return;
      await refreshRelocationTimeline(applicationId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["relocation-steps", applicationId] });
      qc.invalidateQueries({ queryKey: ["activation-record", applicationId] });
    },
  });
}

export function useUpdateRelocationStep() {
  const qc = useQueryClient();
  const { profile } = useAuth();
  return useMutation({
    mutationFn: async (input: {
      stepId: string;
      applicationId: string;
      state: RelocationStepState;
      event_date?: string | null;
      notes?: string | null;
      address?: string | null;
      contact_name?: string | null;
      upload_path?: string | null;
      file?: File | null;
      stepNumber?: number;
    }) => {
      let upload_path = input.upload_path;
      if (input.file && input.stepNumber) {
        upload_path = await uploadRelocationDocument(
          input.applicationId,
          input.stepNumber,
          input.file
        );
      }
      await updateRelocationStep({
        stepId: input.stepId,
        applicationId: input.applicationId,
        state: input.state,
        event_date: input.event_date,
        notes: input.notes,
        address: input.address,
        contact_name: input.contact_name,
        upload_path,
        updated_by: profile?.id ?? null,
      });
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["relocation-steps", vars.applicationId] });
      qc.invalidateQueries({ queryKey: ["activation-record", vars.applicationId] });
      qc.invalidateQueries({ queryKey: ["my-relocation-context"] });
      qc.invalidateQueries({ queryKey: ["employer-relocation-applications"] });
      qc.invalidateQueries({ queryKey: ["admin-relocation-applications"] });
    },
  });
}

export function useUpdatePlannedArrival() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: updatePlannedArrivalDate,
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["activation-record", vars.applicationId] });
      qc.invalidateQueries({ queryKey: ["relocation-steps", vars.applicationId] });
    },
  });
}

export function useUpdateFamilyRelocating() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: updateFamilyRelocating,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["my-relocation-context"] });
      qc.invalidateQueries({ queryKey: ["admin-relocation-applications"] });
      qc.invalidateQueries({ queryKey: ["admin-selection-application"] });
      qc.invalidateQueries({ queryKey: ["relocation-steps"] });
      qc.invalidateQueries({ queryKey: ["employer-relocation-applications"] });
    },
  });
}

export function useRelocationCms() {
  return useQuery({
    queryKey: ["relocation-cms"],
    queryFn: fetchRelocationCms,
  });
}

export function useUpdateRelocationCms() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (cms: RelocationCms) => updateRelocationCms(cms),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["relocation-cms"] });
    },
  });
}

export function useMyRelocationContext() {
  const { profile } = useAuth();
  return useQuery({
    queryKey: ["my-relocation-context", profile?.id],
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
        .in("status", ["relocation", "onboarding", "followup", "journey_complete", "pre_arrival"])
        .order("applied_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!app) return null;

      const { data: activation } = await supabase
        .from("activation_records")
        .select(
          "pre_arrival_completed_at, relocation_completed_at, final_clearance_date, planned_arrival_date, relocation_status"
        )
        .eq("application_id", app.id)
        .maybeSingle();

      return {
        applicationId: app.id as string,
        applicationStatus: app.status as string,
        track: (app.track as string | null) ?? candidate.track,
        jobTitle: (app.jobs as { title?: string } | null)?.title,
        companyName: (app.jobs as { companies?: { name?: string } | null } | null)?.companies?.name,
        preArrivalCompletedAt: activation?.pre_arrival_completed_at as string | null,
        relocationCompletedAt: activation?.relocation_completed_at as string | null,
        finalClearanceDate: activation?.final_clearance_date as string | null,
        plannedArrivalDate: activation?.planned_arrival_date as string | null,
        relocationStatus: activation?.relocation_status as string | null,
        familyRelocating: Boolean(candidate.family_relocating),
        familyMemberCount: candidate.family_member_count as number | null,
      };
    },
  });
}

export function useEmployerRelocationApplications() {
  const { profile } = useAuth();
  return useQuery({
    queryKey: ["employer-relocation-applications", profile?.id],
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
        .in("status", ["relocation", "onboarding", "pre_arrival"])
        .order("applied_at", { ascending: false });
      if (error) throw error;
      // Only those with clearance / relocation started
      const apps = (data ?? []) as SelectionApplication[];
      const withRelocation: SelectionApplication[] = [];
      for (const app of apps) {
        const { data: rec } = await supabase
          .from("activation_records")
          .select("final_clearance_date")
          .eq("application_id", app.id)
          .maybeSingle();
        if (rec?.final_clearance_date || app.status === "relocation" || app.status === "onboarding") {
          withRelocation.push(app);
        }
      }
      return withRelocation;
    },
  });
}

export function useAdminRelocationApplications() {
  return useQuery({
    queryKey: ["admin-relocation-applications"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("applications")
        .select(ADMIN_SELECTION_SELECT)
        .in("status", ["relocation", "onboarding", "pre_arrival"])
        .order("applied_at", { ascending: false });
      if (error) throw error;
      const apps = (data ?? []) as SelectionApplication[];
      const withRelocation: SelectionApplication[] = [];
      for (const app of apps) {
        const { data: rec } = await supabase
          .from("activation_records")
          .select("final_clearance_date")
          .eq("application_id", app.id)
          .maybeSingle();
        if (rec?.final_clearance_date || app.status === "relocation" || app.status === "onboarding") {
          withRelocation.push(app);
        }
      }
      return withRelocation;
    },
  });
}

export { initializeRelocationSteps, initializeRelocationSteps as initializeRelocationCheckpoints };
