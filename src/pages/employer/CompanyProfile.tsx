import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { markCompanyProfileSaved } from "@/hooks/useEmployerOnboarding";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Building2, Loader2, Upload } from "lucide-react";
import { useMyCompany, useUpdateCompany } from "@/hooks/useData";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import {
  companyToForm,
  getMissingCompanyFields,
  isCompanyProfileComplete,
  type CompanyProfile,
} from "@/lib/companyProfileCompleteness";

const emptyForm = {
  name: "",
  industry: "",
  location: "",
  size: "",
  description: "",
  website: "",
  logo_url: "",
};

const EmployerCompanyProfile = () => {
  const navigate = useNavigate();
  const { data: employerData, isLoading } = useMyCompany();
  const updateCompany = useUpdateCompany();
  const { toast } = useToast();
  const logoInputRef = useRef<HTMLInputElement>(null);
  const lastSyncedAt = useRef<string | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [saving, setSaving] = useState(false);
  const company = employerData?.companies as CompanyProfile | null | undefined;
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (!company?.id) return;
    const syncKey = `${company.id}:${company.updated_at ?? ""}`;
    if (lastSyncedAt.current === syncKey) return;
    lastSyncedAt.current = syncKey;
    setForm(companyToForm(company));
  }, [company]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!company?.id) {
    return (
      <div className="space-y-4 py-12 text-center">
        <p className="text-muted-foreground">No company linked to your account.</p>
        <p className="text-sm text-muted-foreground">Log out and sign up again as a company, or contact support.</p>
      </div>
    );
  }

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingLogo(true);
    try {
      const ext = file.name.split(".").pop() ?? "png";
      const path = `companies/${company.id}/logo.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(path, file, { upsert: true, contentType: file.type });
      if (uploadError) throw uploadError;
      const { data } = supabase.storage.from("avatars").getPublicUrl(path);
      setForm((f) => ({ ...f, logo_url: data.publicUrl }));
      toast({ title: "Logo uploaded", description: "Click Save Changes to apply." });
    } catch (err) {
      toast({
        title: "Upload failed",
        description: err instanceof Error ? err.message : "Try again",
        variant: "destructive",
      });
    } finally {
      setUploadingLogo(false);
      if (logoInputRef.current) logoInputRef.current.value = "";
    }
  };

  const handleSave = async () => {
    if (!company.id) {
      toast({ title: "No company found", variant: "destructive" });
      return;
    }

    const saved: CompanyProfile = {
      name: form.name.trim(),
      industry: form.industry.trim(),
      location: form.location.trim(),
      size: form.size.trim(),
      description: form.description.trim(),
      website: form.website.trim(),
      logo_url: form.logo_url || null,
      status: company.status,
    };

    const wasPending = company.status === "pending";
    const complete = isCompanyProfileComplete(saved);
    const missing = getMissingCompanyFields(saved);

    setSaving(true);
    try {
      const updated = await updateCompany.mutateAsync({
        id: company.id,
        name: saved.name,
        industry: saved.industry || null,
        location: saved.location || null,
        size: saved.size || null,
        description: saved.description || null,
        website: saved.website || null,
        logo_url: saved.logo_url,
        status: wasPending && complete ? "active" : company.status,
      });

      const nextForm = companyToForm(updated as CompanyProfile);
      setForm(nextForm);
      lastSyncedAt.current = `${updated.id}:${updated.updated_at ?? ""}`;

      markCompanyProfileSaved();

      if (complete) {
        toast({ title: "Company profile saved" });
      } else {
        toast({
          title: "Saved",
          description: `Still needed: ${missing.map((m) => m.label).join(", ")}`,
        });
      }

      navigate("/employer/jobs?new=1", { replace: true });
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

  const isSaving = saving || updateCompany.isPending;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Company Profile</h1>
        <p className="text-sm text-muted-foreground">Candidates see this on your job listings</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Company Info
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 rounded-lg">
              {form.logo_url ? (
                <AvatarImage src={form.logo_url} className="object-contain p-1" />
              ) : null}
              <AvatarFallback className="rounded-lg text-lg">
                {(form.name || "CO").slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <input
                ref={logoInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleLogoUpload}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={uploadingLogo}
                onClick={() => logoInputRef.current?.click()}
              >
                {uploadingLogo ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Upload className="h-4 w-4 mr-2" />
                )}
                Upload logo
              </Button>
              <p className="text-xs text-muted-foreground mt-2">PNG or JPG</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="company-name">Company name</Label>
              <Input
                id="company-name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company-industry">Industry</Label>
              <Input
                id="company-industry"
                value={form.industry}
                onChange={(e) => setForm({ ...form, industry: e.target.value })}
                placeholder="e.g. Technology"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company-location">Location</Label>
              <Input
                id="company-location"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                placeholder="e.g. Stockholm, Sweden"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company-size">Company size</Label>
              <Input
                id="company-size"
                value={form.size}
                onChange={(e) => setForm({ ...form, size: e.target.value })}
                placeholder="e.g. 500-1000"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="company-website">Website</Label>
              <Input
                id="company-website"
                value={form.website}
                onChange={(e) => setForm({ ...form, website: e.target.value })}
                placeholder="https://yourcompany.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="company-description">Description</Label>
            <Textarea
              id="company-description"
              rows={4}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="What your company does and why candidates should join..."
            />
          </div>

          <p className="text-sm text-muted-foreground">
            Status:{" "}
            <strong>
              {company.status === "pending"
                ? "Pending — complete profile and save to go live"
                : company.status}
            </strong>
          </p>

          <div className="flex justify-end pt-2">
            <Button
              type="button"
              size="lg"
              className="min-w-[140px] bg-nordic-orange hover:bg-nordic-orange/90 text-white"
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Changes"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmployerCompanyProfile;
