import { supabase } from "@/lib/supabase";
import { advanceCandidateStage } from "@/lib/pipelineProgress";

async function notifyCandidate(
  profileId: string,
  title: string,
  body: string,
  type: string,
  metadata?: Record<string, unknown>
) {
  await supabase.from("notifications").insert({
    user_id: profileId,
    title,
    body,
    type,
    metadata: metadata ?? null,
  });
}

export async function notifyAdminsNewApplicationComplete(
  jobTitle: string,
  candidateName: string,
  applicationId: string,
  jobId: string,
  candidateId: string
) {
  const { data: admins } = await supabase.from("profiles").select("id").eq("role", "admin");
  if (!admins?.length) return;

  const inserts = admins.map((admin) => ({
    user_id: admin.id,
    title: "New application complete",
    body: `${candidateName} submitted a complete application for ${jobTitle}. Review in Admin → Selection.`,
    type: "application_complete",
    metadata: { applicationId, jobId, jobTitle, candidateName, candidateId },
  }));

  await supabase.from("notifications").insert(inserts);
}

export async function onApplicationSubmitted(profileId: string, jobTitle: string) {
  await notifyCandidate(
    profileId,
    "Application submitted",
    `Your application for ${jobTitle} was sent. Our team will review it — track progress in My Applications.`,
    "application_submitted",
    { jobTitle }
  );
}

export async function notifyEmployersNewApplication(
  jobId: string,
  jobTitle: string,
  candidateName: string,
  applicationId: string,
  candidateId: string
) {
  const { data: job } = await supabase.from("jobs").select("company_id").eq("id", jobId).single();
  if (!job?.company_id) return;

  const { data: employers } = await supabase
    .from("employers")
    .select("profile_id")
    .eq("company_id", job.company_id);

  const inserts = (employers ?? []).map((emp) => ({
    user_id: emp.profile_id,
    title: "New application",
    body: `${candidateName} applied for ${jobTitle}. Review their profile in Candidates.`,
    type: "application_received",
    metadata: { applicationId, jobId, jobTitle, candidateName, candidateId },
  }));

  if (inserts.length > 0) {
    await supabase.from("notifications").insert(inserts);
  }
}

type ApplicationContext = {
  id: string;
  candidate_id: string;
  status: string;
  profile_id: string;
  job_title: string;
};

export async function onApplicationStatusChange(
  app: ApplicationContext,
  newStatus: string
) {
  const { profile_id, job_title, candidate_id, id } = app;

  switch (newStatus) {
    case "reviewing":
      await notifyCandidate(
        profile_id,
        "Application under review",
        `${job_title}: the employer is reviewing your profile. No action needed — we'll keep you posted.`,
        "application_reviewing",
        { applicationId: id, jobTitle: job_title }
      );
      break;

    case "interview":
      await notifyCandidate(
        profile_id,
        "Interview stage",
        `Good news — your application for ${job_title} moved to the interview stage. Check Messages for next steps.`,
        "application_interview",
        { applicationId: id, jobTitle: job_title }
      );
      break;

    case "offer":
      await notifyCandidate(
        profile_id,
        "Offer in progress",
        `Your application for ${job_title} is at the offer stage. The employer may contact you soon.`,
        "application_offer",
        { applicationId: id, jobTitle: job_title }
      );
      break;

    case "accepted":
      await notifyCandidate(
        profile_id,
        "You've been accepted!",
        `Congratulations — you've been accepted for ${job_title}. Your Selection stage is now open. Continue in My Journey.`,
        "application_accepted",
        { applicationId: id, jobTitle: job_title }
      );
      await advanceCandidateStage(candidate_id, "preparation");
      await supabase.from("applications").update({ stage_id: "selection" }).eq("id", id);
      break;

    case "rejected":
      await notifyCandidate(
        profile_id,
        "Application update",
        `Your application for ${job_title} was not selected this time. You can apply to other open roles in Jobs.`,
        "application_rejected",
        { applicationId: id, jobTitle: job_title }
      );
      await supabase.from("candidates").update({ pool_category: "alumni" }).eq("id", candidate_id);
      break;

    default:
      break;
  }
}
