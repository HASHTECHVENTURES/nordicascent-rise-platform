import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { ADMIN_SELECTION_SELECT } from "@/hooks/useSelection";
import type { SelectionApplication } from "@/lib/selectionModule";
import {
  createAddonRequest,
  fetchFollowupCms,
  initializeFollowup,
  isTouchpointOverdue,
  logAdhocSupport,
  refreshFollowupQuestionnaires,
  setAtRiskRetention,
  submitQuestionnaire,
  updateFollowupCms,
  upsertMeetingLog,
  adminSetQuestionnaireOpensAt,
  adminOpenQuestionnairesNow,
  type FollowupAddonRequest,
  type FollowupAnswer,
  type FollowupMeetingLog,
  type FollowupQuestionnaire,
  type FollowupQuestionnaireCms,
  type FollowupRollupStatus,
  type FollowupTopicsCms,
  type FollowupTouchpoint,
  type MeetingParty,
  type MeetingState,
} from "@/lib/followupModule";

function invalidate(qc: ReturnType<typeof useQueryClient>, applicationId?: string) {
  if (applicationId) {
    qc.invalidateQueries({ queryKey: ["followup-touchpoints", applicationId] });
    qc.invalidateQueries({ queryKey: ["followup-meetings", applicationId] });
    qc.invalidateQueries({ queryKey: ["followup-meeting-summaries", applicationId] });
    qc.invalidateQueries({ queryKey: ["followup-questionnaires", applicationId] });
    qc.invalidateQueries({ queryKey: ["followup-answers", applicationId] });
    qc.invalidateQueries({ queryKey: ["followup-addons", applicationId] });
    qc.invalidateQueries({ queryKey: ["followup-adhoc", applicationId] });
    qc.invalidateQueries({ queryKey: ["activation-record", applicationId] });
  }
  qc.invalidateQueries({ queryKey: ["my-followup-context"] });
  qc.invalidateQueries({ queryKey: ["admin-followup-applications"] });
  qc.invalidateQueries({ queryKey: ["admin-followup-dashboard"] });
  qc.invalidateQueries({ queryKey: ["employer-followup-applications"] });
}

export function useFollowupTouchpoints(applicationId: string | undefined) {
  return useQuery({
    queryKey: ["followup-touchpoints", applicationId],
    enabled: Boolean(applicationId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("followup_touchpoints")
        .select("*")
        .eq("application_id", applicationId!)
        .order("month_number");
      if (error) throw error;
      return (data ?? []) as FollowupTouchpoint[];
    },
  });
}

export function useFollowupMeetingLogs(applicationId: string | undefined) {
  return useQuery({
    queryKey: ["followup-meetings", applicationId],
    enabled: Boolean(applicationId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("followup_meeting_logs")
        .select("*")
        .eq("application_id", applicationId!);
      if (error) throw error;
      return (data ?? []) as FollowupMeetingLog[];
    },
  });
}

export function useFollowupMeetingSummaries(applicationId: string | undefined) {
  return useQuery({
    queryKey: ["followup-meeting-summaries", applicationId],
    enabled: Boolean(applicationId),
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_followup_meeting_summaries", {
        p_application_id: applicationId!,
      });
      if (error) throw error;
      return (data ?? []) as {
        touchpoint_id: string;
        month_number: number;
        party: MeetingParty;
        is_logged: boolean;
        meeting_date: string | null;
        state: MeetingState | null;
      }[];
    },
  });
}

export function useFollowupQuestionnaires(applicationId: string | undefined) {
  return useQuery({
    queryKey: ["followup-questionnaires", applicationId],
    enabled: Boolean(applicationId),
    queryFn: async () => {
      await refreshFollowupQuestionnaires(applicationId!);
      const { data, error } = await supabase
        .from("followup_questionnaires")
        .select("*")
        .eq("application_id", applicationId!)
        .order("month_number");
      if (error) throw error;
      return (data ?? []) as FollowupQuestionnaire[];
    },
  });
}

export function useFollowupAnswers(applicationId: string | undefined, questionnaireId?: string) {
  return useQuery({
    queryKey: ["followup-answers", applicationId, questionnaireId],
    enabled: Boolean(applicationId),
    queryFn: async () => {
      let q = supabase.from("followup_answers").select("*").eq("application_id", applicationId!);
      if (questionnaireId) q = q.eq("questionnaire_id", questionnaireId);
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as FollowupAnswer[];
    },
  });
}

export function useFollowupAddons(applicationId: string | undefined) {
  return useQuery({
    queryKey: ["followup-addons", applicationId],
    enabled: Boolean(applicationId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("followup_addon_requests")
        .select("*")
        .eq("application_id", applicationId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as FollowupAddonRequest[];
    },
  });
}

export function useFollowupAdhoc(applicationId: string | undefined) {
  return useQuery({
    queryKey: ["followup-adhoc", applicationId],
    enabled: Boolean(applicationId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("followup_adhoc_logs")
        .select("*")
        .eq("application_id", applicationId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useFollowupCms() {
  return useQuery({
    queryKey: ["followup-cms"],
    queryFn: fetchFollowupCms,
  });
}

export function useUpdateFollowupCms() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { topics: FollowupTopicsCms; questionnaires: FollowupQuestionnaireCms }) =>
      updateFollowupCms(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["followup-cms"] }),
  });
}

export function useEnsureFollowupInitialized(applicationId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (arrivalDate?: string | null) => {
      if (!applicationId) return;
      await initializeFollowup(applicationId, arrivalDate);
    },
    onSuccess: () => invalidate(qc, applicationId),
  });
}

export function useUpsertMeetingLog() {
  const qc = useQueryClient();
  const { profile } = useAuth();
  return useMutation({
    mutationFn: async (input: Parameters<typeof upsertMeetingLog>[0]) => {
      await upsertMeetingLog({ ...input, logged_by: profile?.id ?? null });
    },
    onSuccess: (_, vars) => invalidate(qc, vars.applicationId),
  });
}

export function useSubmitFollowupQuestionnaire() {
  const qc = useQueryClient();
  const { profile } = useAuth();
  return useMutation({
    mutationFn: async (input: Omit<Parameters<typeof submitQuestionnaire>[0], "submitted_by">) => {
      await submitQuestionnaire({ ...input, submitted_by: profile?.id ?? null });
    },
    onSuccess: (_, vars) => invalidate(qc, vars.applicationId),
  });
}

export function useSetAtRiskRetention() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ applicationId, value }: { applicationId: string; value: boolean }) =>
      setAtRiskRetention(applicationId, value),
    onSuccess: (_, vars) => invalidate(qc, vars.applicationId),
  });
}

export function useAdminSetQuestionnaireOpensAt() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: adminSetQuestionnaireOpensAt,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["followup-questionnaires"] });
      qc.invalidateQueries({ queryKey: ["followup-touchpoints"] });
    },
  });
}

export function useAdminOpenQuestionnairesNow() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: adminOpenQuestionnairesNow,
    onSuccess: (_, vars) => invalidate(qc, vars.applicationId),
  });
}

export function useCreateAddonRequest() {
  const qc = useQueryClient();
  const { profile } = useAuth();
  return useMutation({
    mutationFn: async (input: {
      applicationId: string;
      addon_key: FollowupAddonRequest["addon_key"];
      notes?: string;
    }) => {
      await createAddonRequest({ ...input, requested_by: profile?.id ?? null });
    },
    onSuccess: (_, vars) => invalidate(qc, vars.applicationId),
  });
}

export function useLogAdhocSupport() {
  const qc = useQueryClient();
  const { profile } = useAuth();
  return useMutation({
    mutationFn: async (input: {
      applicationId: string;
      urgency: "urgent" | "standard";
      subject: string;
      body: string;
      opened_by_role: "candidate" | "company" | "admin";
    }) => {
      await logAdhocSupport({ ...input, opened_by: profile?.id ?? null });
    },
    onSuccess: (_, vars) => invalidate(qc, vars.applicationId),
  });
}

export function useMyFollowupContext() {
  const { profile } = useAuth();
  return useQuery({
    queryKey: ["my-followup-context", profile?.id],
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
        .in("status", ["onboarding", "followup", "journey_complete"])
        .order("applied_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (!app) return null;

      const { data: activation } = await supabase
        .from("activation_records")
        .select("arrival_date, followup_completed_at, onboarding_status")
        .eq("application_id", app.id)
        .maybeSingle();

      if (!activation?.arrival_date && app.status !== "followup" && app.status !== "journey_complete") {
        return null;
      }

      return {
        applicationId: app.id as string,
        applicationStatus: app.status as string,
        jobTitle: (app.jobs as { title?: string } | null)?.title,
        companyName: (app.jobs as { companies?: { name?: string } | null } | null)?.companies?.name,
        arrivalDate: activation?.arrival_date as string | null,
        followupStatus: null as string | null,
        followupCompletedAt: activation?.followup_completed_at as string | null,
        atRiskRetention: false,
      };
    },
  });
}

async function appsWithFollowup(apps: SelectionApplication[]) {
  const out: SelectionApplication[] = [];
  for (const app of apps) {
    const { data: rec } = await supabase
      .from("activation_records")
      .select("arrival_date, followup_completed_at")
      .eq("application_id", app.id)
      .maybeSingle();
    // Prefer arrival_date (followup_status masked for non-admin via some paths)
    if (rec?.arrival_date || rec?.followup_completed_at || app.status === "followup") {
      out.push(app);
    }
  }
  return out;
}

export function useAdminFollowupApplications() {
  return useQuery({
    queryKey: ["admin-followup-applications"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("applications")
        .select(ADMIN_SELECTION_SELECT)
        .in("status", ["onboarding", "followup", "journey_complete"])
        .order("applied_at", { ascending: false });
      if (error) throw error;
      return appsWithFollowup((data ?? []) as SelectionApplication[]);
    },
  });
}

export function useAdminFollowupDashboard() {
  return useQuery({
    queryKey: ["admin-followup-dashboard"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("applications")
        .select(ADMIN_SELECTION_SELECT)
        .in("status", ["onboarding", "followup", "journey_complete"])
        .order("applied_at", { ascending: false });
      if (error) throw error;
      const apps = await appsWithFollowup((data ?? []) as SelectionApplication[]);

      return Promise.all(
        apps.map(async (app) => {
          const [{ data: record }, { data: tps }, { data: summaries }] = await Promise.all([
            supabase
              .from("activation_records")
              .select("followup_status, at_risk_retention")
              .eq("application_id", app.id)
              .maybeSingle(),
            supabase
              .from("followup_touchpoints")
              .select("*")
              .eq("application_id", app.id)
              .order("month_number"),
            supabase.rpc("get_followup_meeting_summaries", { p_application_id: app.id }),
          ]);

          const touchpoints = (tps ?? []) as FollowupTouchpoint[];
          const sums = (summaries ?? []) as {
            touchpoint_id: string;
            is_logged: boolean;
          }[];

          let overdueCount = 0;
          for (const tp of touchpoints) {
            const both = sums.filter((s) => s.touchpoint_id === tp.id && s.is_logged).length === 2;
            if (isTouchpointOverdue(tp, both)) overdueCount += 1;
          }

          const status = (record?.followup_status ?? null) as FollowupRollupStatus | null;
          return {
            app,
            overdueCount,
            isFlagged: status === "followup_flag",
            atRisk: Boolean(record?.at_risk_retention) || status === "at_risk_retention",
            status,
          };
        })
      );
    },
  });
}

/** Employer list: use jobs!inner so company filter works (do not stack with ADMIN_SELECTION_SELECT jobs embed). */
const EMPLOYER_FOLLOWUP_SELECT = `
  *,
  jobs!inner(id, title, positions_count, target_track, company_id, core_skills, engineering_discipline, experience_level, requirements, companies(id, name)),
  candidates(
    id, profile_id, full_name, track, university_id, university_waitlist_name,
    gpa_or_standing, field_of_study, cv_url, family_relocating, family_member_count,
    profiles(full_name, email, phone, avatar_url)
  )
`;

export function useEmployerFollowupApplications() {
  const { profile } = useAuth();
  return useQuery({
    queryKey: ["employer-followup-applications", profile?.id],
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
        .select(EMPLOYER_FOLLOWUP_SELECT)
        .eq("jobs.company_id", employer.company_id)
        .in("status", ["onboarding", "followup", "journey_complete"])
        .order("applied_at", { ascending: false });
      if (error) throw error;
      return appsWithFollowup((data ?? []) as SelectionApplication[]);
    },
  });
}
