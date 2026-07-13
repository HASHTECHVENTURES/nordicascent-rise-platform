import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, ExternalLink, FileText, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { documentFileName, openStoredDocument } from "@/lib/documentAccess";
import { getSupabaseErrorMessage } from "@/lib/supabaseError";

type DocItem = {
  label: string;
  path: string | null | undefined;
};

type Props = {
  cvUrl?: string | null;
  academicTranscriptPath?: string | null;
  projectDescriptionsPath?: string | null;
  workExperiencePath?: string | null;
  portfolioPath?: string | null;
  projectDescriptionsText?: string | null;
};

export default function CandidateDocumentsPanel({
  cvUrl,
  academicTranscriptPath,
  projectDescriptionsPath,
  workExperiencePath,
  portfolioPath,
  projectDescriptionsText,
}: Props) {
  const { toast } = useToast();
  const [loadingPath, setLoadingPath] = useState<string | null>(null);

  const items: DocItem[] = [
    { label: "CV / Resume", path: cvUrl },
    { label: "Academic transcript", path: academicTranscriptPath },
    { label: "Project descriptions (file)", path: projectDescriptionsPath },
    { label: "Work experience document", path: workExperiencePath },
    { label: "Portfolio", path: portfolioPath },
  ].filter((d) => Boolean(d.path));

  const openDoc = async (path: string, download = false) => {
    setLoadingPath(path);
    try {
      await openStoredDocument(path, { download, fileName: documentFileName(path) ?? undefined });
    } catch (err) {
      toast({
        title: download ? "Download failed" : "Could not open document",
        description: getSupabaseErrorMessage(err, "Document access failed"),
        variant: "destructive",
      });
    } finally {
      setLoadingPath(null);
    }
  };

  if (items.length === 0 && !projectDescriptionsText?.trim()) {
    return (
      <p className="text-sm text-muted-foreground">No uploaded documents found for this application.</p>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div
          key={item.label}
          className="flex flex-wrap items-center justify-between gap-2 rounded-lg border p-3"
        >
          <div className="flex items-center gap-2 min-w-0">
            <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
            <div className="min-w-0">
              <p className="text-sm font-medium">{item.label}</p>
              <p className="text-xs text-muted-foreground truncate">
                {documentFileName(item.path)}
              </p>
            </div>
          </div>
          <div className="flex gap-2 shrink-0">
            <Button
              size="sm"
              variant="outline"
              className="gap-1"
              disabled={loadingPath === item.path}
              onClick={() => openDoc(item.path!, false)}
            >
              {loadingPath === item.path ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <ExternalLink className="h-3 w-3" />
              )}
              View
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="gap-1"
              disabled={loadingPath === item.path}
              onClick={() => openDoc(item.path!, true)}
            >
              <Download className="h-3 w-3" />
              Download
            </Button>
          </div>
        </div>
      ))}
      {projectDescriptionsText?.trim() && (
        <div className="rounded-lg border p-3 text-sm">
          <p className="font-medium text-xs text-muted-foreground mb-1">Project descriptions (text)</p>
          <p className="whitespace-pre-wrap">{projectDescriptionsText}</p>
        </div>
      )}
    </div>
  );
}
