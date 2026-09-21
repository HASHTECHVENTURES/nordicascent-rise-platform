import { Link } from "react-router-dom";
import { useCurrentPrivacyNoticeVersion } from "@/hooks/useGdpr";
import { DEFAULT_PRIVACY_NOTICE_VERSION } from "@/lib/gdpr";

export default function Privacy() {
  const { data: version } = useCurrentPrivacyNoticeVersion();
  const noticeVersion = version ?? DEFAULT_PRIVACY_NOTICE_VERSION;

  return (
    <div className="max-w-3xl mx-auto py-16 px-4 space-y-8">
        <div>
          <p className="text-sm text-muted-foreground">Version {noticeVersion}</p>
          <h1 className="text-3xl font-medium mt-2">Privacy Notice</h1>
          <p className="text-muted-foreground mt-2">
            How Nordic Ascent collects, uses, stores, and protects personal data on this platform.
          </p>
        </div>

        <section className="prose prose-neutral dark:prose-invert max-w-none space-y-4 text-sm leading-relaxed">
          <h2 className="text-lg font-medium">Who we are</h2>
          <p>
            Nordic Ascent operates this recruitment and integration platform for engineers moving to
            Nordic companies. We act as data controller for candidate and company data processed here.
          </p>

          <h2 className="text-lg font-medium">What we collect</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>Identity and contact details (name, email, phone)</li>
            <li>Professional profile, CV, and application documents</li>
            <li>Assessment and Readiness responses</li>
            <li>Mentor meeting notes and programme progress</li>
            <li>Follow-up questionnaire responses (candidate and company parties are stored separately)</li>
          </ul>

          <h2 className="text-lg font-medium">How we use data</h2>
          <p>
            Data is used to run the selection pipeline, readiness programme, activation, relocation,
            onboarding, and follow-up stages. Companies only see candidate data relevant to their own
            roles and pipeline stage. Internal admin notes and other companies&apos; data are not shared.
          </p>

          <h2 className="text-lg font-medium">Retention</h2>
          <p>
            Each candidate record has a retention date set from programme status and adjustable by
            admin. After retention expires, most personal data is deleted; completed Readiness outcomes
            may be anonymised for aggregate reporting.
          </p>

          <h2 className="text-lg font-medium">Your rights</h2>
          <p>
            You may request access, correction, export, or deletion of your data. Contact{" "}
            <a href="mailto:privacy@nordicascent.com" className="text-primary hover:underline">
              privacy@nordicascent.com
            </a>
            .
          </p>
        </section>

        <p className="text-sm text-muted-foreground">
          <Link to="/login" className="text-primary hover:underline">
            Back to login
          </Link>
        </p>
      </div>
  );
}
