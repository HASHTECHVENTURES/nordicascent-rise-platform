# Appendix A — Adopted Spec Amendments (no build)

These three items match the shipped product. Appendix A wording is updated to
match reality; no further engineering is required.

Source of truth for legal pack: `~/Desktop/nordic-legal-docs/`
(`05-appendix-a-gap-analysis.html`, `06-sow-completion-timeline.html`,
`04-data-processing-agreement.html`).

---

## 1. Core §1 — Roles

**Original wording (gap):** administrator, staff, mentor, candidate

**Adopted wording:**

> User login and authentication with role-based access for: **admin** (regular /
> master), **employer**, **mentor**, **candidate**, and **university staff**.

| Original term | Platform role | Portal |
|---|---|---|
| Administrator | `admin` (regular / master) | `/admin/*` |
| Staff | `university` | `/university/*` |
| Mentor | `mentor` | `/mentor/*` |
| Candidate | `candidate` | `/candidate/*` |
| (unlisted) | `employer` | `/employer/*` |

**Sign-off:** Amended — accepted as-is ☑

---

## 2. Core §6 — Track assignment

**Original wording (gap):** Track assigned by system only, not by candidate

**Adopted wording:**

> Track (Entry / Fast Track) is assigned automatically from candidate profile
> data (experience), with admin override available. The candidate does not
> self-select the track directly.

**How it works:** experience text → `deriveTrackFromExperience()` → Entry or Fast
Track → job eligibility; admin may override on Candidate Detail.

**Sign-off:** Amended — accepted as-is ☑

---

## 3. Data protection §5 — Delete including backups

**Original wording (gap):** Delete candidate including backups

**Adopted wording:**

> Deletion of the candidate and all connected application records and uploaded
> documents from the live database and Platform storage. Backup retention is
> governed by Supabase infrastructure policy (typically 7–30 days PITR) and is
> outside the scope of the application.

**Why not buildable:** Supabase PITR is a regional infrastructure copy; it cannot
be purged per individual candidate from application code. Live delete via
`admin_delete_candidate` (master admin) already removes DB rows + storage.

**DPA §10.3** updated to the same policy language.

**Sign-off:** Amended — accepted as-is ☑
