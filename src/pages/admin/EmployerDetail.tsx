import { useParams, Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Building2, CheckCircle, Loader2, Ban } from "lucide-react";
import { useCompanyById, useUpdateCompany, useRemoveCompany } from "@/hooks/useData";
import { useToast } from "@/hooks/use-toast";

const AdminEmployerDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: company, isLoading } = useCompanyById(id);
  const updateCompany = useUpdateCompany();
  const removeCompany = useRemoveCompany();
  const { toast } = useToast();

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!company) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/admin/employers"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <p className="text-muted-foreground">Company not found.</p>
      </div>
    );
  }

  const employers = (company.employers ?? []) as Array<{
    id: string;
    title: string | null;
    profiles: { full_name: string | null; email: string | null } | null;
  }>;
  const jobs = (company.jobs ?? []) as Array<{ id: string; status: string }>;
  const openJobs = jobs.filter((j) => j.status === "open").length;
  const primaryContact = employers[0]?.profiles;

  const handleVerify = async () => {
    try {
      await updateCompany.mutateAsync({ id: company.id, status: "verified" });
      toast({ title: "Company verified" });
    } catch (err) {
      toast({
        title: "Failed to verify",
        description: err instanceof Error ? err.message : "Try again",
        variant: "destructive",
      });
    }
  };

  const handleRemove = async () => {
    if (!window.confirm(`Remove "${company.name}" from the platform? All ${jobs.length} job(s) will be closed.`)) {
      return;
    }
    try {
      await removeCompany.mutateAsync(company.id);
      toast({ title: "Company removed", description: "Jobs are closed and hidden from candidates." });
      navigate("/admin/employers");
    } catch (err) {
      toast({
        title: "Could not remove company",
        description: err instanceof Error ? err.message : "Try again",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/admin/employers"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{company.name}</h1>
          <p className="text-muted-foreground">
            {primaryContact?.email ?? "—"} · {company.location ?? "—"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Company
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p><span className="text-muted-foreground">Status </span><Badge>{company.status}</Badge></p>
            <p><span className="text-muted-foreground">Industry </span>{company.industry ?? "—"}</p>
            <p><span className="text-muted-foreground">Open jobs </span>{openJobs} / {jobs.length} total</p>
            <p><span className="text-muted-foreground">Joined </span>{company.created_at.split("T")[0]}</p>
            {company.website && (
              <p><span className="text-muted-foreground">Website </span>{company.website}</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Contacts</CardTitle>
          </CardHeader>
          <CardContent>
            {employers.length === 0 ? (
              <p className="text-sm text-muted-foreground">No employer users linked yet.</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {employers.map((emp) => (
                  <li key={emp.id}>
                    {emp.profiles?.full_name ?? "—"} · {emp.profiles?.email ?? "—"}
                    {emp.title && <span className="text-muted-foreground"> ({emp.title})</span>}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      {company.description && (
        <Card>
          <CardHeader><CardTitle className="text-base">About</CardTitle></CardHeader>
          <CardContent><p className="text-sm text-muted-foreground">{company.description}</p></CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Actions</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          {company.status !== "verified" && (
            <Button variant="outline" size="sm" className="gap-2" disabled={updateCompany.isPending} onClick={handleVerify}>
              <CheckCircle className="h-4 w-4" />
              Verify company
            </Button>
          )}
          {company.status === "verified" && (
            <Badge className="bg-success text-success-foreground">Verified</Badge>
          )}
          {company.status !== "suspended" && (
            <Button
              variant="destructive"
              size="sm"
              className="gap-2"
              disabled={removeCompany.isPending}
              onClick={handleRemove}
            >
              <Ban className="h-4 w-4" />
              Remove company
            </Button>
          )}
          {company.status === "suspended" && (
            <Badge variant="destructive">Removed</Badge>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminEmployerDetail;
