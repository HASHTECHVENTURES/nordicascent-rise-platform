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
      return data as { deleted: number; anonymized: number; processed_at: string };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-candidates"] });
      qc.invalidateQueries({ queryKey: ["activity-log"] });
    },
  });
}
