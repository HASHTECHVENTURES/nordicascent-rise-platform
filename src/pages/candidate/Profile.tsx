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
  INDIAN_STATES,
  displayIndiaPhone,
  formatCandidateLocation,
  normalizeIndiaPhone,
} from "@/lib/candidateLocation";
import { markProfileSaved } from "@/hooks/useCandidateOnboarding";
import { syncEligibleTasks } from "@/lib/syncProfileTasks";
import { deriveTrackFromExperience, EXPERIENCE_OPTIONS, normalizeExperienceValue, setTrack, TRACK_META } from "@/lib/track";
import { syncPipelineForTrack } from "@/lib/pipelineProgress";

type ProfileForm = {
  full_name: string;
  email: string;
  phone: string;
  country: string;
  state: string;
  city: string;
  title: string;
  experience: string;
  education: string;
  bio: string;
  skills: string[];
};

function formFromAuth(
  profile: ReturnType<typeof useAuth>["profile"],
  candidate: ReturnType<typeof useAuth>["candidate"]
): ProfileForm {
  const country = candidate?.country?.trim() || DEFAULT_COUNTRY;
  const isIndia = country === DEFAULT_COUNTRY;

  return {
    full_name: profile?.full_name ?? "",
    email: profile?.email ?? "",
    phone: isIndia ? displayIndiaPhone(profile?.phone) : (profile?.phone ?? ""),
    country,
    state: candidate?.state ?? "",
    city: candidate?.city ?? candidate?.location ?? "",
    title: candidate?.title ?? "",
    experience: normalizeExperienceValue(candidate?.experience),
    education: candidate?.education ?? "",
    bio: candidate?.bio ?? "",
    skills: candidate?.skills ?? [],
  };
}

const CandidateProfile = () => {
  const navigate = useNavigate();
  const { profile, candidate, refreshProfile } = useAuth();
  const updateCandidate = useUpdateMyCandidate();
  const { toast } = useToast();
  const qc = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<ProfileForm>(formFromAuth(profile, candidate));

  useEffect(() => {
    if (profile || candidate) {
      setForm(formFromAuth(profile, candidate));
    }
  }, [profile?.id, candidate?.id]);

  const isIndia = form.country === DEFAULT_COUNTRY;
  const isSaving = saving || updateCandidate.isPending;
  const derivedTrack = deriveTrackFromExperience(form.experience);
  const currentTrack = (candidate?.track ?? "entry") as "entry" | "fast";
  const trackWillChange = derivedTrack !== null && derivedTrack !== currentTrack;
  const cvFileName = candidate?.cv_url?.split("/").pop()?.replace(/^\d+-/, "") ?? null;
  const initials = (profile?.full_name ?? "?").split(" ").map((n) => n[0]).join("").slice(0, 2);

  const updateField = <K extends keyof ProfileForm>(key: K, value: ProfileForm[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    if (!profile?.id) {
      toast({ title: "Not signed in", description: "Log in again and retry.", variant: "destructive" });
      return;
    }
    if (!candidate?.id) {
      toast({ title: "Profile not ready", description: "Refresh the page and try again.", variant: "destructive" });
      return;
    }

    setSaving(true);
    try {
      const email = form.email.trim();
      if (email !== (profile.email ?? "")) {
        const { error: authError } = await supabase.auth.updateUser({ email });
        if (authError) throw authError;
      }

      const phone =
        form.country === DEFAULT_COUNTRY ? normalizeIndiaPhone(form.phone) : form.phone.trim();

      const { error: profileError } = await supabase.from("profiles").update({
        full_name: form.full_name.trim(),
        phone,
        email,
      }).eq("id", profile.id);
      if (profileError) throw profileError;

      const location = formatCandidateLocation({
        city: form.city.trim(),
        state: form.state.trim(),
        country: form.country.trim(),
      });

      const trackFromExperience = deriveTrackFromExperience(form.experience.trim());

      await updateCandidate.mutateAsync({
        country: form.country.trim() || DEFAULT_COUNTRY,
        state: form.state.trim(),
        city: form.city.trim(),
        location,
        title: form.title.trim(),
        experience: form.experience,
        education: form.education,
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

      const { data: freshCandidate, error: candError } = await supabase
        .from("candidates")
        .select("*")
        .eq("id", candidate.id)
        .single();
      if (candError) throw candError;

      const { data: freshProfile, error: profError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", profile.id)
        .single();
      if (profError) throw profError;

      if (freshCandidate && freshProfile) {
        try {
          await supabase
            .from("candidates")
            .update({
              full_name: freshProfile.full_name,
              avatar_url: freshProfile.avatar_url,
            })
            .eq("id", candidate.id);
        } catch {
          // Optional until migration 020 adds columns
        }
        await syncEligibleTasks(candidate.id, freshProfile, freshCandidate);
      }

      await refreshProfile();
      qc.invalidateQueries({ queryKey: ["task-progress"] });
      qc.invalidateQueries({ queryKey: ["stage-progress"] });

      markProfileSaved();
      toast({
        title: "Profile saved",
        ...(trackFromExperience && trackFromExperience !== currentTrack
          ? { description: `Program track updated to ${TRACK_META[trackFromExperience].label}.` }
          : {}),
      });
      navigate("/candidate/dashboard", { replace: true });
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
      const { error: candAvatarError } = await supabase
        .from("candidates")
        .update({ avatar_url: data.publicUrl })
        .eq("profile_id", profile.id);
      if (candAvatarError) {
        // Optional until migration 020
      }
      await refreshProfile();
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
    if (file.size > 10 * 1024 * 1024) {
      toast({ title: "File too large", description: "Maximum size is 10 MB", variant: "destructive" });
      return;
    }

    setUploading(true);
    try {
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      const path = `${profile.id}/cv/${Date.now()}-${safeName}`;
      const { error: uploadError } = await supabase.storage
        .from("documents")
        .upload(path, file, { contentType: file.type });
      if (uploadError) throw uploadError;

      await updateCandidate.mutateAsync({ cv_url: path });
      await refreshProfile();
      const { data: freshCandidate } = await supabase
        .from("candidates")
        .select("*")
        .eq("id", candidate!.id)
        .single();
      const { data: freshProfile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", profile!.id)
        .single();
      if (freshCandidate && freshProfile) {
        await syncEligibleTasks(candidate!.id, freshProfile, freshCandidate);
      }
      qc.invalidateQueries({ queryKey: ["task-progress"] });
      qc.invalidateQueries({ queryKey: ["stage-progress"] });
      toast({ title: "CV uploaded" });
    } catch (err) {
      toast({
        title: "Upload failed",
        description: err instanceof Error ? err.message : "Try again",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDownloadCv = async () => {
    if (!candidate?.cv_url) return;
    try {
      const { data, error } = await supabase.storage
        .from("documents")
        .createSignedUrl(candidate.cv_url, 3600);
      if (error) throw error;
      window.open(data.signedUrl, "_blank");
    } catch (err) {
      toast({
        title: "Download failed",
        description: err instanceof Error ? err.message : "Try again",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
        <p className="text-muted-foreground">Manage your profile and CV</p>
      </div>

      <input ref={fileInputRef} type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={handleCvUpload} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Personal Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-6">
            <Avatar className="h-20 w-20">
              <AvatarImage src={profile?.avatar_url ?? undefined} />
              <AvatarFallback className="text-xl bg-nordic-orange/10 text-nordic-orange">{initials}</AvatarFallback>
            </Avatar>
            <div>
              <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
              <Button type="button" variant="outline" size="sm" disabled={uploadingAvatar} onClick={() => avatarInputRef.current?.click()}>
                {uploadingAvatar ? <Loader2 className="h-4 w-4 animate-spin" /> : "Change photo"}
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">Full Name</Label>
              <Input id="full_name" value={form.full_name} onChange={(e) => updateField("full_name", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={form.email} onChange={(e) => updateField("email", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <div className="flex">
                {isIndia && (
                  <span className="inline-flex items-center rounded-l-md border border-r-0 border-input bg-muted px-3 text-sm text-muted-foreground">
                    +91
                  </span>
                )}
                <Input
                  id="phone"
                  type="tel"
                  className={isIndia ? "rounded-l-none" : undefined}
                  value={form.phone}
                  onChange={(e) => updateField("phone", e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Select value={form.country} onValueChange={(value) => updateField("country", value)}>
                <SelectTrigger id="country"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {COUNTRIES.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">State</Label>
              {isIndia ? (
                <Select value={form.state || undefined} onValueChange={(v) => updateField("state", v)}>
                  <SelectTrigger id="state"><SelectValue placeholder="Select state" /></SelectTrigger>
                  <SelectContent>
                    {INDIAN_STATES.map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input id="state" value={form.state} onChange={(e) => updateField("state", e.target.value)} />
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input id="city" value={form.city} onChange={(e) => updateField("city", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="title">Professional Title</Label>
              <Input id="title" value={form.title} onChange={(e) => updateField("title", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="experience">Experience</Label>
              <Select
                value={form.experience || undefined}
                onValueChange={(value) => updateField("experience", value)}
              >
                <SelectTrigger id="experience">
                  <SelectValue placeholder="Select your experience" />
                </SelectTrigger>
                <SelectContent>
                  {EXPERIENCE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
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
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="education">Education</Label>
              <Input id="education" value={form.education} onChange={(e) => updateField("education", e.target.value)} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea id="bio" rows={3} value={form.bio} onChange={(e) => updateField("bio", e.target.value)} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Skills
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="skills">Skills</Label>
            <TagsInput
              id="skills"
              value={form.skills}
              onChange={(skills) => updateField("skills", skills)}
              placeholder="Type a skill and press Enter"
            />
            <p className="text-xs text-muted-foreground">Press Enter after each skill to add it.</p>
          </div>
        </CardContent>
      </Card>

      <Card>
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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-lg border border-dashed p-6">
              <p className="text-sm text-muted-foreground">PDF, DOC, or DOCX — max 10 MB</p>
              <Button type="button" className="gap-2" disabled={uploading} onClick={() => fileInputRef.current?.click()}>
                {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                Upload CV
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end pt-2">
        <Button type="button" onClick={handleSave} disabled={isSaving} className="min-w-[140px]">
          {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Changes"}
        </Button>
      </div>
    </div>
  );
};

export default CandidateProfile;
