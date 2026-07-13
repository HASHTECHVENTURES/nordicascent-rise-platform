import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { ADMIN_SELECTION_SELECT } from "@/hooks/useSelection";
import type { SelectionApplication } from "@/lib/selectionModule";
import {
  confirmRelocationCheckpoint,
  initializeRelocationCheckpoints,
  refreshRelocationCheckpointUnlocks,
  type RelocationCheckpoint,
} from "@/lib/relocationModule";

export function useRelocationCheckpoints(applicationId: string | undefined) {
  return useQuery({
    queryKey: ["relocation-checkpoints", applicationId],
    enabled: Boolean(applicationId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("relocation_checkpoints")
        .select("*")
        .eq("application_id", applicationId!)
        .order("checkpoint_number");
      if (error) throw error;
      return (data ?? []) as RelocationCheckpoint[];
    },
  });
}

export function useEnsureRelocationInitialized(applicationId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!applicationId) return;
      await initializeRelocationCheckpoints(applicationId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["relocation-checkpoints", applicationId] });
    },
  });
}

export function useRefreshRelocationCheckpoints(applicationId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!applicationId) return;
      await refreshRelocationCheckpointUnlocks(applicationId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["relocation-checkpoints", applicationId] });
    },
  });
}

export function useConfirmRelocationCheckpoint() {
  const qc = useQueryClient();
  const { profile } = useAuth();
  return useMutation({
    mutationFn: async (input: {
      checkpointId: string;
      applicationId: string;
      event_date: string;
      notes?: string;
    }) => {
      await confirmRelocationCheckpoint({
        ...input,
        confirmed_by: profile?.id ?? null,
      });
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["relocation-checkpoints", vars.applicationId] });
      qc.invalidateQueries({ queryKey: ["activation-record", vars.applicationId] });
      qc.invalidateQueries({ queryKey: ["my-relocation-context"] });
      qc.invalidateQueries({ queryKey: ["employer-relocation-applications"] });
      qc.invalidateQueries({ queryKey: ["admin-relocation-applications"] });
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
        .select("id, jobs_unlocked, track")
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
        .select("pre_arrival_completed_at, relocation_completed_at")
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
        .in("status", ["relocation", "onboarding"])
        .order("applied_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as SelectionApplication[];
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
        .in("status", ["relocation", "onboarding"])
        .order("applied_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as SelectionApplication[];
    },
  });
}

export { initializeRelocationCheckpoints };
