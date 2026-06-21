-- Candidates need to see company names/logos on open job listings.
-- Previously only status = 'verified' was readable; employer onboarding uses 'active'.

DROP POLICY IF EXISTS companies_select ON companies;

CREATE POLICY companies_select ON companies
  FOR SELECT TO authenticated
  USING (
    is_admin()
    OR id = get_my_company_id()
    OR status IN ('verified', 'active')
    OR EXISTS (
      SELECT 1 FROM jobs j
      WHERE j.company_id = companies.id AND j.status = 'open'
    )
  );
