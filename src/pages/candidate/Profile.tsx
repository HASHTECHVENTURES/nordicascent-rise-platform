import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TagsInput } from "@/components/ui/tags-input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { User, Award, Upload, FileText, Loader2, Download } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useUpdateMyCandidate } from "@/hooks/useData";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import {
  COUNTRIES,
  DEFAULT_COUNTRY,
  displayIndiaPhone,
  formatCandidateLocation,
  normalizeIndiaPhone,
} from "@/lib/candidateLocation";
import { markProfileSaved } from "@/hooks/useCandidateOnboarding";
import { syncEligibleTasks } from "@/lib/syncProfileTasks";
import { deriveTrackFromExperience, setTrack, TRACK_META } from "@/lib/track";
import { syncPipelineForTrack } from "@/lib/pipelineProgress";
import { isOnUniversityWaitlist, isWaitlistProfileOnly } from "@/lib/candidateAccess";
import { Clock, GraduationCap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import IndianStateSelect from "@/components/candidate/IndianStateSelect";
import {
  CANDIDATE_EXPERIENCE_OPTIONS,
  DEGREE_TYPES,
  getMissingStep1Fields,
  normalizeRegistrationExperience,
  step1FormFromAuth,
  type Step1Form,
} from "@/lib/candidateRegistration";
import { needsRegistrationDetailsStep } from "@/pages/candidate/RegistrationDetails";
import { CV_ACCEPT, resolveCvContentType, validateCvFile } from "@/lib/cvUpload";
import { cn } from "@/lib/utils";

function needsUniversityStep(candidate: ReturnType<typeof useAuth>["candidate"]) {
  if (isOnUniversityWaitlist(candidate)) return false;
  return !candidate?.university_id;
}

type ProfileForm = Step1Form;

function formFromAuth(
  profile: ReturnType<typeof useAuth>["profile"],
  candidate: ReturnType<typeof useAuth>["candidate"]
): ProfileForm {
  const base = step1FormFromAuth(profile, candidate);
  const country = base.country || DEFAULT_COUNTRY;
  const isIndia = country === DEFAULT_COUNTRY;
  return {
    ...base,
    phone: isIndia ? displayIndiaPhone(profile?.phone) : (profile?.phone ?? ""),
    experience: normalizeRegistrationExperience(candidate?.experience),
  };
}

const selectContentProps = {
  position: "popper" as const,
  className: "z-[200]",
};

const CandidateProfile = () => {
  const navigate = useNavigate();
  const { profile, candidate, refreshProfile } = useAuth();
  const updateCandidate = useUpdateMyCandidate();
  const { toast } = useToast();
  const qc = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const lastSyncedAt = useRef<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [saving, setSaving] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Set<string>>(new Set());
  const [form, setForm] = useState<ProfileForm>(formFromAuth(profile, candidate));
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url ?? "");

  useEffect(() => {
    if (!profile?.id && !candidate?.id) return;
    const syncKey = `${profile?.id}:${candidate?.id}:${candidate?.updated_at ?? ""}`;
    if (lastSyncedAt.current === syncKey) return;
    lastSyncedAt.current = syncKey;
    setForm(formFromAuth(profile, candidate));
    setAvatarUrl(profile?.avatar_url ?? candidate?.avatar_url ?? "");
  }, [profile, candidate]);

  const isIndia = form.country === DEFAULT_COUNTRY;
  const isSaving = saving || updateCandidate.isPending;
  const derivedTrack = deriveTrackFromExperience(form.experience);
  const currentTrack = (candidate?.track ?? "entry") as "entry" | "fast";
  const trackWillChange = derivedTrack !== null && derivedTrack !== currentTrack;
  const cvFileName = candidate?.cv_url?.split("/").pop()?.replace(/^\d+-/, "") ?? null;
  const initials = (profile?.full_name ?? "?").split(" ").map((n) => n[0]).join("").slice(0, 2);

  const updateField = <K extends keyof ProfileForm>(key: K, value: ProfileForm[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setFieldErrors((prev) => {
      const next = new Set(prev);
      next.delete(key as string);
      return next;
    });
  };

  const fieldInvalid = (key: string) => fieldErrors.has(key);
  const labelClass = (key: string) => cn(fieldInvalid(key) && "text-destructive");
  const inputClass = (key: string) => cn(fieldInvalid(key) && "border-destructive ring-1 ring-destructive");

  const handleSave = async () => {
    if (!profile?.id || !candidate?.id) {
      toast({ title: "Not signed in", variant: "destructive" });
      return;
    }

    const phoneNormalized =
      form.country === DEFAULT_COUNTRY ? normalizeIndiaPhone(form.phone) : form.phone.trim();

    const missing = getMissingStep1Fields(form, {
      phoneNormalized,
      hasCv: Boolean(candidate.cv_url),
      hasAvatar: Boolean(avatarUrl || profile.avatar_url),
    });

    if (missing.length > 0) {
      setFieldErrors(new Set(missing.map((m) => m.key)));
      toast({
        title: "Complete all required fields",
        description: missing.map((m) => m.label).join(", "),
        variant: "destructive",
      });
      return;
    }

    setFieldErrors(new Set());
    setSaving(true);
    try {
      const email = form.email.trim();
      if (email !== (profile.email ?? "")) {
        const { error: authError } = await supabase.auth.updateUser({ email });
        if (authError) throw authError;
      }

      const { error: profileError } = await supabase.from("profiles").update({
        full_name: form.full_name.trim(),
        phone: phoneNormalized,
        email,
      }).eq("id", profile.id);
      if (profileError) throw profileError;

      const location = formatCandidateLocation({
        city: form.city.trim(),
        state: form.state.trim(),
        country: form.country.trim(),
      });

      const trackFromExperience = deriveTrackFromExperience(form.experience.trim());
      const educationSummary = [form.degree_type, form.field_of_study].filter(Boolean).join(" — ");

      await updateCandidate.mutateAsync({
        country: form.country.trim() || DEFAULT_COUNTRY,
        state: form.state.trim(),
        city: form.city.trim(),
        location,
        title: form.title.trim(),
        experience: form.experience,
        education: educationSummary || form.field_of_study.trim(),
        field_of_study: form.field_of_study.trim(),
        degree_type: form.degree_type.trim(),
        linkedin_url: form.linkedin_url.trim(),
        bio: form.bio,
        skills: form.skills,
        ...(trackFromExperience ? { track: trackFromExperience } : {}),
      });

      if (trackFromExperience) {
        setTrack(trackFromExperience);
        if (trackFromExperience !== currentTrack) {
          await syncPipelineForTrack(candidate.id, trackFromExperience);
        }
      }

      await refreshProfile();

      const { data: freshCandidate } = await supabase.from("candidates").select("*").eq("id", candidate.id).single();
      const { data: freshProfile } = await supabase.from("profiles").select("*").eq("id", profile.id).single();

      if (freshCandidate && freshProfile) {
        try {
          await supabase.from("candidates").update({
            full_name: freshProfile.full_name,
            avatar_url: freshProfile.avatar_url,
          }).eq("id", candidate.id);
        } catch {
          // optional columns
        }
        await syncEligibleTasks(candidate.id, freshProfile, freshCandidate);
      }

      qc.invalidateQueries({ queryKey: ["task-progress"] });
      qc.invalidateQueries({ queryKey: ["stage-progress"] });

      markProfileSaved();
      lastSyncedAt.current = `${profile.id}:${candidate.id}:${freshCandidate?.updated_at ?? ""}`;

      toast({
        title: "Profile saved",
        ...(trackFromExperience && trackFromExperience !== currentTrack
          ? { description: `Program track updated to ${TRACK_META[trackFromExperience].label}.` }
          : {}),
      });

      if (isWaitlistProfileOnly(freshCandidate)) {
        navigate("/candidate/profile", { replace: true });
      } else if (needsUniversityStep(freshCandidate)) {
        navigate("/candidate/university", { replace: true });
      } else if (needsRegistrationDetailsStep(freshCandidate)) {
        navigate("/candidate/registration-details", { replace: true });
      }
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

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile?.id) return;
    setUploadingAvatar(true);
    try {
      const ext = file.name.split(".").pop() ?? "jpg";
      const path = `${profile.id}/avatar.${ext}`;
      const { error: uploadError } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
      if (uploadError) throw uploadError;
      const { data } = supabase.storage.from("avatars").getPublicUrl(path);
      await supabase.from("profiles").update({ avatar_url: data.publicUrl }).eq("id", profile.id);
      await supabase.from("candidates").update({ avatar_url: data.publicUrl }).eq("profile_id", profile.id);
      setAvatarUrl(data.publicUrl);
      await refreshProfile();
      setFieldErrors((prev) => {
        const next = new Set(prev);
        next.delete("avatar");
        return next;
      });
      toast({ title: "Photo updated" });
    } catch (err) {
      toast({ title: "Upload failed", description: err instanceof Error ? err.message : "Try again", variant: "destructive" });
    } finally {
      setUploadingAvatar(false);
      if (avatarInputRef.current) avatarInputRef.current.value = "";
    }
  };

  const handleCvUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile?.id) return;

    const validation = validateCvFile(file);
    if (!validation.ok) {
      toast({ title: validation.message.includes("MB") ? "File too large" : "Invalid file", description: validation.message, variant: "destructive" });
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setUploading(true);
    try {
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      const path = `${profile.id}/cv/${Date.now()}-${safeName}`;
      const contentType = resolveCvContentType(file);
      const { error: uploadError } = await supabase.storage
        .from("documents")
        .upload(path, file, { contentType, upsert: false });
      if (uploadError) throw uploadError;

      await updateCandidate.mutateAsync({ cv_url: path });
      setFieldErrors((prev) => {
        const next = new Set(prev);
        next.delete("cv");
        return next;
      });
      await refreshProfile();
      const { data: freshCandidate } = await supabase.from("candidates").select("*").eq("id", candidate!.id).single();
      const { data: freshProfile } = await supabase.from("profiles").select("*").eq("id", profile!.id).single();
      if (freshCandidate && freshProfile) {
        await syncEligibleTasks(candidate!.id, freshProfile, freshCandidate);
      }
      qc.invalidateQueries({ queryKey: ["task-progress"] });
      toast({ title: "CV uploaded" });
    } catch (err) {
      toast({ title: "Upload failed", description: err instanceof Error ? err.message : "Try again", variant: "destructive" });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDownloadCv = async () => {
    if (!candidate?.cv_url) return;
    try {
      const { data, error } = await supabase.storage.from("documents").createSignedUrl(candidate.cv_url, 3600);
      if (error) throw error;
      window.open(data.signedUrl, "_blank");
    } catch (err) {
      toast({ title: "Download failed", description: err instanceof Error ? err.message : "Try again", variant: "destructive" });
    }
  };

  const onWaitlist = isOnUniversityWaitlist(candidate);
  const missingPreview = getMissingStep1Fields(form, {
    phoneNormalized: form.country === DEFAULT_COUNTRY ? normalizeIndiaPhone(form.phone) : form.phone.trim(),
    hasCv: Boolean(candidate?.cv_url),
    hasAvatar: Boolean(avatarUrl || profile?.avatar_url),
  });

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <p className="text-sm font-medium text-primary">Step 1 of 3</p>
        <h1 className="text-2xl font-bold tracking-tight">Candidate Registration</h1>
        <p className="text-muted-foreground">Personal information, education, skills, and CV</p>
      </div>

      {fieldErrors.size > 0 && missingPreview.length > 0 && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/5 p-4 text-sm text-destructive">
          <p className="font-medium">Missing required fields — highlighted in red below:</p>
          <ul className="mt-2 list-disc pl-5">
            {missingPreview.map((m) => (
              <li key={m.key}>{m.label}</li>
            ))}
          </ul>
        </div>
      )}

      {onWaitlist && (
        <Card className="border-amber-200 bg-amber-50/80 dark:border-amber-900 dark:bg-amber-950/30">
          <CardContent className="flex flex-col gap-3 p-6 sm:flex-row sm:items-start">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/50">
              <Clock className="h-5 w-5 text-amber-700 dark:text-amber-400" />
            </div>
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-semibold">University under review</p>
                <Badge variant="secondary" className="gap-1">
                  <GraduationCap className="h-3 w-3" />
                  Waitlist
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                You requested <span className="font-medium text-foreground">{candidate?.university_waitlist_name}</span>.
                Our team is reviewing it.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <input ref={fileInputRef} type="file" accept={CV_ACCEPT} className="hidden" onChange={handleCvUpload} />

      <Card className={cn(fieldInvalid("avatar") && "border-destructive/50")}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Personal Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-6">
            <Avatar className="h-24 w-24 shrink-0">
              <AvatarImage
                src={avatarUrl || profile?.avatar_url || undefined}
                className="object-cover object-center"
              />
              <AvatarFallback className="text-xl bg-nordic-orange/10 text-nordic-orange">{initials}</AvatarFallback>
            </Avatar>
            <div>
              <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
              <Button type="button" variant="outline" size="sm" disabled={uploadingAvatar} onClick={() => avatarInputRef.current?.click()}>
                {uploadingAvatar ? <Loader2 className="h-4 w-4 animate-spin" /> : "Change photo"}
              </Button>
              <p className={cn("text-xs mt-2", fieldInvalid("avatar") ? "text-destructive" : "text-muted-foreground")}>
                {fieldInvalid("avatar") ? "Profile photo required" : "Square photos work best — JPG or PNG"}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="full_name" className={labelClass("full_name")}>Full Name</Label>
              <Input id="full_name" className={inputClass("full_name")} value={form.full_name} onChange={(e) => updateField("full_name", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className={labelClass("email")}>Email</Label>
              <Input id="email" type="email" className={inputClass("email")} value={form.email} onChange={(e) => updateField("email", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone" className={labelClass("phone")}>Phone Number</Label>
              <div className="flex">
                {isIndia && (
                  <span className="inline-flex items-center rounded-l-md border border-r-0 border-input bg-muted px-3 text-sm text-muted-foreground">
                    +91
                  </span>
                )}
                <Input
                  id="phone"
                  type="tel"
                  className={cn(isIndia ? "rounded-l-none" : undefined, inputClass("phone"))}
                  value={form.phone}
                  onChange={(e) => updateField("phone", e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="linkedin" className={labelClass("linkedin_url")}>LinkedIn URL</Label>
              <Input
                id="linkedin"
                type="url"
                className={inputClass("linkedin_url")}
                placeholder="https://linkedin.com/in/..."
                value={form.linkedin_url}
                onChange={(e) => updateField("linkedin_url", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="country" className={labelClass("country")}>Country</Label>
              <Select value={form.country} onValueChange={(value) => updateField("country", value)}>
                <SelectTrigger id="country" className={inputClass("country")}><SelectValue /></SelectTrigger>
                <SelectContent {...selectContentProps}>
                  {COUNTRIES.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="state" className={labelClass("state")}>State</Label>
              {isIndia ? (
                <IndianStateSelect
                  id="state"
                  value={form.state}
                  onChange={(v) => updateField("state", v)}
                  invalid={fieldInvalid("state")}
                />
              ) : (
                <Input id="state" className={inputClass("state")} value={form.state} onChange={(e) => updateField("state", e.target.value)} />
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="city" className={labelClass("city")}>City</Label>
              <Input id="city" className={inputClass("city")} value={form.city} onChange={(e) => updateField("city", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="title" className={labelClass("title")}>Professional Title</Label>
              <Input id="title" className={inputClass("title")} value={form.title} onChange={(e) => updateField("title", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="experience" className={labelClass("experience")}>Experience</Label>
              <Select value={form.experience || undefined} onValueChange={(value) => updateField("experience", value)}>
                <SelectTrigger id="experience" className={inputClass("experience")}>
                  <SelectValue placeholder="Select your experience" />
                </SelectTrigger>
                <SelectContent {...selectContentProps}>
                  {CANDIDATE_EXPERIENCE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {derivedTrack && (
                <p className="text-xs text-muted-foreground">
                  Program track: <strong>{TRACK_META[derivedTrack].label}</strong> — {TRACK_META[derivedTrack].short}
                  {trackWillChange && " (updates when you save)"}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="degree_type" className={labelClass("degree_type")}>Degree type</Label>
              <Select value={form.degree_type || undefined} onValueChange={(value) => updateField("degree_type", value)}>
                <SelectTrigger id="degree_type" className={inputClass("degree_type")}>
                  <SelectValue placeholder="Select degree" />
                </SelectTrigger>
                <SelectContent {...selectContentProps}>
                  {DEGREE_TYPES.map((d) => (
                    <SelectItem key={d} value={d}>{d}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="field_of_study" className={labelClass("field_of_study")}>Field of study</Label>
              <Input
                id="field_of_study"
                className={inputClass("field_of_study")}
                placeholder="e.g. Computer Science, Mechanical Engineering"
                value={form.field_of_study}
                onChange={(e) => updateField("field_of_study", e.target.value)}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="bio">Bio (optional)</Label>
              <Textarea id="bio" rows={3} value={form.bio} onChange={(e) => updateField("bio", e.target.value)} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className={cn(fieldInvalid("skills") && "border-destructive/50")}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Skills
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="skills" className={labelClass("skills")}>Skills</Label>
            <TagsInput
              id="skills"
              value={form.skills}
              onChange={(skills) => updateField("skills", skills)}
              placeholder="Type a skill and press Enter"
              className={inputClass("skills")}
            />
            <p className="text-xs text-muted-foreground">Press Enter after each skill to add it.</p>
          </div>
        </CardContent>
      </Card>

      <Card className={cn(fieldInvalid("cv") && "border-destructive/50")}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            CV / Resume
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {candidate?.cv_url ? (
            <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border p-4">
              <div className="flex items-center gap-3">
                <FileText className="h-8 w-8 text-nordic-orange" />
                <p className="font-medium">{cvFileName ?? "Your CV"}</p>
              </div>
              <div className="flex gap-2">
                <Button type="button" variant="outline" size="sm" className="gap-2" onClick={handleDownloadCv}>
                  <Download className="h-4 w-4" />
                  Download
                </Button>
                <Button type="button" variant="outline" size="sm" disabled={uploading} onClick={() => fileInputRef.current?.click()}>
                  Replace
                </Button>
              </div>
            </div>
          ) : (
            <div className={cn("flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-lg border border-dashed p-6", fieldInvalid("cv") && "border-destructive")}>
              <p className={cn("text-sm", fieldInvalid("cv") ? "text-destructive" : "text-muted-foreground")}>
                {fieldInvalid("cv") ? "CV upload required — PDF, DOC, or DOCX, max 10 MB" : "PDF, DOC, or DOCX — max 10 MB"}
              </p>
              <Button type="button" className="gap-2" disabled={uploading} onClick={() => fileInputRef.current?.click()}>
                {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                Upload CV
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end pt-2 pb-8">
        <Button type="button" onClick={handleSave} disabled={isSaving} className="min-w-[160px] bg-nordic-orange hover:bg-nordic-orange/90 text-white">
          {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save & continue"}
        </Button>
      </div>
    </div>
  );
};

export default CandidateProfile;
