import { useState, useCallback, useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { generateUniversities, refreshScores, SUBJECTS } from "@/data/universities";
import Navbar from "@/components/Navbar";
import DashboardFooter from "@/components/DashboardFooter";
import FilterSidebar from "@/components/FilterSidebar";
import RankingTable from "@/components/RankingTable";
import AnalyticsCharts from "@/components/AnalyticsCharts";
import ComparisonModal from "@/components/ComparisonModal";

const Rankings = () => {
  const [universities, setUniversities] = useState(generateUniversities);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [country, setCountry] = useState("all");
  const [researchFocus, setResearchFocus] = useState("all");
  const [minScore, setMinScore] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    setTimeout(() => {
      setUniversities((prev) => refreshScores(prev));
      setIsRefreshing(false);
    }, 600);
  }, []);

  const filtered = useMemo(
    () => universities.filter((u) => {
      if (country !== "all" && u.country !== country) return false;
      if (researchFocus !== "all" && u.researchFocus !== researchFocus) return false;
      if (u.overallScore < minScore) return false;
      return true;
    }),
    [universities, country, researchFocus, minScore]
  );

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 w-full flex-1">
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-display text-2xl font-bold">Rankings</h1>
          <ComparisonModal universities={universities} />
        </div>

        <Tabs defaultValue="global" className="space-y-6">
          <TabsList className="bg-muted">
            <TabsTrigger value="global">🌍 Global</TabsTrigger>
            <TabsTrigger value="subject">📚 By Subject</TabsTrigger>
            <TabsTrigger value="sustainability">🌱 Sustainability</TabsTrigger>
          </TabsList>

          <TabsContent value="global">
            <div className="flex flex-col lg:flex-row gap-6">
              <FilterSidebar country={country} researchFocus={researchFocus} minScore={minScore} onCountryChange={setCountry} onResearchFocusChange={setResearchFocus} onMinScoreChange={setMinScore} />
              <div className="flex-1 min-w-0 space-y-8">
                <RankingTable universities={filtered} onRefresh={handleRefresh} isRefreshing={isRefreshing} />
                <AnalyticsCharts universities={filtered} />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="subject">
            <div className="glass-card rounded-lg p-8">
              <h3 className="font-display text-lg font-bold mb-4">Rankings by Subject</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {SUBJECTS.map((subj) => (
                  <div key={subj} className="p-4 rounded-lg bg-muted/50 border border-border hover:border-secondary/50 transition-colors cursor-pointer">
                    <p className="font-medium text-sm">{subj}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {universities.filter((u) => u.researchFocus.toLowerCase().includes(subj.toLowerCase().split(" ")[0])).length || "—"} universities
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="sustainability">
            <div className="glass-card rounded-lg p-8">
              <h3 className="font-display text-lg font-bold mb-4">🌱 Sustainability Rankings</h3>
              <div className="space-y-3">
                {[...universities].sort((a, b) => b.pillars.sustainability - a.pillars.sustainability).map((u, i) => (
                  <div key={u.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50">
                    <div className="flex items-center gap-3">
                      <span className="font-display font-bold text-primary w-8">{i + 1}</span>
                      <div>
                        <p className="text-sm font-medium">{u.logo} {u.name}</p>
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
