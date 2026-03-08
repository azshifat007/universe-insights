import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap, TrendingUp, Globe, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Stats {
  totalUniversities: number;
  avgScore: number;
  totalCountries: number;
  recentUpdates: number;
}

export function OverviewTab() {
  const [stats, setStats] = useState<Stats>({ totalUniversities: 0, avgScore: 0, totalCountries: 0, recentUpdates: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      const { data: unis } = await supabase.from("universities").select("*");
      if (unis) {
        const countries = new Set(unis.map((u: any) => u.country));
        const scores = unis.map((u: any) => {
          const pillars = [u.academic_reputation, u.citations_per_faculty, u.employer_reputation, u.faculty_student_ratio, u.international_research_network, u.employment_outcomes, u.sustainability, u.international_diversity];
          return pillars.reduce((a: number, b: number) => a + (b || 0), 0) / 8;
        });
        const avgScore = scores.length > 0 ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10 : 0;
        const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
        const recent = unis.filter((u: any) => u.updated_at > oneWeekAgo).length;
        setStats({ totalUniversities: unis.length, avgScore, totalCountries: countries.size, recentUpdates: recent });
      }
      setLoading(false);
    };
    fetchStats();
  }, []);

  const cards = [
    { title: "Total Universities", value: stats.totalUniversities, icon: GraduationCap, color: "text-secondary" },
    { title: "Average Score", value: stats.avgScore, icon: TrendingUp, color: "text-secondary" },
    { title: "Countries", value: stats.totalCountries, icon: Globe, color: "text-secondary" },
    { title: "Recent Updates", value: stats.recentUpdates, icon: Clock, color: "text-secondary" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-foreground">Dashboard Overview</h2>
        <p className="text-muted-foreground text-sm mt-1">Key metrics for your university analytics platform.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => (
          <Card key={card.title} className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{card.title}</CardTitle>
              <card.icon className={`h-5 w-5 ${card.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold font-display">
                {loading ? "..." : card.value}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
