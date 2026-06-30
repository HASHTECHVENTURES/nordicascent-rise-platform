import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ExternalLink, MapPin } from "lucide-react";
import {
  type CandidateJobPosting,
  getAboutCompanyDetails,
  getAboutRoleDetails,
  getCandidateCompanyName,
  getCandidateJobLocation,
  getJobTrackBadge,
  isAnonymousCompany,
  NORDIC_ASCENT_PROCESS_TEXT,
  formatWebsiteUrl,
} from "@/lib/jobPostingDisplay";

type Props = {
  job: CandidateJobPosting;
  backLink?: { to: string; label: string };
  applyButton?: React.ReactNode;
  secondaryButton?: React.ReactNode;
  showCompanyLogo?: boolean;
};

function DetailGrid({ details }: { details: { label: string; value: string }[] }) {
  if (!details.length) return null;
  return (
    <dl className="grid gap-4 sm:grid-cols-2">
      {details.map((item) => (
        <div key={item.label} className="space-y-1">
          <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{item.label}</dt>
          <dd className="text-sm text-foreground whitespace-pre-wrap">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}

export default function JobPostingView({
  job,
  backLink,
  applyButton,
  secondaryButton,
  showCompanyLogo = true,
}: Props) {
  const company = job.companies ?? null;
  const anonymous = isAnonymousCompany(company?.status);
  const companyName = getCandidateCompanyName(company);
  const location = getCandidateJobLocation(job, company);
  const trackBadge = getJobTrackBadge(job);
  const roleDetails = getAboutRoleDetails(job);
  const companyDetails = getAboutCompanyDetails(company);
  const websiteUrl = formatWebsiteUrl(company?.website);

  return (
    <div className="space-y-6 max-w-3xl">
      {backLink && (
        <Button variant="ghost" size="sm" asChild>
          <Link to={backLink.to}>{backLink.label}</Link>
        </Button>
      )}

      <div className="space-y-4">
        <div className="flex gap-4">
          {showCompanyLogo && !anonymous && company?.logo_url && (
            <Avatar className="h-14 w-14 rounded-lg shrink-0">
              <AvatarImage src={company.logo_url} className="object-contain p-1" />
              <AvatarFallback className="rounded-lg">{companyName.slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
          )}
          <div className="space-y-2 min-w-0">
            <h1 className="text-2xl font-medium tracking-tight">{job.title}</h1>
            <p className="text-muted-foreground">{companyName}</p>
            {location && (
              <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                <MapPin className="h-4 w-4 shrink-0" />
                {location}
              </p>
            )}
            {trackBadge && (
              <Badge variant="secondary" className="font-normal">
                {trackBadge}
              </Badge>
            )}
          </div>
        </div>

        {(applyButton || secondaryButton) && (
          <div className="flex flex-wrap gap-3 pt-2">
            {applyButton}
            {secondaryButton}
          </div>
        )}
      </div>

      {roleDetails.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>About the role</CardTitle>
          </CardHeader>
          <CardContent>
            <DetailGrid details={roleDetails} />
          </CardContent>
        </Card>
      )}

      {(companyDetails.length > 0 || company?.description?.trim()) && (
        <Card>
          <CardHeader>
            <CardTitle>About the company</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <DetailGrid details={companyDetails} />
            {websiteUrl && (
              <a
                href={websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
              >
                Visit website
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            )}
            {company?.description?.trim() && (
              <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                {company.description.trim()}
              </p>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>About the process</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
            {NORDIC_ASCENT_PROCESS_TEXT}
          </p>
        </CardContent>
      </Card>

      {(applyButton || secondaryButton) && (
        <div className="flex flex-wrap gap-3 pb-8 border-t pt-6">
          {applyButton}
          {secondaryButton}
        </div>
      )}
    </div>
  );
}
