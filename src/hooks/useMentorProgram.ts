import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { useMyApplications } from "@/hooks/useData";
import {
  computeNextMeetingUnlocks,
  countReadinessAreasSubmitted,
  initializeMentorMeetings,
  type MentorActivationNote,
  type MentorMeetingObservation,
  type MentorMeetingTheme,
  type MentorProgramMeeting,
  type MentorSignalNote,
} from "@/lib/mentorProgram";
import type { Track } from "@/lib/track";

const MEETINGS_SELECT = `
  *,
  mentor_meeting_observations (*)
`;

export function useMentorMeetingThemes() {
  return useQuery({
    queryKey: ["mentor-meeting-themes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("mentor_meeting_themes")
        .select("*")
        .eq("active", true)
        .order("sort_order");
      if (error) throw error;
      return (data ?? []) as MentorMeetingTheme[];
    },
  });
}

export function useMentorProgramMeetings(applicationId: string | undefined) {
  return useQuery({
    queryKey: ["mentor-program-meetings", applicationId],
    enabled: Boolean(applicationId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("mentor_program_meetings")
        .select(MEETINGS_SELECT)
        .eq("application_id", applicationId!)
        .order("meeting_number");
      if (error) throw error;
      return (data ?? []) as (MentorProgramMeeting & {
        mentor_meeting_observations: MentorMeetingObservation[] | MentorMeetingObservation | null;
      })[];
    },
  });
}

export function useCandidateMentorProgram(applicationId: string | undefined) {
  return useMentorProgramMeetings(applicationId);
}

export function useMentorSignalNote(applicationId: string | undefined) {
  return useQuery({
    queryKey: ["mentor-signal-note", applicationId],
    enabled: Boolean(applicationId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("mentor_signal_notes")
        .select("*")
        .eq("application_id", applicationId!)
        .maybeSingle();
      if (error) throw error;
      return data as MentorSignalNote | null;
    },
  });
}

export function useMentorActivationNote(applicationId: string | undefined) {
  return useQuery({
    queryKey: ["mentor-activation-note", applicationId],
    enabled: Boolean(applicationId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("mentor_activation_notes")
        .select("*")
        .eq("application_id", applicationId!)
        .maybeSingle();
      if (error) throw error;
      return data as MentorActivationNote | null;
    },
  });
}

export function useAssignedMentorForApplication(applicationId: string | undefined) {
  return useQuery({
    queryKey: ["assigned-mentor", applicationId],
    enabled: Boolean(applicationId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("applications")
        .select(
          `
          assigned_mentor_id,
          readiness_unlocked_at,
          track,
          company_mentors (id, name, role_title, email, phone),
          jobs (title, companies (name))
        `
        )
        .eq("id", applicationId!)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });
}

async function refreshMeetingUnlocks(applicationId: string, track: Track | null | undefined) {
  const { data: meetings, error: mErr } = await supabase
    .from("mentor_program_meetings")
    .select("*")
    .eq("application_id", applicationId);
  if (mErr) throw mErr;

  const { data: app } = await supabase
    .from("applications")
    .select("candidate_id")
    .eq("id", applicationId)
    .single();

  let readinessAreas = 0;
  if (app?.candidate_id) {
    const { data: attempts } = await supabase
      .from("readiness_attempts")
      .select("status, readiness_tests(area)")
      .eq("candidate_id", app.candidate_id);
    readinessAreas = countReadinessAreasSubmitted(attempts ?? []);
  }

  const updates = computeNextMeetingUnlocks(
    (meetings ?? []) as MentorProgramMeeting[],
    track,
    readinessAreas
  );

  for (const u of updates) {
    await supabase
      .from("mentor_program_meetings")
      .update({ status: u.status, updated_at: new Date().toISOString() })
      .eq("id", u.id);
  }
}

export function useSaveMentorObservation() {
  const qc = useQueryClient();
  const { profile } = useAuth();
  return useMutation({
    mutationFn: async ({
      meetingId,
      applicationId,
      track,
      meeting_date,
      duration_minutes,
      key_observations,
      concerns,
    }: {
      meetingId: string;
      applicationId: string;
      track: Track | null | undefined;
      meeting_number: number;
      meeting_date: string;
      duration_minutes: number;
      key_observations: string;
      concerns?: string;
    }) => {
      const { error: obsErr } = await supabase.from("mentor_meeting_observations").upsert(
        {
          meeting_id: meetingId,
          meeting_date,
          duration_minutes,
          key_observations,
          concerns: concerns?.trim() || null,
          submitted_by: profile?.id ?? null,
          submitted_at: new Date().toISOString(),
        },
        { onConflict: "meeting_id" }
      );
      if (obsErr) throw obsErr;

      const now = new Date().toISOString();
      const { error: meetErr } = await supabase
        .from("mentor_program_meetings")
        .update({ status: "completed", completed_at: now, updated_at: now })
        .eq("id", meetingId);
      if (meetErr) throw meetErr;

      await refreshMeetingUnlocks(applicationId, track);
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["mentor-program-meetings", vars.applicationId] });
    },
  });
}

export function useSaveMentorSignalNote() {
  const qc = useQueryClient();
  const { profile } = useAuth();
  return useMutation({
    mutationFn: async (input: {
      applicationId: string;
      communication_clarity: string;
      thinking_structure: string;
      collaboration_readiness: string;
      cultural_alignment_signals: string;
      red_flag: boolean;
      red_flag_note?: string | null;
    }) => {
      const payload = {
        application_id: input.applicationId,
        communication_clarity: input.communication_clarity,
        thinking_structure: input.thinking_structure,
        collaboration_readiness: input.collaboration_readiness,
        cultural_alignment_signals: input.cultural_alignment_signals,
        red_flag: input.red_flag,
        red_flag_note: input.red_flag ? input.red_flag_note?.trim() || null : null,
        submitted_by: profile?.id ?? null,
        submitted_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      const { error } = await supabase
        .from("mentor_signal_notes")
        .upsert(payload, { onConflict: "application_id" });
      if (error) throw error;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["mentor-signal-note", vars.applicationId] });
    },
  });
}

export function useSaveMentorActivationNote() {
  const qc = useQueryClient();
  const { profile } = useAuth();
  return useMutation({
    mutationFn: async (input: {
      applicationId: string;
      behavioural_observations: string;
      communication_quality: string;
      collaboration_signals: string;
      perceived_strengths: string;
      perceived_risks: string;
    }) => {
      const payload = {
        application_id: input.applicationId,
        behavioural_observations: input.behavioural_observations,
        communication_quality: input.communication_quality,
        collaboration_signals: input.collaboration_signals,
        perceived_strengths: input.perceived_strengths,
        perceived_risks: input.perceived_risks,
        submitted_by: profile?.id ?? null,
        submitted_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      const { error } = await supabase
        .from("mentor_activation_notes")
        .upsert(payload, { onConflict: "application_id" });
      if (error) throw error;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["mentor-activation-note", vars.applicationId] });
    },
  });
}

export { initializeMentorMeetings, refreshMeetingUnlocks };

export function useMyMentorProgramContext() {
  const { data: applications } = useMyApplications();

  const activeApp = (applications ?? []).find(
    (a) => a.readiness_unlocked_at && a.assigned_mentor_id
  );

  const applicationId = activeApp?.id as string | undefined;
  const { data: assigned } = useAssignedMentorForApplication(applicationId);
  const { data: meetings } = useMentorProgramMeetings(applicationId);

  const track =
    (assigned?.track as Track | null) ??
    ((activeApp?.track as Track | null) ?? "entry");

  const mentor = assigned?.company_mentors as
    | { name: string; role_title?: string | null }
    | null
    | undefined;

  const company = (assigned?.jobs as { companies?: { name: string } | null } | null)?.companies;

  return {
    applicationId,
    mentor,
    company,
    meetings: meetings ?? [],
    track,
    isLoading: !applications,
  };
}
