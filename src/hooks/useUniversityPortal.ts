import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import type { AcademicWorkflowStep } from "@/lib/activationModule";

export type UniversityCreditRow = {
  id: string;
  status: string;
  track: string | null;
  candidates: {
    full_name?: string | null;
    track?: string | null;
    field_of_study?: string | null;
    profiles?:
      | { full_name: string | null; email: string | null }
      | { full_name: string | null; email: string | null }[]
      | null;
  } | null;
  jobs: { title: string; companies?: { name: string } | null } | null;
  activation?: {
    status: string;
    university_credit_required: boolean;
    academic_unlocked_at: string | null;
    internship_start_date: string | null;
  } | null;
  academicProgress?: { done: number; total: number };
};

export function useMyUniversityStaff() {
  const { profile } = useAuth();
  return useQuery({
    queryKey: ["my-university-staff", profile?.id],
    enabled: profile?.role === "university" && Boolean(profile?.id),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("university_staff")
        .select("id, name, email, university_id, universities(id, name, country, city)")
        .eq("profile_id", profile!.id)
        .eq("status", "active")
        .maybeSingle();
      if (error) throw error;
      return data as {
        id: string;
        name: string;
        email: string;
        university_id: string;
        universities: { id: string; name: string; country: string; city: string | null } | null;
      } | null;
    },
  });
}

export function useUniversityCreditActivations() {
  const { profile } = useAuth();
  const { data: staff } = useMyUniversityStaff();

  return useQuery({
    queryKey: ["university-credit-activations", profile?.id, staff?.university_id],
    enabled: profile?.role === "university" && Boolean(staff?.university_id),
    queryFn: async () => {
      const universityId = staff!.university_id;

      const { data: candidates, error: cErr } = await supabase
        .from("candidates")
        .select("id")
        .eq("university_id", universityId);
      if (cErr) throw cErr;
      const candidateIds = (candidates ?? []).map((c) => c.id);
      if (candidateIds.length === 0) return [] as UniversityCreditRow[];

      const { data: apps, error: aErr } = await supabase
        .from("applications")
        .select(
          `
          id,
          status,
          track,
          candidates (full_name, track, field_of_study, profiles (full_name, email)),
          jobs (title, companies (name))
        `
        )
        .in("candidate_id", candidateIds)
        .order("applied_at", { ascending: false });
      if (aErr) throw aErr;
      if (!apps?.length) return [] as UniversityCreditRow[];

      const appIds = apps.map((a) => a.id);
      const { data: records, error: rErr } = await supabase
        .from("activation_records")
        .select(
          "application_id, status, university_credit_required, academic_unlocked_at, internship_start_date"
        )
        .in("application_id", appIds)
        .eq("university_credit_required", true);
      if (rErr) throw rErr;

      const creditAppIds = new Set((records ?? []).map((r) => r.application_id));
      if (creditAppIds.size === 0) return [] as UniversityCreditRow[];

      const { data: steps, error: sErr } = await supabase
        .from("academic_workflow_steps")
        .select("application_id, status")
        .in("application_id", [...creditAppIds]);
      if (sErr) throw sErr;

      const progressByApp: Record<string, { done: number; total: number }> = {};
      for (const step of steps ?? []) {
        const cur = progressByApp[step.application_id] ?? { done: 0, total: 0 };
        cur.total += 1;
        if (step.status === "completed") cur.done += 1;
        progressByApp[step.application_id] = cur;
      }

      const recordByApp = Object.fromEntries(
        (records ?? []).map((r) => [r.application_id, r])
      );

      return apps
        .filter((a) => creditAppIds.has(a.id))
        .map((a) => ({
          ...(a as UniversityCreditRow),
          activation: recordByApp[a.id]
            ? {
                status: recordByApp[a.id].status as string,
                university_credit_required: true,
                academic_unlocked_at: recordByApp[a.id].academic_unlocked_at as string | null,
                internship_start_date: recordByApp[a.id].internship_start_date as string | null,
              }
            : null,
          academicProgress: progressByApp[a.id] ?? { done: 0, total: 7 },
        }));
    },
  });
}

export function useInviteUniversityStaff() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      universityId: string;
      name: string;
      email: string;
      staffId?: string;
    }) => {
      const { data, error } = await supabase.functions.invoke("invite-university", {
        body: {
          universityId: input.universityId,
          name: input.name,
          email: input.email,
          staffId: input.staffId,
          portalUrl: window.location.origin,
        },
      });
      if (error) throw error;
      if (!data?.ok) {
        throw new Error(data?.reason ?? "Invite failed");
      }
      return data as {
        ok: boolean;
        staffId?: string;
        temporaryPassword?: string;
        emailSent?: boolean;
        emailSkipped?: boolean;
        emailReason?: string;
      };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-university-staff"] });
    },
  });
}

export function useAdminUniversityStaff(universityId: string | undefined) {
  return useQuery({
    queryKey: ["admin-university-staff", universityId],
    enabled: Boolean(universityId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("university_staff")
        .select("id, name, email, status, profile_id, invite_sent_at, created_at")
        .eq("university_id", universityId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export type { AcademicWorkflowStep };
