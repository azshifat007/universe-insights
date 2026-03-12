import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Megaphone, AlertTriangle, Info } from "lucide-react";

const NOTICE_TYPES = ["Update", "Announcement", "Important"] as const;

const typeConfig: Record<string, { color: string; icon: typeof Info }> = {
  Update: { color: "bg-blue-500/10 text-blue-600 border-blue-500/20", icon: Info },
  Announcement: { color: "bg-secondary/10 text-secondary-foreground border-secondary/20", icon: Megaphone },
  Important: { color: "bg-destructive/10 text-destructive border-destructive/20", icon: AlertTriangle },
};

export function NoticeManagerTab() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [type, setType] = useState<string>("Announcement");

  const { data: notices = [], isLoading } = useQuery({
    queryKey: ["admin-notices"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("notices")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("notices").insert({ title, content, type });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-notices"] });
      queryClient.invalidateQueries({ queryKey: ["active-notices"] });
      queryClient.invalidateQueries({ queryKey: ["urgent-notice"] });
      setTitle("");
      setContent("");
      setType("Announcement");
      toast({ title: "Notice created" });
    },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase.from("notices").update({ is_active, updated_at: new Date().toISOString() }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-notices"] });
      queryClient.invalidateQueries({ queryKey: ["active-notices"] });
      queryClient.invalidateQueries({ queryKey: ["urgent-notice"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("notices").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-notices"] });
      queryClient.invalidateQueries({ queryKey: ["active-notices"] });
      queryClient.invalidateQueries({ queryKey: ["urgent-notice"] });
      toast({ title: "Notice deleted" });
    },
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" /> Create Notice
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="notice-title">Title</Label>
              <Input id="notice-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Notice headline…" />
            </div>
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {NOTICE_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="notice-content">Content</Label>
            <Textarea id="notice-content" value={content} onChange={(e) => setContent(e.target.value)} placeholder="Detailed description…" rows={4} />
          </div>
          <Button onClick={() => createMutation.mutate()} disabled={!title.trim() || !content.trim() || createMutation.isPending}>
            {createMutation.isPending ? "Saving…" : "Publish Notice"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>All Notices ({notices.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-muted-foreground text-sm">Loading…</p>
          ) : notices.length === 0 ? (
            <p className="text-muted-foreground text-sm">No notices yet.</p>
          ) : (
            <div className="space-y-3">
              {notices.map((notice) => {
                const cfg = typeConfig[notice.type] || typeConfig.Announcement;
                const Icon = cfg.icon;
                return (
                  <div key={notice.id} className="flex items-start gap-4 p-4 rounded-lg border bg-card">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className={cfg.color}>
                          <Icon className="h-3 w-3 mr-1" />{notice.type}
                        </Badge>
                        {!notice.is_active && <Badge variant="outline" className="text-muted-foreground">Unpublished</Badge>}
                      </div>
                      <h4 className="font-semibold truncate">{notice.title}</h4>
                      <p className="text-sm text-muted-foreground line-clamp-2">{notice.content}</p>
                      <p className="text-xs text-muted-foreground mt-1">{new Date(notice.created_at).toLocaleDateString()}</p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <Switch checked={notice.is_active} onCheckedChange={(checked) => toggleMutation.mutate({ id: notice.id, is_active: checked })} />
                      <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => deleteMutation.mutate(notice.id)}>
                        <Trash2 className="h-4 w-4" />
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
}
