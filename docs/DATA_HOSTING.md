# Data Hosting & Residency (EU/EEA)

Appendix A · Integrations §5 — "Database hosted within EU/EEA, structure documented."

## Hosting

- **Provider:** Supabase (managed PostgreSQL, Auth, Storage, Realtime).
- **Project ref:** `dcjxjuqngfukljcifprt`
- **API URL:** `https://dcjxjuqngfukljcifprt.supabase.co`
- **Confirmed region:** `eu-north-1` — **North EU (Stockholm)**
- **Jurisdiction:** European Union / EEA (Sweden is an EU and EEA member state)
- **Nordic context:** Supabase does not offer a Norway-specific AWS region. `eu-north-1` (Stockholm) is the official Nordic / North EU region and is the correct host for Norway-facing Nordic Ascent operations.

### How the region was confirmed

The Supabase MCP tools do not return infrastructure region. Region was verified from
public DNS for this project’s database/pooler hostname:

```
dcjxjuqngfukljcifprt.pooler.supabase.com
  → pool-tcp-eu-north-1-….elb.eu-north-1.amazonaws.com
```

Dashboard cross-check (optional): Project Settings → General / Infrastructure should
show **North EU (Stockholm)** / `eu-north-1`.

A project’s primary region cannot be changed in place. Moving regions requires a new
Supabase project in the target region and a restore/migration.

## Data residency statement (for the Privacy Notice)

> All candidate personal data, uploaded documents, and application records are
> stored in a Supabase PostgreSQL project hosted in the European Union
> (`eu-north-1`, Stockholm — North EU). Backups are managed by Supabase within
> the same region under its point-in-time recovery policy.

## Database structure (documented)

- **Schema source of truth:** SQL migrations in [`supabase/migrations/`](../supabase/migrations) (`001`–`104`).
- **Type definitions:** [`src/types/database.ts`](../src/types/database.ts).
- **Migration index:** [`supabase/migrations/README.md`](../supabase/migrations/README.md).

### Core tables

- Identity & roles: `profiles`, `candidates`, `companies`, `employers`, `university_staff`
- Pipeline: `pipeline_stages`, `candidate_stage_progress`, `stage_tasks`, `candidate_task_progress`, `candidate_status_history`
- Selection & jobs: `jobs`, `applications`, `readiness_evaluations`, `mentor_signal_notes`, `followup_meeting_logs`
- Messaging & ops: `conversations`, `messages`, `notifications`, `activity_log`, `issues`, `support_tickets`
- GDPR: `privacy_notices`, `access_anomaly_flags`, plus `candidates.retention_date`

### Storage buckets

- `avatars` — public profile images
- `documents` — private CVs, transcripts, portfolios, Offee reports

## Related GDPR controls

- Retention: `candidates.retention_date`, auto-set from status via `suggest_retention_date()`.
- Deletion: `admin_delete_candidate()` removes live rows + Platform storage files immediately,
  and writes an **erasure ledger** entry to the `erasure-ledger` Storage bucket (Storage is not
  part of DB backups). Immutable Supabase PITR/daily backups cannot be scrubbed per person; after
  any restore within the ~30-day window, master admin runs **Security → Re-apply erasures** so
  resurrected rows are deleted again.
- Audit: `activity_log` records candidate views and exports (`log_activity()`).
