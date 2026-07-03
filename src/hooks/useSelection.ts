import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import {
  SELECTION_STATUSES,
  computeEligibilityAutoChecks,
  canSelectMoreForJob,
  getNextStatusAfterDecision,
  getNextStepAfterPass,
  getSelectionStepFromStatus,
  maxSelectionsForJob,
  type BoardDecision,
  type SelectionApplication,
  type SelectionStepId,
  type StepDecision,
} from "@/lib/selectionModule";
import { onHoldCandidateActivated, onSelectionStatusChange } from "@/lib/selectionEffects";
import { APPLICATION_JOURNEY_STATUSES } from "@/lib/applicationStatusFlow";

const ADMIN_SELECTION_SELECT = `
  *,
  jobs(id, title, positions_count, target_track, company_id, core_skills, engineering_discipline, experience_level, requirements, companies(id, name)),
  candidates(
    id, profile_id, full_name, track, university_id, university_waitlist_name,
    gpa_or_standing, field_of_study, cv_url,
    profiles(full_name, email, phone, avatar_url)
  )
`;

export function useAdminSelectionJobs() {
  return useQuery({
    queryKey: ["admin-selection-jobs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("jobs")
        .select("id, title, status, positions_count, companies(name)")
        .in("status", ["open", "closed"])
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useAdminJobSelectionApplications(jobId: string | undefined, stepFilter?: SelectionStepId | "all") {
  return useQuery({
    queryKey: ["admin-selection-applications", jobId, stepFilter],
    enabled: Boolean(jobId),
    queryFn: async () => {
      let query = supabase
        .from("applications")
        .select(ADMIN_SELECTION_SELECT)
        .eq("job_id", jobId!)
        .order("applied_at", { ascending: false });

      const { data, error } = await query;
      if (error) throw error;

      const apps = (data ?? []) as SelectionApplication[];
      if (stepFilter === "all" || !stepFilter) return apps;
      return apps.filter((a) => getSelectionStepFromStatus(a.status, a.selection_step) === stepFilter);
    },
  });
}

export function useAdminSelectionApplication(applicationId: string | undefined) {
  return useQuery({
    queryKey: ["admin-selection-application", applicationId],
    enabled: Boolean(applicationId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("applications")
        .select(ADMIN_SELECTION_SELECT)
        .eq("id", applicationId!)
        .single();
      if (error) throw error;
      return data as SelectionApplication;
    },
  });
}

export function useEmployerSelectionApplications(jobId?: string) {
  return useQuery({
    queryKey: ["employer-selection-applications", jobId],
    queryFn: async () => {
      let query = supabase
        .from("applications")
        .select(ADMIN_SELECTION_SELECT)
        .gte("selection_step", 3)
        .order("applied_at", { ascending: false });
      if (jobId) query = query.eq("job_id", jobId);
      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []) as SelectionApplication[];
    },
  });
}

export function useEmployerSelectionApplication(applicationId: string | undefined) {
  return useQuery({
    queryKey: ["employer-selection-application", applicationId],
    enabled: Boolean(applicationId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("applications")
        .select(ADMIN_SELECTION_SELECT)
        .eq("id", applicationId!)
        .single();
      if (error) throw error;
      return data as SelectionApplication;
    },
  });
}

type StepDecisionInput = {
  applicationId: string;
  step: SelectionStepId;
  decision: StepDecision;
  fields?: Record<string, unknown>;
};

export function useSelectionStepDecision() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ applicationId, step, decision, fields = {} }: StepDecisionInput) => {
      const { data: app, error: fetchErr } = await supabase
        .from("applications")
        .select(ADMIN_SELECTION_SELECT)
        .eq("id", applicationId)
        .single();
      if (fetchErr) throw fetchErr;
      const row = app as SelectionApplication;

      const currentStep = getSelectionStepFromStatus(row.status, row.selection_step);
      if (currentStep !== step && !row.status.endsWith("_review")) {
        throw new Error("This application is not at the requested step.");
      }

      const newStatus = getNextStatusAfterDecision(step, decision);
      const now = new Date().toISOString();
      const updates: Record<string, unknown> = {
        ...fields,
        status: newStatus,
        needs_action: decision === "review",
        updated_at: now,
      };

      let companyRejectReason: string | null = null;
      if (decision === "reject") {
        if (step === 3) {
          companyRejectReason =
            (typeof fields.technical_assessor_notes === "string"
              ? fields.technical_assessor_notes.trim()
              : row.technical_assessor_notes?.trim()) || null;
        } else if (step === 4) {
          companyRejectReason =
            (typeof fields.motivation_session_notes === "string"
              ? fields.motivation_session_notes.trim()
              : row.motivation_session_notes?.trim()) || null;
        }
      }

      if (decision === "pass") {
        updates.selection_step = getNextStepAfterPass(step);
        updates.selection_step_entered_at = now;
      } else if (decision === "reject") {
        updates.selection_step = step;
      }

      if (step === 1) updates.eligibility_decided_at = now;
      if (step === 2) updates.offee_decided_at = now;
      if (step === 3) updates.technical_decided_at = now;
      if (step === 4) updates.motivation_decided_at = now;

      const { error } = await supabase.from("applications").update(updates).eq("id", applicationId);
      if (error) throw error;

      return { app: row, newStatus, step, decision, companyRejectReason, fields };
    },
    onSuccess: async ({ app, newStatus, step, decision, companyRejectReason, fields }) => {
      qc.invalidateQueries({ queryKey: ["admin-selection-applications"] });
      qc.invalidateQueries({ queryKey: ["admin-selection-application"] });
      qc.invalidateQueries({ queryKey: ["employer-selection-applications"] });
      qc.invalidateQueries({ queryKey: ["my-applications"] });
      qc.invalidateQueries({ queryKey: ["notifications"] });

      const profile = app.candidates?.profiles;
      const jobTitle = app.jobs?.title ?? "the role";
      if (profile?.id) {
        await onSelectionStatusChange(
          {
            applicationId: app.id,
            candidateId: app.candidate_id,
            profileId: profile.id,
            jobId: app.job_id,
            jobTitle,
            companyId: app.jobs?.company_id ?? null,
            step,
            decision,
            newStatus,
            companyParticipatedStep3: Boolean(
              fields.technical_company_participated ?? app.technical_company_participated
            ),
            companyParticipatedStep4: Boolean(
              fields.motivation_company_participated ?? app.motivation_company_participated
            ),
          },
          companyRejectReason
        );
      }
    },
  });
}

export function useSelectionBoardDecision() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      applicationId,
      adminRecommendation,
      adminReason,
      companyDecision,
    }: {
      applicationId: string;
      adminRecommendation: "recommended" | "not_recommended";
      adminReason: string;
      companyDecision: BoardDecision;
    }) => {
      const now = new Date().toISOString();
      let status: string;
      if (companyDecision === "selected") status = SELECTION_STATUSES.SELECTED_FOR_READINESS;
      else if (companyDecision === "hold") status = SELECTION_STATUSES.SELECTION_HOLD;
      else status = SELECTION_STATUSES.SELECTION_REJECTED;

      const { data: app, error: fetchErr } = await supabase
        .from("applications")
        .select(ADMIN_SELECTION_SELECT)
        .eq("id", applicationId)
        .single();
      if (fetchErr) throw fetchErr;

      const row = app as SelectionApplication;

      if (companyDecision === "selected") {
        const { data: jobApps, error: countErr } = await supabase
          .from("applications")
          .select("id, status, board_company_decision")
          .eq("job_id", row.job_id);
        if (countErr) throw countErr;
        const others = (jobApps ?? []).filter((a) => a.id !== applicationId);
        if (!canSelectMoreForJob(others, row.jobs?.positions_count)) {
          throw new Error(
            `This job already has ${maxSelectionsForJob(row.jobs?.positions_count)} selected candidates (maximum for this role).`
          );
        }
      }

      const { error } = await supabase
        .from("applications")
        .update({
          board_admin_recommendation: adminRecommendation,
          board_admin_reason: adminReason.trim() || null,
          board_company_decision: companyDecision,
          board_decided_at: now,
          status,
          selection_step: 5,
          needs_action: false,
          updated_at: now,
        })
        .eq("id", applicationId);
      if (error) throw error;

      return { app: app as SelectionApplication, status, companyDecision };
    },
    onSuccess: async ({ app, status, companyDecision }) => {
      qc.invalidateQueries({ queryKey: ["admin-selection-applications"] });
      qc.invalidateQueries({ queryKey: ["admin-selection-application"] });
      qc.invalidateQueries({ queryKey: ["employer-selection-applications"] });
      qc.invalidateQueries({ queryKey: ["my-applications"] });
      qc.invalidateQueries({ queryKey: ["notifications"] });

      const profile = app.candidates?.profiles;
      if (!profile?.id) return;
      await onSelectionStatusChange(
        {
          applicationId: app.id,
          candidateId: app.candidate_id,
          profileId: profile.id,
          jobId: app.job_id,
          jobTitle: app.jobs?.title ?? "the role",
          companyId: app.jobs?.company_id ?? null,
          step: 5,
          decision: companyDecision === "hold" ? "review" : companyDecision === "selected" ? "pass" : "reject",
          newStatus: status,
          companyParticipatedStep3: Boolean(app.technical_company_participated),
          companyParticipatedStep4: Boolean(app.motivation_company_participated),
        },
        null
      );
    },
  });
}

export function useActivateHoldCandidate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ applicationId, mentorId }: { applicationId: string; mentorId: string }) => {
      const { data: app, error: fetchErr } = await supabase
        .from("applications")
        .select(ADMIN_SELECTION_SELECT)
        .eq("id", applicationId)
        .single();
      if (fetchErr) throw fetchErr;
      const row = app as SelectionApplication;

      const now = new Date().toISOString();
      const { error } = await supabase
        .from("applications")
        .update({
          status: APPLICATION_JOURNEY_STATUSES.READINESS_ACTIVE,
          board_company_decision: "selected",
          hold_activated_at: now,
          assigned_mentor_id: mentorId,
          readiness_unlocked_at: now,
          updated_at: now,
        })
        .eq("id", applicationId);
      if (error) throw error;
      return row;
    },
    onSuccess: async (app) => {
      qc.invalidateQueries({ queryKey: ["admin-selection-applications"] });
      qc.invalidateQueries({ queryKey: ["admin-selection-application"] });
      qc.invalidateQueries({ queryKey: ["my-applications"] });
      qc.invalidateQueries({ queryKey: ["notifications"] });

      const profile = app.candidates?.profiles;
      if (profile?.id) {
        await onHoldCandidateActivated({
          applicationId: app.id,
          candidateId: app.candidate_id,
          profileId: profile.id,
          jobId: app.job_id,
          jobTitle: app.jobs?.title ?? "the role",
          companyId: app.jobs?.company_id ?? null,
        });
      }
    },
  });
}

export function useAssignMentorToApplication() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ applicationId, mentorId }: { applicationId: string; mentorId: string }) => {
      const now = new Date().toISOString();
      const { error } = await supabase
        .from("applications")
        .update({
          assigned_mentor_id: mentorId,
          readiness_unlocked_at: now,
          status: APPLICATION_JOURNEY_STATUSES.READINESS_ACTIVE,
          updated_at: now,
        })
        .eq("id", applicationId);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-selection-applications"] });
      qc.invalidateQueries({ queryKey: ["admin-selection-application"] });
      qc.invalidateQueries({ queryKey: ["employer-selection-applications"] });
      qc.invalidateQueries({ queryKey: ["my-applications"] });
    },
  });
}

export function useRefreshEligibilityChecks() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (applicationId: string) => {
      const { data: app, error } = await supabase
        .from("applications")
        .select(ADMIN_SELECTION_SELECT)
        .eq("id", applicationId)
        .single();
      if (error) throw error;
      const row = app as SelectionApplication;
      const checks = computeEligibilityAutoChecks(row.candidates ?? null, row.jobs ?? null, row);
      const { error: updErr } = await supabase
        .from("applications")
        .update({ eligibility_auto_checks: checks })
        .eq("id", applicationId);
      if (updErr) throw updErr;
      return checks;
    },
    onSuccess: (_, applicationId) => {
      qc.invalidateQueries({ queryKey: ["admin-selection-application", applicationId] });
      qc.invalidateQueries({ queryKey: ["admin-selection-applications"] });
    },
  });
}

export function useBulkSelectionDecision() {
  const decide = useSelectionStepDecision();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (items: StepDecisionInput[]) => {
      for (const item of items) {
        await decide.mutateAsync(item);
      }
      return items.length;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-selection-applications"] });
      qc.invalidateQueries({ queryKey: ["admin-selection-application"] });
      qc.invalidateQueries({ queryKey: ["employer-selection-applications"] });
      qc.invalidateQueries({ queryKey: ["my-applications"] });
      qc.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

export function useEmployerSelectionFeedback() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      applicationId,
      step,
      feedback,
    }: {
      applicationId: string;
      step: 3 | 4;
      feedback: string;
    }) => {
      const field = step === 3 ? "technical_company_feedback" : "motivation_company_feedback";
      const { error } = await supabase
        .from("applications")
        .update({ [field]: feedback.trim(), updated_at: new Date().toISOString() })
        .eq("id", applicationId);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["employer-selection-applications"] });
      qc.invalidateQueries({ queryKey: ["employer-selection-application"] });
      qc.invalidateQueries({ queryKey: ["admin-selection-application"] });
    },
  });
}

export function useAdminCompanyMentors(companyId: string | undefined) {
  return useQuery({
    queryKey: ["admin-company-mentors", companyId],
    enabled: Boolean(companyId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("company_mentors")
        .select("*")
        .eq("company_id", companyId!)
        .eq("status", "active")
        .order("name");
      if (error) throw error;
      return data ?? [];
    },
  });
}
