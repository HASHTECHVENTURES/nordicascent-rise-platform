import { Navigate } from "react-router-dom";

/** Internship is nested under Activation (Entry Track). Legacy URL redirects here. */
export default function CandidateInternship() {
  return <Navigate to="/candidate/activation" replace />;
}
