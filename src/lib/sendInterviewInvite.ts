import { supabase } from "@/lib/supabase";
import { getOrCreateConversationWithProfile } from "@/lib/conversations";
import { getSupabaseErrorMessage } from "@/lib/supabaseError";

type SendInterviewInviteInput = {
  applicationId: string;
  candidateProfileId: string;
  employerProfileId: string;
  jobTitle: string;
  companyName: string;
  meetUrl: string;
  scheduledAt: string;
  notes?: string;
};

function formatInterviewWhen(scheduledAt: string) {
  return new Date(scheduledAt).toLocaleString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export async function sendInterviewInvite(input: SendInterviewInviteInput) {
  const when = formatInterviewWhen(input.scheduledAt);
  const notesLine = input.notes?.trim() ? `\n\nNotes from ${input.companyName}:\n${input.notes.trim()}` : "";

  const messageBody = `Interview invitation — ${input.jobTitle}

Your interview with ${input.companyName} is scheduled for:
${when}

Join Google Meet:
${input.meetUrl.trim()}${notesLine}

Please join a few minutes early. Reply in this thread if you need to reschedule.`;

  const { error: updateError } = await supabase
    .from("applications")
    .update({
      status: "interview",
      interview_meet_url: input.meetUrl.trim(),
      interview_scheduled_at: input.scheduledAt,
      interview_notes: input.notes?.trim() || null,
      needs_action: false,
    })
    .eq("id", input.applicationId);

  if (updateError) {
    const msg = getSupabaseErrorMessage(updateError);
    if (msg.includes("interview_meet_url") || msg.includes("schema cache")) {
      throw new Error(
        "Interview fields are missing in the database. Run migration 022_interview_invite_fixes.sql in Supabase SQL Editor."
      );
    }
    throw updateError;
  }

  let conversationId: string;
  try {
    conversationId = await getOrCreateConversationWithProfile(
      input.candidateProfileId,
      `Interview — ${input.jobTitle}`
    );
  } catch (err) {
    throw new Error(`Could not open message thread: ${getSupabaseErrorMessage(err)}`);
  }

  const { error: messageError } = await supabase.from("messages").insert({
    conversation_id: conversationId,
    sender_id: input.employerProfileId,
    body: messageBody,
  });
  if (messageError) {
    throw new Error(`Invite saved but message failed: ${getSupabaseErrorMessage(messageError)}`);
  }

  await supabase
    .from("conversations")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", conversationId);

  const { error: notificationError } = await supabase.from("notifications").insert({
    user_id: input.candidateProfileId,
    title: "Interview scheduled",
    body: `${input.companyName} invited you to interview for ${input.jobTitle} on ${when}.`,
    type: "interview_scheduled",
    metadata: {
      applicationId: input.applicationId,
      meetUrl: input.meetUrl.trim(),
      scheduledAt: input.scheduledAt,
    },
  });
  if (notificationError) {
    console.warn("Interview notification failed:", notificationError);
  }

  return { conversationId, when };
}
