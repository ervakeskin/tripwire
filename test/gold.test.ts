import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { locateQuote } from '../src/core/validate';

// Guards the eval itself: every hand-labelled gold quote must exist verbatim in the stored corpus.
const gold = JSON.parse(readFileSync('eval/gold.json', 'utf8'));
describe('gold labels', () => {
  for (const doc of Object.keys(gold).filter((k) => !k.startsWith('_'))) {
    it(`${doc}: all gold quotes found in corpus`, () => {
      const text = readFileSync(`eval/corpus/${doc}.txt`, 'utf8');
      for (const g of gold[doc]) expect(locateQuote(text, g.quote), g.quote).not.toBeNull();
    });
  }
});
