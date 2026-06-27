import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { activateMentoringStage } from "@/lib/preparationProgress";
import { seedReadinessModuleIfEmpty, allTestsSubmitted } from "@/lib/readiness";

export type ReadinessTest = {
  id: string;
  area: "cultural_social" | "technical";
  level: number;
  title: string;
  subtitle: string | null;
  intro_body: string | null;
  timer_minutes: number;
  timer_hard: boolean;
  sort_order: number;
  active: boolean;
};

export type ReadinessQuestion = {
  id: string;
  test_id: string;
  scenario_label: string | null;
  prompt: string;
  answer_type: "short" | "long" | "bullets" | "video";
  sort_order: number;
};

export type ReadinessAttempt = {
  id: string;
  candidate_id: string;
  test_id: string;
  status: "in_progress" | "submitted" | "expired";
  started_at: string;
  submitted_at: string | null;
  expires_at: string | null;
};

export type ReadinessAnswer = {
  id: string;
  attempt_id: string;
  question_id: string;
  answer_text: string | null;
  video_path: string | null;
};

export type ReadinessEvaluation = {
  id: string;
  candidate_id: string;
  cultural_signal: "strong" | "acceptable" | "weak" | null;
  technical_signal: "strong" | "acceptable" | "weak" | null;
  red_flag: boolean;
  red_flag_note: string | null;
  evaluator_notes: string | null;
  evaluated_at: string | null;
  approved_for_activation: boolean;
};


export function useReadinessTests() {
  return useQuery({
    queryKey: ["readiness-tests"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("readiness_tests")
        .select("*")
        .eq("active", true)
        .order("area")
        .order("level");
      if (error) throw error;
      return data as ReadinessTest[];
    },
  });
}

/** All tests including inactive — for admin content editor. */
export function useAdminReadinessTests() {
  return useQuery({
    queryKey: ["readiness-tests", "admin"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("readiness_tests")
        .select("*")
        .order("area")
        .order("level");
      if (error) throw error;
      return data as ReadinessTest[];
    },
  });
}

export function useReadinessQuestions(testId: string | undefined) {
  return useQuery({
    queryKey: ["readiness-questions", testId],
    enabled: !!testId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("readiness_questions")
        .select("*")
        .eq("test_id", testId!)
        .order("sort_order");
      if (error) throw error;
      return data as ReadinessQuestion[];
    },
  });
}

export function useMyReadinessAttempts() {
  const { candidate } = useAuth();
  return useQuery({
    queryKey: ["readiness-attempts", candidate?.id],
    enabled: !!candidate?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("readiness_attempts")
        .select("*")
        .eq("candidate_id", candidate!.id);
      if (error) throw error;
      return data as ReadinessAttempt[];
    },
  });
}

export function useMyReadinessEvaluation() {
  const { candidate } = useAuth();
  return useQuery({
    queryKey: ["readiness-evaluation", candidate?.id],
    enabled: !!candidate?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("readiness_evaluations")
        .select("*")
        .eq("candidate_id", candidate!.id)
        .maybeSingle();
      if (error) throw error;
      return data as ReadinessEvaluation | null;
    },
  });
}

export function useStartReadinessAttempt() {
  const qc = useQueryClient();
  const { candidate } = useAuth();
  return useMutation({
    mutationFn: async (test: ReadinessTest) => {
      if (!candidate?.id) throw new Error("Not signed in");
      const strict = test.timer_hard && test.timer_minutes > 0;
      const expiresAt = strict
        ? new Date(Date.now() + test.timer_minutes * 60 * 1000).toISOString()
        : null;

      const loadExisting = async () => {
        const { data, error } = await supabase
          .from("readiness_attempts")
          .select("*")
          .eq("candidate_id", candidate.id)
          .eq("test_id", test.id)
          .maybeSingle();
        if (error) throw error;
        return data as ReadinessAttempt | null;
      };

      const existing = await loadExisting();

      if (existing) {
        if (existing.status !== "in_progress") return existing;
        if (strict && !existing.expires_at) {
          const backfill =
            existing.started_at != null
              ? new Date(
                  new Date(existing.started_at).getTime() + test.timer_minutes * 60 * 1000
                ).toISOString()
              : expiresAt;
          const { data: patched, error: patchError } = await supabase
            .from("readiness_attempts")
            .update({ expires_at: backfill })
            .eq("id", existing.id)
            .select("*")
            .single();
          if (patchError) throw patchError;
          return patched as ReadinessAttempt;
        }
        if (!strict && existing.expires_at) {
          const { data: patched, error: patchError } = await supabase
            .from("readiness_attempts")
            .update({ expires_at: null })
            .eq("id", existing.id)
            .select("*")
            .single();
          if (patchError) throw patchError;
          return patched as ReadinessAttempt;
        }
        return existing;
      }

      const { data, error } = await supabase
        .from("readiness_attempts")
        .insert({
          candidate_id: candidate.id,
          test_id: test.id,
          status: "in_progress",
          expires_at: expiresAt,
        })
        .select("*")
        .single();

      if (error) {
        // Race: attempt created between SELECT and INSERT (e.g. hub → test navigation).
        if (error.code === "23505") {
          const retry = await loadExisting();
          if (retry) return retry;
        }
        throw error;
      }

      return data as ReadinessAttempt;
    },
    onSuccess: (attempt) => {
      qc.setQueryData<ReadinessAttempt[]>(
        ["readiness-attempts", candidate?.id],
        (prev) => {
          const rows = prev ?? [];
          const idx = rows.findIndex((a) => a.test_id === attempt.test_id);
          if (idx >= 0) {
            const next = [...rows];
            next[idx] = attempt;
            return next;
          }
          return [...rows, attempt];
        }
      );
      qc.invalidateQueries({ queryKey: ["readiness-attempts"] });
    },
  });
}

export function useSaveReadinessAnswer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      attemptId,
      questionId,
      answerText,
      videoPath,
    }: {
      attemptId: string;
      questionId: string;
      answerText?: string | null;
      videoPath?: string | null;
    }) => {
      const { data: existing } = await supabase
        .from("readiness_answers")
        .select("id")
        .eq("attempt_id", attemptId)
        .eq("question_id", questionId)
        .maybeSingle();

      const payload = {
        answer_text: answerText ?? null,
        video_path: videoPath ?? null,
        updated_at: new Date().toISOString(),
      };

      if (existing) {
        const { error } = await supabase
          .from("readiness_answers")
          .update(payload)
          .eq("id", existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("readiness_answers").insert({
          attempt_id: attemptId,
          question_id: questionId,
          ...payload,
        });
        if (error) throw error;
      }
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["readiness-answers", vars.attemptId] });
    },
  });
}

export function useReadinessAnswers(attemptId: string | undefined) {
  return useQuery({
    queryKey: ["readiness-answers", attemptId],
    enabled: !!attemptId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("readiness_answers")
        .select("*")
        .eq("attempt_id", attemptId!);
      if (error) throw error;
      return data as ReadinessAnswer[];
    },
  });
}

export function useSubmitReadinessAttempt() {
  const qc = useQueryClient();
  const { candidate } = useAuth();
  return useMutation({
    mutationFn: async ({
      attemptId,
      expired = false,
    }: {
      attemptId: string;
      expired?: boolean;
    }) => {
      const { error } = await supabase
        .from("readiness_attempts")
        .update({
          status: expired ? "expired" : "submitted",
          submitted_at: new Date().toISOString(),
        })
        .eq("id", attemptId);
      if (error) throw error;

      if (candidate?.id) {
        const { data: tests } = await supabase.from("readiness_tests").select("id").eq("active", true);
        const { data: attempts } = await supabase
          .from("readiness_attempts")
          .select("test_id, status")
          .eq("candidate_id", candidate.id);
        if (tests && attempts && allTestsSubmitted(tests, attempts)) {
          await activateMentoringStage(candidate.id);
        }
      }

      return { expired };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["readiness-attempts"] });
      qc.invalidateQueries({ queryKey: ["stage-progress"] });
    },
  });
}

// ─── Admin ───────────────────────────────────────────────────────────────────

export function useAdminReadinessAttempts(candidateId: string | undefined) {
  return useQuery({
    queryKey: ["readiness-attempts", "admin", candidateId],
    enabled: !!candidateId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("readiness_attempts")
        .select("*, readiness_tests(area, level, title)")
        .eq("candidate_id", candidateId!);
      if (error) throw error;
      return data;
    },
  });
}

export function useAdminReadinessAnswers(attemptId: string | undefined) {
  return useReadinessAnswers(attemptId);
}

export function useAdminReadinessEvaluation(candidateId: string | undefined) {
  return useQuery({
    queryKey: ["readiness-evaluation", candidateId],
    enabled: !!candidateId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("readiness_evaluations")
        .select("*")
        .eq("candidate_id", candidateId!)
        .maybeSingle();
      if (error) throw error;
      return data as ReadinessEvaluation | null;
    },
  });
}

export function useSaveReadinessEvaluation() {
  const qc = useQueryClient();
  const { profile } = useAuth();
  return useMutation({
    mutationFn: async ({
      candidateId,
      cultural_signal,
      technical_signal,
      red_flag,
      red_flag_note,
      evaluator_notes,
    }: {
      candidateId: string;
      cultural_signal: "strong" | "acceptable" | "weak" | null;
      technical_signal: "strong" | "acceptable" | "weak" | null;
      red_flag: boolean;
      red_flag_note: string | null;
      evaluator_notes: string | null;
    }) => {
      const now = new Date().toISOString();
      const payload = {
        candidate_id: candidateId,
        cultural_signal,
        technical_signal,
        red_flag,
        red_flag_note,
        evaluator_notes,
        evaluated_by: profile?.id ?? null,
        evaluated_at: now,
        updated_at: now,
      };

      const { data: existing } = await supabase
        .from("readiness_evaluations")
        .select("id")
        .eq("candidate_id", candidateId)
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from("readiness_evaluations")
          .update(payload)
          .eq("id", existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("readiness_evaluations").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["readiness-evaluation", vars.candidateId] });
      qc.invalidateQueries({ queryKey: ["candidate", vars.candidateId] });
      qc.invalidateQueries({ queryKey: ["stage-progress"] });
      qc.invalidateQueries({ queryKey: ["admin-readiness-overview"] });
    },
  });
}

export function useResetReadinessAttempt() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (attemptId: string) => {
      await supabase.from("readiness_answers").delete().eq("attempt_id", attemptId);
      const { error } = await supabase.from("readiness_attempts").delete().eq("id", attemptId);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["readiness-attempts"] });
    },
  });
}

export function useReseedReadinessModule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { count } = await supabase
        .from("readiness_tests")
        .select("id", { count: "exact", head: true });
      if ((count ?? 0) > 0) {
        throw new Error("Module already seeded. Delete tests first to re-seed.");
      }
      return seedReadinessModuleIfEmpty();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["readiness-tests"] });
      qc.invalidateQueries({ queryKey: ["readiness-question-counts"] });
      qc.invalidateQueries({ queryKey: ["admin-readiness-overview"] });
    },
  });
}

export type AdminReadinessCandidateRow = {
  id: string;
  fullName: string;
  email: string;
  testsTotal: number;
  testsSubmitted: number;
  testsInProgress: number;
  cultural_signal: ReadinessEvaluation["cultural_signal"];
  technical_signal: ReadinessEvaluation["technical_signal"];
  red_flag: boolean;
  evaluated: boolean;
  evaluated_at: string | null;
  lastSubmittedAt: string | null;
};

export function useAdminReadinessOverview() {
  return useQuery({
    queryKey: ["admin-readiness-overview"],
    queryFn: async () => {
      const [
        { data: candidates, error: cErr },
        { data: tests, error: tErr },
        { data: attempts, error: aErr },
        { data: evaluations, error: eErr },
      ] = await Promise.all([
        supabase.from("candidates").select("id, profiles(full_name, email)").order("created_at", { ascending: false }),
        supabase.from("readiness_tests").select("id").eq("active", true),
        supabase.from("readiness_attempts").select("candidate_id, status, submitted_at"),
        supabase.from("readiness_evaluations").select("*"),
      ]);
      if (cErr) throw cErr;
      if (tErr) throw tErr;
      if (aErr) throw aErr;
      if (eErr) throw eErr;

      const testsTotal = tests?.length ?? 0;
      const evalByCandidate = new Map((evaluations ?? []).map((e) => [e.candidate_id, e]));

      const rows: AdminReadinessCandidateRow[] = (candidates ?? []).map((c) => {
        const p = c.profiles as { full_name: string | null; email: string | null } | null;
        const candAttempts = (attempts ?? []).filter((a) => a.candidate_id === c.id);
        const submitted = candAttempts.filter((a) => a.status === "submitted" || a.status === "expired");
        const inProgress = candAttempts.filter((a) => a.status === "in_progress");
        const evalRow = evalByCandidate.get(c.id);
        const lastSubmittedAt =
          submitted
            .map((a) => a.submitted_at)
            .filter(Boolean)
            .sort()
            .reverse()[0] ?? null;

        return {
          id: c.id,
          fullName: p?.full_name ?? "Candidate",
          email: p?.email ?? "—",
          testsTotal,
          testsSubmitted: submitted.length,
          testsInProgress: inProgress.length,
          cultural_signal: evalRow?.cultural_signal ?? null,
          technical_signal: evalRow?.technical_signal ?? null,
          red_flag: evalRow?.red_flag ?? false,
          evaluated: Boolean(evalRow?.evaluated_at),
          evaluated_at: evalRow?.evaluated_at ?? null,
          lastSubmittedAt,
        };
      });

      return rows.sort((a, b) => {
        const aReady = a.testsSubmitted >= a.testsTotal && a.testsTotal > 0 && !a.evaluated;
        const bReady = b.testsSubmitted >= b.testsTotal && b.testsTotal > 0 && !b.evaluated;
        if (aReady && !bReady) return -1;
        if (!aReady && bReady) return 1;
        return (b.lastSubmittedAt ?? "").localeCompare(a.lastSubmittedAt ?? "");
      });
    },
  });
}

export function useAdminUpdateReadinessTest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      ...updates
    }: {
      id: string;
      title?: string;
      subtitle?: string | null;
      timer_minutes?: number;
      timer_hard?: boolean;
      active?: boolean;
      intro_body?: string | null;
    }) => {
      const { error } = await supabase.from("readiness_tests").update(updates).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["readiness-tests"] });
      qc.invalidateQueries({ queryKey: ["readiness-tests", "admin"] });
    },
  });
}

export function useAdminCreateReadinessQuestion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (q: {
      test_id: string;
      prompt: string;
      scenario_label?: string | null;
      answer_type: ReadinessQuestion["answer_type"];
      sort_order: number;
    }) => {
      const { error } = await supabase.from("readiness_questions").insert({
        test_id: q.test_id,
        prompt: q.prompt,
        scenario_label: q.scenario_label ?? null,
        answer_type: q.answer_type,
        sort_order: q.sort_order,
      });
      if (error) throw error;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["readiness-questions", vars.test_id] });
      qc.invalidateQueries({ queryKey: ["readiness-question-counts"] });
    },
  });
}

export function useAdminUpdateReadinessQuestion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      testId,
      ...updates
    }: {
      id: string;
      testId: string;
      prompt?: string;
      scenario_label?: string | null;
      answer_type?: ReadinessQuestion["answer_type"];
      sort_order?: number;
    }) => {
      const { error } = await supabase.from("readiness_questions").update(updates).eq("id", id);
      if (error) throw error;
      return testId;
    },
    onSuccess: (testId) => {
      qc.invalidateQueries({ queryKey: ["readiness-questions", testId] });
      qc.invalidateQueries({ queryKey: ["readiness-question-counts"] });
    },
  });
}

export function useAdminDeleteReadinessQuestion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, testId }: { id: string; testId: string }) => {
      const { error } = await supabase.from("readiness_questions").delete().eq("id", id);
      if (error) throw error;
      return testId;
    },
    onSuccess: (testId) => {
      qc.invalidateQueries({ queryKey: ["readiness-questions", testId] });
      qc.invalidateQueries({ queryKey: ["readiness-question-counts"] });
    },
  });
}
