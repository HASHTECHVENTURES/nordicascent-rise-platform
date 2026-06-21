# Supabase migrations

Migrations are applied in order on the remote Supabase project.

| Version | Name |
|---------|------|
| 001 | enums_and_profiles |
| 002 | core_entities_and_pipeline |
| 003 | jobs_applications_tasks |
| 004 | messaging_issues_notifications |
| 005 | rls_policies |
| 006 | storage_buckets |
| 007 | seed_demo_data |
| 008 | security_hardening |
| 009 | platform_settings_and_public_stats |
| 010 | public_config_rpc |
| 011 | hardening_and_extras |

Local SQL files `009`–`011` mirror the remote DDL. For a fresh project, run all migrations via Supabase CLI or MCP in order.
