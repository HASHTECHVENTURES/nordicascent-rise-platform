import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { GraduationCap, Loader2, Plus } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import {
  useAdminUniversities,
  useAdminUniversityWaitlist,
  useApproveUniversityWaitlist,
  useRejectUniversityWaitlist,
  useSaveUniversity,
  useToggleUniversityAccessible,
} from "@/hooks/useData";
import { useToast } from "@/hooks/use-toast";
import { INSTITUTION_TYPE_LABELS, type InstitutionType } from "@/lib/universities";

export default function AdminUniversities() {
  const { toast } = useToast();
  const { data: universities, isLoading } = useAdminUniversities();
  const { data: waitlist, isLoading: waitlistLoading } = useAdminUniversityWaitlist();
  const saveUniversity = useSaveUniversity();
  const toggleAccessible = useToggleUniversityAccessible();
  const approveWaitlist = useApproveUniversityWaitlist();
  const rejectWaitlist = useRejectUniversityWaitlist();

  const [form, setForm] = useState({
    name: "",
    institution_type: "university" as InstitutionType,
    country: "India",
    is_accessible: true,
  });

  const list = universities ?? [];
  const pendingWaitlist = (waitlist ?? []).filter((w) => w.status === "pending");

  const handleAddUniversity = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await saveUniversity.mutateAsync(form);
      toast({ title: "University added" });
      setForm({ name: "", institution_type: "university", country: "India", is_accessible: true });
    } catch (err) {
      toast({
        title: "Failed",
        description: err instanceof Error ? err.message : "Try again",
        variant: "destructive",
      });
    }
  };

  if (isLoading || waitlistLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-medium">Universities</h1>

      <Tabs defaultValue="directory">
        <TabsList>
          <TabsTrigger value="directory">Directory ({list.length})</TabsTrigger>
          <TabsTrigger value="waitlist">
            Waitlist
            {pendingWaitlist.length > 0 && (
              <Badge className="ml-2" variant="secondary">
                {pendingWaitlist.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="directory" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add university manually
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddUniversity} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 md:col-span-2">
                  <Label>Name</Label>
                  <Input
                    required
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    placeholder="University of Mumbai"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select
                    value={form.institution_type}
                    onValueChange={(v) => setForm((f) => ({ ...f, institution_type: v as InstitutionType }))}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="university">{INSTITUTION_TYPE_LABELS.university}</SelectItem>
                      <SelectItem value="institute">{INSTITUTION_TYPE_LABELS.institute}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Country</Label>
                  <Input
                    value={form.country}
                    onChange={(e) => setForm((f) => ({ ...f, country: e.target.value }))}
                  />
                </div>
                <div className="flex items-center gap-2 md:col-span-2">
                  <Switch
                    checked={form.is_accessible}
                    onCheckedChange={(checked) => setForm((f) => ({ ...f, is_accessible: checked }))}
                  />
                  <Label>Accessible to candidates immediately</Label>
                </div>
                <Button type="submit" disabled={saveUniversity.isPending} className="md:col-span-2 w-fit">
                  Add to directory
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">All universities</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {list.length === 0 && (
                <p className="text-sm text-muted-foreground">No universities in the directory yet.</p>
              )}
              {list.map((uni) => (
                <div
                  key={uni.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-lg border p-4"
                >
                  <div>
                    <p className="font-medium">{uni.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {INSTITUTION_TYPE_LABELS[uni.institution_type as InstitutionType]} · {uni.country}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={uni.is_accessible ?? true}
                        disabled={toggleAccessible.isPending}
                        onCheckedChange={(checked) =>
                          toggleAccessible.mutate({ id: uni.id, is_accessible: checked })
                        }
                      />
                      <span className="text-sm text-muted-foreground">
                        {uni.is_accessible ? "Accessible" : "Hidden"}
                      </span>
                    </div>
                    <Badge variant={uni.is_accessible ? "default" : "secondary"}>
                      {uni.is_accessible ? "Live" : "Off"}
                    </Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="waitlist" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <GraduationCap className="h-4 w-4" />
                Candidate waitlist requests
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {pendingWaitlist.length === 0 && (
                <p className="text-sm text-muted-foreground">No pending waitlist requests.</p>
              )}
              {pendingWaitlist.map((entry) => {
                const candidate = entry.candidates as {
                  full_name?: string | null;
                  profiles?: { full_name?: string | null; email?: string | null } | null;
                } | null;
                const candidateName =
                  candidate?.profiles?.full_name ?? candidate?.full_name ?? "Candidate";
                return (
                  <div key={entry.id} className="rounded-lg border p-4 space-y-3">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <p className="font-medium">{entry.university_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {INSTITUTION_TYPE_LABELS[entry.institution_type as InstitutionType]} · requested by{" "}
                          {candidateName}
                          {candidate?.profiles?.email ? ` (${candidate.profiles.email})` : ""}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDistanceToNow(new Date(entry.created_at), { addSuffix: true })}
                        </p>
                      </div>
                      <Badge variant="outline">Pending</Badge>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        disabled={approveWaitlist.isPending}
                        onClick={async () => {
                          try {
                            await approveWaitlist.mutateAsync({ waitlistId: entry.id, makeAccessible: true });
                            toast({ title: "Approved", description: "University added and made accessible." });
                          } catch (err) {
                            toast({
                              title: "Failed",
                              description: err instanceof Error ? err.message : "Try again",
                              variant: "destructive",
                            });
                          }
                        }}
                      >
                        Approve & make accessible
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={approveWaitlist.isPending}
                        onClick={async () => {
                          try {
                            await approveWaitlist.mutateAsync({ waitlistId: entry.id, makeAccessible: false });
                            toast({ title: "Added as hidden", description: "University saved but not visible yet." });
                          } catch (err) {
                            toast({
                              title: "Failed",
                              description: err instanceof Error ? err.message : "Try again",
                              variant: "destructive",
                            });
                          }
                        }}
                      >
                        Add but keep hidden
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        disabled={rejectWaitlist.isPending}
                        onClick={async () => {
                          try {
                            await rejectWaitlist.mutateAsync(entry.id);
                            toast({ title: "Rejected" });
                          } catch (err) {
                            toast({
                              title: "Failed",
                              description: err instanceof Error ? err.message : "Try again",
                              variant: "destructive",
                            });
                          }
                        }}
                      >
                        Reject
                      </Button>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
