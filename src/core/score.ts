import type { Category, VerifiedClause } from './schema';

export const WEIGHTS: Record<Category, number> = {
  arbitration_waiver: 14,
  data_sale: 14,
  auto_renewal: 11,
  unilateral_change: 10,
  content_license: 10,
  liability_cap: 8,
  cancellation_friction: 9,
  tracking: 7,
  account_termination: 6,
  other: 3,
};
const SEV = { 1: 0.4, 2: 0.75, 3: 1 } as const;
const CONF = { low: 0.5, medium: 0.8, high: 1 } as const;

/** Deterministic: the LLM never sees or sets the score.
 *  Within a category the 1st finding counts fully, the 2nd half, the rest a quarter (breadth of risk types matters more than repetition);
 *  across categories the sum saturates smoothly via 1-exp so one document cannot silently cap at 100 on volume alone. */
export function scoreClauses(clauses: VerifiedClause[]): { score: number; level: 'low' | 'medium' | 'high' } {
  const byCat = new Map<Category, number[]>();
  for (const c of clauses) {
    const v = WEIGHTS[c.category] * SEV[c.severity] * CONF[c.confidence];
    byCat.set(c.category, [...(byCat.get(c.category) ?? []), v]);
  }
  let raw = 0;
  for (const vals of byCat.values()) vals.sort((a, b) => b - a).forEach((v, i) => (raw += v * (i === 0 ? 1 : i === 1 ? 0.5 : 0.25)));
  const score = Math.round(100 * (1 - Math.exp(-raw / 60)));
  return { score, level: score >= 60 ? 'high' : score >= 30 ? 'medium' : 'low' };
}
