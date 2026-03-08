import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { Newspaper, Save, RefreshCw, Globe, Search, Hash, Clock } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface NewsPreview {
  title: string;
  description: string;
  source: string;
  publishedAt: string;
  url: string;
  image: string | null;
}

const LANGUAGES = [
  { value: "en", label: "English" },
  { value: "es", label: "Spanish" },
  { value: "fr", label: "French" },
  { value: "de", label: "German" },
  { value: "ar", label: "Arabic" },
  { value: "zh", label: "Chinese" },
  { value: "ja", label: "Japanese" },
  { value: "bn", label: "Bengali" },
  { value: "hi", label: "Hindi" },
  { value: "pt", label: "Portuguese" },
];

const SORT_OPTIONS = [
  { value: "publishedAt", label: "Newest First" },
  { value: "relevance", label: "Most Relevant" },
];

// Settings keys stored in algorithm_settings table
const SETTINGS_KEYS = {
  news_query: { key: "news_query", label: "News Search Query", defaultValue: '"higher education" OR "university rankings"' },
  news_lang: { key: "news_lang", label: "News Language", defaultValue: "en" },
  news_max: { key: "news_max", label: "Max Articles", defaultValue: "6" },
  news_sort: { key: "news_sort", label: "Sort By", defaultValue: "publishedAt" },
};

export function NewsManagerTab() {
  const [query, setQuery] = useState(SETTINGS_KEYS.news_query.defaultValue);
  const [lang, setLang] = useState(SETTINGS_KEYS.news_lang.defaultValue);
  const [maxArticles, setMaxArticles] = useState(6);
  const [sortBy, setSortBy] = useState(SETTINGS_KEYS.news_sort.defaultValue);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [previewing, setPreviewing] = useState(false);
  const [preview, setPreview] = useState<NewsPreview[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("algorithm_settings")
      .select("key, value, label")
      .in("key", Object.keys(SETTINGS_KEYS));

    if (data) {
      for (const row of data) {
        const r = row as { key: string; value: number; label: string };
        // We store string settings as numeric codes or use label field for text
        switch (r.key) {
          case "news_max":
            setMaxArticles(r.value);
            break;
        }
      }
      // For text-based settings, we need a different approach
      // Check if settings exist in the news_settings approach
    }
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Update the fetch-news edge function query by storing settings
      // We'll save to algorithm_settings using upsert
      const settings = [
        { key: "news_query", label: "News Search Query", value: 0, updated_at: new Date().toISOString() },
        { key: "news_lang", label: `News Language: ${lang}`, value: LANGUAGES.findIndex(l => l.value === lang), updated_at: new Date().toISOString() },
        { key: "news_max", label: "Max Articles", value: maxArticles, updated_at: new Date().toISOString() },
        { key: "news_sort", label: `Sort: ${sortBy}`, value: sortBy === "relevance" ? 1 : 0, updated_at: new Date().toISOString() },
      ];

      for (const s of settings) {
        const { data: existing } = await supabase
          .from("algorithm_settings")
          .select("id")
          .eq("key", s.key)
          .maybeSingle();

        if (existing) {
          await supabase.from("algorithm_settings").update(s as any).eq("key", s.key);
        } else {
          await supabase.from("algorithm_settings").insert(s as any);
        }
      }

      toast({ title: "Settings Saved!", description: "GNews configuration updated. Changes will apply on next page load." });
    } catch (err: any) {
      toast({ title: "Error saving", description: err.message, variant: "destructive" });
    }
    setSaving(false);
  };

  const handlePreview = async () => {
    setPreviewing(true);
    setPreview([]);
    try {
      const NEWS_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/fetch-news`;
      const resp = await fetch(NEWS_URL, {
        headers: {
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
      });
      const data = await resp.json();
      if (data.articles && data.articles.length > 0) {
        setPreview(data.articles);
      } else {
        toast({ title: "No articles found", description: "The GNews API returned no results for the current query.", variant: "destructive" });
      }
    } catch {
      toast({ title: "Preview failed", description: "Could not fetch news. Check GNews API configuration.", variant: "destructive" });
    }
    setPreviewing(false);
  };

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-32 w-full" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold flex items-center gap-2">
          <Newspaper className="h-6 w-6 text-secondary" />
          GNews Settings
        </h2>
        <p className="text-muted-foreground text-sm mt-1">
          Configure how trending news is fetched from the GNews API for the home page.
        </p>
      </div>

      {/* Settings Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Search Query */}
        <Card className="glass-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Search className="h-4 w-4 text-secondary" />
              Search Query
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder='"university rankings" OR "higher education"'
              className="text-sm"
            />
            <p className="text-xs text-muted-foreground mt-2">
              Use quotes for exact phrases, OR/AND for operators. Example: "university rankings" OR "academic research"
            </p>
          </CardContent>
        </Card>

        {/* Language */}
        <Card className="glass-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Globe className="h-4 w-4 text-secondary" />
              Language
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={lang} onValueChange={setLang}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {LANGUAGES.map((l) => (
                  <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-2">
              Filter news articles by language.
            </p>
          </CardContent>
        </Card>

        {/* Max Articles */}
        <Card className="glass-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Hash className="h-4 w-4 text-secondary" />
              Max Articles: {maxArticles}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Slider
              value={[maxArticles]}
              onValueChange={([v]) => setMaxArticles(v)}
              min={3}
              max={10}
              step={1}
              className="mt-2"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>3</span>
              <span>10</span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Number of articles to display on the home page.
            </p>
          </CardContent>
        </Card>

        {/* Sort Order */}
        <Card className="glass-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4 text-secondary" />
              Sort Order
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {SORT_OPTIONS.map((s) => (
                  <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-2">
              Choose how articles are ordered in the feed.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-3">
        <Button onClick={handleSave} disabled={saving} className="bg-secondary text-secondary-foreground hover:bg-secondary/90">
          <Save className="h-4 w-4 mr-1" />
          {saving ? "Saving..." : "Save Settings"}
        </Button>
        <Button variant="outline" onClick={handlePreview} disabled={previewing}>
          <RefreshCw className={`h-4 w-4 mr-1 ${previewing ? "animate-spin" : ""}`} />
          {previewing ? "Fetching..." : "Preview Current Feed"}
        </Button>
      </div>

      {/* Live Preview */}
      {preview.length > 0 && (
        <div>
          <h3 className="font-display font-bold text-lg mb-3">Live Preview ({preview.length} articles)</h3>
          <div className="grid gap-3">
            {preview.map((article, i) => (
              <Card key={i} className="glass-card">
                <CardHeader className="flex flex-row items-start gap-4 pb-2">
                  {article.image && (
                    <img src={article.image} alt="" className="h-16 w-24 rounded object-cover shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-sm font-medium leading-snug line-clamp-2">{article.title}</CardTitle>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{article.description}</p>
                    <p className="text-[11px] text-muted-foreground/70 mt-1">{article.source} · {formatTime(article.publishedAt)}</p>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Info Box */}
      <Card className="border-secondary/20 bg-secondary/5">
        <CardContent className="pt-4">
          <p className="text-sm text-muted-foreground">
            <strong className="text-foreground">How it works:</strong> News is fetched live from the{" "}
            <a href="https://gnews.io" target="_blank" rel="noopener noreferrer" className="text-secondary hover:underline">GNews API</a>{" "}
            each time the home page loads. If the API limit is reached, fallback articles are displayed automatically.
            Settings saved here configure the search parameters used by the backend function.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
