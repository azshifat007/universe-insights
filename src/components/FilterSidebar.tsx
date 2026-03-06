import { GraduationCap } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { COUNTRIES, RESEARCH_FOCUSES, REGIONS, REGION_MAP } from "@/data/universities";

interface FilterSidebarProps {
  country: string;
  researchFocus: string;
  minScore: number;
  region: string;
  onCountryChange: (v: string) => void;
  onResearchFocusChange: (v: string) => void;
  onMinScoreChange: (v: number) => void;
  onRegionChange: (v: string) => void;
}

const FilterSidebar = ({ country, researchFocus, minScore, region, onCountryChange, onResearchFocusChange, onMinScoreChange, onRegionChange }: FilterSidebarProps) => {
  // Filter countries by selected region
  const filteredCountries = region === "all"
    ? COUNTRIES
    : COUNTRIES.filter((c) => REGION_MAP[c] === region);

  return (
    <aside className="w-full lg:w-64 shrink-0 bg-sidebar text-sidebar-foreground rounded-lg p-5 space-y-6">
      <div className="flex items-center gap-2.5">
        <div className="p-1.5 rounded-md bg-sidebar-accent">
          <GraduationCap className="h-4 w-4 text-sidebar-primary" />
        </div>
        <h2 className="font-display text-sm font-bold tracking-tight">Filters</h2>
      </div>

      <div className="space-y-5">
        {/* Region chips */}
        <div className="space-y-1.5">
          <Label className="text-sidebar-foreground/70 text-xs uppercase tracking-wider">Region</Label>
          <div className="flex flex-wrap gap-1.5">
            <Badge
              variant={region === "all" ? "default" : "outline"}
              className={`cursor-pointer text-[10px] px-2 py-0.5 transition-colors ${region === "all" ? "bg-sidebar-primary text-sidebar-primary-foreground" : "border-sidebar-border text-sidebar-foreground/70 hover:bg-sidebar-accent"}`}
              onClick={() => { onRegionChange("all"); onCountryChange("all"); }}
            >
              🌍 All
            </Badge>
            {REGIONS.map((r) => (
              <Badge
                key={r}
                variant={region === r ? "default" : "outline"}
                className={`cursor-pointer text-[10px] px-2 py-0.5 transition-colors ${region === r ? "bg-sidebar-primary text-sidebar-primary-foreground" : "border-sidebar-border text-sidebar-foreground/70 hover:bg-sidebar-accent"}`}
                onClick={() => {
                  onRegionChange(region === r ? "all" : r);
                  onCountryChange("all");
                }}
              >
                {r}
              </Badge>
            ))}
          </div>
        </div>

        {/* Country */}
        <div className="space-y-1.5">
          <Label className="text-sidebar-foreground/70 text-xs uppercase tracking-wider">Country</Label>
          <Select value={country} onValueChange={onCountryChange}>
            <SelectTrigger className="bg-sidebar-accent border-sidebar-border text-sidebar-foreground text-xs h-8">
              <SelectValue placeholder="All Countries" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Countries</SelectItem>
              {filteredCountries.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {/* Research Focus */}
        <div className="space-y-1.5">
          <Label className="text-sidebar-foreground/70 text-xs uppercase tracking-wider">Research Focus</Label>
          <Select value={researchFocus} onValueChange={onResearchFocusChange}>
            <SelectTrigger className="bg-sidebar-accent border-sidebar-border text-sidebar-foreground text-xs h-8">
              <SelectValue placeholder="All Fields" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Fields</SelectItem>
              {RESEARCH_FOCUSES.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {/* Min Score */}
        <div className="space-y-2">
          <Label className="text-sidebar-foreground/70 text-xs uppercase tracking-wider">
            Min Score: <span className="text-sidebar-primary font-semibold">{minScore}</span>
          </Label>
          <Slider
            value={[minScore]}
            onValueChange={(v) => onMinScoreChange(v[0])}
            min={0} max={100} step={1}
            className="[&_[role=slider]]:bg-sidebar-primary [&_[role=slider]]:border-sidebar-primary"
          />
        </div>
      </div>
    </aside>
  );
};

export default FilterSidebar;
