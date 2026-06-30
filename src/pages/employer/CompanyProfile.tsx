import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { markCompanyProfileSaved } from "@/hooks/useEmployerOnboarding";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Building2, Loader2, Upload, User, HelpCircle } from "lucide-react";
import { useMyCompany, useUpdateCompany, useUpdateEmployerContact } from "@/hooks/useData";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import {
  companyToForm,
  getMissingCompanyFields,
  isCompanyProfileComplete,
  type CompanyProfile,
} from "@/lib/companyProfileCompleteness";
import {
  COMPANY_COUNTRIES,
  COMPANY_DESCRIPTION_MAX_WORDS,
  countCompanyDescriptionWords,
  HEARD_ABOUT_OPTIONS,
  lookupPostalLocation,
  normalizeContactPhone,
  parseContactPhone,
  PHONE_COUNTRY_OPTIONS,
  PHONE_PREFIX_BY_COUNTRY,
  WORKPLACE_LANGUAGE_OPTIONS,
} from "@/lib/companyRegistration";

type CompanyForm = ReturnType<typeof companyToForm>;

const emptyForm: CompanyForm = {
  ...companyToForm({
    name: "",
    industry: null,
    location: null,
    size: null,
    description: null,
    website: null,
    logo_url: null,
  }),
};

function SectionHeading({
  step,
  title,
  icon: Icon,
}: {
  step: number;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <CardTitle className="flex items-center gap-2 text-lg">
      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
        {step}
      </span>
      <Icon className="h-5 w-5 text-muted-foreground" />
      {title}
    </CardTitle>
  );
}

const selectContentProps = {
  position: "popper" as const,
  className: "z-[200]",
};

const EmployerCompanyProfile = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { data: employerData, isLoading } = useMyCompany();
  const updateCompany = useUpdateCompany();
  const updateEmployerContact = useUpdateEmployerContact();
  const { toast } = useToast();
  const logoInputRef = useRef<HTMLInputElement>(null);
  const lastSyncedAt = useRef<string | null>(null);
  const postalLookupRef = useRef<number>(0);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [saving, setSaving] = useState(false);
  const [lookingUpPostal, setLookingUpPostal] = useState(false);
  const company = employerData?.companies as CompanyProfile | null | undefined;
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (!company?.id) return;
    const syncKey = `${company.id}:${company.updated_at ?? ""}`;
    if (lastSyncedAt.current === syncKey) return;
    lastSyncedAt.current = syncKey;

    const nextForm = companyToForm(company);
    if (!nextForm.contact_name && profile?.full_name) {
      nextForm.contact_name = profile.full_name;
    }
    if (!nextForm.contact_email && profile?.email) {
      nextForm.contact_email = profile.email;
    }
    if (!nextForm.contact_phone && profile?.phone) {
      const parsed = parseContactPhone(profile.phone);
      nextForm.contact_phone_country = parsed.country;
      nextForm.contact_phone = parsed.local;
    }
    if (!nextForm.contact_role && employerData?.title) {
      nextForm.contact_role = employerData.title;
    }
    setForm(nextForm);
  }, [company, profile, employerData?.title]);

  useEffect(() => {
    const postal = form.postal_code.trim();
    if (postal.length < 3) return;

    const timer = window.setTimeout(async () => {
      const lookupId = ++postalLookupRef.current;
      setLookingUpPostal(true);
      const location = await lookupPostalLocation(form.country, postal);
      if (lookupId !== postalLookupRef.current) return;
      setLookingUpPostal(false);
      if (location) {
        setForm((f) => ({ ...f, location }));
      }
    }, 500);

    return () => window.clearTimeout(timer);
  }, [form.country, form.postal_code]);

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

  const phonePrefix = PHONE_PREFIX_BY_COUNTRY[form.contact_phone_country] ?? "+";
  const showHiringChallenge = form.hired_international_before === "yes";

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
      toast({ title: "Logo uploaded", description: "Click Save to apply." });
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

    if (countCompanyDescriptionWords(form.description) > COMPANY_DESCRIPTION_MAX_WORDS) {
      toast({
        title: "Description too long",
        description: `Company description must be ${COMPANY_DESCRIPTION_MAX_WORDS} words or fewer.`,
        variant: "destructive",
      });
      return;
    }

    const contactPhone = normalizeContactPhone(form.contact_phone_country, form.contact_phone);

    const saved: CompanyProfile = {
      name: form.name.trim(),
      industry: form.industry.trim(),
      location: form.location.trim(),
      size: form.size.trim(),
      description: form.description.trim(),
      website: form.website.trim(),
      logo_url: form.logo_url || null,
      status: company.status,
      country: form.country.trim(),
      org_number: form.org_number.trim(),
      postal_code: form.postal_code.trim(),
      contact_name: form.contact_name.trim(),
      contact_role: form.contact_role.trim(),
      contact_email: form.contact_email.trim(),
      contact_phone: contactPhone,
      hired_international_before:
        form.hired_international_before === "yes"
          ? true
          : form.hired_international_before === "no"
            ? false
            : null,
      international_hiring_challenge: form.international_hiring_challenge.trim() || null,
      workplace_language: form.workplace_language.trim() || null,
      relocation_support: form.relocation_support.trim(),
      heard_about: form.heard_about.trim(),
      registration_notes: form.registration_notes.trim() || null,
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
        country: saved.country || null,
        org_number: saved.org_number || null,
        postal_code: saved.postal_code || null,
        contact_name: saved.contact_name || null,
        contact_role: saved.contact_role || null,
        contact_email: saved.contact_email || null,
        contact_phone: saved.contact_phone || null,
        hired_international_before: saved.hired_international_before,
        international_hiring_challenge: saved.international_hiring_challenge,
        workplace_language: saved.workplace_language,
        relocation_support: saved.relocation_support || null,
        heard_about: saved.heard_about || null,
        registration_notes: saved.registration_notes,
        status: wasPending && complete ? "active" : company.status,
      });

      if (employerData?.id) {
        await updateEmployerContact.mutateAsync({
          employerId: employerData.id,
          contact_name: saved.contact_name ?? "",
          contact_role: saved.contact_role ?? "",
          contact_email: saved.contact_email ?? "",
          contact_phone: saved.contact_phone ?? "",
        });
      }

      const nextForm = companyToForm(updated as CompanyProfile);
      setForm(nextForm);
      lastSyncedAt.current = `${updated.id}:${updated.updated_at ?? ""}`;

      markCompanyProfileSaved();

      if (complete) {
        toast({
          title: "Company profile saved",
          description: "Next, create your first job posting.",
        });
        navigate("/employer/jobs?new=1", { replace: true });
      } else {
        toast({
          title: "Saved",
          description: `Still needed: ${missing.map((m) => m.label).join(", ")}`,
        });
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

  const isSaving = saving || updateCompany.isPending || updateEmployerContact.isPending;

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Company Registration</h1>
        <p className="text-sm text-muted-foreground">
          Tell us about your company and contact person. You&apos;ll create job postings on the next step.
        </p>
      </div>

      <Card>
        <CardHeader>
          <SectionHeading step={1} title="Company information" icon={Building2} />
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
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="company-name">Company name</Label>
              <Input
                id="company-name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company-country">Country</Label>
              <Select value={form.country} onValueChange={(value) => setForm({ ...form, country: value })}>
                <SelectTrigger id="company-country">
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent {...selectContentProps}>
                  {COMPANY_COUNTRIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="company-org-number">Org number</Label>
              <Input
                id="company-org-number"
                value={form.org_number}
                onChange={(e) => setForm({ ...form, org_number: e.target.value })}
                placeholder="e.g. 123 456 789"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company-postal">Post number</Label>
              <div className="relative">
                <Input
                  id="company-postal"
                  value={form.postal_code}
                  onChange={(e) => setForm({ ...form, postal_code: e.target.value })}
                  placeholder="e.g. 0150"
                />
                {lookingUpPostal && (
                  <Loader2 className="absolute right-3 top-2.5 h-4 w-4 animate-spin text-muted-foreground" />
                )}
              </div>
              <p className="text-xs text-muted-foreground">Autofills location when recognized</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="company-location">Location</Label>
              <Input
                id="company-location"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                placeholder="City, region"
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
              <Label htmlFor="company-size">Company size</Label>
              <Input
                id="company-size"
                value={form.size}
                onChange={(e) => setForm({ ...form, size: e.target.value })}
                placeholder="e.g. 50–200"
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
            <Label htmlFor="company-description">Description (max {COMPANY_DESCRIPTION_MAX_WORDS} words, shown on job postings)</Label>
            <Textarea
              id="company-description"
              rows={4}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="What your company does and why candidates should join..."
            />
            <p className={`text-xs ${countCompanyDescriptionWords(form.description) > COMPANY_DESCRIPTION_MAX_WORDS ? "text-destructive" : "text-muted-foreground"}`}>
              {countCompanyDescriptionWords(form.description)} / {COMPANY_DESCRIPTION_MAX_WORDS} words
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <SectionHeading step={2} title="Contact person" icon={User} />
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="contact-name">Name</Label>
            <Input
              id="contact-name"
              value={form.contact_name}
              onChange={(e) => setForm({ ...form, contact_name: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="contact-role">Role / title</Label>
            <Input
              id="contact-role"
              value={form.contact_role}
              onChange={(e) => setForm({ ...form, contact_role: e.target.value })}
              placeholder="e.g. HR Manager"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="contact-email">Email</Label>
            <Input
              id="contact-email"
              type="email"
              value={form.contact_email}
              onChange={(e) => setForm({ ...form, contact_email: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="contact-phone">Phone number</Label>
            <div className="flex">
              <Select
                value={form.contact_phone_country}
                onValueChange={(value) => setForm({ ...form, contact_phone_country: value })}
              >
                <SelectTrigger className="w-[130px] rounded-r-none border-r-0 shrink-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent {...selectContentProps}>
                  {PHONE_COUNTRY_OPTIONS.map((o) => (
                    <SelectItem key={o.country} value={o.country}>
                      {o.prefix ? `${o.prefix} ${o.country}` : o.country}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                id="contact-phone"
                type="tel"
                className="rounded-l-none"
                value={form.contact_phone}
                onChange={(e) => setForm({ ...form, contact_phone: e.target.value })}
                placeholder={phonePrefix === "+" ? "+XX ..." : "Phone number"}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <SectionHeading step={3} title="Other questions" icon={HelpCircle} />
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <Label>Has the company hired international engineers before?</Label>
            <RadioGroup
              value={form.hired_international_before}
              onValueChange={(value) => setForm({ ...form, hired_international_before: value })}
              className="flex gap-6"
            >
              <div className="flex items-center gap-2">
                <RadioGroupItem value="yes" id="hired-yes" />
                <Label htmlFor="hired-yes" className="font-normal cursor-pointer">
                  Yes
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="no" id="hired-no" />
                <Label htmlFor="hired-no" className="font-normal cursor-pointer">
                  No
                </Label>
              </div>
            </RadioGroup>
          </div>

          {showHiringChallenge && (
            <div className="space-y-2">
              <Label htmlFor="hiring-challenge">What was the main challenge?</Label>
              <Textarea
                id="hiring-challenge"
                rows={3}
                value={form.international_hiring_challenge}
                onChange={(e) => setForm({ ...form, international_hiring_challenge: e.target.value })}
                placeholder="e.g. relocation, language, work permits..."
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="workplace-language">Workplace language — how much Norwegian is needed day-to-day?</Label>
            <Select
              value={form.workplace_language || undefined}
              onValueChange={(value) => setForm({ ...form, workplace_language: value })}
            >
              <SelectTrigger id="workplace-language">
                <SelectValue placeholder="Select level" />
              </SelectTrigger>
              <SelectContent {...selectContentProps}>
                {WORKPLACE_LANGUAGE_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="relocation-support">Relocation support the company can offer</Label>
            <Textarea
              id="relocation-support"
              rows={3}
              value={form.relocation_support}
              onChange={(e) => setForm({ ...form, relocation_support: e.target.value })}
              placeholder="Housing assistance, visa support, language courses..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="heard-about">How did you hear about Nordic Ascent?</Label>
            <Select
              value={form.heard_about || undefined}
              onValueChange={(value) => setForm({ ...form, heard_about: value })}
            >
              <SelectTrigger id="heard-about">
                <SelectValue placeholder="Select one" />
              </SelectTrigger>
              <SelectContent {...selectContentProps}>
                {HEARD_ABOUT_OPTIONS.map((o) => (
                  <SelectItem key={o} value={o}>
                    {o}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="registration-notes">Anything else we should know?</Label>
            <Textarea
              id="registration-notes"
              rows={3}
              value={form.registration_notes}
              onChange={(e) => setForm({ ...form, registration_notes: e.target.value })}
              placeholder="Optional"
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between gap-4 pb-8">
        <p className="text-sm text-muted-foreground">
          Status:{" "}
          <strong>
            {company.status === "pending"
              ? "Pending — complete profile and save to continue to job posting"
              : company.status}
          </strong>
        </p>
        <Button
          type="button"
          size="lg"
          className="min-w-[140px] bg-nordic-orange hover:bg-nordic-orange/90 text-white"
          onClick={handleSave}
          disabled={isSaving}
        >
          {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save & continue"}
        </Button>
      </div>
    </div>
  );
};

export default EmployerCompanyProfile;
