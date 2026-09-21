import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { DEFAULT_PRIVACY_NOTICE_VERSION } from "@/lib/gdpr";

export function useCurrentPrivacyNoticeVersion() {
  return useQuery({
    queryKey: ["privacy-notice-version"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_current_privacy_notice_version");
      if (error) throw error;
      return (data as string) || DEFAULT_PRIVACY_NOTICE_VERSION;
    },
    staleTime: 60_000,
  });
}

export function useNeedsPrivacyConsent() {
  return useQuery({
    queryKey: ["needs-privacy-consent"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("needs_privacy_consent");
      if (error) throw error;
      return Boolean(data);
    },
    enabled: false,
  });
}

export function useRecordPrivacyConsent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (version: string) => {
      const { error } = await supabase.rpc("record_privacy_consent", { p_version: version });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["needs-privacy-consent"] });
      qc.invalidateQueries({ queryKey: ["privacy-notice-version"] });
    },
  });
}

export function useLogCandidateAccess() {
  return useMutation({
    mutationFn: async (candidateId: string) => {
      const { error } = await supabase.rpc("log_activity", {
        p_action: "candidate.view",
        p_entity_type: "candidate",
        p_entity_id: candidateId,
        p_metadata: {},
      });
      if (error) throw error;
    },
  });
}

// Appendix A · Audit log: record candidate-data exports (list CSV, Offee CSV)
// so exports are attributable to the acting user, not just record opens.
export function useLogCandidateExport() {
  return useMutation({
    mutationFn: async ({
      scope,
      count,
      candidateId,
    }: {
      scope: string;
      count: number;
      candidateId?: string | null;
    }) => {
      const { error } = await supabase.rpc("log_activity", {
        p_action: "candidate.export",
        p_entity_type: "candidate",
        p_entity_id: candidateId ?? null,
        p_metadata: { scope, count },
      });
      if (error) throw error;
    },
  });
}

export function useExportCandidate() {
  return useMutation({
    mutationFn: async (candidateId: string) => {
      const { data, error } = await supabase.rpc("admin_export_candidate", {
        p_candidate_id: candidateId,
      });
      if (error) throw error;
      return data as Record<string, unknown>;
    },
  });
}

// Appendix A · Integrations §4: pipeline-wide export (all applications, all stages).
export type PipelineExportRow = {
  application_id: string;
  candidate_name: string | null;
  candidate_email: string | null;
  job_title: string | null;
  company_name: string | null;
  track: string | null;
  stage: string | null;
  status: string | null;
  selection_step: number | null;
  applied_at: string | null;
  updated_at: string | null;
};

export function useExportPipeline() {
  return useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.rpc("admin_export_pipeline");
      if (error) throw error;
      const rows = (data ?? []) as PipelineExportRow[];
      await supabase.rpc("log_activity", {
        p_action: "candidate.export",
        p_entity_type: "candidate",
        p_entity_id: null,
        p_metadata: { scope: "pipeline_csv", count: rows.length },
      });
      return rows;
    },
  });
}

export function useCorrectCandidate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      candidateId: string;
      profile: Record<string, string | null>;
      candidate: Record<string, string | null>;
    }) => {
      const { error } = await supabase.rpc("admin_correct_candidate", {
        p_candidate_id: payload.candidateId,
        p_profile: payload.profile,
        p_candidate: payload.candidate,
      });
      if (error) throw error;
    },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ["admin-candidate", vars.candidateId] });
      qc.invalidateQueries({ queryKey: ["admin-candidates"] });
    },
  });
}

export function useUpdateRetentionDate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ candidateId, retentionDate }: { candidateId: string; retentionDate: string | null }) => {
      const { error } = await supabase.rpc("admin_correct_candidate", {
        p_candidate_id: candidateId,
        p_profile: {},
        p_candidate: { retention_date: retentionDate ?? "" },
      });
      if (error) throw error;
    },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ["admin-candidate", vars.candidateId] });
    },
  });
}

export function useAccessAnomalies() {
  return useQuery({
    queryKey: ["access-anomalies"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("access_anomaly_flags")
        .select("*, profiles(full_name, email, role)")
        .eq("resolved", false)
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data;
    },
  });
}

export function useResolveAccessAnomaly() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("access_anomaly_flags")
        .update({ resolved: true, resolved_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["access-anomalies"] });
    },
  });
}

export function useProcessExpiredRetention() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.rpc("process_expired_retention");
      if (error) throw error;
      const purgedLedger = await purgeExpiredErasureLedgerEntries();
      return {
        ...(data as { deleted: number; anonymized: number; processed_at: string }),
        purgedLedger,
      };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-candidates"] });
      qc.invalidateQueries({ queryKey: ["activity-log"] });
      qc.invalidateQueries({ queryKey: ["erasure-ledger"] });
    },
  });
}

export type ErasureLedgerEntry = {
  candidate_id: string;
  profile_id?: string | null;
  email?: string | null;
  full_name?: string | null;
  erased_at: string;
  backup_window_days?: number;
  backup_expires_at?: string;
  path: string;
  status: "active_window" | "expired";
};

async function listErasureLedgerRaw(): Promise<
  Array<Omit<ErasureLedgerEntry, "status"> & { path: string }>
> {
  const { data: files, error } = await supabase.storage.from("erasure-ledger").list("", {
    limit: 500,
    sortBy: { column: "created_at", order: "desc" },
  });
  if (error) throw error;

  const entries: Array<Omit<ErasureLedgerEntry, "status"> & { path: string }> = [];
  for (const file of files ?? []) {
    if (!file.name?.endsWith(".json")) continue;
    const { data: blob, error: dlErr } = await supabase.storage
      .from("erasure-ledger")
      .download(file.name);
    if (dlErr || !blob) continue;
    try {
      const parsed = JSON.parse(await blob.text()) as Omit<ErasureLedgerEntry, "path" | "status">;
      entries.push({ ...parsed, path: file.name });
    } catch {
      // skip corrupt ledger files
    }
  }
  return entries;
}

/** Remove ledger files whose 30-day backup window has ended. */
export async function purgeExpiredErasureLedgerEntries(): Promise<number> {
  const today = new Date().toISOString().slice(0, 10);
  const entries = await listErasureLedgerRaw();
  const expiredPaths = entries
    .filter((e) => e.backup_expires_at && e.backup_expires_at < today)
    .map((e) => e.path);
  if (expiredPaths.length === 0) return 0;
  const { error } = await supabase.storage.from("erasure-ledger").remove(expiredPaths);
  if (error) throw error;
  return expiredPaths.length;
}

export function useErasureLedger() {
  return useQuery({
    queryKey: ["erasure-ledger"],
    queryFn: async () => {
      // Auto-clear entries older than the backup window (~30 days).
      await purgeExpiredErasureLedgerEntries();

      const today = new Date().toISOString().slice(0, 10);
      const entries = await listErasureLedgerRaw();
      return entries.map((e) => ({
        ...e,
        status:
          e.backup_expires_at && e.backup_expires_at < today
            ? ("expired" as const)
            : ("active_window" as const),
      }));
    },
  });
}

export function usePurgeExpiredErasureLedger() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => purgeExpiredErasureLedgerEntries(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["erasure-ledger"] });
    },
  });
}

/** Re-apply erasures after a Supabase backup restore (within the backup window). */
export function useApplyErasureLedger() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      // Drop expired ledger files first (automatic 30-day cleanup).
      const purged = await purgeExpiredErasureLedgerEntries();

      const entries = await listErasureLedgerRaw();
      let deleted = 0;
      let alreadyGone = 0;
      const today = new Date().toISOString().slice(0, 10);

      for (const entry of entries) {
        if (!entry.candidate_id) continue;
        if (entry.backup_expires_at && entry.backup_expires_at < today) continue;

        const { data, error: delErr } = await supabase.rpc("admin_redelete_candidate_if_present", {
          p_candidate_id: entry.candidate_id,
        });
        if (delErr) throw delErr;
        const result = data as { deleted?: boolean; reason?: string } | null;
        if (result?.deleted) deleted += 1;
        else alreadyGone += 1;
      }

      return { deleted, alreadyGone, purged };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-candidates"] });
      qc.invalidateQueries({ queryKey: ["activity-log"] });
      qc.invalidateQueries({ queryKey: ["erasure-ledger"] });
    },
  });
}
