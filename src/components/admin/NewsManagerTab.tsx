import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Eye, EyeOff, Trash2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const CATEGORIES = ["Research", "Rankings", "Campus Life", "Policy", "Innovation", "Global"];

interface NewsItem {
  id: string;
  title: string;
  description: string | null;
  url: string | null;
  image_url: string | null;
  source: string | null;
  category: string | null;
  is_visible: boolean;
  published_at: string;
}

const emptyNews = { title: "", description: "", url: "", image_url: "", source: "", category: "Rankings", is_visible: true };

export function NewsManagerTab() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editItem, setEditItem] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<NewsItem | null>(null);
  const { toast } = useToast();

  const fetchNews = async () => {
    setLoading(true);
    // Use rpc or direct query - admin can see all news
    const { data } = await supabase.from("news").select("*").order("published_at", { ascending: false });
    if (data) setNews(data as unknown as NewsItem[]);
    setLoading(false);
  };

  useEffect(() => { fetchNews(); }, []);

  const handleSave = async () => {
    if (!editItem?.title) { toast({ title: "Title is required", variant: "destructive" }); return; }
    setSaving(true);
    if (editItem.id) {
      const { id, ...rest } = editItem;
      const { error } = await supabase.from("news").update(rest as any).eq("id", id);
      if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
      else toast({ title: "News updated!" });
    } else {
      const { error } = await supabase.from("news").insert(editItem as any);
      if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
      else toast({ title: "News created!" });
    }
    setSaving(false);
    setDialogOpen(false);
    fetchNews();
  };

  const toggleVisibility = async (item: NewsItem) => {
    await supabase.from("news").update({ is_visible: !item.is_visible } as any).eq("id", item.id);
    fetchNews();
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await supabase.from("news").delete().eq("id", deleteTarget.id);
    toast({ title: "News deleted" });
    setDeleteTarget(null);
    fetchNews();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-display text-2xl font-bold">News Manager</h2>
          <p className="text-muted-foreground text-sm mt-1">Create, update, or hide trending news on the home page.</p>
        </div>
        <Button onClick={() => { setEditItem({ ...emptyNews }); setDialogOpen(true); }}>
          <Plus className="h-4 w-4 mr-1" /> Add News
        </Button>
      </div>

      {loading ? (
        <div className="grid gap-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}</div>
      ) : news.length === 0 ? (
        <p className="text-muted-foreground text-center py-8">No news articles yet.</p>
      ) : (
        <div className="grid gap-3">
          {news.map((item) => (
            <Card key={item.id} className={`glass-card ${!item.is_visible ? "opacity-50" : ""}`}>
              <CardHeader className="flex flex-row items-start justify-between pb-2">
                <div className="flex-1 mr-4">
                  <CardTitle className="text-sm font-medium leading-snug">{item.title}</CardTitle>
                  <p className="text-xs text-muted-foreground mt-1">{item.source} · {item.category} · {new Date(item.published_at).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Button variant="ghost" size="icon" onClick={() => toggleVisibility(item)} title={item.is_visible ? "Hide" : "Show"}>
                    {item.is_visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => { setEditItem(item); setDialogOpen(true); }}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => setDeleteTarget(item)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </CardHeader>
              {item.description && (
                <CardContent className="pt-0">
                  <p className="text-xs text-muted-foreground line-clamp-2">{item.description}</p>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Edit/Create Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display">{editItem?.id ? "Edit News" : "Create News"}</DialogTitle>
            <DialogDescription>Fill in the details below.</DialogDescription>
          </DialogHeader>
          {editItem && (
            <div className="space-y-3">
              <div><Label>Title *</Label><Input value={editItem.title} onChange={(e) => setEditItem({ ...editItem, title: e.target.value })} /></div>
              <div><Label>Description</Label><Textarea rows={3} value={editItem.description || ""} onChange={(e) => setEditItem({ ...editItem, description: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Source</Label><Input value={editItem.source || ""} onChange={(e) => setEditItem({ ...editItem, source: e.target.value })} /></div>
                <div>
                  <Label>Category</Label>
                  <Select value={editItem.category || "Rankings"} onValueChange={(v) => setEditItem({ ...editItem, category: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <div><Label>URL</Label><Input value={editItem.url || ""} onChange={(e) => setEditItem({ ...editItem, url: e.target.value })} /></div>
              <div><Label>Image URL</Label><Input value={editItem.image_url || ""} onChange={(e) => setEditItem({ ...editItem, image_url: e.target.value })} /></div>
              <div className="flex items-center gap-2">
                <Switch checked={editItem.is_visible ?? true} onCheckedChange={(v) => setEditItem({ ...editItem, is_visible: v })} />
                <Label>Visible on homepage</Label>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>{saving ? "Saving..." : "Save"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete News?</DialogTitle>
            <DialogDescription>Are you sure you want to delete "<strong>{deleteTarget?.title}</strong>"?</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
