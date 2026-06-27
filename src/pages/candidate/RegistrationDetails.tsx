import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, GraduationCap } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useUpdateMyCandidate } from "@/hooks/useData";
import { useToast } from "@/hooks/use-toast";
import { completePreparationAndActivateReadiness } from "@/lib/preparationProgress";
import {
  countWords,
  getMissingStep3Fields,
  isRegistrationDetailsComplete,
  NORDICS_MOTIVATION_MAX_WORDS,
  step3FormFromCandidate,
  type Step3Form,
} from "@/lib/candidateRegistration";
import { isOnUniversityWaitlist } from "@/lib/candidateAccess";
import { TRACK_META, type Track } from "@/lib/track";
import { cn } from "@/lib/utils";

const selectContentProps = {
  position: "popper" as const,
  className: "z-[200]",
};

const GRADUATION_MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export default function CandidateRegistrationDetails() {
  const navigate = useNavigate();
  const { candidate, loading, refreshProfile } = useAuth();
  const updateCandidate = useUpdateMyCandidate();
  const { toast } = useToast();
  const [form, setForm] = useState<Step3Form>(step3FormFromCandidate(candidate));
  const [fieldErrors, setFieldErrors] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);
  const [gradMonth, setGradMonth] = useState("");
  const [gradYear, setGradYear] = useState("");

  const track = (candidate?.track ?? "entry") as Track;
  const isEntry = track === "entry";
  const motivationWords = countWords(form.nordics_motivation);

  useEffect(() => {
    if (!candidate) return;
    setForm(step3FormFromCandidate(candidate));
    const parts = (candidate.expected_graduation_date ?? "").split("/");
    if (parts.length === 2) {
      setGradMonth(parts[0] ?? "");
      setGradYear(parts[1] ?? "");
    }
  }, [candidate?.id, candidate?.updated_at]);

  useEffect(() => {
    if (loading || !candidate) return;
    if (isOnUniversityWaitlist(candidate)) {
      navigate("/candidate/profile", { replace: true });
      return;
    }
    if (!candidate.university_id) {
      navigate("/candidate/university", { replace: true });
      return;
    }
    if (isRegistrationDetailsComplete(candidate)) {
      navigate("/candidate/readiness", { replace: true });
    }
  }, [loading, candidate, navigate]);

  if (loading || !candidate?.id) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const fieldInvalid = (key: string) => fieldErrors.has(key);
  const labelClass = (key: string) => cn(fieldInvalid(key) && "text-destructive");
  const inputClass = (key: string) => cn(fieldInvalid(key) && "border-destructive ring-1 ring-destructive");

  const handleSave = async () => {
    const expectedDate = isEntry && gradMonth && gradYear ? `${gradMonth}/${gradYear}` : form.expected_graduation_date;
    const payload: Step3Form = { ...form, expected_graduation_date: expectedDate };
    const missing = getMissingStep3Fields(track, payload);

    if (missing.length > 0) {
      setFieldErrors(new Set(missing.map((m) => m.key)));
      toast({
        title: "Complete required fields",
        description: missing.map((m) => m.label).join(", "),
        variant: "destructive",
      });
      return;
    }

    setFieldErrors(new Set());
    setSaving(true);
    try {
      await updateCandidate.mutateAsync({
        gpa_or_standing: payload.gpa_or_standing.trim(),
        nordics_motivation: payload.nordics_motivation.trim(),
        expected_graduation_date: isEntry ? expectedDate.trim() : null,
        graduation_year: !isEntry ? payload.graduation_year.trim() : null,
        current_employer: !isEntry ? payload.current_employer.trim() : null,
        current_role_title: !isEntry ? payload.current_role_title.trim() : null,
      });

      await refreshProfile();
      await completePreparationAndActivateReadiness(candidate.id, track);
      toast({ title: "Registration complete", description: "You can now start Readiness tests." });
      navigate("/candidate/readiness", { replace: true });
    } catch (err) {
      toast({
        title: "Save failed",
        description: err instanceof Error ? err.message : "Try again",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const yearOptions = Array.from({ length: 8 }, (_, i) => String(new Date().getFullYear() + i));

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <p className="text-sm font-medium text-primary">Step 3 of 3</p>
        <h1 className="text-2xl font-bold tracking-tight">Academic & motivation</h1>
        <p className="text-sm text-muted-foreground">
          {TRACK_META[track].label} — a few more details before Readiness tests.
        </p>
      </div>

      {fieldErrors.size > 0 && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/5 p-4 text-sm text-destructive">
          <p className="font-medium">Please fill in all required fields:</p>
          <ul className="mt-2 list-disc pl-5">
            {getMissingStep3Fields(track, { ...form, expected_graduation_date: isEntry && gradMonth && gradYear ? `${gradMonth}/${gradYear}` : form.expected_graduation_date }).map((m) => (
              <li key={m.key}>{m.label}</li>
            ))}
          </ul>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <GraduationCap className="h-5 w-5" />
            Background
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="gpa" className={labelClass("gpa_or_standing")}>GPA or academic standing</Label>
            <Input
              id="gpa"
              className={inputClass("gpa_or_standing")}
              value={form.gpa_or_standing}
              onChange={(e) => setForm({ ...form, gpa_or_standing: e.target.value })}
              placeholder="e.g. 8.2 / 10, First class, 3.7 GPA"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="motivation" className={labelClass("nordics_motivation")}>
              Why do you consider working in the Nordics?
            </Label>
            <Textarea
              id="motivation"
              rows={5}
              className={inputClass("nordics_motivation")}
              value={form.nordics_motivation}
              onChange={(e) => setForm({ ...form, nordics_motivation: e.target.value })}
              placeholder="Share your motivation for building a career in the Nordics..."
            />
            <p className={cn("text-xs", motivationWords > NORDICS_MOTIVATION_MAX_WORDS ? "text-destructive" : "text-muted-foreground")}>
              {motivationWords} / {NORDICS_MOTIVATION_MAX_WORDS} words
            </p>
          </div>

          {isEntry ? (
            <div className="space-y-2">
              <Label className={labelClass("expected_graduation_date")}>Expected graduation date</Label>
              <div className="grid grid-cols-2 gap-3">
                <Select value={gradMonth || undefined} onValueChange={setGradMonth}>
                  <SelectTrigger className={inputClass("expected_graduation_date")}>
                    <SelectValue placeholder="Month" />
                  </SelectTrigger>
                  <SelectContent {...selectContentProps}>
                    {GRADUATION_MONTHS.map((m) => (
                      <SelectItem key={m} value={m}>{m}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={gradYear || undefined} onValueChange={setGradYear}>
                  <SelectTrigger className={inputClass("expected_graduation_date")}>
                    <SelectValue placeholder="Year" />
                  </SelectTrigger>
                  <SelectContent {...selectContentProps}>
                    {yearOptions.map((y) => (
                      <SelectItem key={y} value={y}>{y}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="grad-year" className={labelClass("graduation_year")}>Graduation year</Label>
                <Input
                  id="grad-year"
                  className={inputClass("graduation_year")}
                  value={form.graduation_year}
                  onChange={(e) => setForm({ ...form, graduation_year: e.target.value })}
                  placeholder="e.g. 2020"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="employer" className={labelClass("current_employer")}>Current employer</Label>
                <Input
                  id="employer"
                  className={inputClass("current_employer")}
                  value={form.current_employer}
                  onChange={(e) => setForm({ ...form, current_employer: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role-title" className={labelClass("current_role_title")}>Role title</Label>
                <Input
                  id="role-title"
                  className={inputClass("current_role_title")}
                  value={form.current_role_title}
                  onChange={(e) => setForm({ ...form, current_role_title: e.target.value })}
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end pb-8">
        <Button onClick={handleSave} disabled={saving || updateCandidate.isPending} className="min-w-[160px]">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save & continue to Readiness"}
        </Button>
      </div>
    </div>
  );
}

export function needsRegistrationDetailsStep(candidate: { university_id?: string | null } | null | undefined) {
  if (!candidate?.university_id) return false;
  return !isRegistrationDetailsComplete(candidate as Parameters<typeof isRegistrationDetailsComplete>[0]);
}
