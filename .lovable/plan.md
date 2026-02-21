

# Client Feedback Implementation Plan (Round 3)

## Summary of Changes

The client provided detailed feedback across multiple areas. Since we've already handled the homepage landing page redesign, this plan covers everything else.

---

## 1. Home Page - Final Cleanup

**What:** Remove the "7-Stage Pipeline" process teaser and the "Built for Both Sides" audience cards from the homepage.

**Why:** Client explicitly asked to remove the 7-step process and move "Built for Both Sides" to the Platform page.

**Changes:**
- Remove `ProcessTeaser` and `AudienceCards` imports/usage from `src/pages/Home.tsx`
- Home will now be: Hero -> Stats -> Differentiators -> CTA

---

## 2. Platform Page - Expand & Restructure

**What:** Remove the 7-stage pipeline listing, bring in "Built for Both Sides" section, and expand the FAQ section significantly.

**Changes to `src/pages/Platform.tsx`:**
- Remove the pipeline stages cards section entirely
- Add the "Built for Both Sides" (AudienceCards) content into this page
- Keep and expand the FAQ section with more questions
- Keep the "Continuous Mentoring" callout
- Keep the CTA sections

---

## 3. Candidate Journey - Info Tooltips on Sidebar

**What:** Add an "i" icon popup on hover for each stage in the candidate sidebar navigation, explaining the purpose of that stage.

**Changes to `src/components/layouts/CandidateLayout.tsx`:**
- Add tooltip descriptions for each navigation item (Preparation, Selection, Readiness, etc.)
- Use the existing Tooltip component to show purpose on hover over an info icon next to each stage name

---

## 4. Candidate Internship Page - Split into Two Phases

**What:** The internship page should show two distinct phases:
1. Official internship per school rules (8-10 weeks)
2. Professional Pre-Employment (after hire decision, no credit, early work for company)

**Changes to `src/pages/candidate/Internship.tsx`:**
- Restructure milestones into two phases
- Add a "Hire/No-Hire Decision" divider between the phases
- Update descriptions and durations accordingly

---

## 5. Follow-up Page - Mark as Add-on Service

**What:** Follow-up is an "add-on service" (not core), mentoring stops after onboarding, and language course (Norwegian A2) is part of follow-up. A1 is done before arriving.

**Changes to `src/pages/candidate/Followup.tsx`:**
- Add a visible "Add-on Service" badge/banner indicating this is optional/paid
- Add language course section (Norwegian A2-level) to the follow-up resources
- Remove any references to mentoring in follow-up (mentoring stops at onboarding)

---

## 6. Employer Dashboard - KPI-Style Pipeline Overview

**What:** Redesign the employer dashboard to be a pure KPI overview with clickable elements:
- Total Candidates -> links to Candidate page
- Open Roles -> links to Roles page
- Candidate counts per stage -> clickable, goes to Candidate page filtered by stage
- Action Required / Bottlenecks -> links to new Tasks page

**Changes to `src/pages/employer/Dashboard.tsx`:**
- Make all KPI cards clickable with Link components
- Remove the detailed "Action Required" candidate list (moving to Tasks page)
- Keep pipeline stage counts but make them clickable
- Simplify to a clean KPI dashboard

---

## 7. New Employer Tasks Page

**What:** Create a dedicated Tasks page in the employer portal containing:
- Action Required tasks
- Bottleneck tasks
- Mentoring Tasks
- Interview & Evaluation Tasks
- Other Tasks

**New file: `src/pages/employer/Tasks.tsx`**

**Changes to `src/components/layouts/EmployerLayout.tsx`:**
- Add "Tasks" nav item between "Pipeline Overview" and "Candidates" in the sidebar

**Changes to `src/App.tsx`:**
- Add route for `/employer/tasks`

---

## 8. Employer Candidates Page - Redesign

**What:** Make it a "full-fledged" candidate page with:
- Stage count KPIs at the top (like the pipeline overview)
- Candidates grouped by stage below (moved up since tasks are on separate page)
- Remove action/task items from this page

**Changes to `src/pages/employer/Candidates.tsx`:**
- Remove the "Immediate Actions Required" section (moved to Tasks)
- Remove the "Bottlenecks" alert (moved to Tasks)
- Move the stage-based candidate tabs higher up
- Keep the candidate profile cards with match %, skills, readiness

---

## 9. Employer Mentoring - Multiple Mentors

**What:** Support more than one mentor per company.

**Changes to `src/pages/employer/Mentoring.tsx`:**
- Change from single `companyMentor` to an array of mentors
- Show a list/grid of company mentors with their assigned candidates

---

## 10. Admin Analytics - New KPI Structure

**What:** Replace current analytics with 5 specific KPI areas:
1. Candidates per Stage + Conversion Rates
2. Task Completion Rate
3. Candidate Drop-offs
4. Mentor Session Participation
5. Company Engagement

Plus a CSV/Excel export button.

**Changes to `src/pages/admin/Analytics.tsx`:**
- Replace current charts with the 5 KPI sections
- Each section gets KPI tiles + simple tables/progress bars
- Add functional CSV export button

---

## Implementation Order

1. Home page cleanup (remove ProcessTeaser + AudienceCards)
2. Platform page restructure (add Built for Both Sides + expand FAQ)
3. Candidate sidebar tooltips
4. Candidate Internship page (two-phase split)
5. Candidate Follow-up page (add-on service + language)
6. New Employer Tasks page + sidebar update + route
7. Employer Dashboard (KPI-only, clickable)
8. Employer Candidates page (simplified, no tasks)
9. Employer Mentoring (multiple mentors)
10. Admin Analytics (new KPI structure + export)

---

## Technical Notes

- No new dependencies needed -- all changes use existing UI components (Tooltip, Card, Badge, Tabs, etc.)
- 1 new file created: `src/pages/employer/Tasks.tsx`
- 10 existing files modified
- All content and data is mock/static (no backend changes)

