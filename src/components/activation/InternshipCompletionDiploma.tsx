import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, Award } from "lucide-react";
import { useActivationRecord } from "@/hooks/useActivation";

type Props = {
  applicationId: string;
  candidateName?: string | null;
  companyName?: string | null;
  jobTitle?: string | null;
  /** Candidates can always download once issued — even after Hold. */
  canDownload?: boolean;
};

function buildCertificateHtml(input: {
  candidateName: string;
  companyName: string;
  jobTitle: string;
  issuedAt: string;
}) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Internship Completion — Nordic Ascent</title>
  <style>
    body { font-family: Georgia, serif; max-width: 720px; margin: 48px auto; padding: 32px; border: 2px solid #1a365d; color: #1a202c; }
    h1 { font-size: 28px; letter-spacing: 0.04em; text-align: center; margin-bottom: 8px; }
    .sub { text-align: center; color: #4a5568; margin-bottom: 32px; }
    .body { font-size: 18px; line-height: 1.6; text-align: center; }
    .meta { margin-top: 40px; font-size: 14px; color: #718096; text-align: center; }
  </style>
</head>
<body>
  <h1>Internship Completion</h1>
  <p class="sub">Nordic Ascent Rise Platform</p>
  <p class="body">
    This certifies that <strong>${input.candidateName}</strong> has successfully completed
    the digital internship for <strong>${input.jobTitle}</strong> at
    <strong>${input.companyName}</strong>.
  </p>
  <p class="body" style="margin-top: 24px;">
    This document remains yours regardless of Final Clearance outcome.
  </p>
  <p class="meta">Issued ${input.issuedAt}</p>
</body>
</html>`;
}

export default function InternshipCompletionDiploma({
  applicationId,
  candidateName,
  companyName,
  jobTitle,
  canDownload = true,
}: Props) {
  const { data: record } = useActivationRecord(applicationId);
  const issuedAt = record?.internship_completion_issued_at;

  if (!issuedAt && record?.status !== "internship_complete" && record?.status !== "cleared" && record?.status !== "rejected_activation") {
    return null;
  }

  if (!issuedAt) {
    return null;
  }

  const issuedLabel = new Date(issuedAt).toLocaleDateString();

  const download = () => {
    const html = buildCertificateHtml({
      candidateName: candidateName?.trim() || "Candidate",
      companyName: companyName?.trim() || "Company",
      jobTitle: jobTitle?.trim() || "Internship role",
      issuedAt: issuedLabel,
    });
    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `internship-completion-${applicationId.slice(0, 8)}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex flex-wrap items-center gap-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Award className="h-4 w-4 text-primary" />
            Internship completion document
          </CardTitle>
          <Badge className="bg-success text-success-foreground">Issued</Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          Independent of Final Clearance. Issued {issuedLabel}. Keep this even if the process does
          not proceed to employment.
        </p>
      </CardHeader>
      {canDownload && (
        <CardContent>
          <Button type="button" size="sm" variant="outline" className="gap-1" onClick={download}>
            <Download className="h-3.5 w-3.5" />
            Download certificate
          </Button>
        </CardContent>
      )}
    </Card>
  );
}
