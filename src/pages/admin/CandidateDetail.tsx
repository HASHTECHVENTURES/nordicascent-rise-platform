import { useParams, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, AlertTriangle, CheckCircle, Send, UserCheck } from "lucide-react";
import { useState } from "react";
import { adminCandidates } from "./Candidates";
import { TRACK_META, type Track, setTrack as setGlobalTrack } from "@/lib/track";

const AdminCandidateDetail = () => {
  const { id } = useParams();
  const found = adminCandidates.find((c) => String(c.id) === id) ?? adminCandidates[0];
  const [track, setTrack] = useState<Track>(found.track);

  const onTrackChange = (v: string) => {
    const t = v as Track;
    setTrack(t);
    found.track = t; // mutate mock so list reflects it
    // Mirror the demo candidate (id 1) to the candidate-side store so the candidate view updates live.
    if (String(found.id) === "1") setGlobalTrack(t);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/admin/candidates"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold tracking-tight">{found.name}</h1>
            <Badge variant="outline" className="border-primary/40 text-primary">{TRACK_META[track].label}</Badge>
          </div>
          <p className="text-muted-foreground">{found.email} · {found.location}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p><span className="text-muted-foreground">Role</span> {found.role}</p>
            <p><span className="text-muted-foreground">Status</span> <Badge>{found.status}</Badge></p>
            <p><span className="text-muted-foreground">Joined</span> {found.joined}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Track</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p className="text-muted-foreground">{TRACK_META[track].short}</p>
            <Select value={track} onValueChange={onTrackChange}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="entry">Entry Track</SelectItem>
                <SelectItem value="fast">Fast Track</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Stages in track: {TRACK_META[track].stages.length} of 7
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Fix actions</CardTitle>
          <p className="text-sm text-muted-foreground">Resolve issues from here</p>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button variant="outline" size="sm" className="gap-2">
            <CheckCircle className="h-4 w-4" />
            Mark Readiness complete
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
            <Send className="h-4 w-4" />
            Send reminder
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
            <UserCheck className="h-4 w-4" />
            Update status
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminCandidateDetail;
