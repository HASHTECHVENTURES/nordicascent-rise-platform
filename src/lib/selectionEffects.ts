import { supabase } from "@/lib/supabase";
import { sendTransactionalEmail } from "@/lib/sendTransactionalEmail";
import { buildSelectionEmail } from "@/lib/selectionEmails";
import { SELECTION_STATUSES, type SelectionStepId, type StepDecision } from "@/lib/selectionModule";

async function getProfileEmail(profileId: string) {
  const { data } = await supabase
    .from("profiles")
    .select("email, full_name")
    .eq("id", profileId)
    .maybeSingle();
  return data;
}

async function getEmployerEmails(companyId: string) {
  const { data: employers } = await supabase
    .from("employers")
    .select("profiles(email)")
    .eq("company_id", companyId);
  return (employers ?? [])
    .map((e) => (e.profiles as { email?: string } | null)?.email)
    .filter((email): email is string => Boolean(email?.trim()));
}

async function emailProfile(
  profileId: string,
  kind: Parameters<typeof buildSelectionEmail>[0],
  params: Parameters<typeof buildSelectionEmail>[1]
) {
  const profile = await getProfileEmail(profileId);
  if (!profile?.email) return;
  const { subject, html, text } = buildSelectionEmail(kind, {
    ...params,
    candidateName: profile.full_name ?? params.candidateName,
  });
  await sendTransactionalEmail({ to: profile.email, subject, html, text });
}

async function emailEmployers(
  companyId: string,
  kind: "employer_technical_invite" | "employer_motivation_invite",
  params: { jobTitle: string; companyName?: string }
) {
  const emails = await getEmployerEmails(companyId);
  const { subject, html, text } = buildSelectionEmail(kind, params);
  await Promise.all(emails.map((to) => sendTransactionalEmail({ to, subject, html, text })));
}

async function notifyUser(
  userId: string,
  title: string,
  body: string,
  type: string,
  metadata?: Record<string, unknown>
) {
  await supabase.from("notifications").insert({
    user_id: userId,
    title,
    body,
    type,
    metadata: metadata ?? null,
  });
}

async function notifyEmployers(
  companyId: string,
  title: string,
  body: string,
  type: string,
  metadata?: Record<string, unknown>
) {
  const { data: employers } = await supabase
    .from("employers")
    .select("profile_id")
    .eq("company_id", companyId);
  if (!employers?.length) return;
  await supabase.from("notifications").insert(
    employers.map((e) => ({
      user_id: e.profile_id,
      title,
      body,
      type,
      metadata: metadata ?? null,
    }))
  );
}

export type SelectionChangeContext = {
  applicationId: string;
  candidateId: string;
  profileId: string;
  jobId: string;
  jobTitle: string;
  companyId: string | null;
  step: SelectionStepId;
  decision: StepDecision | "selected" | "hold" | "rejected";
  newStatus: string;
  companyParticipatedStep3: boolean;
  companyParticipatedStep4: boolean;
};

export async function onSelectionStatusChange(ctx: SelectionChangeContext, rejectReason: string | null) {
  const { profileId, jobTitle, newStatus, candidateId, companyId, applicationId, jobId } = ctx;

  if (newStatus === SELECTION_STATUSES.SELECTION_REJECTED || newStatus === SELECTION_STATUSES.REJECTED) {
    await notifyUser(
      profileId,
      "Application update",
      `Thank you for your interest in ${jobTitle}. After careful review, we will not be moving forward with your application for this role. You may apply to other open positions.`,
      "selection_rejected",
      { applicationId, jobId, jobTitle }
    );
    await emailProfile(profileId, "selection_rejected", { jobTitle });
    await supabase.from("candidates").update({ pool_category: "alumni" }).eq("id", candidateId);

    if (companyId && (ctx.companyParticipatedStep3 || ctx.companyParticipatedStep4)) {
      await notifyEmployers(
        companyId,
        "Candidate not proceeding",
        `The candidate you met for ${jobTitle} will not proceed to the next stage.${rejectReason ? ` Note: ${rejectReason}` : ""}`,
        "selection_company_reject_notice",
        { applicationId, jobId, jobTitle }
      );
    }
    return;
  }

  if (newStatus === SELECTION_STATUSES.ELIGIBILITY_PASS) {
    await notifyUser(
      profileId,
      "Offee assessment",
      `Your application for ${jobTitle} passed initial review. Nordic Ascent will send Offee assessment details separately.`,
      "selection_eligibility_pass",
      { applicationId, jobId, jobTitle }
    );
    await emailProfile(profileId, "offee_invite", { jobTitle });
    return;
  }

  if (newStatus === SELECTION_STATUSES.OFFEE_PASS) {
    await notifyUser(
      profileId,
      "Assessment complete",
      `Your Offee assessment for ${jobTitle} is complete. We'll notify you about next steps.`,
      "selection_offee_pass",
      { applicationId, jobId, jobTitle }
    );
    if (companyId) {
      await notifyEmployers(
        companyId,
        "Technical assessment — your participation",
        `A candidate has advanced to the technical assessment for ${jobTitle}. You will be invited to the face-to-face session when scheduled.`,
        "selection_step3_employer_invite",
        { applicationId, jobId, jobTitle, candidateId }
      );
      await emailEmployers(companyId, "employer_technical_invite", { jobTitle });
    }
    return;
  }

  if (newStatus === SELECTION_STATUSES.STEP3_PASS) {
    await notifyUser(
      profileId,
      "Technical assessment complete",
      `Your technical assessment for ${jobTitle} is complete.`,
      "selection_step3_pass",
      { applicationId, jobId, jobTitle }
    );
    if (companyId) {
      await notifyEmployers(
        companyId,
        "Motivation session — your participation",
        `A candidate has advanced to the motivation session for ${jobTitle}. You will be invited when the session is scheduled.`,
        "selection_step4_employer_invite",
        { applicationId, jobId, jobTitle, candidateId }
      );
      await emailEmployers(companyId, "employer_motivation_invite", { jobTitle });
    }
    return;
  }

  if (newStatus === SELECTION_STATUSES.STEP4_PASS) {
    await notifyUser(
      profileId,
      "Motivation session complete",
      `Your motivation session for ${jobTitle} is complete. The selection board will decide soon.`,
      "selection_step4_pass",
      { applicationId, jobId, jobTitle }
    );
    return;
  }

  if (newStatus === SELECTION_STATUSES.SELECTED_FOR_READINESS) {
    await notifyUser(
      profileId,
      "Selected for Readiness",
      "You have been selected for the Nordic Ascent Readiness programme.",
      "selection_selected",
      { applicationId, jobId, jobTitle }
    );
    if (companyId) {
      await notifyEmployers(
        companyId,
        "Assign a mentor",
        `A candidate was selected for ${jobTitle}. Please assign a mentor to unlock Readiness.`,
        "mentor_assignment_required",
        { applicationId, jobId, jobTitle, candidateId }
      );
    }
    return;
  }

  if (newStatus === SELECTION_STATUSES.SELECTION_HOLD) {
    return;
  }

  if (newStatus.endsWith("_review")) {
    await notifyUser(
      profileId,
      "Application under review",
      `Your application for ${jobTitle} is under review. No action needed.`,
      "selection_review",
      { applicationId, jobId, jobTitle }
    );
  }
}

export async function onHoldCandidateActivated(ctx: {
  applicationId: string;
  candidateId: string;
  profileId: string;
  jobId: string;
  jobTitle: string;
  companyId: string | null;
}) {
  const { profileId, jobTitle, applicationId, jobId, companyId, candidateId } = ctx;
  await notifyUser(
    profileId,
    "Selected for Readiness",
    "You have been selected for the Nordic Ascent Readiness programme.",
    "selection_hold_activated",
    { applicationId, jobId, jobTitle }
  );
  if (companyId) {
    await notifyEmployers(
      companyId,
      "Assign a mentor",
      `A backup candidate was activated for ${jobTitle}. Please assign a mentor to unlock Readiness.`,
      "mentor_assignment_required",
      { applicationId, jobId, jobTitle, candidateId }
    );
  }
}
