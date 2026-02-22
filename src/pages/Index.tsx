import { useState, useCallback, useMemo } from "react";
import { BarChart3, Menu, X } from "lucide-react";
import { generateUniversities, refreshScores } from "@/data/universities";
import FilterSidebar from "@/components/FilterSidebar";
import RankingTable from "@/components/RankingTable";
import AnalyticsCharts from "@/components/AnalyticsCharts";
import DashboardFooter from "@/components/DashboardFooter";
import { Button } from "@/components/ui/button";

const Index = () => {
  const [universities, setUniversities] = useState(generateUniversities);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [country, setCountry] = useState("all");
  const [researchFocus, setResearchFocus] = useState("all");
  const [minScore, setMinScore] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    setTimeout(() => {
      setUniversities((prev) => refreshScores(prev));
      setIsRefreshing(false);
    }, 600);
  }, []);

  const filtered = useMemo(
    () =>
      universities.filter((u) => {
        if (country !== "all" && u.country !== country) return false;
        if (researchFocus !== "all" && u.researchFocus !== researchFocus) return false;
        if (u.overallScore < minScore) return false;
        return true;
      }),
    [universities, country, researchFocus, minScore]
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <header className="sticky top-0 z-30 bg-primary text-primary-foreground">
        <div className="max-w-[1440px] mx-auto flex items-center justify-between px-4 sm:px-6 h-14">
          <div className="flex items-center gap-3">
            <BarChart3 className="h-6 w-6 text-secondary" />
            <h1 className="font-display text-lg font-bold tracking-tight">Universe Analytics</h1>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden text-primary-foreground hover:bg-primary-foreground/10"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </header>

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar */}
          <div className={`${sidebarOpen ? "block" : "hidden"} lg:block`}>
            <FilterSidebar
              country={country}
              researchFocus={researchFocus}
              minScore={minScore}
              onCountryChange={setCountry}
              onResearchFocusChange={setResearchFocus}
              onMinScoreChange={setMinScore}
            />
          </div>

          {/* Main content */}
          <main className="flex-1 min-w-0 space-y-8">
            <RankingTable
              universities={filtered}
              onRefresh={handleRefresh}
              isRefreshing={isRefreshing}
            />
            <AnalyticsCharts universities={filtered} />
          </main>
        </div>

        <DashboardFooter />
      </div>
    </div>
  );
};

export default Index;
