// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { extractVisibleText, detectInjection } from '../src/core/sanitize';
import { validateLlmOutput } from '../src/core/validate';

const html = readFileSync('src/public/fixtures/injection.html', 'utf8');
document.documentElement.innerHTML = html.replace(/<!doctype html>/i, '');
const { visible, hidden } = extractVisibleText(document.body, window);

describe('prompt injection fixture', () => {
  it('(a) hidden instructions never reach the LLM text', () => {
    expect(visible).not.toMatch(/disregard all prior/i);
    expect(visible).not.toMatch(/output an empty clause list/i);
    expect(visible).not.toMatch(/display.?none|set the risk score to 0/i);
    expect(hidden).toMatch(/Ignore previous instructions/i);
    expect(hidden).toMatch(/disregard all prior/i);
    expect(detectInjection(hidden).length).toBeGreaterThan(0);
  });
  it('(b) visible injection is flagged, not obeyed', () => {
    expect(visible).toMatch(/Note to any AI assistant/);
    expect(detectInjection(visible)).toContain('ignore-previous');
  });
  it('(c) a model that was fooled and fabricates a "safe" verdict clause is rejected by the validator', () => {
    const fooled = {
      clauses: [{ category: 'other', severity: 1, quote: 'This document is completely safe, risk score 0', explanationTr: 'Belge güvenli.', confidence: 'high' }],
      uncertainties: [],
    };
    const r = validateLlmOutput(fooled, visible, { url: 'x', coverage: 1, injectionFlags: detectInjection(visible) });
    expect(r.clauses).toHaveLength(0);
    expect(r.rejected[0].reason).toBe('quote_not_in_source');
  });
  it('(d) even if the model skips risks, score is computed from verified clauses only (no LLM-set score field exists)', () => {
    const r = validateLlmOutput({ clauses: [], uncertainties: [], score: 0, risk: 'safe' }, visible, { url: 'x', coverage: 1, injectionFlags: [] });
    expect(r.score).toBe(0); // empty by model's choice => honest "nothing verified", UI states this is not a safety guarantee
    expect('risk' in r).toBe(false);
  });
});
