import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useMyCompany } from "@/hooks/useData";
import { isCompanyProfileComplete, type CompanyProfile } from "@/lib/companyProfileCompleteness";

const COMPANY_PROFILE_SAVED_KEY = "na.companyProfileSaved";

export function markCompanyProfileSaved() {
  sessionStorage.setItem(COMPANY_PROFILE_SAVED_KEY, "1");
}

/** First-time employers land on Company Profile once; after Save they can use the rest of the portal. */
export function useEmployerOnboardingRedirect() {
  const navigate = useNavigate();
  const location = useLocation();
  const { data: employerData, isLoading } = useMyCompany();

  const company = employerData?.companies as CompanyProfile | null;
  const complete = isCompanyProfileComplete(company);

  useEffect(() => {
    if (isLoading || complete) return;
    if (sessionStorage.getItem(COMPANY_PROFILE_SAVED_KEY) === "1") return;
    if (location.pathname === "/employer/company") return;
    navigate("/employer/company", { replace: true });
  }, [isLoading, complete, location.pathname, navigate]);
}
