export type StageTaskPreset = {
  title: string;
  description: string;
  task_type: "task" | "course";
  content_url?: string | null;
  content_body: string;
};

export const STAGE_TASK_PRESETS: Record<string, StageTaskPreset[]> = {
  readiness: [
    {
      title: "Technical validation",
      description: "Pass technical interview",
      task_type: "task",
      content_body: `Your technical interview

What happens
You will join a 45-minute video call with a Nordic Ascent technical assessor. Your hiring company may join for the last 15 minutes.

Before the call
• Review the skills listed on your profile
• Prepare two recent projects you can explain clearly
• Test your camera, microphone, and internet connection

During the interview
• Walk through your experience and motivation for the Nordics
• Complete a practical discussion based on your role

After the interview
You will receive feedback in Messages. When you have passed, mark this task complete.`,
    },
    {
      title: "Cultural readiness",
      description: "Complete Nordic cultural readiness module",
      task_type: "course",
      content_body: `Nordic cultural readiness module

What you will cover
1. Workplace communication — direct feedback, flat teams, work-life balance
2. Social norms — punctuality, personal space, seasonal routines
3. Practical basics — healthcare, banking, housing

Time required: about 2 hours.

Complete all sections, then mark this task done.`,
    },
  ],
  internship: [
    {
      title: "Internship agreement",
      description: "Sign and return before start date",
      task_type: "task",
      content_body: `Internship agreement

Your employer will send the internship agreement through Messages.

What to do
• Read the terms, duration, and confidentiality clauses
• Sign electronically or return a scanned copy as instructed
• Confirm your start date with your company mentor

Mark complete once the signed agreement is submitted.`,
    },
    {
      title: "Meet your team",
      description: "Intro call with mentor and manager",
      task_type: "task",
      content_body: `Meet your team

Join an introduction call with your internship mentor and hiring manager.

Before the call
• Review the company profile and your role description
• Prepare a short introduction of your background and goals
• Test your video setup

After the call, mark this task complete.`,
    },
    {
      title: "Project kickoff",
      description: "Start your assigned internship project",
      task_type: "task",
      content_body: `Project kickoff

Begin your assigned internship project with clear goals for the 6–10 week period.

Steps
• Review project brief and success criteria from your mentor
• Set up access to tools and repositories
• Agree on weekly check-in times
• Share your first-week plan in Messages

Mark complete when your kickoff session is done.`,
    },
  ],
  activation: [
    {
      title: "Work permit application",
      description: "Submit work permit documents",
      task_type: "task",
      content_body: `Work permit application

Nordic Ascent will guide you through the work permit process for your destination country.

Steps
1. Confirm your job offer details in Messages
2. Upload required identity and education documents when requested
3. Sign the employer sponsorship forms Nordic Ascent sends you
4. Track permit status updates in Messages

When your application is submitted to authorities, mark this task complete.`,
    },
    {
      title: "Pre-employment paperwork",
      description: "Complete employer onboarding forms",
      task_type: "task",
      content_body: `Pre-employment paperwork

Your employer needs signed forms before you can start.

What to do
• Check Messages for forms from your company
• Complete tax and payroll information
• Sign the employment contract when received
• Return signed copies as instructed

Mark complete once all forms are submitted.`,
    },
  ],
  relocation: [
    {
      title: "Visa & documentation",
      description: "Complete visa requirements",
      task_type: "task",
      content_body: `Visa and documentation

After your work permit is approved, complete any remaining visa steps.

Checklist
• Book biometrics appointment if required
• Submit passport photos and application fee
• Keep copies of all submitted documents
• Notify Nordic Ascent when visa is stamped

Mark complete when your visa is approved.`,
    },
    {
      title: "Housing & travel",
      description: "Arrange accommodation and flights",
      task_type: "task",
      content_body: `Housing and travel planning

Plan your move to the Nordics.

Steps
1. Review housing options Nordic Ascent or your employer shared
2. Confirm temporary or permanent accommodation
3. Book flights for your arrival date
4. Share travel itinerary in Messages

Mark complete when housing and travel are booked.`,
    },
  ],
  onboarding: [
    {
      title: "Arrival check-in",
      description: "Complete arrival registration",
      task_type: "task",
      content_body: `Arrival check-in

Welcome — complete these steps in your first week.

• Register your address with local authorities
• Collect your work ID badge from the employer
• Set up bank account (bring passport and employment contract)
• Attend the company orientation session

Mark complete after your first week check-in with Nordic Ascent.`,
    },
    {
      title: "Integration session",
      description: "Attend workplace integration",
      task_type: "course",
      content_body: `Workplace integration session

A guided session with your team and Nordic Ascent mentor.

Covers
• Team introductions and role expectations
• IT setup and internal tools
• Buddy system and first-month goals

Attend the session, then mark this task complete.`,
    },
  ],
  followup: [
    {
      title: "30-day check-in",
      description: "Complete first month review",
      task_type: "task",
      content_body: `30-day check-in

Share how your first month went.

• Short survey from Nordic Ascent (via Messages)
• Optional call with your mentor
• Raise any relocation or workplace issues

Mark complete after your check-in call or survey.`,
    },
    {
      title: "Long-term support plan",
      description: "Review ongoing support options",
      task_type: "task",
      content_body: `Long-term support plan

Nordic Ascent stays available after onboarding.

Review
• Mentoring options for the next 6 months
• Community events and networking
• How to reach support if issues arise

Mark complete once you have reviewed your support plan.`,
    },
  ],
};

export const READINESS_TASK_PRESETS = STAGE_TASK_PRESETS.readiness;

export function findStagePreset(stageId: string, title: string) {
  return STAGE_TASK_PRESETS[stageId]?.find(
    (p) => p.title.toLowerCase() === title.toLowerCase()
  );
}

export function findReadinessPreset(title: string) {
  return findStagePreset("readiness", title);
}
