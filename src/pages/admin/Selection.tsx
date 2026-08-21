import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Building2, ChevronRight, Search } from "lucide-react";
import { useAdminSelectionCompanies } from "@/hooks/useSelection";
import { PageSpinner } from "@/components/ui/PageSpinner";

const AdminSelection = () => {
  const { data: companies, isLoading } = useAdminSelectionCompanies();
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (companies ?? []).filter(
      (c) =>
        !q ||
        c.name.toLowerCase().includes(q) ||
        (c.location ?? "").toLowerCase().includes(q)
    );
  }, [companies, search]);

  if (isLoading) {
    return <PageSpinner />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-medium">Selection</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Choose a company to open its Selection pipeline.
        </p>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search companies..."
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <Card>
        <CardContent className="pt-6 space-y-2">
          {filtered.length === 0 ? (
            <p className="text-center text-muted-foreground py-10 text-sm">
              {(companies ?? []).length === 0
                ? "No companies with job roles yet."
                : "No companies match your search."}
            </p>
          ) : (
            filtered.map((company) => (
              <Link
                key={company.id}
                to={`/admin/selection/company/${company.id}`}
                className="flex flex-wrap items-center justify-between gap-4 rounded-lg border p-4 transition-colors hover:border-primary/40 hover:bg-muted/30"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="h-11 w-11 shrink-0 rounded-lg bg-muted flex items-center justify-center">
                    <Building2 className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-medium truncate">{company.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {company.location ?? "—"} · {company.jobCount} job
                      {company.jobCount === 1 ? "" : "s"} · {company.positionsTotal} positions
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {company.needsActionCount > 0 && (
                    <Badge variant="destructive" className="font-normal">
                      {company.needsActionCount} need action
                    </Badge>
                  )}
                  <Badge variant="secondary" className="font-normal tabular-nums">
                    {company.applicationCount} application
                    {company.applicationCount === 1 ? "" : "s"}
                  </Badge>
                  {company.status && (
                    <Badge variant="outline" className="font-normal capitalize hidden sm:inline-flex">
                      {company.status}
                    </Badge>
                  )}
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </Link>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSelection;
