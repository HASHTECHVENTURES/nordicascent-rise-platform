import { supabase } from "@/lib/supabase";

export async function getOrCreateConversationWithProfile(
  otherProfileId: string,
  subject?: string
): Promise<string> {
  const { data, error } = await supabase.rpc("get_or_create_conversation_with_profile", {
    p_other_profile_id: otherProfileId,
    p_subject: subject ?? null,
  });
  if (error) throw error;
  if (!data) throw new Error("Could not create conversation");
  return data as string;
}

export type ConversationParticipantDisplay = {
  name: string;
  avatar: string | null;
  subtitle: string | null;
};

/** Resolve display name/avatar for the other person in a conversation. */
export async function resolveConversationParticipant(
  otherProfileId: string,
  viewerRole: string | undefined
): Promise<ConversationParticipantDisplay> {
  if (viewerRole === "candidate") {
    const { data: emp } = await supabase
      .from("employers")
      .select("companies(name, logo_url), profiles(full_name, avatar_url)")
      .eq("profile_id", otherProfileId)
      .maybeSingle();

    if (emp) {
      const company = emp.companies as { name: string; logo_url: string | null } | null;
      const prof = emp.profiles as { full_name: string | null; avatar_url: string | null } | null;
      const companyName = company?.name ?? null;
      const personName = prof?.full_name ?? null;
      return {
        name: companyName ?? personName ?? "Employer",
        avatar: company?.logo_url ?? prof?.avatar_url ?? null,
        subtitle: companyName && personName ? personName : companyName ? "Recruiter" : null,
      };
    }
  }

  if (viewerRole === "employer") {
    const { data: cand } = await supabase
      .from("candidates")
      .select("full_name, avatar_url, title, profiles(full_name, avatar_url)")
      .eq("profile_id", otherProfileId)
      .maybeSingle();

    if (cand) {
      const prof = cand.profiles as { full_name: string | null; avatar_url: string | null } | null;
      const name = cand.full_name ?? prof?.full_name ?? "Candidate";
      return {
        name,
        avatar: cand.avatar_url ?? prof?.avatar_url ?? null,
        subtitle: cand.title ?? null,
      };
    }
  }

  const { data: prof } = await supabase
    .from("profiles")
    .select("full_name, avatar_url, role")
    .eq("id", otherProfileId)
    .maybeSingle();

  if (prof) {
    return {
      name: prof.full_name ?? (prof.role === "admin" ? "Nordic Ascent Support" : "User"),
      avatar: prof.avatar_url,
      subtitle: prof.role === "admin" ? "Support" : null,
    };
  }

  return { name: "Unknown", avatar: null, subtitle: null };
}
