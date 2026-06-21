import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, Trash2 } from "lucide-react";
import {
  useAdminInsightArticles,
  useSaveInsightArticle,
  useDeleteInsightArticle,
} from "@/hooks/useData";
import { useToast } from "@/hooks/use-toast";

const emptyForm = {
  title: "",
  excerpt: "",
  content: "",
  category: "",
  author: "",
  image_url: "",
  published: true,
};

export default function AdminInsights() {
  const { data: articles, isLoading } = useAdminInsightArticles();
  const saveArticle = useSaveInsightArticle();
  const deleteArticle = useDeleteInsightArticle();
  const { toast } = useToast();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const startNew = () => {
    setEditingId(null);
    setForm(emptyForm);
  };

  const startEdit = (a: NonNullable<typeof articles>[number]) => {
    setEditingId(a.id);
    setForm({
      title: a.title,
      excerpt: a.excerpt ?? "",
      content: a.content ?? "",
      category: a.category ?? "",
      author: a.author ?? "",
      image_url: a.image_url ?? "",
      published: a.published,
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await saveArticle.mutateAsync(editingId ? { id: editingId, ...form } : form);
      toast({ title: "Article saved" });
      startNew();
    } catch (err) {
      toast({
        title: "Save failed",
        description: err instanceof Error ? err.message : "Try again",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Insight Articles</h1>
          <p className="text-muted-foreground">Manage public insight content</p>
        </div>
        <Button onClick={startNew} className="gap-2"><Plus className="h-4 w-4" />New article</Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-base">Articles</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {(articles ?? []).map((a) => (
              <div key={a.id} className="flex items-center justify-between p-3 border rounded-lg">
                <button type="button" className="text-left flex-1" onClick={() => startEdit(a)}>
                  <p className="font-medium text-sm">{a.title}</p>
                  <Badge variant="outline" className="mt-1 text-xs">{a.published ? "Published" : "Draft"}</Badge>
                </button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={async () => {
                    await deleteArticle.mutateAsync(a.id);
                    toast({ title: "Deleted" });
                    if (editingId === a.id) startNew();
                  }}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">{editingId ? "Edit" : "Create"} article</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-3">
              <div className="space-y-2"><Label>Title</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required /></div>
              <div className="space-y-2"><Label>Excerpt</Label><Textarea rows={2} value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} /></div>
              <div className="space-y-2"><Label>Content</Label><Textarea rows={6} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2"><Label>Category</Label><Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} /></div>
                <div className="space-y-2"><Label>Author</Label><Input value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} /></div>
              </div>
              <div className="space-y-2"><Label>Image URL</Label><Input value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} /></div>
              <div className="flex items-center gap-2">
                <Switch checked={form.published} onCheckedChange={(v) => setForm({ ...form, published: v })} />
                <Label>Published</Label>
              </div>
              <Button type="submit" disabled={saveArticle.isPending}>Save article</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
