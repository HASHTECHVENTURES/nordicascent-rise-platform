import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Download, Eye, Loader2 } from "lucide-react";
import { TRACK_META, type Track } from "@/lib/track";
import { useAdminCandidates, useAdminCandidateJourneyBrief, useDeleteCandidate } from "@/hooks/useData";
import { adminJourneyStageLabel } from "@/lib/adminJourney";
import AdminDeleteButton from "@/components/admin/AdminDeleteButton";
import { useToast } from "@/hooks/use-toast";

const TrackBadge = ({ track }: { track: Track }) => (
  <Badge variant="outline" className="border-primary/40 text-primary">
    {TRACK_META[track].label}
  </Badge>
);

const AdminCandidates = () => {
  const { data: candidates, isLoading } = useAdminCandidates();
  const { data: journeyMap } = useAdminCandidateJourneyBrief();
  const deleteCandidate = useDeleteCandidate();
  const { toast } = useToast();
  const [trackFilter, setTrackFilter] = useState<"all" | Track>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [search, setSearch] = useState("");

  const filtered = useMemo(
    () =>
      (candidates ?? []).filter((c) => {
        const profile = c.profiles as { full_name: string | null; email: string | null } | null;
        const name = profile?.full_name ?? "";
        const email = profile?.email ?? "";
        const matchesSearch =
          !search ||
          name.toLowerCase().includes(search.toLowerCase()) ||
          email.toLowerCase().includes(search.toLowerCase());
        return (
          matchesSearch &&
          (trackFilter === "all" || c.track === trackFilter) &&
          (statusFilter === "all" || c.status === statusFilter)
        );
      }),
    [candidates, trackFilter, statusFilter, search],
  );

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const list = candidates ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-medium">Candidates</h1>
          <p className="text-sm text-muted-foreground mt-1">Candidate login accounts only</p>
        </div>
        <Button variant="outline" className="gap-2" onClick={() => {
          const headers = ["Name", "Email", "Location", "Title", "Status", "Track", "Joined"];
          const rows = filtered.map((c) => {
            const p = c.profiles as { full_name: string | null; email: string | null } | null;
            return [p?.full_name ?? "", p?.email ?? "", c.location ?? "", c.title ?? "", c.status, TRACK_META[c.track as Track].label, c.created_at.split("T")[0]];
          });
          const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
          const blob = new Blob([csv], { type: "text/csv" });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a"); a.href = url; a.download = "candidates-export.csv"; a.click();
          URL.revokeObjectURL(url);
        }}>
          <Download className="h-4 w-4" />
          Export
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Total</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{list.length}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Readiness</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{[...(journeyMap?.values() ?? [])].filter((s) => s === "readiness").length}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Mentoring</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{[...(journeyMap?.values() ?? [])].filter((s) => s === "mentoring").length}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Activation</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{[...(journeyMap?.values() ?? [])].filter((s) => s === "activation").length}</div></CardContent></Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-4 justify-between">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search candidates..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <div className="flex gap-2">
              <Select value={trackFilter} onValueChange={(v) => setTrackFilter(v as "all" | Track)}>
                <SelectTrigger className="w-[130px]"><SelectValue placeholder="Track" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All tracks</SelectItem>
                  <SelectItem value="entry">Entry</SelectItem>
                  <SelectItem value="fast">Fast</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[130px]"><SelectValue placeholder="Status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filtered.length === 0 && (
              <p className="text-center text-muted-foreground py-8">No candidates found.</p>
            )}
            {filtered.map((candidate) => {
              const profile = candidate.profiles as { full_name: string | null; email: string | null; avatar_url: string | null } | null;
              const name = profile?.full_name ?? "Unknown";
              const stage = journeyMap?.get(candidate.id);
              return (
                <div key={candidate.id} className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-lg border">
                  <div className="flex items-center gap-4 min-w-0">
                    <Avatar className="h-11 w-11">
                      <AvatarImage src={profile?.avatar_url ?? undefined} />
                      <AvatarFallback>{name.slice(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-medium">{name}</h3>
                        <TrackBadge track={candidate.track as Track} />
                        {stage && <Badge variant="outline">{adminJourneyStageLabel(stage)}</Badge>}
                      </div>
                      <p className="text-sm text-muted-foreground truncate">{profile?.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={candidate.status === "suspended" ? "destructive" : "secondary"}>
                      {candidate.status}
                    </Badge>
                    <Button size="sm" variant="outline" asChild>
                      <Link to={`/admin/candidates/${candidate.id}`}>
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Link>
                    </Button>
                    <AdminDeleteButton
                      label="Delete"
                      title={`Delete ${name}?`}
                      description="Permanently removes this candidate account, profile, applications, and readiness data. This cannot be undone."
                      isPending={deleteCandidate.isPending}
                      onConfirm={async () => {
                        try {
                          await deleteCandidate.mutateAsync(candidate.id);
                          toast({ title: "Candidate deleted" });
                        } catch (err) {
                          toast({
                            title: "Delete failed",
                            description: err instanceof Error ? err.message : "Try again",
                            variant: "destructive",
                          });
                        }
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminCandidates;
