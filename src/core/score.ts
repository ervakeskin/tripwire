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

/** Deterministic: the LLM never sees or sets the score. Diminishing returns via 1-exp. */
export function scoreClauses(clauses: VerifiedClause[]): { score: number; level: 'low' | 'medium' | 'high' } {
  const raw = clauses.reduce((a, c) => a + WEIGHTS[c.category] * SEV[c.severity] * CONF[c.confidence], 0);
  const score = Math.round(100 * (1 - Math.exp(-raw / 45)));
  return { score, level: score >= 60 ? 'high' : score >= 30 ? 'medium' : 'low' };
}
