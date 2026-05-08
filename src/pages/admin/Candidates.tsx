import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, Download, Eye, Ban, CheckCircle, MoreHorizontal, MapPin, Briefcase } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Link } from "react-router-dom";
import { TRACK_META, type Track } from "@/lib/track";

export type AdminCandidate = {
  id: number; name: string; email: string; avatar: string; location: string; role: string;
  status: string; applications: number; verified: boolean; joined: string; track: Track;
};

export const adminCandidates: AdminCandidate[] = [
  { id: 1, name: "Emma Lindqvist", email: "emma@email.com", avatar: "", location: "Stockholm, SE", role: "Engineer", status: "active", applications: 5, verified: true, joined: "2024-01-15", track: "entry" },
  { id: 2, name: "Lars Andersen", email: "lars@email.com", avatar: "", location: "Copenhagen, DK", role: "Product Manager", status: "active", applications: 3, verified: true, joined: "2024-02-20", track: "fast" },
  { id: 3, name: "Sofia Virtanen", email: "sofia@email.com", avatar: "", location: "Helsinki, FI", role: "UX Designer", status: "pending", applications: 2, verified: false, joined: "2024-03-10", track: "entry" },
  { id: 4, name: "Magnus Olsen", email: "magnus@email.com", avatar: "", location: "Oslo, NO", role: "Data Scientist", status: "suspended", applications: 0, verified: true, joined: "2024-01-28", track: "fast" },
  { id: 5, name: "Ingrid Svensson", email: "ingrid@email.com", avatar: "", location: "Gothenburg, SE", role: "Frontend Developer", status: "active", applications: 7, verified: true, joined: "2024-02-05", track: "entry" },
];

const TrackBadge = ({ track }: { track: Track }) => (
  <Badge variant="outline" className="border-primary/40 text-primary">
    {TRACK_META[track].label}
  </Badge>
);

const AdminCandidates = () => {
  const [trackFilter, setTrackFilter] = useState<"all" | Track>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filtered = useMemo(
    () =>
      adminCandidates.filter(
        (c) =>
          (trackFilter === "all" || c.track === trackFilter) &&
          (statusFilter === "all" || c.status === statusFilter),
      ),
    [trackFilter, statusFilter],
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Candidate Management</h1>
          <p className="text-muted-foreground">Review and manage platform candidates</p>
        </div>
        <Button variant="outline" className="gap-2" onClick={() => {
          const headers = ["Name", "Email", "Location", "Role", "Status", "Track", "Applications", "Joined"];
          const rows = filtered.map(c => [c.name, c.email, c.location, c.role, c.status, TRACK_META[c.track].label, c.applications, c.joined]);
          const csv = [headers, ...rows].map(r => r.join(",")).join("\n");
          const blob = new Blob([csv], { type: "text/csv" });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a"); a.href = url; a.download = "candidates-export.csv"; a.click();
          URL.revokeObjectURL(url);
        }}>
          <Download className="h-4 w-4" />
          Export candidates
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-candidate-accent/10 to-transparent border-candidate-accent/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Candidates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2,847</div>
            <p className="text-xs text-muted-foreground">+156 this month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Entry Track</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{adminCandidates.filter(c => c.track === "entry").length}</div>
            <p className="text-xs text-muted-foreground">in current sample</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Fast Track</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{adminCandidates.filter(c => c.track === "fast").length}</div>
            <p className="text-xs text-muted-foreground">in current sample</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Suspended</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">157</div>
            <p className="text-xs text-muted-foreground">Policy violations</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-4 justify-between">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search candidates..." className="pl-9" />
            </div>
            <div className="flex gap-2">
              <Select value={trackFilter} onValueChange={(v) => setTrackFilter(v as "all" | Track)}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Track" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All tracks</SelectItem>
                  <SelectItem value="entry">Entry Track</SelectItem>
                  <SelectItem value="fast">Fast Track</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filtered.map((candidate) => (
              <div key={candidate.id} className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={candidate.avatar} />
                    <AvatarFallback className="bg-candidate-accent/10 text-candidate-accent">
                      {candidate.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold">{candidate.name}</h3>
                      {candidate.verified && (
                        <CheckCircle className="h-4 w-4 text-chart-success" />
                      )}
                      <TrackBadge track={candidate.track} />
                    </div>
                    <p className="text-sm text-muted-foreground">{candidate.email}</p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {candidate.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Briefcase className="h-3 w-3" />
                        {candidate.role}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right hidden md:block">
                    <p className="text-sm font-medium">{candidate.applications} applications</p>
                    <p className="text-xs text-muted-foreground">Joined {candidate.joined}</p>
                  </div>
                  <Badge variant={
                    candidate.status === 'active' ? 'default' :
                    candidate.status === 'pending' ? 'secondary' : 'destructive'
                  }>
                    {candidate.status}
                  </Badge>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link to={`/admin/candidates/${candidate.id}`}>
                          <Eye className="h-4 w-4 mr-2" />
                          View & fix
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Verify Account
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">
                        <Ban className="h-4 w-4 mr-2" />
                        Suspend Account
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminCandidates;
