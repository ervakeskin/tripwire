/**
 * Records REAL model output for the two demo pages into cypress/fixtures/llm-*.json.
 * The Cypress demo replays these (wrapped in the Anthropic message shape the web harness expects), so the video shows
 * genuine model behaviour, deterministically and without needing a key at demo time.
 * Usage: LLM_PRESET=gemini LLM_MODEL=gemini-3.1-flash-lite LLM_API_KEY=... npx tsx scripts/record-fixtures.ts
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { JSDOM } from 'jsdom';
import { SYSTEM } from '../src/core/analyze';
import { callLlm, PRESETS, type LlmConfig } from '../src/core/llm';
import { extractVisibleText } from '../src/core/sanitize';

const preset = PRESETS[process.env.LLM_PRESET ?? 'gemini'];
const llm: LlmConfig = { ...preset, apiKey: process.env.LLM_API_KEY ?? '', model: process.env.LLM_MODEL ?? preset.model };

const pages: Record<string, string> = { 'llm-happy': 'tos-demo', 'llm-uncertain': 'injection' };
for (const [out, page] of Object.entries(pages)) {
  const dom = new JSDOM(readFileSync(`src/public/fixtures/${page}.html`, 'utf8'));
  const { visible } = extractVisibleText(dom.window.document.body, dom.window as unknown as Window);
  const input = await callLlm(llm, SYSTEM, `<document>\n${visible}\n</document>`);
  const msg = {
    id: `recorded_${page}`,
    type: 'message',
    role: 'assistant',
    _recordedWith: llm.model,
    content: [{ type: 'tool_use', id: 'tu_rec', name: 'report_clauses', input }],
  };
  writeFileSync(`cypress/fixtures/${out}.json`, JSON.stringify(msg, null, 2));
  console.log(out, '<-', page, JSON.stringify(input).length, 'bytes');
}
