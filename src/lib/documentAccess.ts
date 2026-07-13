import { supabase } from "@/lib/supabase";

export function documentFileName(path: string | null | undefined) {
  if (!path) return null;
  return path.split("/").pop()?.replace(/^\d+-/, "") ?? "document";
}

export async function openStoredDocument(
  path: string,
  options?: { download?: boolean; fileName?: string }
) {
  const { data, error } = await supabase.storage.from("documents").createSignedUrl(path, 3600);
  if (error) throw error;

  if (options?.download) {
    const link = document.createElement("a");
    link.href = data.signedUrl;
    link.download = options.fileName ?? documentFileName(path) ?? "document";
    link.rel = "noopener";
    link.click();
  } else {
    window.open(data.signedUrl, "_blank", "noopener,noreferrer");
  }
}
