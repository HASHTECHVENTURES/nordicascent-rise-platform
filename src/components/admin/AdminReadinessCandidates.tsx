import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Loader2, Search, UserCheck } from "lucide-react";
import { useAdminReadinessOverview, type AdminReadinessCandidateRow } from "@/hooks/useReadiness";
import { READINESS_SIGNAL_LABELS } from "@/data/readinessModuleSeed";
import ReadinessEvaluationPanel from "@/components/admin/ReadinessEvaluationPanel";

function signalBadge(signal: string | null) {
  if (!signal) return <Badge variant="secondary">—</Badge>;
  const label = READINESS_SIGNAL_LABELS[signal as keyof typeof READINESS_SIGNAL_LABELS] ?? signal;
  const cls =
    signal === "strong"
      ? "bg-success text-success-foreground"
      : signal === "acceptable"
        ? "bg-primary/90 text-primary-foreground"
        : "bg-destructive/90 text-destructive-foreground";
  return <Badge className={cls}>{label}</Badge>;
}

function statusBadge(row: AdminReadinessCandidateRow) {
  if (row.evaluated) {
    return <Badge className="bg-success text-success-foreground">Reviewed</Badge>;
  }
  if (row.red_flag) {
    return <Badge variant="destructive">Red flag</Badge>;
  }
  if (row.testsTotal > 0 && row.testsSubmitted >= row.testsTotal) {
    return <Badge className="bg-amber-500 text-white">Ready for review</Badge>;
  }
  if (row.testsInProgress > 0 || row.testsSubmitted > 0) {
    return <Badge className="bg-primary text-primary-foreground">In progress</Badge>;
  }
  return <Badge variant="secondary">Not started</Badge>;
}

export default function AdminReadinessCandidates() {
  const { data: rows, isLoading } = useAdminReadinessOverview();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "review" | "evaluated" | "progress">("all");
  const [reviewId, setReviewId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let list = rows ?? [];
    const q = search.toLowerCase().trim();
    if (q) {
      list = list.filter(
        (r) => r.fullName.toLowerCase().includes(q) || r.email.toLowerCase().includes(q)
      );
    }
    if (filter === "review") {
      list = list.filter((r) => r.testsSubmitted >= r.testsTotal && r.testsTotal > 0 && !r.evaluated);
    } else if (filter === "evaluated") {
      list = list.filter((r) => r.evaluated);
    } else if (filter === "progress") {
      list = list.filter((r) => r.testsSubmitted > 0 && !r.evaluated);
    }
    return list;
  }, [rows, search, filter]);

  const reviewRow = filtered.find((r) => r.id === reviewId) ?? rows?.find((r) => r.id === reviewId);

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const pendingReview = (rows ?? []).filter(
    (r) => r.testsSubmitted >= r.testsTotal && r.testsTotal > 0 && !r.evaluated
  ).length;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Search candidate name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {(
            [
              ["all", "All"],
              ["review", `Needs review (${pendingReview})`],
              ["progress", "In progress"],
              ["evaluated", "Reviewed"],
            ] as const
          ).map(([key, label]) => (
            <Button
              key={key}
              size="sm"
              variant={filter === key ? "default" : "outline"}
              onClick={() => setFilter(key)}
            >
              {label}
            </Button>
          ))}
        </div>
      </div>

      <div className="rounded-lg border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Candidate</TableHead>
              <TableHead>Tests</TableHead>
              <TableHead>Cultural</TableHead>
              <TableHead>Technical</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-10">
                  No candidates match your filters.
                </TableCell>
              </TableRow>
            )}
            {filtered.map((row) => (
              <TableRow key={row.id}>
                <TableCell>
                  <div>
                    <p className="font-medium">{row.fullName}</p>
                    <p className="text-xs text-muted-foreground">{row.email}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="font-mono text-sm">
                    {row.testsSubmitted}/{row.testsTotal}
                  </span>
                  {row.testsInProgress > 0 && (
                    <p className="text-xs text-muted-foreground">{row.testsInProgress} in progress</p>
                  )}
                </TableCell>
                <TableCell>{signalBadge(row.cultural_signal)}</TableCell>
                <TableCell>{signalBadge(row.technical_signal)}</TableCell>
                <TableCell>{statusBadge(row)}</TableCell>
                <TableCell className="text-right space-x-2">
                  <Button size="sm" variant="outline" onClick={() => setReviewId(row.id)}>
                    Review
                  </Button>
                  <Button size="sm" variant="ghost" asChild>
                    <Link to={`/admin/candidates/${row.id}`}>Profile</Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Sheet open={!!reviewId} onOpenChange={(open) => !open && setReviewId(null)}>
        <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <UserCheck className="h-5 w-5" />
              {reviewRow?.fullName ?? "Candidate"} — Readiness review
            </SheetTitle>
            <p className="text-sm text-muted-foreground">{reviewRow?.email}</p>
          </SheetHeader>
          <div className="mt-6">
            {reviewId && <ReadinessEvaluationPanel candidateId={reviewId} />}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
