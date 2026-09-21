import { Link } from "react-router-dom";

export default function Terms() {
  return (
    <div className="max-w-3xl mx-auto py-16 px-4 space-y-8">
      <div>
        <p className="text-sm text-muted-foreground">Version 1.0</p>
        <h1 className="text-3xl font-medium mt-2">Terms of Service</h1>
        <p className="text-muted-foreground mt-2">
          Platform use agreement for candidates, employers, mentors, and other users.
        </p>
      </div>

      <section className="prose prose-neutral dark:prose-invert max-w-none space-y-4 text-sm leading-relaxed">
        <h2 className="text-lg font-medium">1. Agreement</h2>
        <p>
          These Terms of Service (“Terms”) govern access to and use of the Nordic Ascent website and
          platform (the “Platform”). By creating an account, accessing the Platform, or accepting
          these Terms, you agree to them and to our{" "}
          <Link to="/privacy" className="text-primary hover:underline">
            Privacy Notice
          </Link>
          . If you do not agree, do not use the Platform.
        </p>

        <h2 className="text-lg font-medium">2. Definitions</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>
            <strong>Candidate</strong>: an individual engineer applying to or participating in the
            Nordic Ascent programme.
          </li>
          <li>
            <strong>Employer</strong>: a Nordic company registered on the Platform to recruit and
            integrate candidates.
          </li>
          <li>
            <strong>User</strong>: any person with a Platform account (candidate, employer
            representative, mentor, university, or admin).
          </li>
          <li>
            <strong>Content</strong>: information, documents, text, and materials uploaded or
            generated on the Platform.
          </li>
        </ul>

        <h2 className="text-lg font-medium">3. Eligibility</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>You must be at least 18 years old and able to enter a binding contract.</li>
          <li>Candidates must meet programme eligibility criteria as communicated.</li>
          <li>Employer users must be authorised representatives of a registered company.</li>
          <li>We may refuse or terminate accounts that do not meet eligibility or violate these Terms.</li>
        </ul>

        <h2 className="text-lg font-medium">4. Account registration and security</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>Provide accurate registration information and keep it updated.</li>
          <li>You are responsible for safeguarding your login credentials and activity under your account.</li>
          <li>
            Notify us at{" "}
            <a href="mailto:privacy@nordicascent.com" className="text-primary hover:underline">
              privacy@nordicascent.com
            </a>{" "}
            if you suspect unauthorised access.
          </li>
        </ul>

        <h2 className="text-lg font-medium">5. Platform services</h2>
        <p>
          Nordic Ascent provides a structured talent integration platform that may include
          application and selection, Readiness, mentoring, Activation, relocation guidance,
          onboarding, and follow-up. Features may change with reasonable notice where practicable.
          The Platform is provided on an “as available” basis.
        </p>

        <h2 className="text-lg font-medium">6. Candidate obligations</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>Provide truthful information in applications, CVs, and assessments.</li>
          <li>Complete programme stages in good faith and meet communicated deadlines.</li>
          <li>Do not misrepresent qualifications, experience, or identity.</li>
          <li>Do not upload malware, unlawful content, or third-party data without permission.</li>
          <li>
            Progression through stages does not guarantee employment; hiring decisions are made by
            employers.
          </li>
        </ul>

        <h2 className="text-lg font-medium">7. Employer obligations</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>
            Use candidate data only for recruitment and integration related to roles on the Platform.
          </li>
          <li>Comply with GDPR and applicable employment and anti-discrimination laws.</li>
          <li>
            Do not resell, scrape, or retain candidate data outside authorised systems after your
            relationship with Nordic Ascent ends.
          </li>
          <li>Ensure mentors and staff comply with confidentiality and data protection rules.</li>
        </ul>

        <h2 className="text-lg font-medium">8. Intellectual property</h2>
        <p>
          Nordic Ascent owns the Platform, branding, software, and programme content (except user
          Content). You retain ownership of Content you upload and grant Nordic Ascent a licence to
          store, process, and display it as needed to operate the Platform. You may not copy,
          reverse-engineer, or commercially exploit the Platform without written consent.
        </p>

        <h2 className="text-lg font-medium">9. Privacy and data protection</h2>
        <p>
          Personal data processing is described in our{" "}
          <Link to="/privacy" className="text-primary hover:underline">
            Privacy Notice
          </Link>{" "}
          and{" "}
          <Link to="/gdpr" className="text-primary hover:underline">
            GDPR overview
          </Link>
          . Retention and deletion policies apply automatically and on request.
        </p>

        <h2 className="text-lg font-medium">10. Acceptable use</h2>
        <p>You must not:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Violate any law or third-party rights</li>
          <li>Harass, discriminate against, or harm other users</li>
          <li>Attempt unauthorised access to systems or data</li>
          <li>Use automated tools to scrape or bulk-download data</li>
          <li>Impersonate another person or entity</li>
          <li>Interfere with Platform security or performance</li>
        </ul>

        <h2 className="text-lg font-medium">11. Suspension and termination</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>
            You may close your account by contacting{" "}
            <a href="mailto:privacy@nordicascent.com" className="text-primary hover:underline">
              privacy@nordicascent.com
            </a>
            .
          </li>
          <li>We may suspend or terminate accounts for breach of these Terms, fraud, or legal requirement.</li>
          <li>
            After termination, data handling follows the Privacy Notice (including deletion or export
            where applicable).
          </li>
        </ul>

        <h2 className="text-lg font-medium">12. Disclaimers</h2>
        <p>
          The Platform does not guarantee employment, visa approval, or relocation outcomes. Nordic
          Ascent coordinates the programme; employers make hiring decisions. To the fullest extent
          permitted by law, the Platform is provided without warranties of uninterrupted or
          error-free operation.
        </p>

        <h2 className="text-lg font-medium">13. Contact</h2>
        <p>
          Questions about these Terms:{" "}
          <a href="mailto:privacy@nordicascent.com" className="text-primary hover:underline">
            privacy@nordicascent.com
          </a>
          .
        </p>
      </section>

      <p className="text-sm text-muted-foreground flex flex-wrap gap-4">
        <Link to="/privacy" className="text-primary hover:underline">
          Privacy Notice
        </Link>
        <Link to="/gdpr" className="text-primary hover:underline">
          GDPR
        </Link>
        <Link to="/" className="text-primary hover:underline">
          Home
        </Link>
      </p>
    </div>
  );
}
