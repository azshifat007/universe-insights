import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Download, Search, Database, Globe, BookOpen, FileSpreadsheet, ExternalLink, ChevronLeft, ChevronRight } from "lucide-react";

const ITEMS_PER_PAGE = 25;

const DATA_SOURCES = [
  {
    name: "QS World University Rankings 2026",
    url: "https://www.topuniversities.com/world-university-rankings",
    description: "Academic Reputation, Employer Reputation, Faculty-Student Ratio, Citations per Faculty, International metrics",
    pillars: ["Academic Reputation", "Employer Reputation", "Faculty-Student Ratio", "Citations per Faculty", "International Diversity"],
  },
  {
    name: "Times Higher Education (THE)",
    url: "https://www.timeshighereducation.com/world-university-rankings",
    description: "Cross-referenced for teaching quality, research output, and citation impact",
    pillars: ["Citations per Faculty", "Employment Outcomes"],
  },
  {
    name: "University Grants Commission (UGC), Bangladesh",
    url: "http://www.ugc.gov.bd",
    description: "Official data for Bangladeshi universities — enrollment, founding year, accreditation status",
    pillars: ["Student Count", "Founded Year", "City"],
  },
  {
    name: "Scimago Institutions Rankings",
    url: "https://www.scimagoir.com",
    description: "International Research Network scores and research collaboration data",
    pillars: ["International Research Network"],
  },
  {
    name: "THE Impact Rankings (SDGs)",
    url: "https://www.timeshighereducation.com/impactrankings",
    description: "Sustainability and ESG/SDG commitment scores",
    pillars: ["Sustainability"],
  },
];

export function RawDataTab() {
  const [search, setSearch] = useState("");
  const [countryFilter, setCountryFilter] = useState("all");

  const [page, setPage] = useState(1);

  const { data: universities, isLoading } = useQuery({
    queryKey: ["admin-raw-universities"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("universities")
        .select("*")
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  const countries = useMemo(() => {
    if (!universities) return [];
    return [...new Set(universities.map((u) => u.country))].sort();
  }, [universities]);

  const filtered = useMemo(() => {
    if (!universities) return [];
    const result = universities.filter((u) => {
      const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.city.toLowerCase().includes(search.toLowerCase()) ||
        u.slug.toLowerCase().includes(search.toLowerCase());
      const matchCountry = countryFilter === "all" || u.country === countryFilter;
      return matchSearch && matchCountry;
    });
    setPage(1);
    return result;
  }, [universities, search, countryFilter]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const exportCSV = () => {
    if (!filtered.length) return;
    const headers = [
      "Name", "Slug", "Country", "City", "Founded", "Students", "Domain",
      "Research Focus", "Academic Reputation", "Citations/Faculty",
      "Employer Reputation", "Faculty-Student Ratio", "Intl Research Network",
      "Employment Outcomes", "Sustainability", "Intl Diversity", "Active",
    ];
    const rows = filtered.map((u) => [
      `"${u.name}"`, u.slug, u.country, `"${u.city}"`, u.founded ?? "",
      u.students ?? "", u.domain ?? "", `"${u.research_focus ?? ""}"`,
      u.academic_reputation ?? "", u.citations_per_faculty ?? "",
      u.employer_reputation ?? "", u.faculty_student_ratio ?? "",
      u.international_research_network ?? "", u.employment_outcomes ?? "",
      u.sustainability ?? "", u.international_diversity ?? "",
      u.is_active ? "Yes" : "No",
    ]);
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `universities_raw_data_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Data Sources Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            Data Sources & Methodology
          </CardTitle>
          <CardDescription>
            All university data is compiled from multiple authoritative sources and cross-referenced for accuracy.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {DATA_SOURCES.map((source) => (
              <div key={source.name} className="rounded-lg border bg-card p-4 space-y-2">
                <div className="flex items-start justify-between">
                  <h4 className="font-semibold text-sm">{source.name}</h4>
                  <a href={source.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary/80">
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
                <p className="text-xs text-muted-foreground">{source.description}</p>
                <div className="flex flex-wrap gap-1">
                  {source.pillars.map((p) => (
                    <Badge key={p} variant="secondary" className="text-[10px]">{p}</Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Raw Data Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5 text-primary" />
                Raw University Data
              </CardTitle>
              <CardDescription>
                {filtered.length} of {universities?.length ?? 0} universities
                {countryFilter !== "all" && ` in ${countryFilter}`}
              </CardDescription>
            </div>
            <Button onClick={exportCSV} variant="outline" size="sm" className="gap-2">
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, city, or slug..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={countryFilter} onValueChange={setCountryFilter}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <Globe className="h-4 w-4 mr-2 text-muted-foreground" />
                <SelectValue placeholder="All Countries" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Countries</SelectItem>
                {countries.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="sticky left-0 bg-background z-10 min-w-[200px]">Name</TableHead>
                  <TableHead>Country</TableHead>
                  <TableHead>City</TableHead>
                  <TableHead className="text-right">Founded</TableHead>
                  <TableHead className="text-right">Students</TableHead>
                  <TableHead>Domain</TableHead>
                  <TableHead className="text-right">Acad. Rep.</TableHead>
                  <TableHead className="text-right">Citations</TableHead>
                  <TableHead className="text-right">Empl. Rep.</TableHead>
                  <TableHead className="text-right">Fac/Stu</TableHead>
                  <TableHead className="text-right">Intl Res.</TableHead>
                  <TableHead className="text-right">Empl. Out.</TableHead>
                  <TableHead className="text-right">Sustain.</TableHead>
                  <TableHead className="text-right">Intl Div.</TableHead>
                  <TableHead className="text-center">Active</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell className="sticky left-0 bg-background z-10 font-medium">{u.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs whitespace-nowrap">{u.country}</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">{u.city}</TableCell>
                    <TableCell className="text-right text-sm">{u.founded ?? "—"}</TableCell>
                    <TableCell className="text-right text-sm">{u.students?.toLocaleString() ?? "—"}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{u.domain ?? "—"}</TableCell>
                    <TableCell className="text-right text-sm font-mono">{u.academic_reputation ?? "—"}</TableCell>
                    <TableCell className="text-right text-sm font-mono">{u.citations_per_faculty ?? "—"}</TableCell>
                    <TableCell className="text-right text-sm font-mono">{u.employer_reputation ?? "—"}</TableCell>
                    <TableCell className="text-right text-sm font-mono">{u.faculty_student_ratio ?? "—"}</TableCell>
                    <TableCell className="text-right text-sm font-mono">{u.international_research_network ?? "—"}</TableCell>
                    <TableCell className="text-right text-sm font-mono">{u.employment_outcomes ?? "—"}</TableCell>
                    <TableCell className="text-right text-sm font-mono">{u.sustainability ?? "—"}</TableCell>
                    <TableCell className="text-right text-sm font-mono">{u.international_diversity ?? "—"}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant={u.is_active ? "default" : "secondary"} className="text-xs">
                        {u.is_active ? "Yes" : "No"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={15} className="text-center py-8 text-muted-foreground">
                      <FileSpreadsheet className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      No universities match your filters.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
