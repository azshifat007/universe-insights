import { useState, useCallback, useMemo, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { generateUniversities, refreshScores, SUBJECTS, REGION_MAP } from "@/data/universities";
import Navbar from "@/components/Navbar";
import DashboardFooter from "@/components/DashboardFooter";
import FilterSidebar from "@/components/FilterSidebar";
import RankingTable from "@/components/RankingTable";
import RankingTableSkeleton from "@/components/RankingTableSkeleton";
import AnalyticsCharts from "@/components/AnalyticsCharts";
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

  // Deferred initial load to show skeleton first
  useEffect(() => {
    const id = requestIdleCallback?.(() => setUniversities(generateUniversities())) ??
      setTimeout(() => setUniversities(generateUniversities()), 0);
    return () => { typeof id === "number" && clearTimeout(id); };
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
          <TabsList className="bg-muted">
            <TabsTrigger value="global">🌍 Global</TabsTrigger>
            <TabsTrigger value="subject">📚 By Subject</TabsTrigger>
            <TabsTrigger value="sustainability">🌱 Sustainability</TabsTrigger>
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
                    const count = (universities ?? []).filter((u) => u.researchFocus.toLowerCase().includes(subj.toLowerCase().split(" ")[0])).length;
                    return (
                      <div
                        key={subj}
                        onClick={() => setSelectedSubject(subj)}
                        className="p-4 rounded-lg bg-muted/50 border border-border hover:border-secondary/50 hover:bg-secondary/5 transition-colors cursor-pointer group"
                      >
                        <p className="font-medium text-sm group-hover:text-secondary transition-colors">{subj}</p>
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
                      .filter((u) => u.researchFocus.toLowerCase().includes(selectedSubject.toLowerCase().split(" ")[0]))
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
                    {(universities ?? []).filter((u) => u.researchFocus.toLowerCase().includes(selectedSubject.toLowerCase().split(" ")[0])).length === 0 && (
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
