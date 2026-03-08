import { supabase } from "@/integrations/supabase/client";
import type { PillarKey } from "@/data/universities";
import { PILLAR_WEIGHTS as DEFAULT_WEIGHTS } from "@/data/universities";

export interface DynamicWeights {
  [key: string]: number;
}

const KEY_MAP: Record<string, PillarKey> = {
  academic_reputation: "academicReputation",
  citations_per_faculty: "citationsPerFaculty",
  employer_reputation: "employerReputation",
  faculty_student_ratio: "facultyStudentRatio",
  international_research_network: "internationalResearchNetwork",
  employment_outcomes: "employmentOutcomes",
  sustainability: "sustainability",
  international_diversity: "internationalDiversity",
};

export async function fetchAlgorithmWeights(): Promise<Record<PillarKey, number>> {
  try {
    const { data, error } = await supabase
      .from("algorithm_settings")
      .select("key, value");

    if (error || !data || data.length === 0) {
      return { ...DEFAULT_WEIGHTS };
    }

    const weights: Record<string, number> = {};
    for (const row of data) {
      const r = row as { key: string; value: number };
      const pillarKey = KEY_MAP[r.key];
      if (pillarKey) {
        weights[pillarKey] = r.value / 100; // Convert percentage to decimal
      }
    }

    // Verify all keys present, fallback to defaults for missing
    const result = { ...DEFAULT_WEIGHTS };
    for (const [k, v] of Object.entries(weights)) {
      (result as any)[k] = v;
    }

    return result;
  } catch {
    return { ...DEFAULT_WEIGHTS };
  }
}

export function calculateWeightedScore(
  pillars: Record<PillarKey, number>,
  weights: Record<PillarKey, number>
): number {
  let total = 0;
  for (const key of Object.keys(weights) as PillarKey[]) {
    const clamped = Math.max(0, Math.min(100, pillars[key]));
    total += clamped * weights[key];
  }
  return Math.round(total * 10) / 10;
}
