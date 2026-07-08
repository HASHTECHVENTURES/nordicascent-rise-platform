import { Navigate } from "react-router-dom";

/** Internship setup lives under Activation (Step 1). */
export default function EmployerInternship() {
  return <Navigate to="/employer/activation" replace />;
}
