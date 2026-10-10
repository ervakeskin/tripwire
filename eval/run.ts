/**
 * Mini eval: runs the real pipeline (chunk -> Claude -> deterministic validator) on stored real ToS texts and
 * compares against hand-labelled gold. Matching rule: same category AND quote spans overlap.
 * Usage: LLM_PRESET=gemini LLM_API_KEY=... npx tsx eval/run.ts [--cached]   (--cached re-scores eval/results/*.json without API calls)
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { analyze } from '../src/core/analyze';
import { PRESETS, type LlmConfig } from '../src/core/llm';
import { locateQuote } from '../src/core/validate';
import type { Report } from '../src/core/schema';

const gold: Record<string, { category: string; quote: string }[]> = JSON.parse(readFileSync('eval/gold.json', 'utf8'));
const sources = JSON.parse(readFileSync('eval/corpus/SOURCES.json', 'utf8'));
const cached = process.argv.includes('--cached');
// Provider via env: LLM_PRESET=gemini|groq|ollama|anthropic (default gemini), LLM_API_KEY, optional LLM_MODEL / LLM_BASE_URL.
const preset = PRESETS[process.env.LLM_PRESET ?? 'gemini'];
const llm: LlmConfig = { ...preset, apiKey: process.env.LLM_API_KEY ?? '', model: process.env.LLM_MODEL ?? preset.model, baseURL: process.env.LLM_BASE_URL ?? preset.baseURL };
const model = llm.model;
mkdirSync('eval/results', { recursive: true });

let tp = 0, fn = 0, fp = 0, rejectedTotal = 0, claimsTotal = 0;
const lines: string[] = [];
for (const doc of Object.keys(gold).filter((k) => !k.startsWith('_'))) {
  const text = readFileSync(`eval/corpus/${doc}.txt`, 'utf8');
  const file = `eval/results/${doc}.json`;
  let report: Report;
  if (cached && existsSync(file)) report = JSON.parse(readFileSync(file, 'utf8'));
  else {
    if (!llm.apiKey && !/localhost/.test(llm.baseURL)) throw new Error('LLM_API_KEY missing');
    report = await analyze({ url: sources[doc].url, text, llm });
    writeFileSync(file, JSON.stringify(report, null, 2));
  }
  const goldSpans = gold[doc].map((g) => ({ ...g, loc: locateQuote(text, g.quote) }));
  const missingGold = goldSpans.filter((g) => !g.loc);
  if (missingGold.length) throw new Error(`${doc}: gold quote not found in corpus: ${missingGold[0].quote}`);
  const overlap = (a: { start: number; end: number }, b: { start: number; end: number }) => a.start < b.end && b.start < a.end;

  const caught = goldSpans.filter((g) => report.clauses.some((c) => c.category === g.category && overlap({ start: c.quoteStart, end: c.quoteEnd }, g.loc!)));
  const missed = goldSpans.filter((g) => !caught.includes(g));
  const extra = report.clauses.filter((c) => !goldSpans.some((g) => g.category === c.category && overlap({ start: c.quoteStart, end: c.quoteEnd }, g.loc!)));
  tp += caught.length; fn += missed.length; fp += extra.length;
  rejectedTotal += report.rejected.length; claimsTotal += report.clauses.length + report.rejected.length;

  lines.push(`## ${doc} (${text.length} chars, score ${report.score}, coverage ${Math.round(report.coverage * 100)}%)`);
  lines.push(`- Yakalanan: ${caught.length}/${goldSpans.length} · Kaçırılan: ${missed.length} · Yanlış alarm adayı: ${extra.length} · Doğrulamada atılan uydurma alıntı: ${report.rejected.length}`);
  for (const m of missed) lines.push(`  - KAÇIRILAN [${m.category}] "${m.quote.slice(0, 90)}…"`);
  for (const e of extra) lines.push(`  - FAZLA [${e.category}] (${e.confidence}) "${e.quote.slice(0, 90)}…" — _elle gözden geçir: gerçek yanlış alarm mı, gold eksik mi?_`);
  lines.push('');
}
const precision = tp / Math.max(1, tp + fp), recall = tp / Math.max(1, tp + fn);
const head = [
  '# Eval raporu', '',
  `Model: ${model ?? 'varsayılan'} · Belge sayısı: ${Object.keys(gold).filter((k) => !k.startsWith('_')).length}`, '',
  `**Yakalanan (TP): ${tp} · Kaçırılan (FN): ${fn} · Yanlış alarm adayı (FP): ${fp}**`,
  `**Recall: ${(recall * 100).toFixed(0)}% · Precision (gold'a göre, alt sınır): ${(precision * 100).toFixed(0)}%**`,
  `Validator tarafından atılan (metinde olmayan alıntı) iddia: ${rejectedTotal}/${claimsTotal}`, '',
  '> Gold etiketler elle ve eksiksiz değildir; "fazla" maddeler tek tek incelenip aşağıdaki Hata Analizi bölümüne işlenmelidir.', '',
];
writeFileSync('eval/report.md', head.concat(lines).join('\n'));
console.log(head.concat(lines).join('\n'));
