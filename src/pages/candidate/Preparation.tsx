import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import PreparationStageCard from "@/components/candidate/PreparationStageCard";
import { useAuth } from "@/contexts/AuthContext";
import { isPreparationComplete } from "@/lib/candidateJourney";

export default function CandidatePreparation() {
  const navigate = useNavigate();
  const { profile, candidate } = useAuth();
  const prepDone = isPreparationComplete(profile, candidate);

  useEffect(() => {
    if (prepDone) {
      navigate("/candidate/jobs", { replace: true });
    }
  }, [prepDone, navigate]);

  if (prepDone) return null;

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-medium">Preparation</h1>
      <Card>
        <CardContent className="pt-6">
          <PreparationStageCard />
        </CardContent>
      </Card>
    </div>
  );
}
