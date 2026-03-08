import { useState, useMemo } from "react";
import { GraduationCap, BarChart3, AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { generateUniversities, type University } from "@/data/universities";
import UniversityLogo from "@/components/UniversityLogo";

const universities = generateUniversities();

// Selectivity tiers based on overall score
function getSelectivity(uni: University): { tier: string; minGPA: number; minIELTS: number; minTOEFL: number } {
  const score = uni.overallScore;
  if (score >= 90) return { tier: "Highly Selective", minGPA: 3.8, minIELTS: 7.5, minTOEFL: 105 };
  if (score >= 80) return { tier: "Very Selective", minGPA: 3.5, minIELTS: 7.0, minTOEFL: 95 };
  if (score >= 65) return { tier: "Selective", minGPA: 3.2, minIELTS: 6.5, minTOEFL: 85 };
  if (score >= 50) return { tier: "Moderate", minGPA: 3.0, minIELTS: 6.0, minTOEFL: 75 };
  return { tier: "Accessible", minGPA: 2.5, minIELTS: 5.5, minTOEFL: 65 };
}

function calculateChance(
  uni: University,
  gpa: number,
  testType: "ielts" | "toefl",
  testScore: number
): { level: "High" | "Medium" | "Low"; percentage: number; factors: string[] } {
  const sel = getSelectivity(uni);
  const factors: string[] = [];

  // GPA comparison
  const gpaDiff = gpa - sel.minGPA;
  let gpaScore = 0;
  if (gpaDiff >= 0.3) { gpaScore = 40; factors.push("Strong GPA — exceeds requirement"); }
  else if (gpaDiff >= 0) { gpaScore = 28; factors.push("GPA meets minimum requirement"); }
  else if (gpaDiff >= -0.3) { gpaScore = 15; factors.push("GPA slightly below target"); }
  else { gpaScore = 5; factors.push("GPA significantly below target"); }

  // Test score comparison
  const testMin = testType === "ielts" ? sel.minIELTS : sel.minTOEFL;
  const testDiff = testScore - testMin;
  let testScoreVal = 0;
  if (testType === "ielts") {
    if (testDiff >= 0.5) { testScoreVal = 35; factors.push("Excellent IELTS score"); }
    else if (testDiff >= 0) { testScoreVal = 25; factors.push("IELTS meets requirement"); }
    else if (testDiff >= -0.5) { testScoreVal = 12; factors.push("IELTS slightly below target"); }
    else { testScoreVal = 4; factors.push("IELTS needs improvement"); }
  } else {
    if (testDiff >= 5) { testScoreVal = 35; factors.push("Excellent TOEFL score"); }
    else if (testDiff >= 0) { testScoreVal = 25; factors.push("TOEFL meets requirement"); }
    else if (testDiff >= -5) { testScoreVal = 12; factors.push("TOEFL slightly below target"); }
    else { testScoreVal = 4; factors.push("TOEFL needs improvement"); }
  }

  // Institutional factors (internationalization openness)
  const intlBonus = (uni.pillars.internationalDiversity / 100) * 15;
  const empBonus = (uni.pillars.employmentOutcomes / 100) * 10;

  const total = Math.min(100, Math.round(gpaScore + testScoreVal + intlBonus + empBonus));

  let level: "High" | "Medium" | "Low";
  if (total >= 65) { level = "High"; factors.push("Good overall profile match"); }
  else if (total >= 40) { level = "Medium"; factors.push("Competitive but not guaranteed"); }
  else { level = "Low"; factors.push("Consider strengthening your profile"); }

  return { level, percentage: total, factors };
}

const CHANCE_STYLES = {
  High: { color: "text-green-600", bg: "bg-green-500/15", icon: CheckCircle2, label: "High Chance" },
  Medium: { color: "text-yellow-600", bg: "bg-yellow-500/15", icon: AlertTriangle, label: "Medium Chance" },
  Low: { color: "text-red-500", bg: "bg-red-500/15", icon: XCircle, label: "Low Chance" },
};

const AdmissionChanceSimulator = () => {
  const [gpa, setGpa] = useState("");
  const [testType, setTestType] = useState<"ielts" | "toefl">("ielts");
  const [testScore, setTestScore] = useState("");
  const [selectedUnis, setSelectedUnis] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showResults, setShowResults] = useState(false);

  const searchResults = useMemo(() => {
    if (searchQuery.length < 2) return [];
    return universities
      .filter((u) => u.name.toLowerCase().includes(searchQuery.toLowerCase()))
      .slice(0, 5);
  }, [searchQuery]);

  const toggleUni = (id: string) => {
    setSelectedUnis((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : prev.length < 5 ? [...prev, id] : prev
    );
    setSearchQuery("");
  };

  const results = useMemo(() => {
    if (!showResults) return [];
    const g = parseFloat(gpa);
    const t = parseFloat(testScore);
    if (isNaN(g) || isNaN(t) || selectedUnis.length === 0) return [];

    return selectedUnis.map((id) => {
      const uni = universities.find((u) => u.id === id)!;
      const chance = calculateChance(uni, g, testType, t);
      return { uni, ...chance };
    }).sort((a, b) => b.percentage - a.percentage);
  }, [showResults, gpa, testScore, testType, selectedUnis]);

  const canCalculate = gpa && testScore && selectedUnis.length > 0 &&
    !isNaN(parseFloat(gpa)) && !isNaN(parseFloat(testScore));

  const handleCalculate = () => setShowResults(true);
  const handleReset = () => { setShowResults(false); setSelectedUnis([]); setGpa(""); setTestScore(""); };

  return (
    <div className="glass-card rounded-xl p-6 space-y-6">
      <div className="flex items-center gap-2">
        <GraduationCap className="h-5 w-5 text-secondary" />
        <h2 className="font-display text-lg font-bold">Admission Chance Simulator</h2>
      </div>
      <p className="text-sm text-muted-foreground -mt-3">
        Enter your academic profile to estimate admission probability using our heuristic algorithm.
      </p>

      {!showResults ? (
        <div className="space-y-5">
          {/* Inputs row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">GPA (out of 4.0)</Label>
              <Input
                type="number" step="0.1" min="0" max="4" placeholder="e.g. 3.5"
                value={gpa} onChange={(e) => setGpa(e.target.value)}
                className="h-10"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Test Type</Label>
              <Select value={testType} onValueChange={(v) => setTestType(v as "ielts" | "toefl")}>
                <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ielts">IELTS (0–9)</SelectItem>
                  <SelectItem value="toefl">TOEFL (0–120)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">{testType === "ielts" ? "IELTS Score" : "TOEFL Score"}</Label>
              <Input
                type="number" step={testType === "ielts" ? "0.5" : "1"}
                min="0" max={testType === "ielts" ? "9" : "120"}
                placeholder={testType === "ielts" ? "e.g. 7.0" : "e.g. 100"}
                value={testScore} onChange={(e) => setTestScore(e.target.value)}
                className="h-10"
              />
            </div>
          </div>

          {/* University selection */}
          <div className="space-y-2">
            <Label className="text-xs font-medium">Select Universities (up to 5)</Label>
            <div className="relative">
              <Input
                placeholder="Search universities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-10"
              />
              {searchResults.length > 0 && (
                <div className="absolute top-full mt-1 left-0 right-0 bg-card rounded-lg shadow-xl border border-border z-20 overflow-hidden">
                  {searchResults.map((u) => (
                    <button
                      key={u.id}
                      onClick={() => toggleUni(u.id)}
                      disabled={selectedUnis.includes(u.id)}
                      className="flex items-center justify-between w-full px-3 py-2.5 hover:bg-muted/50 transition-colors text-left disabled:opacity-50"
                    >
                      <span className="text-sm font-medium flex items-center gap-2 text-foreground">
                        <UniversityLogo domain={u.domain} name={u.name} className="h-5 w-5" />
                        {u.name}
                      </span>
                      <span className="text-xs text-muted-foreground">#{u.rank}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {selectedUnis.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {selectedUnis.map((id) => {
                  const uni = universities.find((u) => u.id === id)!;
                  return (
                    <Badge
                      key={id}
                      variant="secondary"
                      className="cursor-pointer hover:bg-destructive/20 transition-colors"
                      onClick={() => toggleUni(id)}
                    >
                      {uni.name} ×
                    </Badge>
                  );
                })}
              </div>
            )}
          </div>

          <Button
            onClick={handleCalculate}
            disabled={!canCalculate}
            className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90"
          >
            <BarChart3 className="h-4 w-4 mr-2" /> Calculate Admission Chances
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              GPA: <span className="font-medium text-foreground">{gpa}</span> ·{" "}
              {testType.toUpperCase()}: <span className="font-medium text-foreground">{testScore}</span>
            </p>
            <Button variant="outline" size="sm" onClick={handleReset}>Try Again</Button>
          </div>

          {results.map(({ uni, level, percentage, factors }) => {
            const style = CHANCE_STYLES[level];
            const Icon = style.icon;
            return (
              <Card key={uni.id} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <UniversityLogo domain={uni.domain} name={uni.name} className="h-10 w-10 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="text-sm font-bold truncate">{uni.name}</h4>
                        <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${style.bg} ${style.color}`}>
                          <Icon className="h-3 w-3" />
                          {style.label}
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">
                        {uni.city}, {uni.country} · Selectivity: {getSelectivity(uni).tier}
                      </p>
                      <div className="mb-2">
                        <div className="flex justify-between text-xs mb-0.5">
                          <span className="text-muted-foreground">Admission Probability</span>
                          <span className={`font-bold ${style.color}`}>{percentage}%</span>
                        </div>
                        <Progress value={percentage} className="h-2" />
                      </div>
                      <ul className="space-y-0.5">
                        {factors.map((f, i) => (
                          <li key={i} className="text-[11px] text-muted-foreground flex items-center gap-1">
                            <span className="w-1 h-1 rounded-full bg-muted-foreground/50 shrink-0" />
                            {f}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AdmissionChanceSimulator;
