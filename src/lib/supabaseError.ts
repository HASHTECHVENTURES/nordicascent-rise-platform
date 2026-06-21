/** Extract a human-readable message from Supabase / PostgREST errors. */
export function getSupabaseErrorMessage(err: unknown, fallback = "Something went wrong"): string {
  if (err instanceof Error && err.message) return err.message;
  if (typeof err === "object" && err !== null) {
    const o = err as { message?: string; details?: string; hint?: string };
    if (o.message) return o.message;
    if (o.details) return o.details;
  }
  if (typeof err === "string") return err;
  return fallback;
}
