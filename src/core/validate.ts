import { LlmClauseSchema, LlmOutputSchema, DISCLAIMER_TR, type Report, type VerifiedClause } from './schema';
import { scoreClauses } from './score';

/** Collapse whitespace/quote styles so cosmetic differences don't fail a verbatim check; keeps an index map to the original. */
export function normalizeWithMap(text: string): { norm: string; map: number[] } {
  let norm = '';
  const map: number[] = [];
  let lastSpace = true;
  for (let i = 0; i < text.length; i++) {
    let ch = text[i];
    if (/\s/.test(ch)) {
      if (lastSpace) continue;
      ch = ' ';
      lastSpace = true;
    } else {
      lastSpace = false;
      if (ch === '‘' || ch === '’') ch = "'";
      else if (ch === '“' || ch === '”') ch = '"';
      else if (ch === '–' || ch === '—') ch = '-';
    }
    norm += ch.toLowerCase();
    map.push(i);
  }
  return { norm, map };
}

export function locateQuote(source: string, quote: string): { start: number; end: number } | null {
  const s = normalizeWithMap(source);
  const q = normalizeWithMap(quote).norm.trim();
  if (q.length < 12) return null;
  const idx = s.norm.indexOf(q);
  if (idx === -1) return null;
  return { start: s.map[idx], end: s.map[idx + q.length - 1] + 1 };
}

export interface ValidateOpts {
  url: string;
  coverage: number;
  injectionFlags: string[];
  existing?: VerifiedClause[];
}

/** Deterministic gate: schema -> verbatim quote in source -> dedupe -> score. No clause survives without a real quote. */
export function validateLlmOutput(raw: unknown, source: string, opts: ValidateOpts): Report {
  const rejected: Report['rejected'] = [];
  const uncertainties: string[] = [];
  const clauses: VerifiedClause[] = [...(opts.existing ?? [])];

  const parsed = LlmOutputSchema.safeParse(raw);
  if (!parsed.success) {
    rejected.push({ reason: 'schema_violation', quote: '' });
  } else {
    uncertainties.push(...parsed.data.uncertainties);
    for (const rawClause of parsed.data.clauses) {
      const cp = LlmClauseSchema.safeParse(rawClause);
      if (!cp.success) {
        rejected.push({ reason: 'invalid_clause', quote: String((rawClause as { quote?: unknown })?.quote ?? '').slice(0, 120) });
        continue;
      }
      const c = cp.data;
      const loc = locateQuote(source, c.quote);
      if (!loc) {
        rejected.push({ reason: 'quote_not_in_source', quote: c.quote.slice(0, 120) });
        continue;
      }
      if (clauses.some((x) => x.category === c.category && Math.abs(x.quoteStart - loc.start) < 20)) continue;
      clauses.push({
        id: `c${clauses.length + 1}`,
        category: c.category,
        severity: c.severity as 1 | 2 | 3,
        quote: source.slice(loc.start, loc.end),
        quoteStart: loc.start,
        quoteEnd: loc.end,
        explanationTr: c.explanationTr,
        confidence: c.confidence,
      });
    }
  }
  if (rejected.length) uncertainties.push(`${rejected.length} iddia şema/alıntı doğrulamasında doğrulanamadığı için atıldı.`);
  const { score, level } = scoreClauses(clauses);
  return {
    url: opts.url,
    score,
    level,
    clauses,
    rejected,
    uncertainties,
    injectionFlags: opts.injectionFlags,
    coverage: opts.coverage,
    disclaimer: DISCLAIMER_TR,
  };
}
