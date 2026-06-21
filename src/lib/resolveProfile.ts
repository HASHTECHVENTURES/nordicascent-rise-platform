/** Supabase nested relations may return an object or a one-element array. */
export function resolveProfile<T>(nested: T | T[] | null | undefined): T | null {
  if (!nested) return null;
  if (Array.isArray(nested)) return nested[0] ?? null;
  return nested;
}
