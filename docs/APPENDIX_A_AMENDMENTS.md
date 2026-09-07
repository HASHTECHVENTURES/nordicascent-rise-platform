# Appendix A — Amendments & Gap Closure

Companion to the Gap Analysis (`~/Desktop/nordic-legal-docs/05-appendix-a-gap-analysis.html`).
This records (1) items now **implemented** in this codebase and (2) wording
**amendments** for items that should be accepted as-is because the build already
matches the intent. Regenerate the client-facing HTML/PDF from this content.

## 1. Gaps now closed (implemented)

| Appendix A item | Previous status | Now | Where |
|---|---|---|---|
| Data protection §2 — retention date auto from status | Partial | **Done** | `useUpdateCandidateStatus` recalculates + persists `retention_date` via `suggest_retention_date()` on every status change |
| Audit log — views & exports | Partial | **Done** | `candidate.view` logged on admin, employer and mentor candidate detail; `candidate.export` logged for candidate-list CSV, pipeline CSV, and Offee CSV (`useLogCandidateAccess`, `useLogCandidateExport`) |
| Core §3 — candidate status history | Partial | **Done** | `candidate_status_history` table + trigger (migration `102`); admin timeline on Candidate Detail (from → to, actor, date) |
| Integrations §4 — pipeline-wide export | Partial | **Done** | `admin_export_pipeline()` RPC (migration `103`) + "Export pipeline" button (all applications across stages in one CSV) |
| Core §10 — unified internal notes | Partial | **Done** | `admin_candidate_internal_notes()` RPC (migration `104`) + "Internal notes" panel aggregating selection / readiness / mentoring / follow-up notes, admin-only |
| Integrations §5 — EU/EEA hosting documented | Partial | **Done** | Confirmed `eu-north-1` (North EU / Stockholm) via pooler DNS → `elb.eu-north-1.amazonaws.com`; documented in `docs/DATA_HOSTING.md` + README |
| Integrations §6 — deployment pipeline | Partial | **Done (baseline)** | `.github/workflows/ci.yml` — install + lint + build on push/PR; migrations remain CLI/MCP |
| Integrations §2 — transactional email | Partial | **Ready** | `send-transactional-email` deployed with a safe `healthcheck`; enable by setting `RESEND_API_KEY` in production (currently not configured — in-app notifications remain the channel) |

## 2. Wording amendments (adopted — no product change)

Documented in [`APPENDIX_A_SPEC_AMENDMENTS.md`](./APPENDIX_A_SPEC_AMENDMENTS.md)
and applied in the Desktop legal pack.

- **Roles (Core §1).** Adopted: **admin (regular/master), employer, mentor, candidate,
  university staff**. Sign-off ☑
- **Track assignment (Core §6).** Adopted: auto from profile experience + admin
  override; candidate does not self-select. Sign-off ☑
- **Candidate deletion (Data protection §5).** Adopted: live DB + storage delete;
  PITR backups per Supabase policy, out of app scope. Sign-off ☑
- **Acceptance testing.** Each closed item was verified through a real admin
  login with UI + database checks. Use the per-item checklist in section 3 as the
  acceptance evidence.

## 3. Acceptance checklist (verified this pass)

- [x] Change a candidate's status → `retention_date` updates automatically (verified: NULL → 2031-09-07 on "Mark verified").
- [x] Admin candidate-list CSV export → `candidate.export` row appears in Activity log.
- [x] Pipeline export downloads all applications in one CSV → `candidate.export` (`scope=pipeline_csv`) logged.
- [x] Change status twice → Status history timeline shows each transition with actor + date.
- [x] Candidate with stage notes → unified Internal notes panel shows them, admin-only.
- [x] `npm run lint` and `npm run build` both pass (CI parity).

## 4. Still blocked / out of scope

- **Offee live API (Integrations §1).** No Offee API credentials or sandbox exist.
  The manual CSV export + admin score entry workflow is retained; a live API is a
  separate work item once Offee provides API access. No mock API was built.
