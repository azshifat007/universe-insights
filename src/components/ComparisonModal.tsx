import { useState } from "react";
import { X, BarChart3 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { University, PILLAR_LABELS, PillarKey } from "@/data/universities";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend } from "recharts";

interface ComparisonModalProps {
  universities: University[];
}

const COMPARE_COLORS = ["hsl(160,60%,40%)", "hsl(222,60%,30%)", "hsl(45,90%,55%)"];

const ComparisonModal = ({ universities }: ComparisonModalProps) => {
  const [selected, setSelected] = useState<string[]>([]);
  const [open, setOpen] = useState(false);

  const toggle = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : prev.length < 3 ? [...prev, id] : prev
    );
  };

  const selectedUnis = universities.filter((u) => selected.includes(u.id));
  const pillarKeys = Object.keys(PILLAR_LABELS) as PillarKey[];

  const radarData = pillarKeys.map((key) => {
    const point: Record<string, string | number> = { metric: PILLAR_LABELS[key].replace("Intl ", "I.") };
    selectedUnis.forEach((u) => {
      point[u.name] = u.pillars[key];
    });
    return point;
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="border-secondary/30 text-secondary hover:bg-secondary/10">
          <BarChart3 className="h-4 w-4 mr-1.5" />
          Compare
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">Compare Universities (max 3)</DialogTitle>
        </DialogHeader>

        {/* Selection */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
          {universities.slice(0, 15).map((u) => (
            <label
              key={u.id}
              className={`flex items-center gap-2 p-2 rounded-md border text-xs cursor-pointer transition-colors ${
                selected.includes(u.id) ? "border-secondary bg-secondary/10" : "border-border hover:bg-muted/50"
              }`}
            >
              <Checkbox
                checked={selected.includes(u.id)}
                onCheckedChange={() => toggle(u.id)}
                disabled={!selected.includes(u.id) && selected.length >= 3}
              />
              <span className="truncate">{u.name}</span>
            </label>
          ))}
        </div>

        {/* Radar chart */}
        {selectedUnis.length >= 2 && (
          <div className="mt-6">
            <ResponsiveContainer width="100%" height={350}>
              <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="75%">
                <PolarGrid stroke="hsl(220,15%,88%)" />
                <PolarAngleAxis dataKey="metric" tick={{ fontSize: 10 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 9 }} />
                {selectedUnis.map((u, i) => (
                  <Radar
                    key={u.id}
                    name={u.name}
                    dataKey={u.name}
                    stroke={COMPARE_COLORS[i]}
                    fill={COMPARE_COLORS[i]}
                    fillOpacity={0.15}
                    strokeWidth={2}
                  />
                ))}
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </RadarChart>
            </ResponsiveContainer>

            {/* Score comparison table */}
            <div className="overflow-x-auto mt-4">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 font-semibold">Metric</th>
                    {selectedUnis.map((u) => (
                      <th key={u.id} className="text-center py-2 font-semibold">{u.name.split(" ").slice(0, 3).join(" ")}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {pillarKeys.map((key) => (
                    <tr key={key} className="border-b border-border/50">
                      <td className="py-1.5 text-muted-foreground">{PILLAR_LABELS[key]}</td>
                      {selectedUnis.map((u) => (
                        <td key={u.id} className="text-center font-mono">{u.pillars[key].toFixed(1)}</td>
                      ))}
                    </tr>
                  ))}
                  <tr className="font-bold">
                    <td className="py-2">Overall Score</td>
                    {selectedUnis.map((u) => (
                      <td key={u.id} className="text-center text-secondary">{u.overallScore.toFixed(1)}</td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {selectedUnis.length < 2 && (
          <p className="text-center text-muted-foreground text-sm py-8">Select at least 2 universities to compare.</p>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ComparisonModal;
