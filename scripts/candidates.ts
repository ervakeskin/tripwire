/** Helper for hand-labelling: lists sentences matching risk keywords so a human can pick gold items. */
import { readFileSync } from 'node:fs';
const RE: Record<string, RegExp> = {
  auto_renewal: /auto(matically)?[- ]?renew|renew automatically|recurring (billing|charge|payment)|automatically (charge|bill)/i,
  arbitration_waiver: /waive[^.]{0,60}(class|jury|right to)|class action|individual basis|binding arbitration/i,
  data_sale: /\bsell(ing)?\b[^.]{0,40}(personal|data|information)|share[^.]{0,60}(advertis|partners|third part)/i,
  unilateral_change: /(may|can|reserve the right to) (change|modify|update|amend)[^.]{0,60}(terms|agreement|service)|at any time[^.]{0,40}(modify|change)/i,
  liability_cap: /(not|no) (be )?liable|limitation of liability|aggregate liability|in no event/i,
  content_license: /(perpetual|irrevocable|worldwide|royalty-free|sublicens)[^.]{0,120}(license|content)/i,
  cancellation_friction: /(no|not) (be )?(entitled to )?refund|non-refundable|cancel[^.]{0,60}(before|prior|days)/i,
  tracking: /cookies|track(ing)?\b|pixel|analytics/i,
  account_termination: /terminate[^.]{0,60}(at any time|sole discretion|without notice)|suspend[^.]{0,40}(at any time|sole discretion)/i,
};
const doc = process.argv[2];
const text = readFileSync(`eval/corpus/${doc}.txt`, 'utf8');
const sents = text.split(/(?<=[.!?])\s+|\n/).map((s) => s.trim()).filter((s) => s.length > 40);
let n = 0;
for (const [cat, re] of Object.entries(RE)) {
  const hits = sents.filter((s) => re.test(s)).slice(0, 4);
  for (const s of hits) console.log(`${doc}#${n++} [${cat}] ${s.slice(0, 260)}`);
}
