/** Email copy for client-phase transactional email — unused while integration is off. */
export type SelectionEmailKind =
  | "offee_invite"
  | "employer_technical_invite"
  | "employer_motivation_invite"
  | "selection_rejected";

export function buildSelectionEmail(
  kind: SelectionEmailKind,
  params: {
    jobTitle: string;
    candidateName?: string;
    companyName?: string;
  }
) {
  const { jobTitle, candidateName, companyName } = params;
  const greeting = candidateName ? `Hi ${candidateName},` : "Hello,";

  switch (kind) {
    case "offee_invite":
      return {
        subject: `Offee assessment invitation — ${jobTitle}`,
        text: `${greeting}

Your application for ${jobTitle} has passed initial eligibility review.

You will receive a separate invitation to complete the Offee assessment. Please complete it within the timeframe given in that email.

If you have questions, contact Nordic Ascent.

Nordic Ascent`,
        html: `<p>${greeting}</p>
<p>Your application for <strong>${jobTitle}</strong> has passed initial eligibility review.</p>
<p>You will receive a separate invitation to complete the <strong>Offee assessment</strong>. Please complete it within the timeframe given in that email.</p>
<p>If you have questions, contact Nordic Ascent.</p>
<p>— Nordic Ascent</p>`,
      };
    case "employer_technical_invite":
      return {
        subject: `Technical assessment — ${jobTitle}`,
        text: `Hello,

A candidate has advanced to the technical and cognitive assessment for ${jobTitle}${companyName ? ` at ${companyName}` : ""}.

Please participate in the face-to-face session (or video call during pilot) when Nordic Ascent schedules it. After the session, submit your feedback in the employer portal.

Nordic Ascent`,
        html: `<p>Hello,</p>
<p>A candidate has advanced to the <strong>technical and cognitive assessment</strong> for <strong>${jobTitle}</strong>${companyName ? ` at ${companyName}` : ""}.</p>
<p>Please participate in the face-to-face session (or video call during pilot) when Nordic Ascent schedules it. After the session, submit your feedback in the employer portal.</p>
<p>— Nordic Ascent</p>`,
      };
    case "employer_motivation_invite":
      return {
        subject: `Motivation session — ${jobTitle}`,
        text: `Hello,

A candidate has advanced to the motivation and direction session for ${jobTitle}${companyName ? ` at ${companyName}` : ""}.

Please participate when Nordic Ascent schedules the session. After the session, submit your feedback in the employer portal.

Nordic Ascent`,
        html: `<p>Hello,</p>
<p>A candidate has advanced to the <strong>motivation and direction session</strong> for <strong>${jobTitle}</strong>${companyName ? ` at ${companyName}` : ""}.</p>
<p>Please participate when Nordic Ascent schedules the session. After the session, submit your feedback in the employer portal.</p>
<p>— Nordic Ascent</p>`,
      };
    case "selection_rejected":
      return {
        subject: `Application update — ${jobTitle}`,
        text: `${greeting}

Thank you for your interest in ${jobTitle}. After careful review, we will not be moving forward with your application for this role.

You may apply to other open positions on Nordic Ascent.

Nordic Ascent`,
        html: `<p>${greeting}</p>
<p>Thank you for your interest in <strong>${jobTitle}</strong>. After careful review, we will not be moving forward with your application for this role.</p>
<p>You may apply to other open positions on Nordic Ascent.</p>
<p>— Nordic Ascent</p>`,
      };
  }
}
