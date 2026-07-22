import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
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
  updateActivationCms,
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
  const { profile } = useAuth();
  return useQuery({
    queryKey: ["activation-record", applicationId, profile?.role],
    enabled: Boolean(applicationId),
    queryFn: async () => {
      // Mask followup_status / at_risk_* for non-admin (RLS-hard via RPC)
      const { data, error } = await supabase.rpc("get_activation_record_for_viewer", {
        p_application_id: applicationId!,
      });
      if (error) {
        // Fallback for environments without the hardening RPC yet
        const { data: row, error: fallbackErr } = await supabase
          .from("activation_records")
          .select("*")
          .eq("application_id", applicationId!)
          .maybeSingle();
        if (fallbackErr) throw fallbackErr;
        if (profile?.role !== "admin" && row) {
          const masked = { ...(row as ActivationRecord) };
          masked.followup_status = null;
          masked.at_risk_retention = false;
          masked.at_risk_retention_at = null;
          return masked;
        }
        return row as ActivationRecord | null;
      }
      if (!data) return null;
      return data as ActivationRecord;
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
      try {
        await syncAllMentorCheckpoints(applicationId);
      } catch {
        // Mentor sync must not block gate-based unlock refresh
      }
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
      qc.invalidateQueries({ queryKey: ["relocation-steps", vars.applicationId] });
      qc.invalidateQueries({ queryKey: ["my-relocation-context"] });
      qc.invalidateQueries({ queryKey: ["employer-relocation-applications"] });
      qc.invalidateQueries({ queryKey: ["admin-relocation-applications"] });
      qc.invalidateQueries({ queryKey: ["my-stage-progress"] });
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
    onMutate: async (vars) => {
      await qc.cancelQueries({ queryKey: ["activation-record", vars.applicationId] });
      const key = ["activation-record", vars.applicationId, profile?.role] as const;
      const previous = qc.getQueryData<ActivationRecord | null>(key);
      if (previous) {
        qc.setQueryData<ActivationRecord>(key, {
          ...previous,
          presentation_acknowledged_at: previous.presentation_acknowledged_at ?? new Date().toISOString(),
          presentation_acknowledged_by: previous.presentation_acknowledged_by ?? profile?.id ?? null,
        });
      }
      return { previous, key };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous !== undefined) {
        qc.setQueryData(ctx.key, ctx.previous);
      }
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
    mutationFn: async (input: Parameters<typeof acceptPreInternship>[0]) => {
      await acceptPreInternship(input);
      // Explicit second pass so UI never stays locked if accept raced init
      await refreshInternshipCheckpointUnlocks(input.applicationId);
    },
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

export function useUpdateActivationCms() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: updateActivationCms,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["activation-cms"] });
    },
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

/** Employer activation list — use !inner embeds (do not stack on ADMIN_SELECTION_SELECT). */
const EMPLOYER_ACTIVATION_SELECT = `
  *,
  jobs!inner(id, title, positions_count, target_track, company_id, core_skills, engineering_discipline, experience_level, requirements, companies(id, name)),
  candidates!inner(
    id, profile_id, full_name, track, university_id, university_waitlist_name,
    gpa_or_standing, field_of_study, cv_url, family_relocating, family_member_count, jobs_unlocked,
    profiles(full_name, email, phone, avatar_url)
  )
`;

const ADMIN_ACTIVATION_SELECT = `
  *,
  jobs(id, title, positions_count, target_track, company_id, core_skills, engineering_discipline, experience_level, requirements, companies(id, name)),
  candidates!inner(
    id, profile_id, full_name, track, university_id, university_waitlist_name,
    gpa_or_standing, field_of_study, cv_url, family_relocating, family_member_count, jobs_unlocked,
    profiles(full_name, email, phone, avatar_url)
  )
`;

export function useEmployerActivationApplications() {
  const { profile } = useAuth();
  return useQuery({
    queryKey: ["employer-activation-applications", profile?.id],
    enabled: profile?.role === "employer",
    queryFn: async () => {
      const { data: employer, error: employerError } = await supabase
        .from("employers")
        .select("company_id")
        .eq("profile_id", profile!.id)
        .maybeSingle();
      if (employerError) throw employerError;
      if (!employer?.company_id) return [];

      const { data, error } = await supabase
        .from("applications")
        .select(EMPLOYER_ACTIVATION_SELECT)
        .eq("jobs.company_id", employer.company_id)
        .eq("candidates.jobs_unlocked", true)
        .in("status", [
          "accepted",
          "mentor_assigned",
          "readiness_active",
          "readiness_complete",
          "internship",
          "go_no_go",
          "pre_arrival",
          "relocation",
        ])
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
        .select(ADMIN_ACTIVATION_SELECT)
        .eq("candidates.jobs_unlocked", true)
        .in("status", [
          "accepted",
          "mentor_assigned",
          "readiness_active",
          "readiness_complete",
          "internship",
          "go_no_go",
          "pre_arrival",
          "relocation",
        ])
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
        .in("status", ["accepted", "mentor_assigned", "readiness_active", "readiness_complete", "internship", "go_no_go", "pre_arrival", "relocation"])
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
