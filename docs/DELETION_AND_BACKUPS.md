# Candidate deletion & backup window

## What Appendix A asks for

> Deletion of a single candidate and all connected records in one action, including backups

## What is technically possible

Supabase **cannot** delete one person from an immutable PITR / daily backup snapshot.
There is no API for that (see [Supabase Backups](https://supabase.com/docs/guides/platform/backups)).

## What we implemented (GDPR-standard approach)

1. **Live delete (immediate)** — `admin_delete_candidate` removes candidate, related rows,
   auth user, and Platform storage files.
2. **Erasure ledger (outside DB backups)** — on delete, a JSON entry is written to the
   `erasure-ledger` Storage bucket. Storage objects are **not** included in database backups,
   so the ledger survives a DB restore.
3. **Re-apply after restore** — master admin opens **Admin → Security → Re-apply erasures
   after restore**. Any candidate who came back from a backup is deleted again.
4. **Window** — ledger entries are enforced for **30 days** (`backup_expires_at`), covering
   typical Pro daily / PITR retention. After that, backup copies expire on their own.

## Ops rule

After **any** Supabase backup or PITR restore, run **Re-apply erasures after restore** before
returning the platform to users.
