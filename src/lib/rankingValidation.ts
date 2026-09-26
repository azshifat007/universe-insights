import { PILLAR_WEIGHTS, type PillarKey, type University } from "@/data/universities";

export type Weights = Record<PillarKey, number>;
const KEYS = Object.keys(PILLAR_WEIGHTS) as PillarKey[];

const isValid = (v: unknown): v is number => typeof v === "number" && Number.isFinite(v);

/**
 * Missing-data aware score: missing/invalid pillars are excluded and the
 * remaining weights are re-normalised to sum to 1 (weight redistribution).
 * Records with < MIN_COVERAGE of total weight available are flagged unreliable.
 */
export const MIN_COVERAGE = 0.7;
export function robustScore(pillars: Partial<Record<PillarKey, number>>, weights: Weights = PILLAR_WEIGHTS) {
  let total = 0, used = 0;
  const missing: PillarKey[] = [];
  for (const k of KEYS) {
    const v = pillars[k];
    if (!isValid(v)) { missing.push(k); continue; }
    total += Math.max(0, Math.min(100, v)) * weights[k];
    used += weights[k];
  }
  const score = used > 0 ? Math.round((total / used) * 10) / 10 : 0;
  return { score, coverage: used, missing, reliable: used >= MIN_COVERAGE };
}

/** Min–max normalisation of a pillar across the cohort to a common 0–100 scale. */
export function minMaxNormalise(unis: University[]): University[] {
  const range = {} as Record<PillarKey, [number, number]>;
  for (const k of KEYS) {
    const vals = unis.map((u) => u.pillars[k]).filter(isValid);
    range[k] = [Math.min(...vals), Math.max(...vals)];
  }
  return unis.map((u) => {
    const p = { ...u.pillars };
    for (const k of KEYS) {
      const [lo, hi] = range[k];
      if (isValid(p[k])) p[k] = hi === lo ? 100 : ((p[k] - lo) / (hi - lo)) * 100;
    }
    return { ...u, pillars: p };
  });
}

export function rankWith(unis: University[], weights: Weights): Map<string, number> {
  const scored = unis.map((u) => ({ id: u.id, s: robustScore(u.pillars, weights).score }));
  scored.sort((a, b) => b.s - a.s);
  return new Map(scored.map((x, i) => [x.id, i + 1]));
}

/** Spearman rank correlation between two rankings over the same ids. */
export function spearman(a: Map<string, number>, b: Map<string, number>): number {
  const n = a.size;
  if (n < 2) return 1;
  let d2 = 0;
  a.forEach((r, id) => { const d = r - (b.get(id) ?? r); d2 += d * d; });
  return 1 - (6 * d2) / (n * (n * n - 1));
}

/** Kendall's tau-a (O(n²), fine for a few hundred records). */
export function kendall(a: Map<string, number>, b: Map<string, number>): number {
  const ids = [...a.keys()];
  let c = 0, d = 0;
  for (let i = 0; i < ids.length; i++)
    for (let j = i + 1; j < ids.length; j++) {
      const s = Math.sign(a.get(ids[i])! - a.get(ids[j])!) * Math.sign(b.get(ids[i])! - b.get(ids[j])!);
      if (s > 0) c++; else if (s < 0) d++;
    }
  const pairs = (ids.length * (ids.length - 1)) / 2;
  return pairs ? (c - d) / pairs : 1;
}

export function topKOverlap(a: Map<string, number>, b: Map<string, number>, k = 10): number {
  const top = (m: Map<string, number>) => new Set([...m].filter(([, r]) => r <= k).map(([id]) => id));
  const A = top(a), B = top(b);
  let hit = 0; A.forEach((id) => B.has(id) && hit++);
  return hit / k;
}

function mulberry32(seed: number) {
  return () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export interface ValidationReport {
  n: number;
  monteCarlo: { runs: number; perturbation: number; meanRho: number; minRho: number; meanTop10: number };
  leaveOneOut: { pillar: PillarKey; rho: number; tau: number }[];
  equalWeights: { rho: number; tau: number };
  normalisation: { rho: number; tau: number };
  data: { complete: number; imputed: number; unreliable: number; outOfRange: number };
}

/**
 * Validation suite for the 8-pillar reweighting model:
 * 1. Monte-Carlo weight perturbation (±p%) → rank stability (Spearman ρ, top-10 overlap)
 * 2. Leave-one-pillar-out → no single pillar dominates the ordering
 * 3. Equal-weights baseline → convergent validity of the composite
 * 4. Raw vs min–max normalised inputs → robustness to scale heterogeneity
 * 5. Data-quality audit → completeness, out-of-range values, low-coverage records
 */
export function validateRanking(unis: University[], runs = 200, perturbation = 0.2, seed = 42): ValidationReport {
  const base = rankWith(unis, PILLAR_WEIGHTS);
  const rnd = mulberry32(seed);

  let sumRho = 0, minRho = 1, sumTop = 0;
  for (let r = 0; r < runs; r++) {
    const w = {} as Weights; let s = 0;
    for (const k of KEYS) { w[k] = PILLAR_WEIGHTS[k] * (1 + (rnd() * 2 - 1) * perturbation); s += w[k]; }
    for (const k of KEYS) w[k] /= s;
    const alt = rankWith(unis, w);
    const rho = spearman(base, alt);
    sumRho += rho; minRho = Math.min(minRho, rho); sumTop += topKOverlap(base, alt);
  }

  const leaveOneOut = KEYS.map((pillar) => {
    const w = { ...PILLAR_WEIGHTS } as Weights; w[pillar] = 0;
    const s = KEYS.reduce((a, k) => a + w[k], 0);
    for (const k of KEYS) w[k] /= s;
    const alt = rankWith(unis, w);
    return { pillar, rho: spearman(base, alt), tau: kendall(base, alt) };
  });

  const eq = Object.fromEntries(KEYS.map((k) => [k, 1 / KEYS.length])) as Weights;
  const eqRank = rankWith(unis, eq);
  const normRank = rankWith(minMaxNormalise(unis), PILLAR_WEIGHTS);

  let complete = 0, imputed = 0, unreliable = 0, outOfRange = 0;
  for (const u of unis) {
    const r = robustScore(u.pillars);
    if (r.missing.length === 0) complete++; else imputed++;
    if (!r.reliable) unreliable++;
    if (KEYS.some((k) => isValid(u.pillars[k]) && (u.pillars[k] < 0 || u.pillars[k] > 100))) outOfRange++;
  }

  return {
    n: unis.length,
    monteCarlo: { runs, perturbation, meanRho: sumRho / runs, minRho, meanTop10: sumTop / runs },
    leaveOneOut,
    equalWeights: { rho: spearman(base, eqRank), tau: kendall(base, eqRank) },
    normalisation: { rho: spearman(base, normRank), tau: kendall(base, normRank) },
    data: { complete, imputed, unreliable, outOfRange },
  };
}
