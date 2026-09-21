import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import { useCandidateById } from "@/hooks/useData";
import { useCorrectCandidate } from "@/hooks/useGdpr";
import { useToast } from "@/hooks/use-toast";
import { PageSpinner } from "@/components/ui/PageSpinner";
import { suggestRetentionDate } from "@/lib/gdpr";

export default function AdminCandidateEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: candidate, isLoading } = useCandidateById(id);
  const correct = useCorrectCandidate();

  const profile = candidate?.profiles as {
    full_name: string | null;
    email: string | null;
    phone: string | null;
  } | null;

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    title: "",
    location: "",
    country: "",
    city: "",
    linkedin_url: "",
    education: "",
    field_of_study: "",
    degree_type: "",
    gpa_or_standing: "",
    nordics_motivation: "",
    current_employer: "",
    current_role_title: "",
    bio: "",
    retention_date: "",
  });

  useEffect(() => {
    if (!candidate) return;
    setForm({
      full_name: profile?.full_name ?? candidate.full_name ?? "",
      email: profile?.email ?? "",
      phone: profile?.phone ?? "",
      title: candidate.title ?? "",
      location: candidate.location ?? "",
      country: candidate.country ?? "",
      city: candidate.city ?? "",
      linkedin_url: candidate.linkedin_url ?? "",
      education: candidate.education ?? "",
      field_of_study: candidate.field_of_study ?? "",
      degree_type: candidate.degree_type ?? "",
      gpa_or_standing: candidate.gpa_or_standing ?? "",
      nordics_motivation: candidate.nordics_motivation ?? "",
      current_employer: candidate.current_employer ?? "",
      current_role_title: candidate.current_role_title ?? "",
      bio: candidate.bio ?? "",
      retention_date:
        (candidate as { retention_date?: string | null }).retention_date ??
        suggestRetentionDate(candidate.status),
    });
  }, [candidate, profile]);

  if (isLoading) return <PageSpinner />;
  if (!candidate) return <p className="text-muted-foreground">Candidate not found.</p>;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await correct.mutateAsync({
        candidateId: candidate.id,
        profile: {
          full_name: form.full_name,
          email: form.email,
          phone: form.phone,
        },
        candidate: {
          full_name: form.full_name,
          title: form.title,
          location: form.location,
          country: form.country,
          city: form.city,
          linkedin_url: form.linkedin_url,
          education: form.education,
          field_of_study: form.field_of_study,
          degree_type: form.degree_type,
          gpa_or_standing: form.gpa_or_standing,
          nordics_motivation: form.nordics_motivation,
          current_employer: form.current_employer,
          current_role_title: form.current_role_title,
          bio: form.bio,
          retention_date: form.retention_date,
        },
      });
      toast({ title: "Candidate details updated" });
      navigate(`/admin/candidates/${candidate.id}`);
    } catch (err) {
      toast({
        title: "Update failed",
        description: err instanceof Error ? err.message : "Try again",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to={`/admin/candidates/${candidate.id}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Correct candidate details</h1>
          <p className="text-muted-foreground text-sm">GDPR data correction: admin only</p>
        </div>
      </div>

      <form onSubmit={onSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Contact</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="full_name">Full name</Label>
              <Input id="full_name" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Profile</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input id="location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Input id="country" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input id="city" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="linkedin_url">LinkedIn URL</Label>
              <Input id="linkedin_url" value={form.linkedin_url} onChange={(e) => setForm({ ...form, linkedin_url: e.target.value })} />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea id="bio" rows={3} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Education & employment</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="education">Education</Label>
              <Input id="education" value={form.education} onChange={(e) => setForm({ ...form, education: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="field_of_study">Field of study</Label>
              <Input id="field_of_study" value={form.field_of_study} onChange={(e) => setForm({ ...form, field_of_study: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="degree_type">Degree type</Label>
              <Input id="degree_type" value={form.degree_type} onChange={(e) => setForm({ ...form, degree_type: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gpa_or_standing">GPA / standing</Label>
              <Input id="gpa_or_standing" value={form.gpa_or_standing} onChange={(e) => setForm({ ...form, gpa_or_standing: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="current_employer">Current employer</Label>
              <Input id="current_employer" value={form.current_employer} onChange={(e) => setForm({ ...form, current_employer: e.target.value })} />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="nordics_motivation">Nordics motivation</Label>
              <Textarea id="nordics_motivation" rows={3} value={form.nordics_motivation} onChange={(e) => setForm({ ...form, nordics_motivation: e.target.value })} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Data retention</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-w-xs">
              <Label htmlFor="retention_date">Retention date</Label>
              <Input
                id="retention_date"
                type="date"
                value={form.retention_date}
                onChange={(e) => setForm({ ...form, retention_date: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                Suggested from status ({candidate.status}). Editable by admin.
              </p>
            </div>
          </CardContent>
        </Card>

        <Button type="submit" disabled={correct.isPending}>
          {correct.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
          Save corrections
        </Button>
      </form>
    </div>
  );
}
