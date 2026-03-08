import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GraduationCap, TrendingUp, Globe, Clock, Database } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { generateUniversities } from "@/data/universities";

interface Stats {
  totalUniversities: number;
  avgScore: number;
  totalCountries: number;
  recentUpdates: number;
}

export function OverviewTab() {
  const [stats, setStats] = useState<Stats>({ totalUniversities: 0, avgScore: 0, totalCountries: 0, recentUpdates: 0 });
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const { toast } = useToast();

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

  useEffect(() => { fetchStats(); }, []);

  const handleSeedUniversities = async () => {
    setSeeding(true);
    try {
      const universities = generateUniversities();
      // Deduplicate by id (used as slug) — keep first occurrence
      const seen = new Set<string>();
      const deduped = universities.filter((u) => {
        if (seen.has(u.id)) return false;
        seen.add(u.id);
        return true;
      });
      const batch = deduped.map((u) => ({
        slug: u.id,
        name: u.name,
        country: u.country,
        city: u.city,
        founded: u.founded,
        students: u.students,
        research_focus: u.researchFocus,
        domain: u.domain,
        academic_reputation: u.pillars.academicReputation,
        citations_per_faculty: u.pillars.citationsPerFaculty,
        employer_reputation: u.pillars.employerReputation,
        faculty_student_ratio: u.pillars.facultyStudentRatio,
        international_research_network: u.pillars.internationalResearchNetwork,
        employment_outcomes: u.pillars.employmentOutcomes,
        sustainability: u.pillars.sustainability,
        international_diversity: u.pillars.internationalDiversity,
        highlights: u.highlights,
        is_active: true,
      }));

      const { data, error } = await supabase.functions.invoke("seed-universities", {
        body: { batch },
      });

      if (error) throw error;
      toast({ title: "Universities Synced!", description: data?.message || `Imported ${batch.length} universities.` });
      fetchStats();
    } catch (err: any) {
      toast({ title: "Seeding failed", description: err.message, variant: "destructive" });
    }
    setSeeding(false);
  };

  const cards = [
    { title: "Total Universities", value: stats.totalUniversities, icon: GraduationCap, color: "text-secondary" },
    { title: "Average Score", value: stats.avgScore, icon: TrendingUp, color: "text-secondary" },
    { title: "Countries", value: stats.totalCountries, icon: Globe, color: "text-secondary" },
    { title: "Recent Updates", value: stats.recentUpdates, icon: Clock, color: "text-secondary" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-display text-2xl font-bold text-foreground">Dashboard Overview</h2>
          <p className="text-muted-foreground text-sm mt-1">Key metrics for your university analytics platform.</p>
        </div>
        <Button onClick={handleSeedUniversities} disabled={seeding} variant="outline" className="border-secondary/30 text-secondary hover:bg-secondary/10">
          <Database className="h-4 w-4 mr-1" />
          {seeding ? "Syncing..." : stats.totalUniversities === 0 ? "Seed Universities from Static Data" : `Sync All (${stats.totalUniversities} in DB)`}
        </Button>
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
