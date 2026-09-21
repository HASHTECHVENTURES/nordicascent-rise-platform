# Nordic Ascent Rise Platform - Backend Setup

Full-stack talent mobility platform with **Supabase** backend and three role-based portals.

## Stack

- **Frontend:** Vite + React + TypeScript + shadcn/ui
- **Backend:** Supabase (PostgreSQL, Auth, RLS, Storage, Realtime)
- **Data layer:** TanStack React Query + `@supabase/supabase-js`

## Quick start

```bash
cp .env.example .env   # add your Supabase URL + anon key
npm install
npm run dev
```

App runs at `http://localhost:8080`

## Portals

| Role | Path | Sign up as |
|------|------|------------|
| Candidate | `/candidate/*` | Candidate on login page |
| Employer | `/employer/*` | Company on login page |
| Admin | `/admin/*` | Admin (disabled by default; see env) |

All portal routes are **protected** - unauthenticated users redirect to `/login`.

## Environment variables

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_ALLOW_ADMIN_SIGNUP=false   # set true only for local dev
```

## Supabase

Migrations `001`-`011` are applied on the connected project. Local SQL copies are in `supabase/migrations/` (001-008 were applied remotely first; 009-011 are mirrored locally).

### Database tables

- `profiles`, `candidates`, `companies`, `employers`
- `pipeline_stages`, `candidate_stage_progress`, `stage_tasks`, `candidate_task_progress`
- `jobs`, `applications`, `employer_tasks`
- `conversations`, `messages`, `mentoring_sessions`
- `issues`, `support_tickets`, `support_ticket_messages`, `notifications`, `activity_log`
- `contact_submissions`, `insight_articles`, `announcements`, `platform_settings`

### Storage buckets

- `avatars` - public profile images
- `documents` - private CVs and uploads

### Transactional email (Resend)

In-app notifications always fire on workflow events. Transactional email is sent
via the `send-transactional-email` edge function (deployed, ACTIVE) and is
**off until configured**. To enable in production, set Supabase function secrets:

```
RESEND_API_KEY=<resend key>
TRANSACTIONAL_EMAIL_FROM=Nordic Ascent <noreply@your-verified-domain>
```

Readiness can be checked safely (no email sent) by POSTing `{"healthcheck":true}`
to the function - it returns `resendConfigured: true|false`. As of the last check
`resendConfigured` is `false`, so email currently no-ops and in-app notifications
remain the channel.

### Data hosting & residency (EU/EEA)

Candidate data is stored in Supabase project `dcjxjuqngfukljcifprt` in
**`eu-north-1` (North EU / Stockholm)** - the Nordic EU/EEA region (Supabase has
no Norway-specific region). See [`docs/DATA_HOSTING.md`](docs/DATA_HOSTING.md)
for evidence, the privacy-notice residency statement, and the documented schema.

### Auth & security

- `handle_new_user` trigger creates profile + role-specific rows
- Server-side blocks: admin signup (unless `allowAdminSignup` in settings), registration toggles, maintenance mode
- `profiles.account_status` - suspend users from admin panel
- RLS on all tables; public RPCs: `get_public_stats`, `get_public_config`

## Scripts

```bash
npm run dev      # development server
npm run build    # production build
npm run preview  # preview production build
```
