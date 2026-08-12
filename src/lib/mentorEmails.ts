/** Mentor programme transactional email copy. */

export type MentorEmailKind = "mentor_invite" | "mentor_session_scheduled";

export function buildMentorEmail(
  kind: MentorEmailKind,
  params: {
    mentorName: string;
    companyName?: string;
    candidateName?: string;
    jobTitle?: string;
    meetingNumber?: number;
    scheduledAt?: string;
    meetingUrl?: string;
    portalUrl?: string;
  }
) {
  const {
    mentorName,
    companyName,
    candidateName,
    jobTitle,
    meetingNumber,
    scheduledAt,
    meetingUrl,
    portalUrl = "https://nordicascent.com",
  } = params;
  const company = companyName ? ` at ${companyName}` : "";

  switch (kind) {
    case "mentor_invite":
      return {
        subject: `You have been invited as a mentor${companyName ? ` — ${companyName}` : ""}`,
        text: `Hi ${mentorName},

You have been added as a company mentor${company} on Nordic Ascent${
          candidateName ? ` for ${candidateName}` : ""
        }${jobTitle ? ` (${jobTitle})` : ""}.

Mentoring follows a standardised programme: shared agendas, observation forms after each meeting, and Signal / Activation notes where required. You do not design your own programme.

Sign in to the company portal to view assigned candidates, agendas, and observation forms:
${portalUrl}/employer/mentoring

If you need login help, contact your company admin or Nordic Ascent.

— Nordic Ascent`,
        html: `<p>Hi ${mentorName},</p>
<p>You have been added as a company mentor${company} on Nordic Ascent${
          candidateName ? ` for <strong>${candidateName}</strong>` : ""
        }${jobTitle ? ` (${jobTitle})` : ""}.</p>
<p>Mentoring follows a standardised programme: shared agendas, observation forms after each meeting, and Signal / Activation notes where required. You do not design your own programme.</p>
<p><a href="${portalUrl}/employer/mentoring">Open the mentor programme in the company portal</a></p>
<p>If you need login help, contact your company admin or Nordic Ascent.</p>
<p>— Nordic Ascent</p>`,
      };
    case "mentor_session_scheduled":
      return {
        subject: `Mentor meeting ${meetingNumber ?? ""} scheduled${jobTitle ? ` — ${jobTitle}` : ""}`,
        text: `Hi${candidateName ? ` ${candidateName}` : ""},

Your mentor${company} has scheduled Meeting ${meetingNumber ?? ""}${
          scheduledAt ? ` for ${scheduledAt}` : ""
        }.

${meetingUrl ? `Join link: ${meetingUrl}\n\n` : ""}Review the agenda in Mentoring on Nordic Ascent:
${portalUrl}/candidate/mentoring

— Nordic Ascent`,
        html: `<p>Hi${candidateName ? ` ${candidateName}` : ""},</p>
<p>Your mentor${company} has scheduled <strong>Meeting ${meetingNumber ?? ""}</strong>${
          scheduledAt ? ` for <strong>${scheduledAt}</strong>` : ""
        }.</p>
${meetingUrl ? `<p><a href="${meetingUrl}">Join the call</a></p>` : ""}
<p><a href="${portalUrl}/candidate/mentoring">Review the agenda in Mentoring</a></p>
<p>— Nordic Ascent</p>`,
      };
  }
}
