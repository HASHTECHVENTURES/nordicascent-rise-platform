import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import {
  useAdminReadinessTests,
  useReadinessQuestions,
  useAdminUpdateReadinessTest,
  useAdminCreateReadinessQuestion,
  useAdminUpdateReadinessQuestion,
  useAdminDeleteReadinessQuestion,
  type ReadinessQuestion,
} from "@/hooks/useReadiness";
import { READINESS_AREA_LABELS, READINESS_LEVEL_LABELS } from "@/data/readinessModuleSeed";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const ANSWER_TYPES = ["short", "long", "bullets", "video"] as const;

export default function AdminReadinessContentEditor() {
  const { data: tests, isLoading } = useAdminReadinessTests();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = tests?.find((t) => t.id === selectedId) ?? tests?.[0];
  const selectedTestId = selected?.id;

  const { data: questions, isLoading: qLoading } = useReadinessQuestions(selectedTestId);
  const updateTest = useAdminUpdateReadinessTest();
  const createQuestion = useAdminCreateReadinessQuestion();
  const updateQuestion = useAdminUpdateReadinessQuestion();
  const deleteQuestion = useAdminDeleteReadinessQuestion();
  const { toast } = useToast();

  const [editQ, setEditQ] = useState<ReadinessQuestion | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [formPrompt, setFormPrompt] = useState("");
  const [formLabel, setFormLabel] = useState("");
  const [formType, setFormType] = useState<(typeof ANSWER_TYPES)[number]>("long");

  const [testTitle, setTestTitle] = useState("");
  const [testSubtitle, setTestSubtitle] = useState("");
  const [testMinutes, setTestMinutes] = useState(60);
  const [testHard, setTestHard] = useState(true);
  const [testActive, setTestActive] = useState(true);

  const loadTestForm = (t: NonNullable<typeof tests>[number]) => {
    setTestTitle(t.title);
    setTestSubtitle(t.subtitle ?? "");
    setTestMinutes(t.timer_minutes);
    setTestHard(t.timer_hard);
    setTestActive(t.active);
  };

  useEffect(() => {
    if (!tests?.length) return;
    if (!selectedId || !tests.some((t) => t.id === selectedId)) {
      setSelectedId(tests[0].id);
      loadTestForm(tests[0]);
    }
  }, [tests, selectedId]);

  const selectTest = (id: string) => {
    setSelectedId(id);
    const t = tests?.find((x) => x.id === id);
    if (t) loadTestForm(t);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!tests?.length) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-muted-foreground">
          No tests yet. Use <strong>Initialize module</strong> in the header to seed Module 3 content.
        </CardContent>
      </Card>
    );
  }

  const currentId = selectedId ?? tests[0]?.id;

  const openAdd = () => {
    setFormPrompt("");
    setFormLabel("");
    setFormType("long");
    setEditQ(null);
    setAddOpen(true);
  };

  const openEdit = (q: ReadinessQuestion) => {
    setEditQ(q);
    setFormPrompt(q.prompt);
    setFormLabel(q.scenario_label ?? "");
    setFormType(q.answer_type);
    setAddOpen(true);
  };

  const saveQuestion = async () => {
    if (!selectedTestId || !formPrompt.trim()) return;
    try {
      if (editQ) {
        await updateQuestion.mutateAsync({
          id: editQ.id,
          testId: selectedTestId,
          prompt: formPrompt.trim(),
          scenario_label: formLabel.trim() || null,
          answer_type: formType,
        });
        toast({ title: "Question updated" });
      } else {
        const nextOrder = (questions?.length ?? 0) + 1;
        await createQuestion.mutateAsync({
          test_id: selectedTestId,
          prompt: formPrompt.trim(),
          scenario_label: formLabel.trim() || null,
          answer_type: formType,
          sort_order: nextOrder,
        });
        toast({ title: "Question added" });
      }
      setAddOpen(false);
    } catch (err) {
      toast({
        title: "Save failed",
        description: err instanceof Error ? err.message : "Try again",
        variant: "destructive",
      });
    }
  };

  const saveTestSettings = async () => {
    if (!selectedTestId) return;
    try {
      await updateTest.mutateAsync({
        id: selectedTestId,
        title: testTitle.trim(),
        subtitle: testSubtitle.trim() || null,
        timer_minutes: testMinutes,
        timer_hard: testHard,
        active: testActive,
      });
      toast({ title: "Test settings saved" });
    } catch (err) {
      toast({
        title: "Save failed",
        description: err instanceof Error ? err.message : "Try again",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <Card className="lg:col-span-4">
        <CardHeader>
          <CardTitle className="text-base">Tests</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 p-0 pb-4">
          {tests
            .sort((a, b) => a.area.localeCompare(b.area) || a.level - b.level)
            .map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => selectTest(t.id)}
                className={cn(
                  "w-full text-left px-4 py-3 border-b hover:bg-muted/50 transition-colors",
                  currentId === t.id && "bg-primary/5 border-l-2 border-l-primary"
                )}
              >
                <p className="text-xs text-muted-foreground">{READINESS_AREA_LABELS[t.area]}</p>
                <p className="font-medium text-sm">{READINESS_LEVEL_LABELS[t.level]}</p>
                <div className="flex gap-1 mt-1">
                  {!t.active && <Badge variant="secondary" className="text-[10px]">Off</Badge>}
                  {t.timer_hard && <Badge variant="outline" className="text-[10px]">Hard timer</Badge>}
                </div>
              </button>
            ))}
        </CardContent>
      </Card>

      <div className="lg:col-span-8 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Test settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2 md:col-span-2">
                <Label>Title</Label>
                <Input value={testTitle} onChange={(e) => setTestTitle(e.target.value)} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Subtitle</Label>
                <Input value={testSubtitle} onChange={(e) => setTestSubtitle(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Timer (minutes)</Label>
                <Input
                  type="number"
                  min={15}
                  value={testMinutes}
                  onChange={(e) => setTestMinutes(Number(e.target.value))}
                />
              </div>
              <div className="flex items-center gap-6 pt-6">
                <div className="flex items-center gap-2">
                  <Switch checked={testHard} onCheckedChange={setTestHard} id="hard-timer" />
                  <Label htmlFor="hard-timer">Hard limit (auto-submit)</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={testActive} onCheckedChange={setTestActive} id="active-test" />
                  <Label htmlFor="active-test">Active</Label>
                </div>
              </div>
            </div>
            <Button size="sm" disabled={updateTest.isPending} onClick={saveTestSettings}>
              {updateTest.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save test settings"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Questions ({questions?.length ?? 0})</CardTitle>
            <Button size="sm" className="gap-1" onClick={openAdd}>
              <Plus className="h-4 w-4" /> Add question
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {qLoading && <Loader2 className="h-6 w-6 animate-spin mx-auto" />}
            {(questions ?? []).map((q, i) => (
              <div key={q.id} className="rounded-lg border p-4 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <Badge variant="outline" className="text-[10px]">Q{i + 1}</Badge>
                      <Badge variant="secondary" className="text-[10px]">{q.answer_type}</Badge>
                      {q.scenario_label && (
                        <span className="text-xs font-medium text-primary">{q.scenario_label}</span>
                      )}
                    </div>
                    <p className="text-sm whitespace-pre-wrap text-muted-foreground line-clamp-4">{q.prompt}</p>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => openEdit(q)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-destructive"
                      disabled={deleteQuestion.isPending}
                      onClick={async () => {
                        if (!selectedTestId || !confirm("Delete this question?")) return;
                        try {
                          await deleteQuestion.mutateAsync({ id: q.id, testId: selectedTestId });
                          toast({ title: "Question deleted" });
                        } catch (err) {
                          toast({
                            title: "Delete failed",
                            description: err instanceof Error ? err.message : "Try again",
                            variant: "destructive",
                          });
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editQ ? "Edit question" : "Add question"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Scenario label (optional)</Label>
              <Input
                placeholder="e.g. Scenario 1: Taking Initiative"
                value={formLabel}
                onChange={(e) => setFormLabel(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Answer type</Label>
              <Select value={formType} onValueChange={(v) => setFormType(v as typeof formType)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {ANSWER_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Prompt</Label>
              <Textarea
                rows={8}
                value={formPrompt}
                onChange={(e) => setFormPrompt(e.target.value)}
                placeholder="Question text shown to the candidate..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button
              disabled={!formPrompt.trim() || createQuestion.isPending || updateQuestion.isPending}
              onClick={saveQuestion}
            >
              {editQ ? "Save changes" : "Add question"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
