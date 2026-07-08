import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Users } from "lucide-react";
import {
  useAdminMentoringPipeline,
  useUnlockCandidateJobs,
} from "@/hooks/useData";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";

export default function AdminMentoring() {
  const { data: pipeline, isLoading: pipelineLoading } = useAdminMentoringPipeline();
  const unlockJobs = useUnlockCandidateJobs();
  const { toast } = useToast();
  const [tab, setTab] = useState("pipeline");

  const pipelineOptions = useMemo(() => pipeline ?? [], [pipeline]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-medium">Mentoring</h1>
        <p className="text-muted-foreground">
          Standard 3+3 programme — mentors complete six fixed sessions per application in Selection.
          Custom meetings are not used.
        </p>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="pipeline" className="gap-2">
            <Users className="h-4 w-4" />
            Pipeline
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pipeline" className="mt-6 space-y-4">
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="pt-6 text-sm text-muted-foreground">
              Record mentor meetings, signal notes, and activation notes from{" "}
              <Link to="/admin/selection" className="text-primary font-medium hover:underline">
                Selection → application detail
              </Link>
              . Mentors may add optional topics to each standard session.
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">After Readiness — unlock activation here</CardTitle>
            </CardHeader>
            <CardContent>
              {pipelineLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : pipelineOptions.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4">No candidates have completed Readiness yet.</p>
              ) : (
                <div className="rounded-lg border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Candidate</TableHead>
                        <TableHead>Readiness</TableHead>
                        <TableHead>Activation</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pipelineOptions.map((row) => (
                        <TableRow key={row.id}>
                          <TableCell>
                            <p className="font-medium text-sm">{row.fullName}</p>
                            <p className="text-xs text-muted-foreground">{row.email}</p>
                          </TableCell>
                          <TableCell className="font-mono text-sm">
                            {row.testsSubmitted}/{row.testsTotal}
                          </TableCell>
                          <TableCell>
                            {row.jobsUnlocked ? (
                              <Badge className="bg-success text-success-foreground">Unlocked</Badge>
                            ) : (
                              <Badge variant="secondary">Locked</Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right space-x-2">
                            {!row.jobsUnlocked && (
                              <Button
                                size="sm"
                                disabled={unlockJobs.isPending}
                                onClick={async () => {
                                  try {
                                    await unlockJobs.mutateAsync({ candidateId: row.id, unlock: true });
                                    toast({ title: "Activation unlocked", description: row.fullName });
                                  } catch (err) {
                                    toast({
                                      title: "Failed",
                                      description: err instanceof Error ? err.message : "Try again",
                                      variant: "destructive",
                                    });
                                  }
                                }}
                              >
                                Unlock activation
                              </Button>
                            )}
                            <Button size="sm" variant="outline" asChild>
                              <Link to={`/admin/candidates/${row.id}`}>View</Link>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
