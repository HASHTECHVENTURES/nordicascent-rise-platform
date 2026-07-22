import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Settings, Palette, Save, Loader2, Trash2, FileText } from "lucide-react";
import { usePlatformSettings, useUpdatePlatformSettings, useClearPlatformData, type PlatformSettingsData } from "@/hooks/useData";
import { useActivationCms, useUpdateActivationCms } from "@/hooks/useActivation";
import { DEFAULT_ACTIVATION_CMS, type ActivationCms } from "@/lib/activationModule";
import { useRelocationCms, useUpdateRelocationCms } from "@/hooks/useRelocation";
import { DEFAULT_RELOCATION_CMS, type RelocationCms } from "@/lib/relocationModule";
import { useOnboardingCms, useUpdateOnboardingCms } from "@/hooks/useModuleOnboarding";
import { DEFAULT_ONBOARDING_CMS, type OnboardingCms } from "@/lib/onboardingModule";
import { useFollowupCms, useUpdateFollowupCms } from "@/hooks/useFollowup";
import {
  DEFAULT_FOLLOWUP_QUESTIONNAIRE_CMS,
  DEFAULT_FOLLOWUP_TOPICS_CMS,
  type FollowupQuestionnaireCms,
  type FollowupTopicsCms,
} from "@/lib/followupModule";
import { useReadinessCms, useUpdateReadinessCms } from "@/hooks/useReadiness";
import { DEFAULT_READINESS_CMS, type ReadinessCms } from "@/lib/readiness";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const AdminSettings = () => {
  const { data: settings, isLoading } = usePlatformSettings();
  const updateSettings = useUpdatePlatformSettings();
  const clearPlatformData = useClearPlatformData();
  const { data: activationCms, isLoading: cmsLoading } = useActivationCms();
  const updateCms = useUpdateActivationCms();
  const { data: relocationCms, isLoading: relocCmsLoading } = useRelocationCms();
  const updateRelocCms = useUpdateRelocationCms();
  const { data: onboardingCms, isLoading: onboardCmsLoading } = useOnboardingCms();
  const updateOnboardCms = useUpdateOnboardingCms();
  const { data: followupCms, isLoading: followupCmsLoading } = useFollowupCms();
  const updateFollowupCmsMut = useUpdateFollowupCms();
  const { data: readinessCms, isLoading: readinessCmsLoading } = useReadinessCms();
  const updateReadinessCmsMut = useUpdateReadinessCms();
  const { toast } = useToast();
  const [form, setForm] = useState<PlatformSettingsData | null>(null);
  const [cmsForm, setCmsForm] = useState<ActivationCms | null>(null);
  const [relocCmsForm, setRelocCmsForm] = useState<RelocationCms | null>(null);
  const [onboardCmsForm, setOnboardCmsForm] = useState<OnboardingCms | null>(null);
  const [followupTopicsForm, setFollowupTopicsForm] = useState<FollowupTopicsCms | null>(null);
  const [followupQForm, setFollowupQForm] = useState<FollowupQuestionnaireCms | null>(null);
  const [readinessCmsForm, setReadinessCmsForm] = useState<ReadinessCms | null>(null);

  useEffect(() => {
    if (settings) setForm(settings);
  }, [settings]);

  useEffect(() => {
    if (activationCms) setCmsForm(activationCms);
  }, [activationCms]);

  useEffect(() => {
    if (relocationCms) setRelocCmsForm(relocationCms);
  }, [relocationCms]);

  useEffect(() => {
    if (onboardingCms) setOnboardCmsForm(onboardingCms);
  }, [onboardingCms]);

  useEffect(() => {
    if (followupCms) {
      setFollowupTopicsForm(followupCms.topics);
      setFollowupQForm(followupCms.questionnaires);
    }
  }, [followupCms]);

  useEffect(() => {
    if (readinessCms) setReadinessCmsForm(readinessCms);
  }, [readinessCms]);

  const handleSave = async () => {
    if (!form) return;
    try {
      await updateSettings.mutateAsync(form);
      toast({ title: "Settings saved" });
    } catch (err) {
      toast({
        title: "Save failed",
        description: err instanceof Error ? err.message : "Try again",
        variant: "destructive",
      });
    }
  };

  const handleSaveCms = async () => {
    if (!cmsForm) return;
    try {
      await updateCms.mutateAsync(cmsForm);
      toast({ title: "Activation CMS saved" });
    } catch (err) {
      toast({
        title: "CMS save failed",
        description: err instanceof Error ? err.message : "Try again",
        variant: "destructive",
      });
    }
  };

  const handleSaveRelocCms = async () => {
    if (!relocCmsForm) return;
    try {
      await updateRelocCms.mutateAsync(relocCmsForm);
      toast({ title: "Relocation CMS saved" });
    } catch (err) {
      toast({
        title: "CMS save failed",
        description: err instanceof Error ? err.message : "Try again",
        variant: "destructive",
      });
    }
  };

  const handleSaveOnboardCms = async () => {
    if (!onboardCmsForm) return;
    try {
      await updateOnboardCms.mutateAsync(onboardCmsForm);
      toast({ title: "Onboarding CMS saved" });
    } catch (err) {
      toast({
        title: "CMS save failed",
        description: err instanceof Error ? err.message : "Try again",
        variant: "destructive",
      });
    }
  };

  const handleSaveFollowupCms = async () => {
    if (!followupTopicsForm || !followupQForm) return;
    try {
      await updateFollowupCmsMut.mutateAsync({
        topics: followupTopicsForm,
        questionnaires: followupQForm,
      });
      toast({ title: "Follow-up CMS saved" });
    } catch (err) {
      toast({
        title: "CMS save failed",
        description: err instanceof Error ? err.message : "Try again",
        variant: "destructive",
      });
    }
  };

  const handleSaveReadinessCms = async () => {
    if (!readinessCmsForm) return;
    try {
      await updateReadinessCmsMut.mutateAsync(readinessCmsForm);
      toast({ title: "Readiness CMS saved" });
    } catch (err) {
      toast({
        title: "CMS save failed",
        description: err instanceof Error ? err.message : "Try again",
        variant: "destructive",
      });
    }
  };

  if (
    isLoading ||
    cmsLoading ||
    relocCmsLoading ||
    onboardCmsLoading ||
    followupCmsLoading ||
    readinessCmsLoading ||
    !form ||
    !cmsForm ||
    !relocCmsForm ||
    !onboardCmsForm ||
    !followupTopicsForm ||
    !followupQForm ||
    !readinessCmsForm
  ) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Platform Settings</h1>
        <p className="text-muted-foreground">Configure platform-wide settings stored in Supabase</p>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="branding">Branding</TabsTrigger>
          <TabsTrigger value="activation">Activation CMS</TabsTrigger>
          <TabsTrigger value="relocation">Relocation CMS</TabsTrigger>
          <TabsTrigger value="onboarding">Onboarding CMS</TabsTrigger>
          <TabsTrigger value="followup">Follow-up CMS</TabsTrigger>
          <TabsTrigger value="readiness">Readiness CMS</TabsTrigger>
          <TabsTrigger value="data">Data</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                General Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Platform Name</Label>
                  <Input
                    value={form.platformName}
                    onChange={(e) => setForm({ ...form, platformName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Support Email</Label>
                  <Input
                    type="email"
                    value={form.supportEmail}
                    onChange={(e) => setForm({ ...form, supportEmail: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Default Language</Label>
                  <Select value={form.defaultLanguage} onValueChange={(v) => setForm({ ...form, defaultLanguage: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="sv">Swedish</SelectItem>
                      <SelectItem value="no">Norwegian</SelectItem>
                      <SelectItem value="da">Danish</SelectItem>
                      <SelectItem value="fi">Finnish</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Timezone</Label>
                  <Select value={form.timezone} onValueChange={(v) => setForm({ ...form, timezone: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cet">Central European Time (CET)</SelectItem>
                      <SelectItem value="eet">Eastern European Time (EET)</SelectItem>
                      <SelectItem value="utc">UTC</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-medium">Feature Toggles</h3>
                {[
                  { key: "candidateRegistration" as const, label: "Candidate Registration", desc: "Allow new candidates to register" },
                  { key: "employerRegistration" as const, label: "Employer Registration", desc: "Allow new employers to register" },
                  { key: "maintenanceMode" as const, label: "Maintenance Mode", desc: "Show maintenance page to all users" },
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">{item.label}</p>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                    </div>
                    <Switch
                      checked={form[item.key]}
                      onCheckedChange={(checked) => setForm({ ...form, [item.key]: checked })}
                    />
                  </div>
                ))}
              </div>

              <Button onClick={handleSave} disabled={updateSettings.isPending}>
                {updateSettings.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                Save Changes
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="branding">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5" />
                Branding Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Primary Color</Label>
                  <div className="flex gap-2">
                    <Input
                      value={form.primaryColor}
                      onChange={(e) => setForm({ ...form, primaryColor: e.target.value })}
                    />
                    <div className="w-10 h-10 rounded-lg border" style={{ backgroundColor: form.primaryColor }} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Secondary Color</Label>
                  <div className="flex gap-2">
                    <Input
                      value={form.secondaryColor}
                      onChange={(e) => setForm({ ...form, secondaryColor: e.target.value })}
                    />
                    <div className="w-10 h-10 rounded-lg border" style={{ backgroundColor: form.secondaryColor }} />
                  </div>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">Logo uploads use static assets in the app bundle for now.</p>
              <Button onClick={handleSave} disabled={updateSettings.isPending}>
                <Save className="w-4 h-4 mr-2" />
                Save Branding
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activation">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Module 4 — Activation CMS
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Editable without a deploy. Use {"{companyName}"}, {"{jobTitle}"}, {"{visitDate}"},{" "}
                {"{visitFormat}"}, {"{notes}"} where applicable.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {(
                [
                  ["pre_internship_presentation", "Pre-internship presentation"],
                  ["visit_confirmed", "Visit confirmed (candidate)"],
                  ["clearance_screen_note", "Final Clearance screen note"],
                  ["clearance_cleared", "Candidate — cleared"],
                  ["clearance_hold", "Candidate — hold"],
                  ["clearance_company_cleared", "Company — cleared confirmation"],
                  ["clearance_company_hold", "Company — hold confirmation"],
                ] as const
              ).map(([key, label]) => (
                <div key={key} className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <Label htmlFor={key}>{label}</Label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-xs"
                      onClick={() =>
                        setCmsForm({ ...cmsForm, [key]: DEFAULT_ACTIVATION_CMS[key] })
                      }
                    >
                      Reset default
                    </Button>
                  </div>
                  <Textarea
                    id={key}
                    rows={key === "pre_internship_presentation" ? 5 : 3}
                    value={cmsForm[key]}
                    onChange={(e) => setCmsForm({ ...cmsForm, [key]: e.target.value })}
                  />
                </div>
              ))}
              <Button onClick={handleSaveCms} disabled={updateCms.isPending}>
                {updateCms.isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                Save Activation CMS
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="relocation">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Module 5 — Relocation CMS
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Candidate-facing copy per coordination step. Editable without a deploy.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {(
                [
                  ["step_1", "Step 1 — Contract signed"],
                  ["step_2", "Step 2 — Visa / immigration"],
                  ["step_3", "Step 3 — Norwegian A1"],
                  ["step_4", "Step 4 — Pre-arrival preparation"],
                  ["step_5", "Step 5 — Housing"],
                  ["step_6", "Step 6 — Admin setup"],
                  ["step_7", "Step 7 — Family support"],
                  ["step_8", "Step 8 — Buddy (INDONORD)"],
                  ["step_9", "Step 9 — Final prep + toolkit"],
                  ["step_10", "Step 10 — Arrival confirmed"],
                ] as const
              ).map(([key, label]) => (
                <div key={key} className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <Label htmlFor={`reloc-${key}`}>{label}</Label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-xs"
                      onClick={() =>
                        setRelocCmsForm({ ...relocCmsForm, [key]: DEFAULT_RELOCATION_CMS[key] })
                      }
                    >
                      Reset default
                    </Button>
                  </div>
                  <Textarea
                    id={`reloc-${key}`}
                    rows={2}
                    value={relocCmsForm[key]}
                    onChange={(e) =>
                      setRelocCmsForm({ ...relocCmsForm, [key]: e.target.value })
                    }
                  />
                </div>
              ))}
              <Button onClick={handleSaveRelocCms} disabled={updateRelocCms.isPending}>
                {updateRelocCms.isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                Save Relocation CMS
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="onboarding">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Module 6 — Onboarding CMS
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Candidate-facing step copy and contact directory. Editable without a deploy.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {(
                [
                  ["step_1", "Step 1 — Arrival"],
                  ["step_2", "Step 2 — Airport pickup"],
                  ["step_3", "Step 3 — Housing move-in"],
                  ["step_4", "Step 4 — Administrative completion"],
                  ["step_5", "Step 5 — Practical checklist"],
                  ["step_6", "Step 6 — Workplace onboarding"],
                  ["step_7", "Step 7 — Buddy connection"],
                  ["step_8", "Step 8 — Cultural adjustment"],
                  ["step_9", "Step 9 — Completion"],
                  ["contact_directory", "Contact directory"],
                ] as const
              ).map(([key, label]) => (
                <div key={key} className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <Label htmlFor={`onboard-${key}`}>{label}</Label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-xs"
                      onClick={() =>
                        setOnboardCmsForm({
                          ...onboardCmsForm,
                          [key]: DEFAULT_ONBOARDING_CMS[key],
                        })
                      }
                    >
                      Reset default
                    </Button>
                  </div>
                  <Textarea
                    id={`onboard-${key}`}
                    rows={key === "contact_directory" ? 6 : 2}
                    value={onboardCmsForm[key]}
                    onChange={(e) =>
                      setOnboardCmsForm({ ...onboardCmsForm, [key]: e.target.value })
                    }
                  />
                </div>
              ))}
              <Button onClick={handleSaveOnboardCms} disabled={updateOnboardCms.isPending}>
                {updateOnboardCms.isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                Save Onboarding CMS
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="followup">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Follow-up CMS
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Standing meeting topics (one line per prompt) and questionnaire question sets.
                Editable without a deploy.
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <p className="text-sm font-medium">Standing topics</p>
                {(
                  [
                    ["m1_candidate", "1 mo — Candidate"],
                    ["m1_company", "1 mo — Company"],
                    ["m2_candidate", "2 mo — Candidate"],
                    ["m2_company", "2 mo — Company"],
                    ["m3_candidate", "3 mo — Candidate"],
                    ["m3_company", "3 mo — Company"],
                    ["m3_confidential", "3 mo — Confidential prompt"],
                    ["m6_candidate", "6 mo — Candidate"],
                    ["m6_company", "6 mo — Company"],
                    ["m6_confidential", "6 mo — Confidential prompt"],
                  ] as const
                ).map(([key, label]) => (
                  <div key={key} className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <Label htmlFor={`fu-${key}`}>{label}</Label>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-xs"
                        onClick={() =>
                          setFollowupTopicsForm({
                            ...followupTopicsForm,
                            [key]: DEFAULT_FOLLOWUP_TOPICS_CMS[key],
                          })
                        }
                      >
                        Reset default
                      </Button>
                    </div>
                    <Textarea
                      id={`fu-${key}`}
                      rows={key.includes("confidential") ? 2 : 4}
                      value={followupTopicsForm[key]}
                      onChange={(e) =>
                        setFollowupTopicsForm({
                          ...followupTopicsForm,
                          [key]: e.target.value,
                        })
                      }
                    />
                  </div>
                ))}
              </div>

              <div className="space-y-4 border-t pt-4">
                <p className="text-sm font-medium">Questionnaire sets (JSON)</p>
                <p className="text-xs text-muted-foreground">
                  Structured Likert + open questions with readiness_dimension tags. Edit carefully.
                </p>
                {(
                  [
                    ["candidate_3", "Candidate 3-month"],
                    ["company_3", "Company 3-month"],
                    ["candidate_6", "Candidate 6-month"],
                    ["company_6", "Company 6-month"],
                  ] as const
                ).map(([key, label]) => (
                  <div key={key} className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <Label htmlFor={`fuq-${key}`}>{label}</Label>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-xs"
                        onClick={() =>
                          setFollowupQForm({
                            ...followupQForm,
                            [key]: DEFAULT_FOLLOWUP_QUESTIONNAIRE_CMS[key],
                          })
                        }
                      >
                        Reset default
                      </Button>
                    </div>
                    <Textarea
                      id={`fuq-${key}`}
                      rows={8}
                      className="font-mono text-xs"
                      value={JSON.stringify(followupQForm[key], null, 2)}
                      onChange={(e) => {
                        try {
                          const parsed = JSON.parse(e.target.value);
                          setFollowupQForm({ ...followupQForm, [key]: parsed });
                        } catch {
                          /* keep typing invalid JSON until blur/save */
                        }
                      }}
                    />
                  </div>
                ))}
              </div>

              <Button
                onClick={handleSaveFollowupCms}
                disabled={updateFollowupCmsMut.isPending}
              >
                {updateFollowupCmsMut.isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                Save Follow-up CMS
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="readiness">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Readiness CMS
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Candidate intro copy shown before readiness tests. Edit test questions under{" "}
                <span className="font-medium text-foreground">Readiness → Content</span>.
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {(
                [
                  ["pre_test_note", "Pre-test note"],
                  ["timer_soft_note", "No time-limit note"],
                  ["timer_hard_note", "Hard time-limit note"],
                ] as const
              ).map(([key, label]) => (
                <div key={key} className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <Label htmlFor={`rd-${key}`}>{label}</Label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-xs"
                      onClick={() =>
                        setReadinessCmsForm({
                          ...readinessCmsForm,
                          [key]: DEFAULT_READINESS_CMS[key],
                        })
                      }
                    >
                      Reset default
                    </Button>
                  </div>
                  <Textarea
                    id={`rd-${key}`}
                    rows={key === "pre_test_note" ? 12 : 3}
                    value={readinessCmsForm[key]}
                    onChange={(e) =>
                      setReadinessCmsForm({
                        ...readinessCmsForm,
                        [key]: e.target.value,
                      })
                    }
                  />
                </div>
              ))}
              <Button
                onClick={handleSaveReadinessCms}
                disabled={updateReadinessCmsMut.isPending}
              >
                {updateReadinessCmsMut.isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                Save Readiness CMS
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="data">
          <Card className="border-destructive/40">
            <CardHeader>
              <CardTitle className="text-destructive">Clear platform data</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Removes all test candidates, companies, jobs, messages, program tasks, and non-admin users.
                Your admin account is kept. This cannot be undone.
              </p>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="gap-2" disabled={clearPlatformData.isPending}>
                    <Trash2 className="h-4 w-4" />
                    Clear all platform data
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Clear all platform data?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This deletes every candidate, company, job, message, and test user except your admin login.
                      Run migration 030 in Supabase first if the button fails.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      onClick={async (e) => {
                        e.preventDefault();
                        try {
                          await clearPlatformData.mutateAsync();
                          toast({ title: "Platform data cleared" });
                        } catch (err) {
                          toast({
                            title: "Clear failed",
                            description: err instanceof Error ? err.message : "Try again",
                            variant: "destructive",
                          });
                        }
                      }}
                    >
                      Yes, clear everything
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminSettings;
