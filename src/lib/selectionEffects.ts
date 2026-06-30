import { supabase } from "@/lib/supabase";
import { SELECTION_STATUSES, type SelectionStepId, type StepDecision } from "@/lib/selectionModule";

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
      "Application update",
      `Your application for ${jobTitle} has passed initial review.`,
      "selection_eligibility_pass",
      { applicationId, jobId, jobTitle }
    );
    return;
  }

  if (newStatus === SELECTION_STATUSES.OFFEE_PASS) {
    await notifyUser(
      profileId,
      "Assessment complete",
      `Your assessment for ${jobTitle} is complete. We'll notify you about next steps.`,
      "selection_offee_pass",
      { applicationId, jobId, jobTitle }
    );
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
      `Congratulations — you have been selected for the Nordic Ascent Readiness programme for ${jobTitle}.`,
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
