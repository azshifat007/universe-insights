import { ArrowUpDown, Search, RefreshCw, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import UniversityLogo from "@/components/UniversityLogo";
import type { University } from "@/data/universities";

const PAGE_SIZE = 20;

interface RankingTableProps {
  universities: University[];
  onRefresh: () => void;
  isRefreshing: boolean;
}

type SortKey = "overallScore" | "academicReputation" | "citationsPerFaculty" | "employerReputation";

const RankingTable = ({ universities, onRefresh, isRefreshing }: RankingTableProps) => {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("overallScore");
  const [sortAsc, setSortAsc] = useState(false);
  const [page, setPage] = useState(1);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(false); }
    setPage(1);
  };

  const getValue = (u: University, key: SortKey) =>
    key === "overallScore" ? u.overallScore : u.pillars[key];

  // Search across the FULL dataset, then sort
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    const list = q
      ? universities.filter((u) => u.name.toLowerCase().includes(q) || u.country.toLowerCase().includes(q))
      : universities;
    return [...list].sort((a, b) =>
      sortAsc ? getValue(a, sortKey) - getValue(b, sortKey) : getValue(b, sortKey) - getValue(a, sortKey)
    );
  }, [universities, search, sortKey, sortAsc]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageData = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const startRank = (safePage - 1) * PAGE_SIZE;

  // Reset page when search changes
  const handleSearch = (v: string) => { setSearch(v); setPage(1); };

  const SortHeader = ({ label, field }: { label: string; field: SortKey }) => (
    <TableHead
      className="cursor-pointer select-none hover:bg-muted/50 transition-colors text-xs uppercase tracking-wider font-semibold"
      onClick={() => handleSort(field)}
    >
      <span className="flex items-center gap-1">
        {label}
        <ArrowUpDown className="h-3 w-3 text-muted-foreground" />
      </span>
    </TableHead>
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h2 className="font-display text-xl font-bold">Live Ranking Table</h2>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-secondary/15 text-secondary">
            <span className="relative flex h-2 w-2">
              <span className="pulse-live absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-secondary"></span>
            </span>
            REAL-TIME
          </span>
          <span className="text-xs text-muted-foreground">{filtered.length} universities</span>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search all universities..." value={search} onChange={(e) => handleSearch(e.target.value)} className="pl-9" />
          </div>
          <Button onClick={onRefresh} disabled={isRefreshing} variant="outline" size="sm" className="border-secondary/30 text-secondary hover:bg-secondary/10 shrink-0">
            <RefreshCw className={`h-4 w-4 mr-1.5 ${isRefreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      <div className="glass-card rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-primary/5 border-b border-border">
                <TableHead className="text-xs uppercase tracking-wider font-semibold w-16">Rank</TableHead>
                <TableHead className="text-xs uppercase tracking-wider font-semibold">University</TableHead>
                <SortHeader label="Academic" field="academicReputation" />
                <SortHeader label="Citations" field="citationsPerFaculty" />
                <SortHeader label="Employer" field="employerReputation" />
                <SortHeader label="Overall" field="overallScore" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {pageData.map((u, i) => (
                <TableRow key={u.id} className="table-row-enter hover:bg-muted/30 hover:shadow-md hover:scale-[1.01] hover:-translate-y-px transition-all duration-200" style={{ animationDelay: `${i * 20}ms` }}>
                  <TableCell className="font-display font-bold text-primary">{startRank + i + 1}</TableCell>
                  <TableCell>
                    <Link to={`/university/${u.id}`} className="group flex items-center gap-3">
                      <UniversityLogo domain={u.domain} name={u.name} />
                      <div>
                        <div className="font-medium text-sm group-hover:text-secondary transition-colors">{u.name}</div>
                        <div className="text-xs text-muted-foreground">{u.country} · {u.researchFocus}</div>
                      </div>
                    </Link>
                  </TableCell>
                  <TableCell className="font-mono text-sm">{u.pillars.academicReputation.toFixed(1)}</TableCell>
                  <TableCell className="font-mono text-sm">{u.pillars.citationsPerFaculty.toFixed(1)}</TableCell>
                  <TableCell className="font-mono text-sm">{u.pillars.employerReputation.toFixed(1)}</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-secondary/15 text-secondary">
                      {u.overallScore.toFixed(1)}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
              {pageData.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No universities match your criteria.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-xs text-muted-foreground">
            Showing {startRank + 1}–{Math.min(startRank + PAGE_SIZE, filtered.length)} of {filtered.length}
          </p>
          <div className="flex items-center gap-1.5">
            <Button variant="outline" size="sm" disabled={safePage <= 1} onClick={() => setPage(safePage - 1)} className="h-8 px-3">
              <ChevronLeft className="h-4 w-4 mr-1" /> Previous
            </Button>
            <span className="text-xs font-medium px-3">
              Page {safePage} of {totalPages}
            </span>
            <Button variant="outline" size="sm" disabled={safePage >= totalPages} onClick={() => setPage(safePage + 1)} className="h-8 px-3">
              Next <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RankingTable;
