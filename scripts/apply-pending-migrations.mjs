/**
 * Apply pending SQL migrations to the remote Supabase Postgres database.
 *
 * Usage (get DB password from Supabase Dashboard → Project Settings → Database):
 *   export $(grep -v '^#' .env | xargs)
 *   SUPABASE_DB_PASSWORD='your-db-password' node scripts/apply-pending-migrations.mjs
 *
 * Optional: SUPABASE_DB_REGION=ap-south-1 (default ap-south-1)
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

const url = process.env.VITE_SUPABASE_URL ?? process.env.SUPABASE_URL;
const password = process.env.SUPABASE_DB_PASSWORD;
const region = process.env.SUPABASE_DB_REGION ?? "ap-south-1";

if (!url) {
  console.error("Missing VITE_SUPABASE_URL (load .env first: export $(grep -v '^#' .env | xargs))");
  process.exit(1);
}
if (!password) {
  console.error("Missing SUPABASE_DB_PASSWORD — set it from Supabase Dashboard → Database → password");
  process.exit(1);
}

const ref = url.replace("https://", "").replace(".supabase.co", "");
const connectionString =
  process.env.SUPABASE_DB_URL ??
  `postgresql://postgres.${ref}:${encodeURIComponent(password)}@aws-0-${region}.pooler.supabase.com:6543/postgres`;

const files = [
  "062_mentor_addon_topics.sql",
];

const postgres = (await import("postgres")).default;
const sql = postgres(connectionString, { ssl: "require", max: 1 });

try {
  for (const file of files) {
    const path = join(root, "supabase/migrations", file);
    const query = readFileSync(path, "utf8");
    console.log(`Applying ${file}...`);
    await sql.unsafe(query);
    console.log("  OK");
  }
  console.log("All pending migrations applied.");
} catch (err) {
  console.error("Migration failed:", err?.message ?? err);
  process.exit(1);
} finally {
  await sql.end();
}
