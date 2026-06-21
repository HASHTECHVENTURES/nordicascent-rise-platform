import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Search, Eye, MessageSquare,
  MapPin, Briefcase, GraduationCap, AlertTriangle, Loader2,
} from "lucide-react";
import { useMemo, useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { applicationStatusVariant, employerApplicationStatusLabel } from "@/lib/applicationJourney";
import { TRACK_META, type Track } from "@/lib/track";
import { PIPELINE_STAGES } from "@/lib/pipeline";
import { useEmployerApplications } from "@/hooks/useData";
import { resolveProfile } from "@/lib/resolveProfile";

const EmployerCandidates = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { data: applications, isLoading } = useEmployerApplications();
  const [activeStage, setActiveStage] = useState("preparation");
  const [trackFilter, setTrackFilter] = useState<"all" | Track>("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const stage = searchParams.get("stage");
    if (stage && PIPELINE_STAGES.some((s) => s.id === stage)) {
      setActiveStage(stage);
    }
  }, [searchParams]);

  const byStage = useMemo(() => {
    const map: Record<string, typeof applications> = {};
    PIPELINE_STAGES.forEach((s) => { map[s.id] = []; });
    (applications ?? []).forEach((app) => {
      const stage = app.stage_id ?? "preparation";
      if (!map[stage]) map[stage] = [];
      map[stage].push(app);
    });
    return map;
  }, [applications]);

  const stageCandidates = useMemo(() => {
    let list = byStage[activeStage] ?? [];
    if (trackFilter !== "all") {
      list = list.filter((a) => (a.candidates as { track: Track })?.track === trackFilter);
    }
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((a) => {
        const c = a.candidates as {
          full_name?: string | null;
          title: string | null;
          profiles?: { full_name: string | null } | { full_name: string | null }[] | null;
        };
        const profile = resolveProfile(c?.profiles);
        const name = c?.full_name ?? profile?.full_name ?? "";
        return name.toLowerCase().includes(q) || (c?.title ?? "").toLowerCase().includes(q);
      });
    }
    return list;
  }, [byStage, activeStage, trackFilter, search]);

  const activeStageInfo = PIPELINE_STAGES.find((s) => s.id === activeStage);

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-medium text-foreground">Candidates</h1>
          <p className="text-muted-foreground">Monitor candidates across the mobility pipeline</p>
        </div>
        <div className="flex gap-2 items-center flex-wrap">
          <div className="flex gap-1 rounded-md border bg-card p-1">
            {(["all", "entry", "fast"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTrackFilter(t)}
                className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
                  trackFilter === t ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"
                }`}
              >
                {t === "all" ? "All tracks" : TRACK_META[t].label}
              </button>
            ))}
          </div>
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search candidates..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {PIPELINE_STAGES.map((stage) => {
          const count = (byStage[stage.id] ?? []).length;
          const isActive = activeStage === stage.id;
          return (
            <button
              key={stage.id}
              onClick={() => setActiveStage(stage.id)}
              className={`flex flex-col items-center gap-1.5 p-3 rounded-lg border-2 transition-all cursor-pointer ${
                isActive ? "border-primary bg-primary/5 shadow-sm" : "border-border hover:border-primary/30 bg-card"
              }`}
            >
              <stage.icon className={`h-5 w-5 ${isActive ? "text-primary" : stage.color}`} />
              <span className={`text-xl font-bold ${isActive ? "text-primary" : "text-foreground"}`}>{count}</span>
              <span className={`text-[10px] font-medium text-center leading-tight ${isActive ? "text-primary" : "text-muted-foreground"}`}>{stage.name}</span>
            </button>
          );
        })}
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-medium flex items-center gap-2">
            {activeStageInfo && <activeStageInfo.icon className={`h-5 w-5 ${activeStageInfo.color}`} />}
            {activeStageInfo?.name} Stage
            <Badge variant="secondary" className="ml-2">{stageCandidates.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {stageCandidates.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              {activeStageInfo && <activeStageInfo.icon className="h-12 w-12 mx-auto mb-3 opacity-50" />}
              <p className="text-sm">No candidates in {activeStageInfo?.name} stage yet.</p>
              <p className="text-xs mt-1">Candidates appear here when they apply to your open roles.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {stageCandidates.map((app) => {
                const candidate = app.candidates as {
                  id: string;
                  profile_id: string;
                  full_name?: string | null;
                  avatar_url?: string | null;
                  title: string | null;
                  location: string | null;
                  experience: string | null;
                  skills: string[] | null;
                  track: Track;
                  profiles: { full_name: string | null; avatar_url: string | null } | { full_name: string | null; avatar_url: string | null }[] | null;
                };
                const profile = resolveProfile(candidate?.profiles);
                const name = candidate.full_name ?? profile?.full_name ?? "Candidate";
                const avatarUrl = candidate.avatar_url ?? profile?.avatar_url ?? undefined;
                const job = app.jobs as { title: string } | null;
                const initials = name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
                return (
                  <div key={app.id} className="flex items-center justify-between p-4 border border-border rounded-lg hover:border-primary/50 transition-colors">
                    <div className="flex items-center gap-4 min-w-0">
                      <Avatar className="h-12 w-12 shrink-0">
                        <AvatarImage src={avatarUrl} />
                        <AvatarFallback>{initials}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-medium">{name}</h3>
                          {app.needs_action && <AlertTriangle className="h-4 w-4 text-warning" />}
                          <Badge variant="outline" className="border-primary/40 text-primary">{TRACK_META[candidate.track].label}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-0.5">
                          Applied for <span className="font-medium text-foreground">{job?.title ?? "—"}</span>
                        </p>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1 flex-wrap">
                          <span className="flex items-center gap-1"><Briefcase className="h-3 w-3" />{candidate.title ?? "—"}</span>
                          <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{candidate.location ?? "—"}</span>
                          {candidate.experience && (
                            <span className="flex items-center gap-1"><GraduationCap className="h-3 w-3" />{candidate.experience}</span>
                          )}
                        </div>
                        <div className="flex gap-1 mt-2 flex-wrap">
                          {(candidate.skills ?? []).map((skill) => (
                            <Badge key={skill} variant="outline" className="text-xs">{skill}</Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <Badge variant={applicationStatusVariant(app.status)}>
                        {employerApplicationStatusLabel(app.status)}
                      </Badge>
                      <Button size="sm" asChild>
                        <Link to={`/employer/candidates/${candidate.id}`}>
                          <Eye className="h-4 w-4 mr-1" />
                          Open
                        </Link>
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          navigate("/employer/messages", {
                            state: { startWithProfileId: candidate.profile_id },
                          })
                        }
                      >
                        <MessageSquare className="h-4 w-4 mr-1" />
                        Message
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EmployerCandidates;
