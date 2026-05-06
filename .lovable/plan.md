## Final pre-production feedback changes

Based on the uploaded feedback document, four small content changes across the candidate and admin portals.

### 1. Activation page — remove track explanation
**File:** `src/pages/candidate/Internship.tsx`

- Remove the entire "Entry track vs. Fast track — how the road is built" card (currently around lines 141–154).
- Update the subtitle on line 29 from `"Entry Track — Activation – Internship (6–10 weeks) or Pre-Employment"` to `"Activation – Internship (6–10 weeks) or Pre-Employment"` (drop the "Entry Track —" prefix; track labels should not appear on Activation).

### 2. My Journey page — replace track explanation with the new copy
**File:** `src/pages/candidate/Dashboard.tsx`

Replace the existing short "Entry track vs. Fast track" card (around lines 134–145) with the new, fuller explanation from the feedback doc:

- Intro: "Both tracks follow the same seven-stage journey you see in My Journey (Preparation → Selection → Readiness → Activation → Relocation → Onboarding → Follow-up)."
- **Entry Track** section: 12-month selection and preparation program for participants with 0–12 months of professional experience, from selected schools. Process description: Preparation → Selection → Readiness, then Activation starting with a 6–10-week academic internship (unless otherwise specified). After internship, final hiring decision is confirmed, followed by Relocation and Pre-employment, before Onboarding and move to Company.
- **Fast Track** section: Accelerated preparation and activation program for participants with 1+ years of professional experience and education/alumni from selected schools. Timeline starts after Selection has been completed, covering Readiness, Activation and Relocation. Designed for participants who already meet defined criteria with the company.
- Closing line: "Nordic Ascent will confirm the track and stages applicable to your profile, and the pipeline indicates which steps are currently active."

Also update the dashboard line 131 program tag to use **Entry Track** (already correct capitalization).

### 3. Capitalize "Entry Track" and "Fast Track" everywhere
Across the platform, normalize lowercase "Entry track" / "Fast track" to **Entry Track** / **Fast Track** (both words capitalized). Affected files include:

- `src/pages/candidate/Dashboard.tsx`
- `src/pages/candidate/Internship.tsx` (in any remaining copy)
- `src/pages/candidate/Readiness.tsx`
- `src/components/layouts/CandidateLayout.tsx`
- Any other occurrences surfaced during the edit pass.

### 4. Admin — remove pipeline arrow line
**File:** `src/pages/admin/Issues.tsx` (line 181)

Remove the line: `Prep → Screening → Readiness → Activation → Relocation → Onboard → Follow-up`. Clean up the surrounding wrapper element if it becomes empty.

### Out of scope
No layout, color, component, or routing changes — copy edits only.
