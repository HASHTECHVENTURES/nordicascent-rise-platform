import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Users, FileEdit, Heart } from "lucide-react";
import { useAdminReadinessTests, useReseedReadinessModule } from "@/hooks/useReadiness";
import { useToast } from "@/hooks/use-toast";
import AdminReadinessCandidates from "@/components/admin/AdminReadinessCandidates";
import AdminReadinessContentEditor from "@/components/admin/AdminReadinessContentEditor";
import AdminMentoring from "@/pages/admin/Mentoring";

export default function AdminReadiness() {
  const { data: tests, isLoading, refetch } = useAdminReadinessTests();
  const reseed = useReseedReadinessModule();
  const { toast } = useToast();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-medium">Readiness</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Module 3 — tests plus mentor meetings 1–3 (parallel).
          </p>
        </div>
        {(tests?.length ?? 0) === 0 && (
          <Button
            variant="outline"
            size="sm"
            disabled={reseed.isPending}
            onClick={async () => {
              try {
                await reseed.mutateAsync();
                await refetch();
                toast({ title: "Module initialized" });
              } catch (err) {
                toast({
                  title: "Failed",
                  description: err instanceof Error ? err.message : "Try again",
                  variant: "destructive",
                });
              }
            }}
          >
            {reseed.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Initialize tests"}
          </Button>
        )}
      </div>

      <Tabs defaultValue="candidates">
        <TabsList>
          <TabsTrigger value="candidates" className="gap-2">
            <Users className="h-4 w-4" />
            Reviews
          </TabsTrigger>
          <TabsTrigger value="mentoring" className="gap-2">
            <Heart className="h-4 w-4" />
            Mentoring
          </TabsTrigger>
          <TabsTrigger value="content" className="gap-2">
            <FileEdit className="h-4 w-4" />
            Content
          </TabsTrigger>
        </TabsList>

        <TabsContent value="candidates" className="mt-6">
          <AdminReadinessCandidates />
        </TabsContent>

        <TabsContent value="mentoring" className="mt-6">
          <AdminMentoring embedded />
        </TabsContent>

        <TabsContent value="content" className="mt-6">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <AdminReadinessContentEditor />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
