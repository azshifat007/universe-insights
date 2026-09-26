import { useMemo } from "react";
import { FlaskConical, Database } from "lucide-react";
import { generateUniversities, PILLAR_LABELS } from "@/data/universities";
import { validateRanking, MIN_COVERAGE } from "@/lib/rankingValidation";

const f = (n: number, d = 3) => n.toFixed(d);

const Stat = ({ label, value, hint }: { label: string; value: string; hint: string }) => (
  <div className="rounded-lg border border-border/60 bg-muted/30 p-4">
    <div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
    <div className="font-mono text-2xl font-bold text-foreground mt-1">{value}</div>
    <div className="text-xs text-muted-foreground mt-1">{hint}</div>
  </div>
);

const ValidationPanel = () => {
  const r = useMemo(() => validateRanking(generateUniversities()), []);

  return (
    <>
      <div className="glass-card-hover rounded-xl p-6 space-y-5">
        <div className="flex items-center gap-2">
          <FlaskConical className="h-5 w-5 text-secondary" />
          <h2 className="font-display text-lg font-bold">Model Validation (computed live on {r.n} universities)</h2>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          To show the 8-pillar reweighting yields stable, meaningful rankings rather than arbitrary orderings, we run a
          reproducible validation suite (seed 42) every time this page loads. Spearman ρ and Kendall τ compare each
          alternative ranking to the default one (1 = identical order).
        </p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Stat label="Weight perturbation ρ" value={f(r.monteCarlo.meanRho)} hint={`mean of ${r.monteCarlo.runs} runs, ±${r.monteCarlo.perturbation * 100}% weights (min ${f(r.monteCarlo.minRho)})`} />
          <Stat label="Top-10 stability" value={`${Math.round(r.monteCarlo.meanTop10 * 100)}%`} hint="avg overlap of top 10 under perturbation" />
          <Stat label="Equal-weights ρ" value={f(r.equalWeights.rho)} hint={`τ = ${f(r.equalWeights.tau)} — convergent validity`} />
          <Stat label="Normalised-input ρ" value={f(r.normalisation.rho)} hint={`τ = ${f(r.normalisation.tau)} — raw vs min–max scaled`} />
        </div>
        <div>
          <h3 className="text-sm font-semibold mb-2">Leave-one-pillar-out sensitivity</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="text-left text-muted-foreground border-b border-border/60">
                <th className="py-2">Pillar removed</th><th className="py-2 text-right">Spearman ρ</th><th className="py-2 text-right">Kendall τ</th>
              </tr></thead>
              <tbody>
                {r.leaveOneOut.map((l) => (
                  <tr key={l.pillar} className="border-b border-border/30">
                    <td className="py-1.5">{PILLAR_LABELS[l.pillar]}</td>
                    <td className="py-1.5 text-right font-mono">{f(l.rho)}</td>
                    <td className="py-1.5 text-right font-mono">{f(l.tau)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            High ρ across rows means no single pillar dictates the ordering; lower values identify the most influential pillars.
          </p>
        </div>
      </div>

      <div className="glass-card-hover rounded-xl p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Database className="h-5 w-5 text-secondary" />
          <h2 className="font-display text-lg font-bold">Data Comparability & Missing Records</h2>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Stat label="Complete records" value={`${r.data.complete}`} hint="all 8 pillars present" />
          <Stat label="Weight-redistributed" value={`${r.data.imputed}`} hint="≥1 pillar missing" />
          <Stat label="Flagged unreliable" value={`${r.data.unreliable}`} hint={`< ${MIN_COVERAGE * 100}% weight coverage`} />
          <Stat label="Out-of-range values" value={`${r.data.outOfRange}`} hint="clamped to [0, 100]" />
        </div>
        <ul className="space-y-2 text-sm text-muted-foreground list-disc pl-5 leading-relaxed">
          <li><strong className="text-foreground">Common scale:</strong> every pillar is expressed as a 0–100 indicator score before weighting; values outside the range are clamped. The normalised-input ρ above shows results are robust to re-scaling via cohort min–max normalisation.</li>
          <li><strong className="text-foreground">Missing pillars:</strong> a missing or invalid value is never treated as 0. It is excluded and the remaining weights are re-normalised to sum to 100% (score = Σ wᵢxᵢ / Σ wᵢ over available pillars).</li>
          <li><strong className="text-foreground">Low coverage:</strong> records whose available pillars carry less than {MIN_COVERAGE * 100}% of total weight are flagged as unreliable rather than silently ranked.</li>
          <li><strong className="text-foreground">Heterogeneous, multi-year sources:</strong> each pillar is drawn from a single reference cycle per indicator; self-reported inputs (e.g. sustainability) carry low default weight (5%) to limit their influence, and duplicates are removed by ID before scoring.</li>
        </ul>
      </div>
    </>
  );
};

export default ValidationPanel;
