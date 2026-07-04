import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { rejectHoldApplicationsForClosedJob } from "@/lib/jobCloseEffects";
import { activateJobsAfterMentoringUnlock } from "@/lib/preparationProgress";
import type { Track } from "@/lib/track";
import type { AdminCandidateJourneyStage } from "@/lib/adminJourney";
import { inferCandidateJourneyStage } from "@/lib/adminJourney";
import type { TrackType } from "@/types/database";
import { useAuth } from "@/contexts/AuthContext";
import { advanceCandidateStage, completePreparationIfReady, completeStageIfTasksDone, syncPipelineForTrack } from "@/lib/pipelineProgress";
import {
  onApplicationStatusChange,
  onApplicationSubmitted,
  notifyEmployersNewApplication,
  notifyAdminsNewApplicationComplete,
} from "@/lib/applicationEffects";
import { getOrCreateConversationWithProfile, resolveConversationParticipant } from "@/lib/conversations";
import { sendInterviewInvite } from "@/lib/sendInterviewInvite";
import {
  ensureCompanyActiveWhenPublishingJob,
  isCandidateVisibleJob,
} from "@/lib/jobVisibility";
import { CANDIDATE_JOB_COMPANY_SELECT } from "@/lib/jobPostingDisplay";
import {
  computeStageReadiness,
  isTaskManuallyCompletable,
  isTaskRequirementMet,
} from "@/lib/profileCompleteness";
import { fetchStageTasksForCandidate, fetchStageTaskIdsForCandidate } from "@/lib/stageTasks";
import { UNIVERSITY_SEED, type InstitutionType } from "@/lib/universities";

// ─── Pipeline ───────────────────────────────────────────────────────────────

export function usePipelineStages() {
  return useQuery({
    queryKey: ["pipeline-stages"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pipeline_stages")
        .select("*")
        .order("sort_order");
      if (error) throw error;
      return data;
    },
  });
}

export function useMyStageProgress() {
  const { candidate } = useAuth();
  return useQuery({
    queryKey: ["stage-progress", candidate?.id],
    enabled: !!candidate?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("candidate_stage_progress")
        .select("*, pipeline_stages(*)")
        .eq("candidate_id", candidate!.id);
      if (error) throw error;
      return data;
    },
  });
}

export function useStageTasks(stageId: string) {
  const { candidate, session, loading: authLoading } = useAuth();
  return useQuery({
    queryKey: ["stage-tasks", stageId, candidate?.id],
    enabled: !!stageId && !authLoading && !!session,
    staleTime: 0,
    refetchOnMount: "always",
    queryFn: async () => fetchStageTasksForCandidate(candidate?.id, stageId),
  });
}

export function useMyTaskProgress() {
  const { candidate } = useAuth();
  return useQuery({
    queryKey: ["task-progress", candidate?.id],
    enabled: !!candidate?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("candidate_task_progress")
        .select("*")
        .eq("candidate_id", candidate!.id);
      if (error) throw error;
      return data;
    },
  });
}

export function useCompleteTask() {
  const qc = useQueryClient();
  const { candidate, profile, refreshProfile } = useAuth();
  return useMutation({
    mutationFn: async (taskId: string) => {
      const { data: task } = await supabase
        .from("stage_tasks")
        .select("title, stage_id")
        .eq("id", taskId)
        .single();
      if (!task) return;

      if (
        !isTaskManuallyCompletable(task.title) &&
        !isTaskRequirementMet(task.title, profile, candidate)
      ) {
        throw new Error("Complete the required steps in My Profile first.");
      }

      const { error } = await supabase.from("candidate_task_progress").insert({
        candidate_id: candidate!.id,
        task_id: taskId,
      });
      if (error) throw error;

      const [{ data: completed }] = await Promise.all([
        supabase
          .from("candidate_task_progress")
          .select("task_id")
          .eq("candidate_id", candidate!.id),
      ]);
      const stageTaskIds = await fetchStageTaskIdsForCandidate(candidate!.id, task.stage_id);
      const done = new Set((completed ?? []).map((c) => c.task_id));
      const stageDone = stageTaskIds.filter((id) => done.has(id)).length;
      const readiness = computeStageReadiness(stageDone, stageTaskIds.length);
      await supabase.from("candidates").update({ readiness_score: readiness }).eq("id", candidate!.id);

      if (stageTaskIds.length && stageTaskIds.every((id) => done.has(id))) {
        if (task.stage_id === "preparation") {
          await completePreparationIfReady(candidate!.id);
        } else {
          await completeStageIfTasksDone(candidate!.id, task.stage_id);
        }
      }
    },
    onSuccess: async () => {
      await refreshProfile();
      qc.invalidateQueries({ queryKey: ["task-progress"] });
      qc.invalidateQueries({ queryKey: ["stage-progress"] });
    },
  });
}

export function useAdvanceStageIfReady() {
  const qc = useQueryClient();
  const { candidate, refreshProfile } = useAuth();
  return useMutation({
    mutationFn: async (stageId: string) => {
      if (!candidate?.id) return false;
      return completeStageIfTasksDone(candidate.id, stageId);
    },
    onSuccess: async (didAdvance) => {
      if (!didAdvance) return;
      await refreshProfile();
      qc.invalidateQueries({ queryKey: ["stage-progress"] });
      qc.invalidateQueries({ queryKey: ["task-progress"] });
    },
  });
}

// ─── Candidates (admin) ─────────────────────────────────────────────────────

export function useAdminCandidates() {
  return useQuery({
    queryKey: ["admin-candidates"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("candidates")
        .select("*, profiles(full_name, email, avatar_url)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useCandidateById(id: string | undefined) {
  return useQuery({
    queryKey: ["candidate", id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("candidates")
        .select("*, profiles(full_name, email, avatar_url, phone)")
        .eq("id", id!)
        .single();
      if (error) throw error;
      return data;
    },
  });
}

export function useUpdateCandidateStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from("candidates").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ["candidate", id] });
      qc.invalidateQueries({ queryKey: ["admin-candidates"] });
    },
  });
}

export function useCreateIssue() {
  const qc = useQueryClient();
  const { profile } = useAuth();
  return useMutation({
    mutationFn: async (issue: {
      title: string;
      description?: string;
      candidate_id?: string;
      priority?: string;
    }) => {
      const { error } = await supabase.from("issues").insert({
        title: issue.title,
        description: issue.description ?? null,
        candidate_id: issue.candidate_id ?? null,
        reporter_id: profile?.id ?? null,
        status: "open",
        priority: issue.priority ?? "medium",
      });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["issues"] }),
  });
}

export function useUpdateCandidateTrack() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, track }: { id: string; track: TrackType }) => {
      const { error } = await supabase.from("candidates").update({ track }).eq("id", id);
      if (error) throw error;
      await syncPipelineForTrack(id, track);
    },
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ["admin-candidates"] });
      qc.invalidateQueries({ queryKey: ["candidate", id] });
      qc.invalidateQueries({ queryKey: ["stage-progress"] });
    },
  });
}

export function useUpdateMyCandidate() {
  const qc = useQueryClient();
  const { candidate, refreshProfile } = useAuth();
  return useMutation({
    mutationFn: async (updates: Record<string, unknown>) => {
      const { error } = await supabase
        .from("candidates")
        .update(updates)
        .eq("id", candidate!.id);
      if (error) throw error;
    },
    onSuccess: async () => {
      await refreshProfile();
      qc.invalidateQueries({ queryKey: ["candidate"] });
    },
  });
}

// ─── Companies & Employers ───────────────────────────────────────────────────

export function useAdminEmployers() {
  return useQuery({
    queryKey: ["admin-employers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("companies")
        .select("*, employers(id, profile_id, title, profiles(full_name, email))")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useMyCompany() {
  const { profile } = useAuth();
  return useQuery({
    queryKey: ["my-company", profile?.id],
    enabled: profile?.role === "employer",
    queryFn: async () => {
      const { data: employer, error: e1 } = await supabase
        .from("employers")
        .select("*, companies(*)")
        .eq("profile_id", profile!.id)
        .single();
      if (e1) throw e1;
      return employer;
    },
  });
}

// ─── Universities ────────────────────────────────────────────────────────────

export function useUniversities() {
  return useQuery({
    queryKey: ["universities"],
    queryFn: async () => {
      let { data, error } = await supabase
        .from("universities")
        .select("id, name, institution_type, country, city, is_accessible")
        .eq("is_accessible", true)
        .eq("institution_type", "university")
        .order("name");

      if (error?.message?.includes("is_accessible")) {
        const fallback = await supabase
          .from("universities")
          .select("id, name, institution_type, country")
          .eq("institution_type", "university")
          .order("name");
        data = fallback.data;
        error = fallback.error;
      }

      if (error || !data?.length) {
        return UNIVERSITY_SEED.filter((u) => u.institution_type === "university");
      }
      return data;
    },
  });
}

export function useMyUniversity(candidateId: string | undefined, universityId: string | null | undefined, waitlistName: string | null | undefined) {
  return useQuery({
    queryKey: ["my-university", candidateId, universityId, waitlistName],
    enabled: !!candidateId,
    queryFn: async () => {
      if (universityId) {
        const { data, error } = await supabase
          .from("universities")
          .select("id, name, is_accessible")
          .eq("id", universityId)
          .maybeSingle();
        if (error) throw error;
        if (data) return { name: data.name, status: "selected" as const, isAccessible: data.is_accessible };
      }
      if (waitlistName?.trim()) {
        return { name: waitlistName.trim(), status: "waitlist" as const, isAccessible: false };
      }
      return null;
    },
  });
}

export function useAdminUniversities() {
  return useQuery({
    queryKey: ["admin-universities"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("universities")
        .select("*")
        .order("name");
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useAdminUniversityWaitlist() {
  return useQuery({
    queryKey: ["admin-university-waitlist"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("university_waitlist")
        .select("*, candidates(full_name, profile_id, profiles(full_name, email))")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useSaveUniversity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      id?: string;
      name: string;
      institution_type: InstitutionType;
      country?: string;
      city?: string;
      is_accessible?: boolean;
    }) => {
      const row = {
        name: payload.name.trim(),
        institution_type: payload.institution_type,
        country: payload.country?.trim() || "India",
        city: payload.city?.trim() || null,
        is_accessible: payload.is_accessible ?? true,
      };
      if (payload.id) {
        const { error } = await supabase.from("universities").update(row).eq("id", payload.id);
        if (error) throw error;
        return;
      }
      const { error } = await supabase.from("universities").insert(row);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-universities"] });
      qc.invalidateQueries({ queryKey: ["universities"] });
    },
  });
}

export function useToggleUniversityAccessible() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, is_accessible }: { id: string; is_accessible: boolean }) => {
      const { error } = await supabase.from("universities").update({ is_accessible }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-universities"] });
      qc.invalidateQueries({ queryKey: ["universities"] });
    },
  });
}

export function useDeleteUniversity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { count, error: countError } = await supabase
        .from("candidates")
        .select("id", { count: "exact", head: true })
        .eq("university_id", id);
      if (countError) throw countError;
      if ((count ?? 0) > 0) {
        throw new Error(
          `Cannot remove: ${count} candidate(s) are linked to this university. Hide it instead.`
        );
      }
      const { error } = await supabase.from("universities").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-universities"] });
      qc.invalidateQueries({ queryKey: ["universities"] });
    },
  });
}

export function useApproveUniversityWaitlist() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      waitlistId,
      makeAccessible = true,
    }: {
      waitlistId: string;
      makeAccessible?: boolean;
    }) => {
      const { data: entry, error: fetchError } = await supabase
        .from("university_waitlist")
        .select("*")
        .eq("id", waitlistId)
        .single();
      if (fetchError || !entry) throw fetchError ?? new Error("Waitlist entry not found");

      const { data: existing } = await supabase
        .from("universities")
        .select("id")
        .eq("name", entry.university_name)
        .eq("institution_type", entry.institution_type)
        .maybeSingle();

      let universityId = existing?.id;
      if (!universityId) {
        const { data: created, error: createError } = await supabase
          .from("universities")
          .insert({
            name: entry.university_name,
            institution_type: entry.institution_type,
            country: "India",
            city: entry.city ?? null,
            is_accessible: makeAccessible,
          })
          .select("id")
          .single();
        if (createError) throw createError;
        universityId = created.id;
      } else if (makeAccessible) {
        await supabase.from("universities").update({ is_accessible: true }).eq("id", universityId);
      }

      await supabase
        .from("university_waitlist")
        .update({ status: "approved" })
        .eq("id", waitlistId);

      await supabase
        .from("candidates")
        .update({
          university_id: universityId,
          university_waitlist_name: null,
        })
        .eq("id", entry.candidate_id);

      await supabase
        .from("candidates")
        .update({
          university_id: universityId,
          university_waitlist_name: null,
        })
        .eq("university_waitlist_name", entry.university_name);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-university-waitlist"] });
      qc.invalidateQueries({ queryKey: ["admin-universities"] });
      qc.invalidateQueries({ queryKey: ["universities"] });
    },
  });
}

export function useRejectUniversityWaitlist() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (waitlistId: string) => {
      const { error } = await supabase
        .from("university_waitlist")
        .update({ status: "rejected" })
        .eq("id", waitlistId);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-university-waitlist"] });
    },
  });
}

export function useSaveCandidateUniversity() {
  const qc = useQueryClient();
  const { refreshProfile } = useAuth();
  return useMutation({
    mutationFn: async ({
      candidateId,
      universityId,
      waitlistName,
      institutionType = "university",
      city,
    }: {
      candidateId: string;
      universityId?: string;
      waitlistName?: string;
      institutionType?: InstitutionType;
      city?: string;
    }) => {
      let resolvedWaitlist = waitlistName?.trim() ?? "";

      if (universityId?.startsWith("seed-")) {
        const seed = UNIVERSITY_SEED.find((u) => u.id === universityId);
        if (seed) resolvedWaitlist = seed.name;
        universityId = undefined;
      }

      if (universityId) {
        const { error } = await supabase
          .from("candidates")
          .update({
            university_id: universityId,
            university_waitlist_name: null,
          })
          .eq("id", candidateId);
        if (error) throw error;
        return;
      }

      if (!resolvedWaitlist) throw new Error("Select or enter a university");

      const { error: candError } = await supabase
        .from("candidates")
        .update({
          university_id: null,
          university_waitlist_name: resolvedWaitlist,
        })
        .eq("id", candidateId);
      if (candError) throw candError;

      const { error: wlError } = await supabase.from("university_waitlist").insert({
        candidate_id: candidateId,
        university_name: resolvedWaitlist,
        institution_type: institutionType,
        city: city?.trim() || null,
      });
      if (wlError && !wlError.message.includes("does not exist")) throw wlError;
    },
    onSuccess: async () => {
      await refreshProfile();
      qc.invalidateQueries({ queryKey: ["candidate"] });
      qc.invalidateQueries({ queryKey: ["my-university"] });
      qc.invalidateQueries({ queryKey: ["admin-university-waitlist"] });
      qc.invalidateQueries({ queryKey: ["stage-progress"] });
    },
  });
}

// ─── Jobs ───────────────────────────────────────────────────────────────────

export function useOpenJobs() {
  return useQuery({
    queryKey: ["jobs-open"],
    staleTime: 0,
    refetchOnWindowFocus: true,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("jobs")
        .select(`*, companies!inner(${CANDIDATE_JOB_COMPANY_SELECT})`)
        .eq("status", "open")
        .order("posted_at", { ascending: false });
      if (error) throw error;
      return (data ?? []).filter(isCandidateVisibleJob);
    },
  });
}

export function useEmployerJobs() {
  const { profile } = useAuth();
  return useQuery({
    queryKey: ["employer-jobs", profile?.id],
    enabled: profile?.role === "employer",
    queryFn: async () => {
      const { data: employer } = await supabase
        .from("employers")
        .select("company_id")
        .eq("profile_id", profile!.id)
        .single();
      if (!employer) return [];
      const { data, error } = await supabase
        .from("jobs")
        .select("*, applications(count)")
        .eq("company_id", employer.company_id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useAdminJobs() {
  return useQuery({
    queryKey: ["admin-jobs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("jobs")
        .select("*, companies(name)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateJob() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (job: Record<string, unknown>) => {
      const companyId = job.company_id as string | undefined;
      if (companyId && job.status === "open") {
        await ensureCompanyActiveWhenPublishingJob(companyId);
      }
      const { error } = await supabase.from("jobs").insert(job);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["employer-jobs"] });
      qc.invalidateQueries({ queryKey: ["admin-jobs"] });
      qc.invalidateQueries({ queryKey: ["jobs-open"] });
    },
  });
}

export function useUpdateJob() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Record<string, unknown>) => {
      if (updates.status === "open") {
        const { data: job } = await supabase.from("jobs").select("company_id").eq("id", id).single();
        if (job?.company_id) {
          await ensureCompanyActiveWhenPublishingJob(job.company_id);
        }
      }
      const { error } = await supabase.from("jobs").update(updates).eq("id", id);
      if (error) throw error;

      let holdRejected = 0;
      if (updates.status === "closed") {
        holdRejected = await rejectHoldApplicationsForClosedJob(id);
      }
      return { holdRejected };
    },
    onSuccess: (result) => {
      qc.invalidateQueries({ queryKey: ["employer-jobs"] });
      qc.invalidateQueries({ queryKey: ["admin-jobs"] });
      qc.invalidateQueries({ queryKey: ["jobs-open"] });
      qc.invalidateQueries({ queryKey: ["admin-selection-applications"] });
      qc.invalidateQueries({ queryKey: ["my-applications"] });
      return result;
    },
  });
}

export function useJobById(id: string | undefined) {
  return useQuery({
    queryKey: ["job", id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("jobs")
        .select(`*, companies(${CANDIDATE_JOB_COMPANY_SELECT})`)
        .eq("id", id!)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });
}

export function useInsightArticle(id: string | undefined) {
  return useQuery({
    queryKey: ["insight-article", id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("insight_articles")
        .select("*")
        .eq("id", id!)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });
}

// ─── Applications ───────────────────────────────────────────────────────────

export function useEmployerApplications() {
  const { profile } = useAuth();
  return useQuery({
    queryKey: ["employer-applications", profile?.id],
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
        .select(
          "*, candidates(*, profiles(full_name, email, avatar_url)), jobs!inner(title, company_id)"
        )
        .eq("jobs.company_id", employer.company_id);
      if (error) throw error;
      return data;
    },
  });
}

export function useMyApplications() {
  const { candidate } = useAuth();
  return useQuery({
    queryKey: ["my-applications", candidate?.id],
    enabled: !!candidate?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("applications")
        .select("*, jobs(title, location, job_type, status, companies(name, logo_url))")
        .eq("candidate_id", candidate!.id)
        .order("applied_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useSubmitJobApplication() {
  const qc = useQueryClient();
  const { candidate } = useAuth();
  return useMutation({
    mutationFn: async ({
      jobId,
      track,
      motivation_statement,
      academic_transcript_path,
      project_descriptions_text,
      project_descriptions_path,
      work_experience_path,
      portfolio_path,
    }: {
      jobId: string;
      track: Track;
    } & import("@/lib/jobApplication").JobApplicationForm) => {
      const { data: job } = await supabase.from("jobs").select("title").eq("id", jobId).single();
      const { data: app, error } = await supabase
        .from("applications")
        .insert({
          candidate_id: candidate!.id,
          job_id: jobId,
          stage_id: "preparation",
          status: "application_complete",
          needs_action: true,
          track,
          source: "apply",
          motivation_statement: motivation_statement.trim(),
          academic_transcript_path,
          project_descriptions_text: project_descriptions_text.trim() || null,
          project_descriptions_path: project_descriptions_path || null,
          work_experience_path: work_experience_path || null,
          portfolio_path: portfolio_path || null,
        })
        .select("id")
        .single();
      if (error) throw error;
      await supabase.from("candidates").update({ pool_category: "active" }).eq("id", candidate!.id);
      return { jobTitle: job?.title ?? "this role", jobId, applicationId: app.id };
    },
    onSuccess: async ({ jobTitle, jobId, applicationId }) => {
      qc.invalidateQueries({ queryKey: ["applications"] });
      qc.invalidateQueries({ queryKey: ["employer-applications"] });
      qc.invalidateQueries({ queryKey: ["my-applications"] });
      qc.invalidateQueries({ queryKey: ["notifications"] });

      if (!candidate?.id) return;

      const { data: cand } = await supabase
        .from("candidates")
        .select("profile_id, profiles(full_name)")
        .eq("id", candidate.id)
        .single();
      if (cand?.profile_id) {
        await onApplicationSubmitted(cand.profile_id, jobTitle);
        const candidateName =
          (cand.profiles as { full_name: string | null } | null)?.full_name ?? "A candidate";
        await notifyEmployersNewApplication(
          jobId,
          jobTitle,
          candidateName,
          applicationId,
          candidate.id
        );
        await notifyAdminsNewApplicationComplete(
          jobTitle,
          candidateName,
          applicationId,
          jobId,
          candidate.id
        );
      }

      const { data: tasks } = await supabase.from("stage_tasks").select("id, title");
      const { data: completed } = await supabase
        .from("candidate_task_progress")
        .select("task_id")
        .eq("candidate_id", candidate.id);
      const done = new Set((completed ?? []).map((c) => c.task_id));

      for (const task of tasks ?? []) {
        const title = task.title.toLowerCase();
        if (!title.includes("apply") && !title.includes("job")) continue;
        if (done.has(task.id)) continue;
        await supabase.from("candidate_task_progress").insert({
          candidate_id: candidate.id,
          task_id: task.id,
        });
      }

      qc.invalidateQueries({ queryKey: ["task-progress"] });
      qc.invalidateQueries({ queryKey: ["stage-progress"] });
    },
  });
}

export function useApplyToJob() {
  const qc = useQueryClient();
  const { candidate } = useAuth();
  return useMutation({
    mutationFn: async (jobId: string) => {
      const { data: job } = await supabase.from("jobs").select("title").eq("id", jobId).single();
      const { data: app, error } = await supabase
        .from("applications")
        .insert({
          candidate_id: candidate!.id,
          job_id: jobId,
          stage_id: "preparation",
          status: "applied",
          needs_action: true,
        })
        .select("id")
        .single();
      if (error) throw error;
      return { jobTitle: job?.title ?? "this role", jobId, applicationId: app.id };
    },
    onSuccess: async ({ jobTitle, jobId, applicationId }) => {
      qc.invalidateQueries({ queryKey: ["applications"] });
      qc.invalidateQueries({ queryKey: ["employer-applications"] });
      qc.invalidateQueries({ queryKey: ["my-applications"] });
      qc.invalidateQueries({ queryKey: ["notifications"] });

      if (!candidate?.id) return;

      const { data: cand } = await supabase
        .from("candidates")
        .select("profile_id, profiles(full_name)")
        .eq("id", candidate.id)
        .single();
      if (cand?.profile_id) {
        await onApplicationSubmitted(cand.profile_id, jobTitle);
        const candidateName =
          (cand.profiles as { full_name: string | null } | null)?.full_name ?? "A candidate";
        await notifyEmployersNewApplication(
          jobId,
          jobTitle,
          candidateName,
          applicationId,
          candidate.id
        );
      }

      const { data: tasks } = await supabase.from("stage_tasks").select("id, title");
      const { data: completed } = await supabase
        .from("candidate_task_progress")
        .select("task_id")
        .eq("candidate_id", candidate.id);
      const done = new Set((completed ?? []).map((c) => c.task_id));

      for (const task of tasks ?? []) {
        const title = task.title.toLowerCase();
        if (!title.includes("apply") && !title.includes("job")) continue;
        if (done.has(task.id)) continue;
        await supabase.from("candidate_task_progress").insert({
          candidate_id: candidate.id,
          task_id: task.id,
        });
      }

      qc.invalidateQueries({ queryKey: ["task-progress"] });
      qc.invalidateQueries({ queryKey: ["stage-progress"] });
    },
  });
}

export function useUpdateApplication() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      ...updates
    }: {
      id: string;
      stage_id?: string;
      status?: string;
      needs_action?: boolean;
    }) => {
      const { data: app, error: fetchError } = await supabase
        .from("applications")
        .select("id, candidate_id, status, jobs(title), candidates(profile_id)")
        .eq("id", id)
        .single();
      if (fetchError) throw fetchError;

      const { error } = await supabase
        .from("applications")
        .update({
          ...updates,
          ...(updates.status ? { needs_action: false } : {}),
        })
        .eq("id", id);
      if (error) throw error;

      return { app, updates };
    },
    onSuccess: async ({ app, updates }) => {
      qc.invalidateQueries({ queryKey: ["employer-applications"] });
      qc.invalidateQueries({ queryKey: ["employer-candidate"] });
      qc.invalidateQueries({ queryKey: ["applications"] });
      qc.invalidateQueries({ queryKey: ["my-applications"] });
      qc.invalidateQueries({ queryKey: ["notifications"] });
      qc.invalidateQueries({ queryKey: ["stage-progress"] });

      if (!updates.status || updates.status === app.status) return;

      const candidate = app.candidates as { profile_id: string } | null;
      const job = app.jobs as { title: string } | null;
      if (!candidate?.profile_id) return;

      await onApplicationStatusChange(
        {
          id: app.id,
          candidate_id: app.candidate_id,
          status: app.status,
          profile_id: candidate.profile_id,
          job_title: job?.title ?? "the role",
        },
        updates.status
      );
    },
  });
}

export function useSendInterviewInvite() {
  const qc = useQueryClient();
  const { profile } = useAuth();
  return useMutation({
    mutationFn: async (params: {
      applicationId: string;
      candidateProfileId: string;
      candidateId: string;
      jobTitle: string;
      companyName: string;
      meetUrl: string;
      scheduledAt: string;
      notes?: string;
      previousStatus: string;
    }) => {
      if (!profile?.id) throw new Error("Not signed in");
      const result = await sendInterviewInvite({
        applicationId: params.applicationId,
        candidateProfileId: params.candidateProfileId,
        employerProfileId: profile.id,
        jobTitle: params.jobTitle,
        companyName: params.companyName,
        meetUrl: params.meetUrl,
        scheduledAt: params.scheduledAt,
        notes: params.notes,
      });

      return result;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["employer-applications"] });
      qc.invalidateQueries({ queryKey: ["employer-candidate"] });
      qc.invalidateQueries({ queryKey: ["my-applications"] });
      qc.invalidateQueries({ queryKey: ["applications"] });
      qc.invalidateQueries({ queryKey: ["notifications"] });
      qc.invalidateQueries({ queryKey: ["conversations-details"] });
    },
  });
}

// ─── Issues & Support ───────────────────────────────────────────────────────

export function useIssues() {
  return useQuery({
    queryKey: ["issues"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("issues")
        .select("*, candidates(id, profiles(full_name))")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useSupportTickets() {
  return useQuery({
    queryKey: ["support-tickets"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("support_tickets")
        .select("*, profiles(full_name, email)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

// ─── Notifications ──────────────────────────────────────────────────────────

export function useNotifications() {
  const { profile } = useAuth();
  return useQuery({
    queryKey: ["notifications", profile?.id],
    enabled: !!profile?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", profile!.id)
        .order("created_at", { ascending: false })
        .limit(20);
      if (error) throw error;
      return data;
    },
  });
}

// ─── Activity ───────────────────────────────────────────────────────────────

export function useActivityLog() {
  return useQuery({
    queryKey: ["activity-log"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("activity_log")
        .select("*, profiles(full_name)")
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data;
    },
  });
}

// ─── Messages ───────────────────────────────────────────────────────────────

export function useConversations() {
  const { profile } = useAuth();
  return useQuery({
    queryKey: ["conversations", profile?.id],
    enabled: !!profile?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("conversation_participants")
        .select("conversation_id, conversations(*)")
        .eq("profile_id", profile!.id);
      if (error) throw error;
      return data;
    },
  });
}

export function useMessages(conversationId: string | undefined) {
  return useQuery({
    queryKey: ["messages", conversationId],
    enabled: !!conversationId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("messages")
        .select("id, conversation_id, sender_id, body, created_at, read_at")
        .eq("conversation_id", conversationId!)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data;
    },
  });
}

export function useSendMessage() {
  const qc = useQueryClient();
  const { profile } = useAuth();
  return useMutation({
    mutationFn: async ({ conversationId, body }: { conversationId: string; body: string }) => {
      const { error } = await supabase.from("messages").insert({
        conversation_id: conversationId,
        sender_id: profile!.id,
        body,
      });
      if (error) throw error;
      await supabase
        .from("conversations")
        .update({ updated_at: new Date().toISOString() })
        .eq("id", conversationId);
    },
    onSuccess: (_, { conversationId }) => {
      qc.invalidateQueries({ queryKey: ["messages", conversationId] });
      qc.invalidateQueries({ queryKey: ["conversations-details"] });
    },
  });
}

export function useConversationsWithDetails() {
  const { profile } = useAuth();
  return useQuery({
    queryKey: ["conversations-details", profile?.id],
    enabled: !!profile?.id,
    queryFn: async () => {
      const { data: myConvs, error } = await supabase
        .from("conversation_participants")
        .select("conversation_id, conversations(id, subject, updated_at, created_at)")
        .eq("profile_id", profile!.id);
      if (error) throw error;

      const results = await Promise.all(
        (myConvs ?? []).map(async (row) => {
          const conv = row.conversations as {
            id: string;
            subject: string | null;
            updated_at: string;
            created_at: string;
          };
          const { data: participants } = await supabase
            .from("conversation_participants")
            .select("profile_id")
            .eq("conversation_id", conv.id);
          const other = participants?.find((p) => p.profile_id !== profile!.id);
          const display = other
            ? await resolveConversationParticipant(other.profile_id, profile!.role)
            : { name: "Unknown", avatar: null, subtitle: null };
          const { data: msgs } = await supabase
            .from("messages")
            .select("body, created_at, read_at, sender_id")
            .eq("conversation_id", conv.id)
            .order("created_at", { ascending: false })
            .limit(1);
          const last = msgs?.[0];
          const { count: unread } = await supabase
            .from("messages")
            .select("*", { count: "exact", head: true })
            .eq("conversation_id", conv.id)
            .neq("sender_id", profile!.id)
            .is("read_at", null);

          return {
            id: conv.id,
            subject: conv.subject,
            otherName: display.name,
            otherAvatar: display.avatar,
            otherSubtitle: display.subtitle,
            lastMessage: last?.body ?? null,
            lastMessageAt: last?.created_at ?? conv.updated_at,
            unread: unread ?? 0,
          };
        })
      );

      return results.sort(
        (a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
      );
    },
  });
}

// ─── Mentoring ──────────────────────────────────────────────────────────────

export function useMentoringSessions() {
  const { profile, candidate } = useAuth();
  return useQuery({
    queryKey: ["mentoring", profile?.id, candidate?.id],
    enabled: !!profile?.id && profile.role !== "admin",
    queryFn: async () => {
      let query = supabase
        .from("mentoring_sessions")
        .select("*, mentor:profiles!mentoring_sessions_mentor_id_fkey(full_name, avatar_url)")
        .order("scheduled_at", { ascending: true });
      if (profile?.role === "candidate" && candidate) {
        query = query.eq("candidate_id", candidate.id);
      } else if (profile?.role === "employer") {
        query = query.eq("mentor_id", profile.id);
      }
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
}

export function useAdminMentors() {
  return useQuery({
    queryKey: ["admin-mentors"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, email, avatar_url")
        .eq("role", "admin")
        .order("full_name");
      if (error) throw error;
      return data;
    },
  });
}

export function useAdminMentoringSessions() {
  return useQuery({
    queryKey: ["admin-mentoring-sessions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("mentoring_sessions")
        .select(
          "*, mentor:profiles!mentoring_sessions_mentor_id_fkey(id, full_name, avatar_url), candidate:candidates!mentoring_sessions_candidate_id_fkey(id, profiles(full_name, email))"
        )
        .order("scheduled_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

// ─── Public ─────────────────────────────────────────────────────────────────

export function useInsightArticles() {
  return useQuery({
    queryKey: ["insight-articles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("insight_articles")
        .select("*")
        .eq("published", true)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useSubmitContact() {
  return useMutation({
    mutationFn: async (submission: {
      name: string;
      email: string;
      company?: string;
      message: string;
    }) => {
      const { error } = await supabase.from("contact_submissions").insert(submission);
      if (error) throw error;
    },
  });
}

// ─── Admin users ────────────────────────────────────────────────────────────

export function useAdminUsers() {
  return useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("role", "admin")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useAdminEmployerUsers() {
  return useQuery({
    queryKey: ["admin-employer-users"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select(
          "id, full_name, email, account_status, created_at, employers(id, title, company_id, companies(id, name))"
        )
        .eq("role", "employer")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

// ─── Employer tasks ─────────────────────────────────────────────────────────

export function useEmployerTasks() {
  const { profile } = useAuth();
  return useQuery({
    queryKey: ["employer-tasks", profile?.id],
    enabled: profile?.role === "employer",
    queryFn: async () => {
      const { data: employer } = await supabase
        .from("employers")
        .select("id")
        .eq("profile_id", profile!.id)
        .single();
      if (!employer) return [];
      const { data, error } = await supabase
        .from("employer_tasks")
        .select("*")
        .eq("employer_id", employer.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useToggleEmployerTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, completed }: { id: string; completed: boolean }) => {
      const { error } = await supabase.from("employer_tasks").update({ completed }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["employer-tasks"] }),
  });
}

export function useCreateEmployerTask() {
  const qc = useQueryClient();
  const { profile } = useAuth();
  return useMutation({
    mutationFn: async (task: { title: string; description?: string; priority?: string; due_at?: string }) => {
      const { data: employer } = await supabase
        .from("employers")
        .select("id")
        .eq("profile_id", profile!.id)
        .single();
      if (!employer) throw new Error("Employer profile not found");
      const { error } = await supabase.from("employer_tasks").insert({
        employer_id: employer.id,
        title: task.title,
        description: task.description ?? null,
        priority: task.priority ?? "medium",
        due_at: task.due_at ?? null,
        completed: false,
      });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["employer-tasks"] }),
  });
}

export function useEmployerInternshipTasks() {
  const { profile } = useAuth();
  return useQuery({
    queryKey: ["employer-internship-tasks", profile?.id],
    enabled: profile?.role === "employer",
    queryFn: async () => {
      const { data: employer } = await supabase
        .from("employers")
        .select("company_id")
        .eq("profile_id", profile!.id)
        .single();
      if (!employer?.company_id) return [];
      const { data, error } = await supabase
        .from("stage_tasks")
        .select("*")
        .eq("stage_id", "internship")
        .eq("company_id", employer.company_id)
        .order("sort_order");
      if (error) throw error;
      return data;
    },
  });
}

export function useSaveEmployerInternshipTask() {
  const qc = useQueryClient();
  const { profile } = useAuth();
  return useMutation({
    mutationFn: async (task: {
      id?: string;
      title: string;
      description?: string | null;
      sort_order: number;
      task_type?: "task" | "course";
      content_url?: string | null;
      content_body?: string | null;
    }) => {
      const { data: employer } = await supabase
        .from("employers")
        .select("company_id")
        .eq("profile_id", profile!.id)
        .single();
      if (!employer?.company_id) throw new Error("Company profile required");

      const payload = {
        stage_id: "internship" as const,
        company_id: employer.company_id,
        title: task.title.trim(),
        description: task.description?.trim() || null,
        sort_order: task.sort_order,
        task_type: task.task_type ?? "task",
        content_url: task.content_url?.trim() || null,
        content_body: task.content_body?.trim() || null,
      };

      if (task.id) {
        const { error } = await supabase.from("stage_tasks").update(payload).eq("id", task.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("stage_tasks").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["employer-internship-tasks"] });
      qc.invalidateQueries({ queryKey: ["stage-tasks"] });
    },
  });
}

export function useDeleteEmployerInternshipTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("stage_tasks").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["employer-internship-tasks"] });
      qc.invalidateQueries({ queryKey: ["stage-tasks"] });
    },
  });
}

export function useEmployerActivationTasks() {
  const { profile } = useAuth();
  return useQuery({
    queryKey: ["employer-activation-tasks", profile?.id],
    enabled: profile?.role === "employer",
    queryFn: async () => {
      const { data: employer } = await supabase
        .from("employers")
        .select("company_id")
        .eq("profile_id", profile!.id)
        .single();
      if (!employer?.company_id) return [];
      const { data, error } = await supabase
        .from("stage_tasks")
        .select("*")
        .eq("stage_id", "activation")
        .eq("company_id", employer.company_id)
        .order("sort_order");
      if (error) throw error;
      return data;
    },
  });
}

export function useSaveEmployerActivationTask() {
  const qc = useQueryClient();
  const { profile } = useAuth();
  return useMutation({
    mutationFn: async (task: {
      id?: string;
      title: string;
      description?: string | null;
      sort_order: number;
      task_type?: "task" | "course";
      content_url?: string | null;
      content_body?: string | null;
    }) => {
      const { data: employer } = await supabase
        .from("employers")
        .select("company_id")
        .eq("profile_id", profile!.id)
        .single();
      if (!employer?.company_id) throw new Error("Company profile required");

      const payload = {
        stage_id: "activation" as const,
        company_id: employer.company_id,
        title: task.title.trim(),
        description: task.description?.trim() || null,
        sort_order: task.sort_order,
        task_type: task.task_type ?? "task",
        content_url: task.content_url?.trim() || null,
        content_body: task.content_body?.trim() || null,
      };

      if (task.id) {
        const { error } = await supabase.from("stage_tasks").update(payload).eq("id", task.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("stage_tasks").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["employer-activation-tasks"] });
      qc.invalidateQueries({ queryKey: ["stage-tasks"] });
    },
  });
}

export function useDeleteEmployerActivationTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("stage_tasks").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["employer-activation-tasks"] });
      qc.invalidateQueries({ queryKey: ["stage-tasks"] });
    },
  });
}

export function useEmployerJobApplications(jobId: string | undefined) {
  const { profile } = useAuth();
  return useQuery({
    queryKey: ["employer-job-applications", jobId, profile?.id],
    enabled: !!jobId && profile?.role === "employer",
    queryFn: async () => {
      const { data: employer } = await supabase
        .from("employers")
        .select("company_id")
        .eq("profile_id", profile!.id)
        .single();
      if (!employer) return [];
      const { data, error } = await supabase
        .from("applications")
        .select("*, candidates(id, title, profiles(full_name, email, avatar_url)), jobs!inner(title, company_id)")
        .eq("job_id", jobId!)
        .eq("jobs.company_id", employer.company_id)
        .order("applied_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useUpdateCompany() {
  const qc = useQueryClient();
  const { profile } = useAuth();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Record<string, unknown>) => {
      const { data, error } = await supabase
        .from("companies")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      if (!data) throw new Error("Company could not be updated.");
      return data;
    },
    onSuccess: (data) => {
      qc.setQueryData(["my-company", profile?.id], (old: { companies?: unknown } | undefined) => {
        if (!old) return old;
        return { ...old, companies: data };
      });
      qc.invalidateQueries({ queryKey: ["my-company"] });
      qc.invalidateQueries({ queryKey: ["admin-employers"] });
      qc.invalidateQueries({ queryKey: ["company", data.id] });
      qc.invalidateQueries({ queryKey: ["jobs-open"] });
      qc.invalidateQueries({ queryKey: ["admin-jobs"] });
    },
  });
}

export function useUpdateEmployerContact() {
  const qc = useQueryClient();
  const { profile } = useAuth();
  return useMutation({
    mutationFn: async (payload: {
      employerId: string;
      contact_name: string;
      contact_role: string;
      contact_email: string;
      contact_phone: string;
    }) => {
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          full_name: payload.contact_name.trim(),
          email: payload.contact_email.trim(),
          phone: payload.contact_phone.trim() || null,
        })
        .eq("id", profile!.id);
      if (profileError) throw profileError;

      const { error: employerError } = await supabase
        .from("employers")
        .update({ title: payload.contact_role.trim() || null })
        .eq("id", payload.employerId);
      if (employerError) throw employerError;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["my-company", profile?.id] });
    },
  });
}

/** Close all company jobs and suspend the company so listings disappear for candidates. */
export function useRemoveCompany() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (companyId: string) => {
      const { error: jobsError } = await supabase
        .from("jobs")
        .update({ status: "closed" })
        .eq("company_id", companyId);
      if (jobsError) throw jobsError;

      const { error: companyError } = await supabase
        .from("companies")
        .update({ status: "suspended" })
        .eq("id", companyId);
      if (companyError) throw companyError;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["my-company"] });
      qc.invalidateQueries({ queryKey: ["admin-employers"] });
      qc.invalidateQueries({ queryKey: ["company"] });
      qc.invalidateQueries({ queryKey: ["jobs-open"] });
      qc.invalidateQueries({ queryKey: ["admin-jobs"] });
      qc.invalidateQueries({ queryKey: ["employer-jobs"] });
    },
  });
}

export function useDeleteCandidate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (candidateId: string) => {
      const { error } = await supabase.rpc("admin_delete_candidate", {
        p_candidate_id: candidateId,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-candidates"] });
      qc.invalidateQueries({ queryKey: ["admin-users"] });
      qc.invalidateQueries({ queryKey: ["admin-journey-stats"] });
      qc.invalidateQueries({ queryKey: ["admin-candidate-journey-brief"] });
      qc.invalidateQueries({ queryKey: ["admin-mentoring-pipeline"] });
      qc.invalidateQueries({ queryKey: ["admin-readiness-overview"] });
      qc.invalidateQueries({ queryKey: ["platform-stats"] });
    },
  });
}

export function useDeleteCompany() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (companyId: string) => {
      const { error } = await supabase.rpc("admin_delete_company", {
        p_company_id: companyId,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-employers"] });
      qc.invalidateQueries({ queryKey: ["admin-employer-users"] });
      qc.invalidateQueries({ queryKey: ["admin-jobs"] });
      qc.invalidateQueries({ queryKey: ["jobs-open"] });
      qc.invalidateQueries({ queryKey: ["platform-stats"] });
    },
  });
}

export function useDeleteEmployerUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (profileId: string) => {
      const { error } = await supabase.rpc("admin_delete_employer_user", {
        p_profile_id: profileId,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-employer-users"] });
      qc.invalidateQueries({ queryKey: ["admin-employers"] });
      qc.invalidateQueries({ queryKey: ["platform-stats"] });
    },
  });
}

export function usePlatformStats() {
  return useQuery({
    queryKey: ["platform-stats"],
    queryFn: async () => {
      const [candidates, companies, jobs, issues, applications, tickets] = await Promise.all([
        supabase.from("candidates").select("*", { count: "exact", head: true }),
        supabase.from("companies").select("*", { count: "exact", head: true }),
        supabase.from("jobs").select("*", { count: "exact", head: true }),
        supabase.from("issues").select("*", { count: "exact", head: true }).eq("status", "open"),
        supabase.from("applications").select("*", { count: "exact", head: true }),
        supabase.from("support_tickets").select("*", { count: "exact", head: true }).eq("status", "open"),
      ]);
      return {
        candidates: candidates.count ?? 0,
        companies: companies.count ?? 0,
        jobs: jobs.count ?? 0,
        openIssues: issues.count ?? 0,
        applications: applications.count ?? 0,
        openSupportTickets: tickets.count ?? 0,
      };
    },
  });
}

export function useCompanyById(id: string | undefined) {
  return useQuery({
    queryKey: ["company", id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("companies")
        .select("*, employers(id, profile_id, title, profiles(full_name, email)), jobs(id, status)")
        .eq("id", id!)
        .single();
      if (error) throw error;
      return data;
    },
  });
}

export function useAnnouncements() {
  return useQuery({
    queryKey: ["announcements"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("announcements")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateAnnouncement() {
  const { profile } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      title: string;
      body: string;
      audience: "candidates" | "companies" | "all";
    }) => {
      const { error } = await supabase.from("announcements").insert({
        title: input.title,
        body: input.body,
        published: true,
        created_by: profile?.id ?? null,
      });
      if (error) throw error;

      const roles =
        input.audience === "candidates"
          ? (["candidate"] as const)
          : input.audience === "companies"
            ? (["employer"] as const)
            : (["candidate", "employer", "admin"] as const);

      const { data: users } = await supabase.from("profiles").select("id").in("role", [...roles]);
      if (users?.length) {
        await supabase.from("notifications").insert(
          users.map((u) => ({
            user_id: u.id,
            title: input.title,
            body: input.body,
            type: "announcement",
          })),
        );
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["announcements"] });
      qc.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

export type MessageableUser = {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  role: string;
  subtitle?: string;
};

export function useMessageableUsers() {
  const { profile } = useAuth();
  return useQuery({
    queryKey: ["messageable-users", profile?.id, profile?.role],
    enabled: !!profile?.id,
    queryFn: async (): Promise<MessageableUser[]> => {
      const map = new Map<string, MessageableUser>();
      const add = (u: MessageableUser) => {
        if (u.id !== profile!.id) map.set(u.id, u);
      };

      if (profile!.role === "employer") {
        const { data: employer } = await supabase
          .from("employers")
          .select("company_id")
          .eq("profile_id", profile!.id)
          .single();
        if (!employer) return [];
        const { data: apps } = await supabase
          .from("applications")
          .select(
            "candidates(profile_id, title, profiles(id, full_name, avatar_url, role)), jobs!inner(title, company_id)",
          )
          .eq("jobs.company_id", employer.company_id);
        for (const app of apps ?? []) {
          const c = app.candidates as {
            profile_id: string;
            title: string | null;
            profiles: { full_name: string | null; avatar_url: string | null; role: string } | null;
          };
          const job = app.jobs as { title: string };
          if (c?.profiles) {
            add({
              id: c.profile_id,
              full_name: c.profiles.full_name,
              avatar_url: c.profiles.avatar_url,
              role: c.profiles.role,
              subtitle: c.title ?? job.title,
            });
          }
        }
      } else if (profile!.role === "candidate") {
        const { data: cand } = await supabase
          .from("candidates")
          .select("id")
          .eq("profile_id", profile!.id)
          .single();
        if (cand) {
          const { data: apps } = await supabase
            .from("applications")
            .select("jobs!inner(company_id, title, companies(name))")
            .eq("candidate_id", cand.id);
          const companyIds = [...new Set((apps ?? []).map((a) => (a.jobs as { company_id: string }).company_id))];
          if (companyIds.length > 0) {
            const { data: employers } = await supabase
              .from("employers")
              .select("profile_id, profiles(id, full_name, avatar_url, role), companies(name, logo_url)")
              .in("company_id", companyIds);
            for (const emp of employers ?? []) {
              const p = emp.profiles as { full_name: string | null; avatar_url: string | null; role: string } | null;
              const company = emp.companies as { name: string; logo_url: string | null } | null;
              if (p) {
                add({
                  id: emp.profile_id,
                  full_name: company?.name ?? p.full_name,
                  avatar_url: company?.logo_url ?? p.avatar_url,
                  role: p.role,
                  subtitle: company?.name ? (p.full_name ?? "Recruiter") : "Employer",
                });
              }
            }
          }
        }
        const { data: admins } = await supabase
          .from("profiles")
          .select("id, full_name, avatar_url, role")
          .eq("role", "admin");
        for (const a of admins ?? []) {
          add({ ...a, subtitle: "Nordic Ascent Support" });
        }
      } else if (profile!.role === "admin") {
        const { data: users } = await supabase
          .from("profiles")
          .select("id, full_name, avatar_url, role")
          .neq("id", profile!.id)
          .order("full_name")
          .limit(100);
        for (const u of users ?? []) {
          add({ ...u, subtitle: u.role });
        }
      }

      return Array.from(map.values());
    },
  });
}

export function useStartConversation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ otherProfileId, subject }: { otherProfileId: string; subject?: string }) => {
      return getOrCreateConversationWithProfile(otherProfileId, subject);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["conversations-details"] });
    },
  });
}

export type PlatformSettingsData = {
  platformName: string;
  supportEmail: string;
  defaultLanguage: string;
  timezone: string;
  candidateRegistration: boolean;
  employerRegistration: boolean;
  maintenanceMode: boolean;
  allowAdminSignup: boolean;
  primaryColor: string;
  secondaryColor: string;
};

const defaultPlatformSettings: PlatformSettingsData = {
  platformName: "Nordic Ascent",
  supportEmail: "support@nordicascent.com",
  defaultLanguage: "en",
  timezone: "cet",
  candidateRegistration: true,
  employerRegistration: true,
  maintenanceMode: false,
  allowAdminSignup: false,
  primaryColor: "#2E7DFF",
  secondaryColor: "#1B1B1B",
};

export function usePlatformSettings() {
  return useQuery({
    queryKey: ["platform-settings"],
    queryFn: async (): Promise<PlatformSettingsData> => {
      const { data, error } = await supabase
        .from("platform_settings")
        .select("settings")
        .eq("id", "default")
        .maybeSingle();
      if (error) throw error;
      return { ...defaultPlatformSettings, ...(data?.settings as Partial<PlatformSettingsData> ?? {}) };
    },
  });
}

export function useUpdatePlatformSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (settings: PlatformSettingsData) => {
      const { error } = await supabase
        .from("platform_settings")
        .upsert({ id: "default", settings, updated_at: new Date().toISOString() });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["platform-settings"] }),
  });
}

export function useClearPlatformData() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { error } = await supabase.rpc("admin_clear_platform_data");
      if (error) {
        if (error.message.includes("admin_clear_platform_data")) {
          throw new Error(
            "Reset function not installed. Run migration 030_admin_clear_platform_data_rpc.sql in Supabase SQL Editor, then try again."
          );
        }
        throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries();
    },
  });
}

export function usePublicStats() {
  return useQuery({
    queryKey: ["public-stats"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_public_stats");
      if (error) throw error;
      return data as { candidates: number; companies: number; openJobs: number };
    },
    staleTime: 60_000,
  });
}

export type PublicConfig = {
  candidateRegistration: boolean;
  employerRegistration: boolean;
  maintenanceMode: boolean;
  platformName: string;
};

export function usePublicConfig() {
  return useQuery({
    queryKey: ["public-config"],
    queryFn: async (): Promise<PublicConfig> => {
      const { data, error } = await supabase.rpc("get_public_config");
      if (error) throw error;
      return data as PublicConfig;
    },
    staleTime: 60_000,
  });
}

// ─── Issues, stages, users ───────────────────────────────────────────────────

export function useResolveIssue() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("issues")
        .update({ status: "resolved", resolved_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["issues"] }),
  });
}

export function useAdvanceCandidateStage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (candidateId: string) => {
      await advanceCandidateStage(candidateId);
    },
    onSuccess: (_, candidateId) => {
      qc.invalidateQueries({ queryKey: ["candidate", candidateId] });
      qc.invalidateQueries({ queryKey: ["admin-candidates"] });
      qc.invalidateQueries({ queryKey: ["stage-progress"] });
    },
  });
}

export function useUpdateUserAccountStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, account_status }: { id: string; account_status: string }) => {
      const { error } = await supabase.from("profiles").update({ account_status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-users"] }),
  });
}

// ─── Contact submissions ─────────────────────────────────────────────────────

export function useContactSubmissions() {
  return useQuery({
    queryKey: ["contact-submissions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contact_submissions")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useUpdateContactSubmission() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from("contact_submissions").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["contact-submissions"] }),
  });
}

// ─── Support tickets ─────────────────────────────────────────────────────────

export function useMySupportTickets() {
  const { profile } = useAuth();
  return useQuery({
    queryKey: ["my-support-tickets", profile?.id],
    enabled: !!profile?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("support_tickets")
        .select("*")
        .eq("user_id", profile!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateSupportTicket() {
  const qc = useQueryClient();
  const { profile } = useAuth();
  return useMutation({
    mutationFn: async ({ subject, body }: { subject: string; body: string }) => {
      const { data: ticket, error } = await supabase
        .from("support_tickets")
        .insert({ user_id: profile!.id, subject, status: "open", priority: "medium" })
        .select("id")
        .single();
      if (error) throw error;
      await supabase.from("support_ticket_messages").insert({
        ticket_id: ticket.id,
        sender_id: profile!.id,
        body,
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["my-support-tickets"] });
      qc.invalidateQueries({ queryKey: ["support-tickets"] });
    },
  });
}

export function useSupportTicketMessages(ticketId: string | undefined) {
  return useQuery({
    queryKey: ["support-ticket-messages", ticketId],
    enabled: !!ticketId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("support_ticket_messages")
        .select("*, profiles(full_name)")
        .eq("ticket_id", ticketId!)
        .order("created_at");
      if (error) throw error;
      return data;
    },
  });
}

export function useReplySupportTicket() {
  const qc = useQueryClient();
  const { profile } = useAuth();
  return useMutation({
    mutationFn: async ({ ticketId, body }: { ticketId: string; body: string }) => {
      const { error } = await supabase.from("support_ticket_messages").insert({
        ticket_id: ticketId,
        sender_id: profile!.id,
        body,
      });
      if (error) throw error;
      await supabase
        .from("support_tickets")
        .update({ updated_at: new Date().toISOString(), status: "open" })
        .eq("id", ticketId);
    },
    onSuccess: (_, { ticketId }) => {
      qc.invalidateQueries({ queryKey: ["support-ticket-messages", ticketId] });
      qc.invalidateQueries({ queryKey: ["support-tickets"] });
      qc.invalidateQueries({ queryKey: ["my-support-tickets"] });
    },
  });
}

export function useCloseSupportTicket() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (ticketId: string) => {
      const { error } = await supabase
        .from("support_tickets")
        .update({ status: "closed", updated_at: new Date().toISOString() })
        .eq("id", ticketId);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["support-tickets"] }),
  });
}

// ─── Insight articles (admin CMS) ────────────────────────────────────────────

export function useAdminInsightArticles() {
  return useQuery({
    queryKey: ["admin-insight-articles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("insight_articles")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useSaveInsightArticle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (article: Record<string, unknown> & { id?: string }) => {
      if (article.id) {
        const { id, ...rest } = article;
        const { error } = await supabase.from("insight_articles").update(rest).eq("id", id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("insight_articles").insert(article);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-insight-articles"] });
      qc.invalidateQueries({ queryKey: ["insight-articles"] });
    },
  });
}

export function useDeleteInsightArticle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("insight_articles").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-insight-articles"] });
      qc.invalidateQueries({ queryKey: ["insight-articles"] });
    },
  });
}

// ─── Stage tasks (admin) ─────────────────────────────────────────────────────

export function useSaveStageTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (task: {
      id?: string;
      stage_id: string;
      title: string;
      description?: string | null;
      sort_order: number;
      task_type: "task" | "course";
      content_url?: string | null;
      image_url?: string | null;
      content_body?: string | null;
    }) => {
      const payload = {
        stage_id: task.stage_id,
        company_id: null as string | null,
        title: task.title,
        description: task.description ?? null,
        sort_order: task.sort_order,
        task_type: task.task_type,
        content_url: task.content_url?.trim() || null,
        image_url: task.image_url?.trim() || null,
        content_body: task.content_body?.trim() || null,
      };
      if (task.id) {
        const { error } = await supabase.from("stage_tasks").update(payload).eq("id", task.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("stage_tasks").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["stage-tasks", vars.stage_id] });
      qc.invalidateQueries({ queryKey: ["admin-stage-tasks"] });
    },
  });
}

export function useDeleteStageTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, stageId }: { id: string; stageId: string }) => {
      const { error } = await supabase.from("stage_tasks").delete().eq("id", id);
      if (error) throw error;
      return stageId;
    },
    onSuccess: (stageId) => {
      qc.invalidateQueries({ queryKey: ["stage-tasks", stageId] });
      qc.invalidateQueries({ queryKey: ["admin-stage-tasks"] });
    },
  });
}

export function useCandidateTaskProgress(candidateId: string | undefined) {
  return useQuery({
    queryKey: ["candidate-task-progress", candidateId],
    enabled: !!candidateId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("candidate_task_progress")
        .select("*")
        .eq("candidate_id", candidateId!);
      if (error) throw error;
      return data;
    },
  });
}

export function useCandidateStageProgress(candidateId: string | undefined) {
  return useQuery({
    queryKey: ["candidate-stage-progress", candidateId],
    enabled: !!candidateId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("candidate_stage_progress")
        .select("*, pipeline_stages(name)")
        .eq("candidate_id", candidateId!);
      if (error) throw error;
      return data;
    },
  });
}

export function useAdminMarkTaskComplete() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ candidateId, taskId }: { candidateId: string; taskId: string }) => {
      const { error } = await supabase.from("candidate_task_progress").insert({
        candidate_id: candidateId,
        task_id: taskId,
      });
      if (error) throw error;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["candidate-task-progress", vars.candidateId] });
      qc.invalidateQueries({ queryKey: ["task-progress"] });
      qc.invalidateQueries({ queryKey: ["admin-candidates"] });
    },
  });
}

// ─── Mentoring ───────────────────────────────────────────────────────────────

export function useCompanyMentors() {
  const { profile } = useAuth();
  return useQuery({
    queryKey: ["company-mentors", profile?.id],
    enabled: profile?.role === "employer",
    queryFn: async () => {
      const { data: employer } = await supabase
        .from("employers")
        .select("company_id")
        .eq("profile_id", profile!.id)
        .single();
      if (!employer?.company_id) return [];
      const { data, error } = await supabase
        .from("company_mentors")
        .select("*")
        .eq("company_id", employer.company_id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useCreateCompanyMentor() {
  const qc = useQueryClient();
  const { profile } = useAuth();
  return useMutation({
    mutationFn: async (mentor: {
      name: string;
      role_title?: string;
      email: string;
      phone?: string;
    }) => {
      const { data: employer } = await supabase
        .from("employers")
        .select("company_id")
        .eq("profile_id", profile!.id)
        .single();
      if (!employer?.company_id) throw new Error("Company not found");
      const { error } = await supabase.from("company_mentors").insert({
        company_id: employer.company_id,
        name: mentor.name.trim(),
        role_title: mentor.role_title?.trim() || null,
        email: mentor.email.trim().toLowerCase(),
        phone: mentor.phone?.trim() || null,
        status: "active",
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["company-mentors"] });
    },
  });
}

export function useCreateMentoringSession() {
  const qc = useQueryClient();
  const { profile } = useAuth();
  return useMutation({
    mutationFn: async (session: {
      candidate_id: string;
      title: string;
      scheduled_at: string;
      duration_minutes?: number;
      meeting_url?: string;
      notes?: string;
      mentor_id?: string;
    }) => {
      const { mentor_id: mentorOverride, ...rest } = session;
      const { error } = await supabase.from("mentoring_sessions").insert({
        ...rest,
        mentor_id: mentorOverride ?? profile!.id,
        status: "scheduled",
        duration_minutes: session.duration_minutes ?? 60,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["mentoring"] });
      qc.invalidateQueries({ queryKey: ["admin-mentoring-sessions"] });
    },
  });
}

export function useUpdateMentoringSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      ...updates
    }: {
      id: string;
      status?: string;
      title?: string;
      scheduled_at?: string;
      meeting_url?: string | null;
      notes?: string | null;
      duration_minutes?: number;
    }) => {
      const { error } = await supabase.from("mentoring_sessions").update(updates).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["mentoring"] });
      qc.invalidateQueries({ queryKey: ["admin-mentoring-sessions"] });
    },
  });
}

export type AdminMentoringCandidateRow = {
  id: string;
  fullName: string;
  email: string;
  testsTotal: number;
  testsSubmitted: number;
  jobsUnlocked: boolean;
  sessionCount: number;
  nextSessionAt: string | null;
};

export function useAdminMentoringPipeline() {
  return useQuery({
    queryKey: ["admin-mentoring-pipeline"],
    queryFn: async () => {
      const [
        { data: candidates, error: cErr },
        { data: tests, error: tErr },
        { data: attempts, error: aErr },
        { data: sessions, error: sErr },
      ] = await Promise.all([
        supabase
          .from("candidates")
          .select("id, jobs_unlocked, profiles(full_name, email)")
          .order("created_at", { ascending: false }),
        supabase.from("readiness_tests").select("id").eq("active", true),
        supabase.from("readiness_attempts").select("candidate_id, status"),
        supabase.from("mentoring_sessions").select("candidate_id, scheduled_at, status"),
      ]);
      if (cErr) throw cErr;
      if (tErr) throw tErr;
      if (aErr) throw aErr;
      if (sErr) throw sErr;

      const testsTotal = tests?.length ?? 0;
      const rows: AdminMentoringCandidateRow[] = (candidates ?? [])
        .map((c) => {
          const p = c.profiles as { full_name: string | null; email: string | null } | null;
          const candAttempts = (attempts ?? []).filter((a) => a.candidate_id === c.id);
          const submitted = candAttempts.filter((a) => a.status === "submitted" || a.status === "expired");
          const candSessions = (sessions ?? []).filter((s) => s.candidate_id === c.id);
          const upcoming = candSessions
            .filter((s) => s.status === "scheduled")
            .map((s) => s.scheduled_at)
            .sort();

          return {
            id: c.id,
            fullName: p?.full_name ?? "Candidate",
            email: p?.email ?? "—",
            testsTotal,
            testsSubmitted: submitted.length,
            jobsUnlocked: Boolean(c.jobs_unlocked),
            sessionCount: candSessions.length,
            nextSessionAt: upcoming[0] ?? null,
          };
        })
        .filter((r) => r.testsTotal > 0 && r.testsSubmitted >= r.testsTotal);

      return rows.sort((a, b) => {
        if (!a.jobsUnlocked && b.jobsUnlocked) return -1;
        if (a.jobsUnlocked && !b.jobsUnlocked) return 1;
        return a.fullName.localeCompare(b.fullName);
      });
    },
  });
}

export function useUnlockCandidateJobs() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ candidateId, unlock }: { candidateId: string; unlock: boolean }) => {
      const { error } = await supabase
        .from("candidates")
        .update({ jobs_unlocked: unlock, updated_at: new Date().toISOString() })
        .eq("id", candidateId);
      if (error) throw error;

      if (unlock) {
        const { data: cand } = await supabase
          .from("candidates")
          .select("track")
          .eq("id", candidateId)
          .single();
        await activateJobsAfterMentoringUnlock(candidateId, (cand?.track ?? "entry") as Track);
      }
    },
    onSuccess: (_, { candidateId }) => {
      qc.invalidateQueries({ queryKey: ["admin-mentoring-pipeline"] });
      qc.invalidateQueries({ queryKey: ["admin-journey-stats"] });
      qc.invalidateQueries({ queryKey: ["admin-candidate-journey-brief"] });
      qc.invalidateQueries({ queryKey: ["admin-candidates"] });
      qc.invalidateQueries({ queryKey: ["candidate", candidateId] });
      qc.invalidateQueries({ queryKey: ["stage-progress"] });
    },
  });
}

export type AdminJourneyStats = {
  waitlistPending: number;
  readinessNeedsReview: number;
  mentoringPipeline: number;
  jobsUnlocked: number;
};

export function useAdminJourneyStats() {
  return useQuery({
    queryKey: ["admin-journey-stats"],
    queryFn: async () => {
      const [
        { count: waitlistPending, error: wErr },
        { data: tests, error: tErr },
        { data: attempts, error: aErr },
        { data: candidates, error: cErr },
        { data: evaluations, error: eErr },
      ] = await Promise.all([
        supabase
          .from("university_waitlist")
          .select("id", { count: "exact", head: true })
          .eq("status", "pending"),
        supabase.from("readiness_tests").select("id").eq("active", true),
        supabase.from("readiness_attempts").select("candidate_id, status"),
        supabase.from("candidates").select("id, jobs_unlocked, university_id"),
        supabase.from("readiness_evaluations").select("candidate_id, evaluated_at"),
      ]);
      if (wErr) throw wErr;
      if (tErr) throw tErr;
      if (aErr) throw aErr;
      if (cErr) throw cErr;
      if (eErr) throw eErr;

      const testsTotal = tests?.length ?? 0;
      const evalByCandidate = new Map((evaluations ?? []).map((e) => [e.candidate_id, e]));

      let readinessNeedsReview = 0;
      let mentoringPipeline = 0;
      let jobsUnlocked = 0;

      for (const c of candidates ?? []) {
        if (c.jobs_unlocked) jobsUnlocked += 1;
        const submitted = (attempts ?? []).filter(
          (a) =>
            a.candidate_id === c.id && (a.status === "submitted" || a.status === "expired")
        ).length;
        const readinessDone = testsTotal > 0 && submitted >= testsTotal;
        if (readinessDone && !c.jobs_unlocked) mentoringPipeline += 1;
        if (readinessDone && !evalByCandidate.get(c.id)?.evaluated_at) readinessNeedsReview += 1;
      }

      return {
        waitlistPending: waitlistPending ?? 0,
        readinessNeedsReview,
        mentoringPipeline,
        jobsUnlocked,
      } satisfies AdminJourneyStats;
    },
  });
}

export function useAdminCandidateJourneyBrief() {
  return useQuery({
    queryKey: ["admin-candidate-journey-brief"],
    queryFn: async () => {
      const [{ data: candidates, error: cErr }, { data: tests, error: tErr }, { data: attempts, error: aErr }] =
        await Promise.all([
          supabase.from("candidates").select("id, university_id, jobs_unlocked"),
          supabase.from("readiness_tests").select("id").eq("active", true),
          supabase.from("readiness_attempts").select("candidate_id, status"),
        ]);
      if (cErr) throw cErr;
      if (tErr) throw tErr;
      if (aErr) throw aErr;

      const testsTotal = tests?.length ?? 0;
      const map = new Map<string, AdminCandidateJourneyStage>();

      for (const c of candidates ?? []) {
        const testsSubmitted = (attempts ?? []).filter(
          (a) =>
            a.candidate_id === c.id && (a.status === "submitted" || a.status === "expired")
        ).length;
        map.set(
          c.id,
          inferCandidateJourneyStage({
            universityId: c.university_id,
            jobsUnlocked: Boolean(c.jobs_unlocked),
            testsSubmitted,
            testsTotal,
          })
        );
      }

      return map;
    },
  });
}

export function useEmployerApplicantCandidate(candidateId: string | undefined) {
  const { profile } = useAuth();
  return useQuery({
    queryKey: ["employer-candidate", candidateId, profile?.id],
    enabled: !!candidateId && profile?.role === "employer",
    queryFn: async () => {
      const { data: employer } = await supabase
        .from("employers")
        .select("company_id")
        .eq("profile_id", profile!.id)
        .single();
      if (!employer) return null;
      const { data, error } = await supabase
        .from("candidates")
        .select("*, profiles(full_name, email, phone, avatar_url), applications!inner(id, status, stage_id, job_id, interview_meet_url, interview_scheduled_at, interview_notes, jobs!inner(title, company_id, companies(name)))")
        .eq("id", candidateId!)
        .eq("applications.jobs.company_id", employer.company_id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });
}

// ─── Notifications ───────────────────────────────────────────────────────────

export function useMarkNotificationRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("notifications")
        .update({ read_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });
}

export function useMarkAllNotificationsRead() {
  const qc = useQueryClient();
  const { profile } = useAuth();
  return useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("notifications")
        .update({ read_at: new Date().toISOString() })
        .eq("user_id", profile!.id)
        .is("read_at", null);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });
}

export function useMarkConversationRead() {
  const qc = useQueryClient();
  const { profile } = useAuth();
  return useMutation({
    mutationFn: async (conversationId: string) => {
      const { error } = await supabase
        .from("messages")
        .update({ read_at: new Date().toISOString() })
        .eq("conversation_id", conversationId)
        .neq("sender_id", profile!.id)
        .is("read_at", null);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["conversations-details"] }),
  });
}
