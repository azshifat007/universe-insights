import { useState, useCallback, useMemo, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { generateUniversities, refreshScores, SUBJECTS, REGION_MAP } from "@/data/universities";
import type { PillarKey, University } from "@/data/universities";
import { fetchAlgorithmWeights, calculateWeightedScore } from "@/lib/algorithmWeights";
import Navbar from "@/components/Navbar";
import DashboardFooter from "@/components/DashboardFooter";
import FilterSidebar from "@/components/FilterSidebar";
import RankingTable from "@/components/RankingTable";
import RankingTableSkeleton from "@/components/RankingTableSkeleton";
import AnalyticsCharts from "@/components/AnalyticsCharts";
import {
  Wrench, Monitor, Stethoscope, Briefcase, Palette, FlaskConical,
  Cpu, Scale, Atom, BookOpen, Calculator, Wheat, Users, TrendingUp,
  Building2, Leaf, Pill, Globe, GraduationCap,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

// Synonyms / keyword groups so subject filtering is broad and useful
const SUBJECT_KEYWORDS: Record<string, string[]> = {
  "Engineering": ["engineering", "technology", "architecture", "eee"],
  "Computer Science": ["computer", "cs", "ai", "technology", "engineering & cs", "data"],
  "Medicine": ["medicine", "medical", "health", "pharmacy", "life sciences", "veterinary"],
  "Business": ["business", "economics", "management", "finance"],
  "Arts & Humanities": ["arts", "humanities", "liberal", "philosophy", "media"],
  "Natural Sciences": ["natural sciences", "sciences", "physics", "chemistry", "biology"],
  "Technology": ["technology", "engineering", "computer", "ai"],
  "Law": ["law", "governance", "legal"],
  "Sciences": ["sciences", "science", "physics", "mathematics"],
  "Humanities": ["humanities", "arts", "philosophy", "social sciences"],
  "Mathematics": ["mathematics", "math", "physics"],
  "Agriculture": ["agriculture", "veterinary", "agricultural"],
  "Social Sciences": ["social sciences", "governance", "development", "humanities"],
  "Economics": ["economics", "business", "finance"],
  "Architecture": ["architecture", "engineering"],
  "Environmental": ["environmental", "sustainability", "energy", "marine"],
  "Pharmacy": ["pharmacy", "medicine", "health"],
};

const matchesSubject = (focus: string, subject: string) => {
  const f = focus.toLowerCase();
  return (SUBJECT_KEYWORDS[subject] ?? [subject.toLowerCase()]).some((kw) => f.includes(kw));
};

const SUBJECT_ICONS: Record<string, LucideIcon> = {
  "Engineering": Wrench,
  "Computer Science": Monitor,
  "Medicine": Stethoscope,
  "Business": Briefcase,
  "Arts & Humanities": Palette,
  "Natural Sciences": FlaskConical,
  "Technology": Cpu,
  "Law": Scale,
  "Sciences": Atom,
  "Humanities": BookOpen,
  "Mathematics": Calculator,
  "Agriculture": Wheat,
  "Social Sciences": Users,
  "Economics": TrendingUp,
  "Architecture": Building2,
  "Environmental": Leaf,
  "Pharmacy": Pill,
};
import ComparisonModal from "@/components/ComparisonModal";
import UniversityLogo from "@/components/UniversityLogo";

const Rankings = () => {
  const [searchParams] = useSearchParams();
  const [universities, setUniversities] = useState<ReturnType<typeof generateUniversities> | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [country, setCountry] = useState("all");
  const [region, setRegion] = useState(searchParams.get("region") || "all");
  const [researchFocus, setResearchFocus] = useState("all");
  const [minScore, setMinScore] = useState(0);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);

  // Deferred initial load — fetch dynamic weights and apply them, with a timeout fallback
  useEffect(() => {
    let cancelled = false;
    const baseUnis = generateUniversities();

    // Safety net: if anything stalls, render with base scores after 5s
    const fallbackTimer = setTimeout(() => {
      if (!cancelled) {
        setUniversities((prev) => prev ?? baseUnis);
      }
    }, 5000);

    const init = async () => {
      try {
        const weightsPromise = fetchAlgorithmWeights();
        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("weights-timeout")), 4000)
        );
        const weights = await Promise.race([weightsPromise, timeoutPromise]);
        if (cancelled) return;
        const reweighted = baseUnis.map((u) => ({
          ...u,
          overallScore: calculateWeightedScore(u.pillars, weights),
        }));
        reweighted.sort((a, b) => b.overallScore - a.overallScore);
        reweighted.forEach((u, i) => (u.rank = i + 1));
        setUniversities(reweighted);
      } catch {
        if (!cancelled) setUniversities(baseUnis);
      }
    };
    init();

    return () => {
      cancelled = true;
      clearTimeout(fallbackTimer);
    };
  }, []);

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    setTimeout(() => {
      setUniversities((prev) => prev ? refreshScores(prev) : prev);
      setIsRefreshing(false);
    }, 600);
  }, []);

  const filtered = useMemo(
    () => (universities ?? []).filter((u) => {
      if (region !== "all" && REGION_MAP[u.country] !== region) return false;
      if (country !== "all" && u.country !== country) return false;
      if (researchFocus !== "all" && u.researchFocus !== researchFocus) return false;
      if (u.overallScore < minScore) return false;
      return true;
    }),
    [universities, country, region, researchFocus, minScore]
  );

  const loading = universities === null;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 w-full flex-1">
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-display text-2xl font-bold">Rankings</h1>
          {!loading && <ComparisonModal universities={universities} />}
        </div>

        <Tabs defaultValue="global" className="space-y-6">
          <TabsList className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl">
            <TabsTrigger value="global" className="gap-2"><Globe className="h-4 w-4" /> Global</TabsTrigger>
            <TabsTrigger value="subject" className="gap-2"><GraduationCap className="h-4 w-4" /> By Subject</TabsTrigger>
            <TabsTrigger value="sustainability" className="gap-2"><Leaf className="h-4 w-4" /> Sustainability</TabsTrigger>
          </TabsList>

          <TabsContent value="global">
            <div className="flex flex-col lg:flex-row gap-6">
              <FilterSidebar country={country} researchFocus={researchFocus} minScore={minScore} region={region} onCountryChange={setCountry} onResearchFocusChange={setResearchFocus} onMinScoreChange={setMinScore} onRegionChange={setRegion} />
              <div className="flex-1 min-w-0 space-y-8">
                {loading ? (
                  <RankingTableSkeleton />
                ) : (
                  <RankingTable universities={filtered} onRefresh={handleRefresh} isRefreshing={isRefreshing} />
                )}
                {!loading && <AnalyticsCharts universities={filtered} />}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="subject">
            <div className="glass-card rounded-lg p-8">
              <h3 className="font-display text-lg font-bold mb-4">Rankings by Subject</h3>
              {!selectedSubject ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {SUBJECTS.map((subj) => {
                    const count = (universities ?? []).filter((u) => matchesSubject(u.researchFocus, subj)).length;
                    const Icon = SUBJECT_ICONS[subj];
                    return (
                      <div
                        key={subj}
                        onClick={() => setSelectedSubject(subj)}
                        className="p-4 rounded-lg bg-muted/50 border border-border hover:border-secondary/50 hover:bg-secondary/5 transition-all duration-200 cursor-pointer group hover:scale-105 hover:shadow-lg hover:-translate-y-0.5"
                      >
                        <div className="flex items-center gap-2 mb-1">
                          {Icon && <Icon className="h-4 w-4 text-muted-foreground group-hover:text-secondary transition-colors" />}
                          <p className="font-medium text-sm group-hover:text-secondary transition-colors">{subj}</p>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {count || "—"} universities
                        </p>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div>
                  <button
                    onClick={() => setSelectedSubject(null)}
                    className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
                  >
                    ← Back to all subjects
                  </button>
                  <h4 className="font-display text-base font-bold mb-3">{selectedSubject}</h4>
                  <div className="space-y-2">
                    {(universities ?? [])
                      .filter((u) => matchesSubject(u.researchFocus, selectedSubject))
                      .sort((a, b) => b.overallScore - a.overallScore)
                      .map((u, i) => (
                        <Link
                          key={u.id}
                          to={`/university/${u.id}`}
                          className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50 hover:border-secondary/50 hover:bg-secondary/5 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <span className="font-display font-bold text-primary w-8">{i + 1}</span>
                            <UniversityLogo domain={u.domain} name={u.name} />
                            <div>
                              <p className="text-sm font-medium">{u.name}</p>
                              <p className="text-xs text-muted-foreground">{u.city}, {u.country}</p>
                            </div>
                          </div>
                          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-secondary/15 text-secondary">
                            {u.overallScore.toFixed(1)}
                          </span>
                        </Link>
                      ))}
                    {(universities ?? []).filter((u) => matchesSubject(u.researchFocus, selectedSubject)).length === 0 && (
                      <p className="text-sm text-muted-foreground py-4 text-center">No universities found for this subject.</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="sustainability">
            <div className="glass-card rounded-lg p-8">
              <h3 className="font-display text-lg font-bold mb-4">🌱 Sustainability Rankings</h3>
              <div className="space-y-3">
                {[...(universities ?? [])].sort((a, b) => b.pillars.sustainability - a.pillars.sustainability).map((u, i) => (
                  <div key={u.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50">
                    <div className="flex items-center gap-3">
                      <span className="font-display font-bold text-primary w-8">{i + 1}</span>
                      <UniversityLogo domain={u.domain} name={u.name} />
                      <div>
                        <p className="text-sm font-medium">{u.name}</p>
                        <p className="text-xs text-muted-foreground">{u.country}</p>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-secondary/15 text-secondary">
                      {u.pillars.sustainability.toFixed(1)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
      <DashboardFooter />
    </div>
  );
};

export default Rankings;
