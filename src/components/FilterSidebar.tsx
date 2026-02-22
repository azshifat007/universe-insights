import { Filter, GraduationCap } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { COUNTRIES, RESEARCH_FOCUSES } from "@/data/universities";

interface FilterSidebarProps {
  country: string;
  researchFocus: string;
  minScore: number;
  onCountryChange: (v: string) => void;
  onResearchFocusChange: (v: string) => void;
  onMinScoreChange: (v: number) => void;
}

const FilterSidebar = ({
  country,
  researchFocus,
  minScore,
  onCountryChange,
  onResearchFocusChange,
  onMinScoreChange,
}: FilterSidebarProps) => {
  return (
    <aside className="w-full lg:w-72 shrink-0 bg-sidebar text-sidebar-foreground rounded-lg p-6 space-y-8">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-md bg-sidebar-accent">
          <GraduationCap className="h-5 w-5 text-sidebar-primary" />
        </div>
        <h2 className="font-display text-lg font-bold tracking-tight">Universe Analytics</h2>
      </div>

      <div className="space-y-6">
        <div className="flex items-center gap-2 text-sm font-medium text-sidebar-primary">
          <Filter className="h-4 w-4" />
          <span>Filters</span>
        </div>

        <div className="space-y-2">
          <Label className="text-sidebar-foreground/70 text-xs uppercase tracking-wider">Country</Label>
          <Select value={country} onValueChange={onCountryChange}>
            <SelectTrigger className="bg-sidebar-accent border-sidebar-border text-sidebar-foreground">
              <SelectValue placeholder="All Countries" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Countries</SelectItem>
              {COUNTRIES.map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-sidebar-foreground/70 text-xs uppercase tracking-wider">Research Focus</Label>
          <Select value={researchFocus} onValueChange={onResearchFocusChange}>
            <SelectTrigger className="bg-sidebar-accent border-sidebar-border text-sidebar-foreground">
              <SelectValue placeholder="All Fields" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Fields</SelectItem>
              {RESEARCH_FOCUSES.map((r) => (
                <SelectItem key={r} value={r}>{r}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-3">
          <Label className="text-sidebar-foreground/70 text-xs uppercase tracking-wider">
            Min Overall Score: <span className="text-sidebar-primary font-semibold">{minScore}</span>
          </Label>
          <Slider
            value={[minScore]}
            onValueChange={(v) => onMinScoreChange(v[0])}
            min={0}
            max={100}
            step={1}
            className="[&_[role=slider]]:bg-sidebar-primary [&_[role=slider]]:border-sidebar-primary"
          />
        </div>
      </div>
    </aside>
  );
};

export default FilterSidebar;
