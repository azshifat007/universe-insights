import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Save } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface Setting {
  id: string;
  key: string;
  value: number;
  label: string;
}

export function AlgorithmSettingsTab() {
  const [settings, setSettings] = useState<Setting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from("algorithm_settings").select("*").order("key");
      if (data) setSettings(data as unknown as Setting[]);
      setLoading(false);
    };
    fetch();
  }, []);

  const total = settings.reduce((acc, s) => acc + s.value, 0);

  const handleSave = async () => {
    if (Math.abs(total - 100) > 0.1) {
      toast({ title: "Weights must sum to 100%", description: `Current total: ${total}%`, variant: "destructive" });
      return;
    }
    setSaving(true);
    for (const s of settings) {
      await supabase.from("algorithm_settings").update({ value: s.value, updated_at: new Date().toISOString() } as any).eq("id", s.id);
    }
    toast({ title: "Algorithm weights saved!" });
    setSaving(false);
  };

  if (loading) return <div className="space-y-4">{Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-display text-2xl font-bold">Algorithm Settings</h2>
          <p className="text-muted-foreground text-sm mt-1">Adjust the 8 QS-style pillar weights. Must sum to 100%.</p>
        </div>
        <div className="flex items-center gap-3">
          <span className={`text-sm font-mono font-bold ${Math.abs(total - 100) < 0.1 ? "text-secondary" : "text-destructive"}`}>
            Total: {total}%
          </span>
          <Button onClick={handleSave} disabled={saving}>
            <Save className="h-4 w-4 mr-1" />
            {saving ? "Saving..." : "Save Weights"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {settings.map((s) => (
          <Card key={s.id} className="glass-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">{s.label}</CardTitle>
              <CardDescription className="font-mono text-lg font-bold text-foreground">{s.value}%</CardDescription>
            </CardHeader>
            <CardContent>
              <Slider
                min={0} max={50} step={1}
                value={[s.value]}
                onValueChange={([v]) => setSettings(settings.map((x) => x.id === s.id ? { ...x, value: v } : x))}
              />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
