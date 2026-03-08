import { useState } from "react";
import { Link } from "react-router-dom";
import { Compass, MapPin, BookOpen, DollarSign, Target, ArrowRight, ArrowLeft, Sparkles, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import Navbar from "@/components/Navbar";
import AdmissionChanceSimulator from "@/components/AdmissionChanceSimulator";
import DashboardFooter from "@/components/DashboardFooter";
import { generateUniversities, PILLAR_LABELS, type University, type PillarKey } from "@/data/universities";

// ─── Wizard options ─────────────────────────────────────────────────────────
const REGIONS = [
  { value: "north-america", label: "North America", countries: ["USA", "Canada"] },
  { value: "europe", label: "Europe", countries: ["UK", "Switzerland", "Germany"] },
  { value: "asia", label: "Asia", countries: ["Singapore", "Japan", "China", "South Korea", "India"] },
  { value: "oceania", label: "Oceania", countries: ["Australia"] },
  { value: "latin-america", label: "Latin America", countries: ["Brazil"] },
  { value: "africa", label: "Africa", countries: ["South Africa"] },
];

const SUBJECTS = [
  { value: "engineering", label: "Engineering & Technology", focuses: ["Engineering & Technology", "Engineering & Computer Science", "Engineering & CS", "Technology & Business", "Technology & Engineering", "Engineering & Natural Sciences"] },
  { value: "sciences", label: "Sciences & Medicine", focuses: ["Sciences & Mathematics", "Natural Sciences & Medicine", "Medicine & Life Sciences", "Medicine & Agriculture", "Sciences & Engineering"] },
  { value: "humanities", label: "Humanities & Social Sciences", focuses: ["Humanities & Sciences"] },
  { value: "business", label: "Business & Economics", focuses: ["Technology & Business"] },
  { value: "health", label: "Health & Development", focuses: ["Health & Development", "AI & Health Sciences", "Technology & Medicine"] },
  { value: "cs", label: "Computer Science & AI", focuses: ["Engineering & Computer Science", "Engineering & CS", "AI & Health Sciences", "Technology & Engineering"] },
];

const BUDGETS = [
  { value: "low", label: "Budget-Friendly", description: "Public universities & scholarships", boost: { sustainability: 15, internationalDiversity: 10 } },
  { value: "mid", label: "Moderate", description: "Mix of public & private", boost: { employmentOutcomes: 10, employerReputation: 5 } },
  { value: "high", label: "Premium", description: "Top-tier private institutions", boost: { academicReputation: 15, citationsPerFaculty: 10 } },
  { value: "any", label: "No Preference", description: "Show me the best fit", boost: {} },
];

const PRIORITIES = [
  { value: "research", label: "Research Excellence", pillars: ["academicReputation", "citationsPerFaculty", "internationalResearchNetwork"] as PillarKey[] },
  { value: "jobs", label: "Job Placement", pillars: ["employerReputation", "employmentOutcomes"] as PillarKey[] },
  { value: "campus", label: "Campus Life & Diversity", pillars: ["internationalDiversity", "sustainability", "facultyStudentRatio"] as PillarKey[] },
  { value: "global", label: "Global Exposure", pillars: ["internationalResearchNetwork", "internationalDiversity"] as PillarKey[] },
];

const STEPS = [
  { icon: MapPin, title: "Preferred Region", subtitle: "Where do you want to study?" },
  { icon: BookOpen, title: "Major / Subject", subtitle: "What field interests you most?" },
  { icon: DollarSign, title: "Budget Range", subtitle: "What's your investment level?" },
  { icon: Target, title: "Your Priority", subtitle: "What matters most to you?" },
];

// ─── Matching algorithm ─────────────────────────────────────────────────────
function matchUniversities(
  region: string,
  subject: string,
  budget: string,
  priority: string
): University[] {
  const universities = generateUniversities();

  const regionData = REGIONS.find((r) => r.value === region);
  const subjectData = SUBJECTS.find((s) => s.value === subject);
  const budgetData = BUDGETS.find((b) => b.value === budget);
  const priorityData = PRIORITIES.find((p) => p.value === priority);

  const scored = universities.map((uni) => {
    let matchScore = uni.overallScore;

    // Region match bonus
    if (regionData?.countries.includes(uni.country)) {
      matchScore += 12;
    }

    // Subject match bonus
    if (subjectData?.focuses.includes(uni.researchFocus)) {
      matchScore += 10;
    }

    // Budget-driven pillar boosts
    if (budgetData?.boost) {
      for (const [pillar, boost] of Object.entries(budgetData.boost)) {
        matchScore += (uni.pillars[pillar as PillarKey] / 100) * boost;
      }
    }

    // Priority-driven pillar boosts
    if (priorityData) {
      for (const pillar of priorityData.pillars) {
        matchScore += (uni.pillars[pillar] / 100) * 8;
      }
    }

    return { uni, matchScore };
  });

  scored.sort((a, b) => b.matchScore - a.matchScore);
  return scored.slice(0, 3).map((s) => s.uni);
}

// ─── Component ──────────────────────────────────────────────────────────────
const FindMyMatch = () => {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({ region: "", subject: "", budget: "", priority: "" });
  const [results, setResults] = useState<University[] | null>(null);

  const progress = results ? 100 : ((step + 1) / 4) * 100;
  const canProceed =
    (step === 0 && answers.region) ||
    (step === 1 && answers.subject) ||
    (step === 2 && answers.budget) ||
    (step === 3 && answers.priority);

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      setResults(matchUniversities(answers.region, answers.subject, answers.budget, answers.priority));
    }
  };

  const handleRestart = () => {
    setStep(0);
    setAnswers({ region: "", subject: "", budget: "", priority: "" });
    setResults(null);
  };

  const StepIcon = STEPS[step]?.icon ?? Compass;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 py-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-secondary/10 text-secondary px-4 py-1.5 rounded-full text-sm font-medium mb-4">
            <Compass className="h-4 w-4" />
            Find My Match
          </div>
          <h1 className="text-3xl sm:text-4xl font-display font-bold text-foreground mb-2">
            Discover Your Ideal University
          </h1>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Answer 4 quick questions and our Smart Algorithm will match you with the best-fit universities worldwide.
          </p>
        </div>

        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex justify-between text-xs text-muted-foreground mb-2">
            <span>{results ? "Complete!" : `Step ${step + 1} of 4`}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Wizard body */}
        {!results ? (
          <Card className="glass-card">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center mb-3">
                <StepIcon className="h-6 w-6 text-secondary" />
              </div>
              <CardTitle className="text-xl font-display">{STEPS[step].title}</CardTitle>
              <p className="text-sm text-muted-foreground">{STEPS[step].subtitle}</p>
            </CardHeader>
            <CardContent>
              {step === 0 && (
                <RadioGroup value={answers.region} onValueChange={(v) => setAnswers({ ...answers, region: v })} className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {REGIONS.map((r) => (
                    <Label
                      key={r.value}
                      htmlFor={`region-${r.value}`}
                      className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer hover-lift ${
                        answers.region === r.value ? "border-secondary bg-secondary/10 shadow-md" : "border-border hover:border-secondary/40"
                      }`}
                    >
                      <RadioGroupItem value={r.value} id={`region-${r.value}`} />
                      <span className="text-sm font-medium">{r.label}</span>
                    </Label>
                  ))}
                </RadioGroup>
              )}

              {step === 1 && (
                <RadioGroup value={answers.subject} onValueChange={(v) => setAnswers({ ...answers, subject: v })} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {SUBJECTS.map((s) => (
                    <Label
                      key={s.value}
                      htmlFor={`subject-${s.value}`}
                      className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors ${
                        answers.subject === s.value ? "border-secondary bg-secondary/10" : "border-border hover:border-secondary/40"
                      }`}
                    >
                      <RadioGroupItem value={s.value} id={`subject-${s.value}`} />
                      <span className="text-sm font-medium">{s.label}</span>
                    </Label>
                  ))}
                </RadioGroup>
              )}

              {step === 2 && (
                <RadioGroup value={answers.budget} onValueChange={(v) => setAnswers({ ...answers, budget: v })} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {BUDGETS.map((b) => (
                    <Label
                      key={b.value}
                      htmlFor={`budget-${b.value}`}
                      className={`flex flex-col gap-0.5 p-3 rounded-lg border cursor-pointer transition-colors ${
                        answers.budget === b.value ? "border-secondary bg-secondary/10" : "border-border hover:border-secondary/40"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <RadioGroupItem value={b.value} id={`budget-${b.value}`} />
                        <span className="text-sm font-medium">{b.label}</span>
                      </div>
                      <span className="text-xs text-muted-foreground ml-6">{b.description}</span>
                    </Label>
                  ))}
                </RadioGroup>
              )}

              {step === 3 && (
                <RadioGroup value={answers.priority} onValueChange={(v) => setAnswers({ ...answers, priority: v })} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {PRIORITIES.map((p) => (
                    <Label
                      key={p.value}
                      htmlFor={`priority-${p.value}`}
                      className={`flex flex-col gap-1 p-3 rounded-lg border cursor-pointer transition-colors ${
                        answers.priority === p.value ? "border-secondary bg-secondary/10" : "border-border hover:border-secondary/40"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <RadioGroupItem value={p.value} id={`priority-${p.value}`} />
                        <span className="text-sm font-medium">{p.label}</span>
                      </div>
                      <span className="text-xs text-muted-foreground ml-6">
                        Focus: {p.pillars.map((k) => PILLAR_LABELS[k]).join(", ")}
                      </span>
                    </Label>
                  ))}
                </RadioGroup>
              )}

              {/* Navigation buttons */}
              <div className="flex justify-between mt-6">
                <Button variant="outline" onClick={() => setStep(step - 1)} disabled={step === 0}>
                  <ArrowLeft className="h-4 w-4 mr-1" /> Back
                </Button>
                <Button onClick={handleNext} disabled={!canProceed} className="bg-secondary text-secondary-foreground hover:bg-secondary/90">
                  {step === 3 ? "Find My Match" : "Next"} <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          /* ─── Results ───────────────────────────────────────────────── */
          <div className="space-y-6">
            <div className="text-center">
              <Sparkles className="h-8 w-8 text-secondary mx-auto mb-2" />
              <h2 className="text-2xl font-display font-bold text-foreground">Your Top 3 Matches</h2>
              <p className="text-sm text-muted-foreground mt-1">Based on your preferences and our Smart Algorithm</p>
            </div>

            {results.map((uni, i) => (
              <Card key={uni.id} className="glass-card overflow-hidden table-row-enter" style={{ animationDelay: `${i * 0.12}s` }}>
                <CardContent className="p-5 sm:p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center">
                      <Trophy className={`h-6 w-6 ${i === 0 ? "text-yellow-500" : i === 1 ? "text-gray-400" : "text-amber-700"}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <Badge variant="secondary" className="text-xs">#{i + 1} Match</Badge>
                        <Badge variant="outline" className="text-xs">Rank #{uni.rank}</Badge>
                      </div>
                      <h3 className="text-lg font-display font-bold text-foreground truncate">{uni.name}</h3>
                      <p className="text-sm text-muted-foreground">{uni.city}, {uni.country} · {uni.researchFocus}</p>

                      {/* Pillar mini bars */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-2 mt-4">
                        {(Object.keys(PILLAR_LABELS) as PillarKey[]).slice(0, 4).map((key) => (
                          <div key={key}>
                            <div className="flex justify-between text-xs text-muted-foreground mb-0.5">
                              <span className="truncate">{PILLAR_LABELS[key]}</span>
                              <span className="font-medium text-foreground">{uni.pillars[key]}</span>
                            </div>
                            <Progress value={uni.pillars[key]} className="h-1.5" />
                          </div>
                        ))}
                      </div>

                      <div className="flex items-center justify-between mt-4">
                        <span className="text-sm font-medium text-foreground">Overall: <span className="text-secondary font-bold">{uni.overallScore}</span></span>
                        <Link to={`/university/${uni.id}`}>
                          <Button size="sm" variant="outline" className="text-xs">View Profile <ArrowRight className="h-3 w-3 ml-1" /></Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            <div className="text-center pt-2">
              <Button variant="outline" onClick={handleRestart}>
                <Compass className="h-4 w-4 mr-1" /> Take Quiz Again
              </Button>
            </div>
          </div>
        )}
        {/* Admission Chance Simulator */}
        <div className="mt-10">
          <AdmissionChanceSimulator />
        </div>
      </main>

      <DashboardFooter />
    </div>
  );
};

export default FindMyMatch;
