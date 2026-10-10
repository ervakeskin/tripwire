import { z } from 'zod';

export const CATEGORIES = [
  'auto_renewal',
  'arbitration_waiver',
  'data_sale',
  'unilateral_change',
  'liability_cap',
  'content_license',
  'cancellation_friction',
  'tracking',
  'account_termination',
  'other',
] as const;
export type Category = (typeof CATEGORIES)[number];

/** What the LLM is allowed to return (enforced via tool_use input_schema + Zod). */
export const LlmClauseSchema = z.object({
  category: z.enum(CATEGORIES),
  severity: z.number().int().min(1).max(3),
  quote: z.string().min(12).max(600),
  explanationTr: z.string().min(5).max(500),
  confidence: z.enum(['low', 'medium', 'high']),
});
export const LlmOutputSchema = z.object({
  clauses: z.array(LlmClauseSchema).max(40),
  uncertainties: z.array(z.string().max(300)).max(10),
});
export type LlmOutput = z.infer<typeof LlmOutputSchema>;

/** Clause after deterministic validation: quote is proven to exist in the source. */
export interface VerifiedClause {
  id: string;
  category: Category;
  severity: 1 | 2 | 3;
  quote: string;
  quoteStart: number;
  quoteEnd: number;
  explanationTr: string;
  confidence: 'low' | 'medium' | 'high';
}

export interface Report {
  url: string;
  score: number; // 0-100, deterministic
  level: 'low' | 'medium' | 'high';
  clauses: VerifiedClause[];
  rejected: { reason: string; quote: string }[]; // dropped by validator
  uncertainties: string[];
  injectionFlags: string[];
  coverage: number; // 0..1 share of text chunks analysed successfully
  disclaimer: string;
}

export const DISCLAIMER_TR =
  'Bu araç hukuki tavsiye vermez. Sonuçlar otomatik analizdir; önemli kararlar için bir avukata danışın.';

/** JSON schema handed to Claude as tool input_schema. */
export const TOOL_INPUT_SCHEMA = {
  type: 'object',
  properties: {
    clauses: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          category: { type: 'string', enum: [...CATEGORIES] },
          severity: { type: 'integer', minimum: 1, maximum: 3 },
          quote: { type: 'string', description: 'Verbatim, contiguous excerpt copied from the document.' },
          explanationTr: { type: 'string', description: 'Plain Turkish, 1-2 sentences.' },
          confidence: { type: 'string', enum: ['low', 'medium', 'high'] },
        },
        required: ['category', 'severity', 'quote', 'explanationTr', 'confidence'],
      },
    },
    uncertainties: { type: 'array', items: { type: 'string' } },
  },
  required: ['clauses', 'uncertainties'],
} as const;
