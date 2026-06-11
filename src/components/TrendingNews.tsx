import { useState, useEffect } from "react";
import { Newspaper, ExternalLink, Clock } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface NewsArticle {
  title: string;
  description: string;
  url: string;
  image: string | null;
  publishedAt: string;
  source: string;
  category?: string;
}

const CATEGORIES = ["Research", "Rankings", "Campus Life", "Policy", "Innovation", "Global"];

const FALLBACK_NEWS: NewsArticle[] = [
  {
    title: "QS World University Rankings 2026: MIT Retains Top Spot for Record 15th Year",
    description: "Massachusetts Institute of Technology continues its unprecedented streak at the top of the global rankings, scoring perfect marks in academic and employer reputation.",
    url: "#",
    image: null,
    publishedAt: "2026-01-15T10:00:00Z",
    source: "QS Intelligence",
    category: "Rankings",
  },
  {
    title: "Global Shift: Asian Universities Make Historic Gains in Latest Rankings",
    description: "Universities from China, Singapore, and South Korea see significant improvements across research impact and international collaboration metrics.",
    url: "#",
    image: null,
    publishedAt: "2026-01-10T08:00:00Z",
    source: "Universe Analytics",
    category: "Rankings",
  },
  {
    title: "Sustainability Metrics Now Account for 5% of Overall University Scores",
    description: "The new sustainability pillar reflects growing emphasis on ESG commitments and SDG contributions in higher education assessment worldwide.",
    url: "#",
    image: null,
    publishedAt: "2025-12-20T12:00:00Z",
    source: "QS Methodology Update",
    category: "Research",
  },
];

function assignCategory(title: string): string {
  const t = title.toLowerCase();
  if (t.includes("research") || t.includes("study") || t.includes("discover")) return "Research";
  if (t.includes("rank") || t.includes("top") || t.includes("best")) return "Rankings";
  if (t.includes("campus") || t.includes("student") || t.includes("life")) return "Campus Life";
  if (t.includes("policy") || t.includes("government") || t.includes("law")) return "Policy";
  if (t.includes("ai") || t.includes("tech") || t.includes("innovat")) return "Innovation";
  return CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];
}

const CATEGORY_COLORS: Record<string, string> = {
  Research: "bg-blue-500/15 text-blue-700",
  Rankings: "bg-secondary/15 text-secondary",
  "Campus Life": "bg-purple-500/15 text-purple-700",
  Policy: "bg-amber-500/15 text-amber-700",
  Innovation: "bg-rose-500/15 text-rose-700",
  Global: "bg-teal-500/15 text-teal-700",
};

const NEWS_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/fetch-news`;

const TrendingNews = () => {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchedAt, setFetchedAt] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const resp = await fetch(NEWS_URL, {
          headers: {
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
        });
        const data = await resp.json();
        if (data.articles && data.articles.length > 0) {
          setArticles(
            data.articles.map((a: NewsArticle) => ({
              ...a,
              category: assignCategory(a.title),
            }))
          );
          setFetchedAt(data.fetchedAt);
        } else {
          setArticles(FALLBACK_NEWS);
          setFetchedAt(new Date().toISOString());
        }
      } catch {
        setArticles(FALLBACK_NEWS);
        setFetchedAt(new Date().toISOString());
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  if (loading) {
    return (
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12 w-full">
        <h2 className="font-display text-2xl font-bold text-center mb-2">Global Education Updates</h2>
        <p className="text-center text-sm text-muted-foreground mb-8">Trending university news from around the world</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass-card rounded-xl overflow-hidden">
              <Skeleton className="h-40 w-full" />
              <div className="p-5 space-y-3">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12 w-full">
      <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-2">
        <div className="text-center sm:text-left">
          <h2 className="font-display text-2xl font-bold flex items-center gap-2 justify-center sm:justify-start">
            <Newspaper className="h-6 w-6 text-secondary" />
            Global Education Updates
          </h2>
          <p className="text-sm text-muted-foreground mt-1">Trending university news from around the world</p>
        </div>
        {fetchedAt && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="h-3.5 w-3.5" />
            Last updated: {formatTime(fetchedAt)}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {articles.slice(0, 6).map((article, i) => (
          <a
            key={i}
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="glass-card rounded-xl overflow-hidden group transition-all duration-300 hover:shadow-xl hover:-translate-y-1.5 hover:scale-[1.02] flex flex-col"
          >
            {/* Thumbnail */}
            <div className="h-40 bg-muted relative overflow-hidden">
              {article.image ? (
                <img
                  src={article.image}
                  alt={article.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-primary/5">
                  <Newspaper className="h-10 w-10 text-muted-foreground/40" />
                </div>
              )}
              {/* Category badge */}
              {article.category && (
                <span
                  className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider backdrop-blur-sm ${
                    CATEGORY_COLORS[article.category] || "bg-muted text-muted-foreground"
                  }`}
                >
                  {article.category}
                </span>
              )}
            </div>

            {/* Content */}
            <div className="p-5 flex flex-col flex-1">
              <h3 className="font-display font-bold text-sm leading-snug line-clamp-2 group-hover:text-secondary transition-colors">
                {article.title}
              </h3>
              <p className="text-xs text-muted-foreground mt-2 line-clamp-2 flex-1">
                {article.description}
              </p>
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/50">
                <span className="text-[11px] text-muted-foreground">{article.source} · {formatTime(article.publishedAt)}</span>
                <span className="inline-flex items-center gap-1 text-xs font-medium text-secondary group-hover:underline">
                  Read More <ExternalLink className="h-3 w-3" />
                </span>
              </div>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
};

export default TrendingNews;
