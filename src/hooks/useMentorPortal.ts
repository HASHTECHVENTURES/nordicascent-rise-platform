import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import type { MentorProgramMeeting } from "@/lib/mentorProgram";

export type MentorAssignmentRow = {
  id: string;
  status: string;
  track: string | null;
  readiness_unlocked_at: string | null;
  candidates: {
    full_name?: string | null;
    track?: string | null;
    profiles?: { full_name: string | null; email: string | null } | { full_name: string | null; email: string | null }[] | null;
  } | null;
  jobs: { title: string; companies?: { name: string } | null } | null;
  meetings?: MentorProgramMeeting[];
};

export function useMyMentorAssignments() {
  const { profile } = useAuth();
  return useQuery({
    queryKey: ["my-mentor-assignments", profile?.id],
    enabled: profile?.role === "mentor" && Boolean(profile?.id),
    queryFn: async () => {
      const { data: mentorRow, error: mErr } = await supabase
        .from("company_mentors")
        .select("id, name, role_title, email, company_id, companies(name)")
        .eq("profile_id", profile!.id)
        .eq("status", "active")
        .maybeSingle();
      if (mErr) throw mErr;
      if (!mentorRow) {
        return { mentor: null, assignments: [] as MentorAssignmentRow[] };
      }

      const { data: apps, error: aErr } = await supabase
        .from("applications")
        .select(
          `
          id,
          status,
          track,
          readiness_unlocked_at,
          candidates (full_name, track, profiles (full_name, email)),
          jobs (title, companies (name))
        `
        )
        .eq("assigned_mentor_id", mentorRow.id)
        .not("readiness_unlocked_at", "is", null)
        .order("readiness_unlocked_at", { ascending: false });
      if (aErr) throw aErr;

      const appIds = (apps ?? []).map((a) => a.id);
      let meetingsByApp: Record<string, MentorProgramMeeting[]> = {};
      if (appIds.length > 0) {
        const { data: meetings, error: meetErr } = await supabase
          .from("mentor_program_meetings")
          .select("*")
          .in("application_id", appIds)
          .order("meeting_number");
        if (meetErr) throw meetErr;
        meetingsByApp = (meetings ?? []).reduce<Record<string, MentorProgramMeeting[]>>((acc, m) => {
          const list = acc[m.application_id] ?? [];
          list.push(m as MentorProgramMeeting);
          acc[m.application_id] = list;
          return acc;
        }, {});
      }

      const assignments = (apps ?? []).map((a) => ({
        ...(a as MentorAssignmentRow),
        meetings: meetingsByApp[a.id] ?? [],
      }));

      return {
        mentor: mentorRow as {
          id: string;
          name: string;
          role_title: string | null;
          email: string;
          companies?: { name: string } | null;
        },
        assignments,
      };
    },
  });
}

export async function inviteMentorAccount(input: {
  mentorId: string;
  candidateName?: string;
  jobTitle?: string;
}) {
  const portalUrl = typeof window !== "undefined" ? window.location.origin : undefined;
  const { data, error } = await supabase.functions.invoke("invite-mentor", {
    body: {
      mentorId: input.mentorId,
      portalUrl,
      candidateName: input.candidateName,
      jobTitle: input.jobTitle,
    },
  });
  if (error) throw error;
  return data as {
    ok: boolean;
    profileId?: string;
    emailSent?: boolean;
    emailSkipped?: boolean;
    emailReason?: string;
    temporaryPassword?: string;
    reason?: string;
  };
}
