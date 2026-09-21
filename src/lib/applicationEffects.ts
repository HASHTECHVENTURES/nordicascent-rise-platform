import { supabase } from "@/lib/supabase";
import { advanceCandidateStage } from "@/lib/pipelineProgress";

async function notifyUser(
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

async function notifyCandidate(
  profileId: string,
  title: string,
  body: string,
  type: string,
  metadata?: Record<string, unknown>
) {
  await notifyUser(profileId, title, body, type, metadata);
}

async function notifyAdmins(title: string, body: string, type: string, metadata?: Record<string, unknown>) {
  const { data: admins } = await supabase.from("profiles").select("id").eq("role", "admin");
  if (!admins?.length) return;
  await supabase.from("notifications").insert(
    admins.map((admin) => ({
      user_id: admin.id,
      title,
      body,
      type,
      metadata: metadata ?? null,
    }))
  );
}

async function notifyCompanyEmployers(
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
    employers.map((emp) => ({
      user_id: emp.profile_id,
      title,
      body,
      type,
      metadata: metadata ?? null,
    }))
  );
}

export async function notifyAdminsNewApplicationComplete(
  jobTitle: string,
  candidateName: string,
  applicationId: string,
  jobId: string,
  candidateId: string
) {
  await notifyAdmins(
    "New application complete",
    `${candidateName} submitted a complete application for ${jobTitle}. Review in Admin → Selection.`,
    "application_complete",
    { applicationId, jobId, jobTitle, candidateName, candidateId }
  );
}

export async function onApplicationSubmitted(profileId: string, jobTitle: string) {
  await notifyCandidate(
    profileId,
    "Application submitted",
    `Your application for ${jobTitle} was sent. Our team will review it: track progress in My Journey.`,
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

  await notifyCompanyEmployers(
    job.company_id,
    "New application",
    `${candidateName} applied for ${jobTitle}. Review their profile in Candidates.`,
    "application_received",
    { applicationId, jobId, jobTitle, candidateName, candidateId }
  );
}

/** Candidate + mentor (if linked) + admins when a mentor session is scheduled. */
export async function notifyMentorSessionScheduled(input: {
  applicationId: string;
  meetingNumber: number;
  scheduledAt: string;
  meetingUrl?: string | null;
}) {
  const { data: app } = await supabase
    .from("applications")
    .select(
      `
      id,
      assigned_mentor_id,
      jobs(title, company_id, companies(name)),
      candidates(full_name, profile_id, profiles(id, email)),
      company_mentors(name, profile_id)
    `
    )
    .eq("id", input.applicationId)
    .maybeSingle();
  if (!app) return;

  const cand = app.candidates as {
    full_name?: string | null;
    profile_id?: string | null;
    profiles?: { id?: string; email?: string | null } | { id?: string; email?: string | null }[] | null;
  } | null;
  const profile = Array.isArray(cand?.profiles) ? cand?.profiles[0] : cand?.profiles;
  const candidateProfileId = profile?.id ?? cand?.profile_id ?? null;
  const jobTitle = (app.jobs as { title?: string } | null)?.title ?? "your role";
  const companyId = (app.jobs as { company_id?: string } | null)?.company_id;
  const when = new Date(input.scheduledAt).toLocaleString();
  const joinHint = input.meetingUrl ? " Join from Mentoring when it is time." : "";

  if (candidateProfileId) {
    await notifyCandidate(
      candidateProfileId,
      `Mentor Meeting ${input.meetingNumber} scheduled`,
      `Your mentor scheduled Meeting ${input.meetingNumber} for ${when} (${jobTitle}).${joinHint}`,
      "mentor_session_scheduled",
      {
        applicationId: input.applicationId,
        meetingNumber: input.meetingNumber,
        scheduledAt: input.scheduledAt,
      }
    );
  }

  const mentor = app.company_mentors as { name?: string; profile_id?: string | null } | null;
  if (mentor?.profile_id) {
    await notifyUser(
      mentor.profile_id,
      `Meeting ${input.meetingNumber} saved`,
      `Session with ${cand?.full_name ?? "candidate"} is set for ${when}.`,
      "mentor_session_scheduled",
      { applicationId: input.applicationId, meetingNumber: input.meetingNumber }
    );
  }

  if (companyId) {
    await notifyCompanyEmployers(
      companyId,
      `Mentor Meeting ${input.meetingNumber} scheduled`,
      `${cand?.full_name ?? "Candidate"}: Meeting ${input.meetingNumber} at ${when}.`,
      "mentor_session_scheduled",
      { applicationId: input.applicationId, meetingNumber: input.meetingNumber }
    );
  }
}

export async function notifyReadinessApprovedForActivation(input: {
  candidateProfileId: string;
  candidateName: string;
  candidateId: string;
}) {
  await notifyCandidate(
    input.candidateProfileId,
    "Activation unlocked",
    "Your Readiness review is complete. Activation is now open in My Journey.",
    "readiness_approved",
    { candidateId: input.candidateId }
  );
  await notifyAdmins(
    "Readiness approved for Activation",
    `${input.candidateName} was approved for Activation.`,
    "readiness_approved",
    { candidateId: input.candidateId }
  );
}

export async function notifyInternshipStartDateSet(input: {
  applicationId: string;
  startDate: string;
  candidateProfileId: string | null;
  companyId: string | null;
}) {
  const body = `Internship start date set to ${input.startDate}. Mentor meetings 4-6 follow this schedule.`;
  if (input.candidateProfileId) {
    await notifyCandidate(
      input.candidateProfileId,
      "Internship start date confirmed",
      body,
      "internship_start_date",
      { applicationId: input.applicationId, startDate: input.startDate }
    );
  }
  if (input.companyId) {
    await notifyCompanyEmployers(
      input.companyId,
      "Internship start date set",
      body,
      "internship_start_date",
      { applicationId: input.applicationId, startDate: input.startDate }
    );
  }
  await notifyAdmins("Internship start date set", body, "internship_start_date", {
    applicationId: input.applicationId,
    startDate: input.startDate,
  });
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
        `${job_title}: the employer is reviewing your profile. No action needed: we'll keep you posted.`,
        "application_reviewing",
        { applicationId: id, jobTitle: job_title }
      );
      break;

    case "interview":
      await notifyCandidate(
        profile_id,
        "Interview stage",
        `Good news: your application for ${job_title} moved to the interview stage. Check Messages for next steps.`,
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
        `Congratulations: you've been accepted for ${job_title}. Your Selection stage is now open. Continue in My Journey.`,
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
        `Your application for ${job_title} was not selected this time. You can apply to other open job roles in Job Roles.`,
        "application_rejected",
        { applicationId: id, jobTitle: job_title }
      );
      await supabase.from("candidates").update({ pool_category: "alumni" }).eq("id", candidate_id);
      break;

    default:
      break;
  }
}
