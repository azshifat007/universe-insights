import { ArrowUpDown, Search, RefreshCw, Radio } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { University } from "@/data/universities";

interface RankingTableProps {
  universities: University[];
  onRefresh: () => void;
  isRefreshing: boolean;
}

type SortKey = "overallScore" | "researchImpact" | "studentSatisfaction" | "infrastructureScore";

const RankingTable = ({ universities, onRefresh, isRefreshing }: RankingTableProps) => {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("overallScore");
  const [sortAsc, setSortAsc] = useState(false);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(false); }
  };

  const filtered = universities
    .filter((u) => u.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => (sortAsc ? a[sortKey] - b[sortKey] : b[sortKey] - a[sortKey]));

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
      {/* Header */}
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
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search universities..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button
            onClick={onRefresh}
            disabled={isRefreshing}
            variant="outline"
            size="sm"
            className="border-secondary/30 text-secondary hover:bg-secondary/10 shrink-0"
          >
            <RefreshCw className={`h-4 w-4 mr-1.5 ${isRefreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="glass-card rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-primary/5 border-b border-border">
                <TableHead className="text-xs uppercase tracking-wider font-semibold w-16">Rank</TableHead>
                <TableHead className="text-xs uppercase tracking-wider font-semibold">University</TableHead>
                <SortHeader label="Research" field="researchImpact" />
                <SortHeader label="Satisfaction" field="studentSatisfaction" />
                <SortHeader label="Infrastructure" field="infrastructureScore" />
                <SortHeader label="Overall" field="overallScore" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((u, i) => (
                <TableRow key={u.id} className="table-row-enter hover:bg-muted/30 transition-colors" style={{ animationDelay: `${i * 30}ms` }}>
                  <TableCell className="font-display font-bold text-primary">{i + 1}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium text-sm">{u.name}</div>
                      <div className="text-xs text-muted-foreground">{u.country} · {u.researchFocus}</div>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-sm">{u.researchImpact.toFixed(1)}</TableCell>
                  <TableCell className="font-mono text-sm">{u.studentSatisfaction.toFixed(1)}</TableCell>
                  <TableCell className="font-mono text-sm">{u.infrastructureScore.toFixed(1)}</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-secondary/15 text-secondary">
                      {u.overallScore.toFixed(1)}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No universities match your criteria.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default RankingTable;
