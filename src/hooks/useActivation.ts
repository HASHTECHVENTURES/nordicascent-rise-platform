import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { ADMIN_SELECTION_SELECT } from "@/hooks/useSelection";
import type { SelectionApplication } from "@/lib/selectionModule";
import {
  confirmInternshipCheckpoint,
  confirmPreArrivalCheckpoint,
  acknowledgePreInternshipPresentation,
  acceptPreInternship,
  unlockAcademicInternship,
  setUniversityCreditRequired,
  fetchActivationCms,
  confirmInPersonVisit,
  completeAcademicWorkflowStep,
  initializeAcademicWorkflow,
  initializeActivationForApplication,
  initializePreArrivalCheckpoints,
  refreshInternshipCheckpointUnlocks,
  refreshPreArrivalCheckpointUnlocks,
  submitInternshipEvaluation,
  submitFinalClearanceDecision,
  syncAllMentorCheckpoints,
  type ActivationRecord,
  type FinalClearanceDecision,
  type InternshipCheckpoint,
  type InternshipEvaluation,
  type PreArrivalCheckpoint,
  type ActivationCms,
  type InPersonVisit,
  type AcademicWorkflowStep,
} from "@/lib/activationModule";

export function useActivationRecord(applicationId: string | undefined) {
  return useQuery({
    queryKey: ["activation-record", applicationId],
    enabled: Boolean(applicationId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("activation_records")
        .select("*")
        .eq("application_id", applicationId!)
        .maybeSingle();
      if (error) throw error;
      return data as ActivationRecord | null;
    },
  });
}

export function useInternshipCheckpoints(applicationId: string | undefined) {
  return useQuery({
    queryKey: ["internship-checkpoints", applicationId],
    enabled: Boolean(applicationId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("internship_checkpoints")
        .select("*")
        .eq("application_id", applicationId!)
        .order("checkpoint_number");
      if (error) throw error;
      return (data ?? []) as InternshipCheckpoint[];
    },
  });
}

export function useEnsureActivationInitialized(applicationId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!applicationId) return;
      await initializeActivationForApplication(applicationId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["activation-record", applicationId] });
      qc.invalidateQueries({ queryKey: ["internship-checkpoints", applicationId] });
    },
  });
}

export function useSyncInternshipCheckpoints(applicationId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!applicationId) return;
      await syncAllMentorCheckpoints(applicationId);
      await refreshInternshipCheckpointUnlocks(applicationId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["internship-checkpoints", applicationId] });
      qc.invalidateQueries({ queryKey: ["activation-record", applicationId] });
    },
  });
}

export function useConfirmInternshipCheckpoint() {
  const qc = useQueryClient();
  const { profile } = useAuth();
  return useMutation({
    mutationFn: async (input: {
      checkpointId: string;
      applicationId: string;
      event_date: string;
      notes?: string;
    }) => {
      await confirmInternshipCheckpoint({
        ...input,
        confirmed_by: profile?.id ?? null,
      });
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["internship-checkpoints", vars.applicationId] });
      qc.invalidateQueries({ queryKey: ["activation-record", vars.applicationId] });
    },
  });
}

export function useInternshipEvaluation(applicationId: string | undefined, enabled = true) {
  const { profile } = useAuth();
  const canAccess =
    enabled &&
    Boolean(applicationId) &&
    (profile?.role === "admin" || profile?.role === "employer");

  return useQuery({
    queryKey: ["internship-evaluation", applicationId],
    enabled: canAccess,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("internship_evaluations")
        .select("*")
        .eq("application_id", applicationId!)
        .maybeSingle();
      if (error) throw error;
      return data as InternshipEvaluation | null;
    },
  });
}

export function useSubmitInternshipEvaluation() {
  const qc = useQueryClient();
  const { profile } = useAuth();
  return useMutation({
    mutationFn: async (input: {
      applicationId: string;
      checkpointId: string;
      event_date: string;
      technical_execution: string;
      communication: string;
      collaboration_team_fit: string;
      overall_assessment: string;
      concerns_risks: string;
    }) => {
      await submitInternshipEvaluation({
        ...input,
        submitted_by: profile?.id ?? null,
      });
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["internship-evaluation", vars.applicationId] });
      qc.invalidateQueries({ queryKey: ["internship-checkpoints", vars.applicationId] });
      qc.invalidateQueries({ queryKey: ["activation-record", vars.applicationId] });
    },
  });
}

export function useFinalClearanceDecision(applicationId: string | undefined) {
  const { profile } = useAuth();
  const canAccess =
    Boolean(applicationId) && (profile?.role === "admin" || profile?.role === "employer");

  return useQuery({
    queryKey: ["final-clearance", applicationId],
    enabled: canAccess,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("final_clearance_decisions")
        .select("*")
        .eq("application_id", applicationId!)
        .maybeSingle();
      if (error) throw error;
      return data as FinalClearanceDecision | null;
    },
  });
}

export function useSubmitFinalClearance() {
  const qc = useQueryClient();
  const { profile } = useAuth();
  return useMutation({
    mutationFn: async (input: Parameters<typeof submitFinalClearanceDecision>[0]) => {
      await submitFinalClearanceDecision({
        ...input,
        submitted_by: profile?.id ?? null,
      });
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["final-clearance", vars.applicationId] });
      qc.invalidateQueries({ queryKey: ["activation-record", vars.applicationId] });
      qc.invalidateQueries({ queryKey: ["employer-activation-applications"] });
      qc.invalidateQueries({ queryKey: ["admin-activation-applications"] });
      qc.invalidateQueries({ queryKey: ["my-activation-context"] });
      qc.invalidateQueries({ queryKey: ["pre-arrival-checkpoints", vars.applicationId] });
    },
  });
}

export function usePreArrivalCheckpoints(applicationId: string | undefined) {
  return useQuery({
    queryKey: ["pre-arrival-checkpoints", applicationId],
    enabled: Boolean(applicationId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pre_arrival_checkpoints")
        .select("*")
        .eq("application_id", applicationId!)
        .order("checkpoint_number");
      if (error) throw error;
      return (data ?? []) as PreArrivalCheckpoint[];
    },
  });
}

export function useEnsurePreArrivalInitialized(applicationId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!applicationId) return;
      await initializePreArrivalCheckpoints(applicationId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pre-arrival-checkpoints", applicationId] });
    },
  });
}

export function useRefreshPreArrivalCheckpoints(applicationId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!applicationId) return;
      await refreshPreArrivalCheckpointUnlocks(applicationId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pre-arrival-checkpoints", applicationId] });
    },
  });
}

export function useConfirmPreArrivalCheckpoint() {
  const qc = useQueryClient();
  const { profile } = useAuth();
  return useMutation({
    mutationFn: async (input: {
      checkpointId: string;
      applicationId: string;
      event_date: string;
      notes?: string;
      attachment_path?: string | null;
    }) => {
      await confirmPreArrivalCheckpoint({
        ...input,
        confirmed_by: profile?.id ?? null,
      });
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["pre-arrival-checkpoints", vars.applicationId] });
      qc.invalidateQueries({ queryKey: ["activation-record", vars.applicationId] });
      qc.invalidateQueries({ queryKey: ["my-activation-context"] });
      qc.invalidateQueries({ queryKey: ["employer-activation-applications"] });
      qc.invalidateQueries({ queryKey: ["admin-activation-applications"] });
    },
  });
}

export function useAcknowledgePreInternshipPresentation() {
  const qc = useQueryClient();
  const { profile } = useAuth();
  return useMutation({
    mutationFn: async (input: { applicationId: string }) => {
      await acknowledgePreInternshipPresentation({
        applicationId: input.applicationId,
        profileId: profile!.id,
      });
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["activation-record", vars.applicationId] });
      qc.invalidateQueries({ queryKey: ["internship-checkpoints", vars.applicationId] });
    },
  });
}

export function useAcceptPreInternship() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: acceptPreInternship,
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["activation-record", vars.applicationId] });
      qc.invalidateQueries({ queryKey: ["internship-checkpoints", vars.applicationId] });
    },
  });
}

export function useUnlockAcademicInternship() {
  const qc = useQueryClient();
  const { profile } = useAuth();
  return useMutation({
    mutationFn: async (input: { applicationId: string }) => {
      await unlockAcademicInternship({
        applicationId: input.applicationId,
        profileId: profile!.id,
      });
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["activation-record", vars.applicationId] });
      qc.invalidateQueries({ queryKey: ["internship-checkpoints", vars.applicationId] });
    },
  });
}

export function useSetUniversityCreditRequired() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: setUniversityCreditRequired,
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["activation-record", vars.applicationId] });
      qc.invalidateQueries({ queryKey: ["internship-checkpoints", vars.applicationId] });
      qc.invalidateQueries({ queryKey: ["academic-workflow", vars.applicationId] });
    },
  });
}

export function useActivationCms() {
  return useQuery({
    queryKey: ["activation-cms"],
    queryFn: fetchActivationCms,
    staleTime: 60_000,
  });
}

export function useInPersonVisit(applicationId: string | undefined) {
  return useQuery({
    queryKey: ["in-person-visit", applicationId],
    enabled: Boolean(applicationId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("activation_in_person_visits")
        .select("*")
        .eq("application_id", applicationId!)
        .maybeSingle();
      if (error) throw error;
      return data as InPersonVisit | null;
    },
  });
}

export function useConfirmInPersonVisit() {
  const qc = useQueryClient();
  const { profile } = useAuth();
  return useMutation({
    mutationFn: async (
      input: Parameters<typeof confirmInPersonVisit>[0]
    ) => {
      await confirmInPersonVisit({
        ...input,
        confirmed_by: profile?.id ?? null,
      });
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["in-person-visit", vars.applicationId] });
    },
  });
}

export function useAcademicWorkflowSteps(applicationId: string | undefined, enabled = true) {
  return useQuery({
    queryKey: ["academic-workflow", applicationId],
    enabled: Boolean(applicationId) && enabled,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("academic_workflow_steps")
        .select("*")
        .eq("application_id", applicationId!)
        .order("step_number");
      if (error) throw error;
      return (data ?? []) as AcademicWorkflowStep[];
    },
  });
}

export function useEnsureAcademicWorkflow(applicationId: string | undefined, required: boolean) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!applicationId || !required) return;
      await initializeAcademicWorkflow(applicationId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["academic-workflow", applicationId] });
    },
  });
}

export function useCompleteAcademicWorkflowStep() {
  const qc = useQueryClient();
  const { profile } = useAuth();
  return useMutation({
    mutationFn: async (input: { stepId: string; applicationId: string; notes?: string }) => {
      await completeAcademicWorkflowStep({
        ...input,
        completed_by: profile?.id ?? null,
      });
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["academic-workflow", vars.applicationId] });
      qc.invalidateQueries({ queryKey: ["activation-record", vars.applicationId] });
      qc.invalidateQueries({ queryKey: ["internship-checkpoints", vars.applicationId] });
    },
  });
}

export function useEmployerActivationApplications() {
  const { profile } = useAuth();
  return useQuery({
    queryKey: ["employer-activation-applications", profile?.id],
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
        .select(`${ADMIN_SELECTION_SELECT}, jobs!inner(company_id), candidates!inner(jobs_unlocked)`)
        .eq("jobs.company_id", employer.company_id)
        .eq("candidates.jobs_unlocked", true)
        .in("status", ["accepted", "mentor_assigned", "readiness_active", "readiness_complete", "internship", "go_no_go", "pre_arrival"])
        .order("applied_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as SelectionApplication[];
    },
  });
}

export function useAdminActivationApplications() {
  return useQuery({
    queryKey: ["admin-activation-applications"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("applications")
        .select(`${ADMIN_SELECTION_SELECT}, candidates!inner(jobs_unlocked)`)
        .eq("candidates.jobs_unlocked", true)
        .order("applied_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as SelectionApplication[];
    },
  });
}

export function useMyActivationContext() {
  const { profile } = useAuth();
  return useQuery({
    queryKey: ["my-activation-context", profile?.id],
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
        .select("id, track, jobs(title, companies(name))")
        .eq("candidate_id", candidate.id)
        .in("status", ["accepted", "mentor_assigned", "readiness_active", "readiness_complete", "internship", "go_no_go", "pre_arrival"])
        .order("applied_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!app) return null;
      return {
        applicationId: app.id as string,
        track: (app.track as string | null) ?? candidate.track,
        jobTitle: (app.jobs as { title?: string } | null)?.title,
        companyName: (app.jobs as { companies?: { name?: string } | null } | null)?.companies?.name,
      };
    },
  });
}

export { initializeActivationForApplication, syncAllMentorCheckpoints };
