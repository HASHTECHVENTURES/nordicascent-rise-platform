import { Link } from "react-router-dom";

export default function Gdpr() {
  return (
    <div className="max-w-3xl mx-auto py-16 px-4 space-y-8">
      <div>
        <h1 className="text-3xl font-medium">GDPR</h1>
        <p className="text-muted-foreground mt-2">
          How Nordic Ascent handles personal data under the EU General Data Protection Regulation.
        </p>
      </div>

      <section className="prose prose-neutral dark:prose-invert max-w-none space-y-4 text-sm leading-relaxed">
        <h2 className="text-lg font-medium">Our commitment</h2>
        <p>
          Nordic Ascent processes personal data in line with the GDPR (as applied in Norway through
          the EEA Agreement and the Norwegian Personal Data Act), and other applicable privacy laws.
          Full detail is in our{" "}
          <Link to="/privacy" className="text-primary hover:underline">
            Privacy Notice
          </Link>
          .
        </p>

        <h2 className="text-lg font-medium">Roles</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>
            <strong>Nordic Ascent</strong> is the data controller for operating this Platform
            (accounts, programme stages, retention, and security).
          </li>
          <li>
            <strong>Employers</strong> are typically independent controllers for their own hiring
            decisions. Nordic Ascent shares candidate data with them only as needed for relevant
            roles and stages.
          </li>
        </ul>

        <h2 className="text-lg font-medium">Your rights</h2>
        <p>Under the GDPR you may request:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Access to your personal data</li>
          <li>Correction of inaccurate data</li>
          <li>Export of your data (data portability)</li>
          <li>Deletion of your data (where legally applicable)</li>
          <li>Restriction of, or objection to, certain processing</li>
          <li>Withdrawal of consent where processing is based on consent</li>
        </ul>
        <p>
          To exercise these rights, email{" "}
          <a href="mailto:privacy@nordicascent.com" className="text-primary hover:underline">
            privacy@nordicascent.com
          </a>
          . You may also lodge a complaint with Datatilsynet (Norway) at datatilsynet.no.
        </p>

        <h2 className="text-lg font-medium">Retention and deletion</h2>
        <p>
          Candidate records have a retention date based on programme status. When retention expires,
          personal data is deleted or anonymised according to platform policy. Admins can also delete
          a candidate on request; live data is removed immediately, with a short backup window managed
          so restored copies do not bring deleted people back.
        </p>

        <h2 className="text-lg font-medium">Hosting</h2>
        <p>
          Platform data is hosted in the EU/EEA (Supabase, North EU / Stockholm). Processing for the
          programme may involve partners (for example assessment providers) as described in the
          Privacy Notice.
        </p>

        <h2 className="text-lg font-medium">Consent</h2>
        <p>
          Account signup and ongoing use require acceptance of the current Privacy Notice version.
          Employers also confirm GDPR consent when submitting company registration.
        </p>
      </section>

      <p className="text-sm text-muted-foreground flex flex-wrap gap-4">
        <Link to="/privacy" className="text-primary hover:underline">
          Privacy Notice
        </Link>
        <Link to="/terms" className="text-primary hover:underline">
          Terms of Service
        </Link>
        <Link to="/" className="text-primary hover:underline">
          Home
        </Link>
      </p>
    </div>
  );
}
