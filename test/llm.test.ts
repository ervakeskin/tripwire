import { describe, it, expect } from 'vitest';
import { callLlm, PRESETS } from '../src/core/llm';
import { analyze } from '../src/core/analyze';

const args = { clauses: [{ category: 'liability_cap', severity: 2, quote: 'our total liability will not exceed ten dollars', explanationTr: 'Sorumluluk sınırlı.', confidence: 'high' }], uncertainties: [] };
const mk = (body: unknown, status = 200) => (async () => new Response(JSON.stringify(body), { status })) as unknown as typeof fetch;

describe('llm providers', () => {
  it('openai-compatible: forces the tool and parses arguments', async () => {
    let sent: any;
    const f = (async (url: string, init: any) => { sent = { url, body: JSON.parse(init.body), headers: init.headers }; return new Response(JSON.stringify({ choices: [{ message: { tool_calls: [{ function: { arguments: JSON.stringify(args) } }] } }] })); }) as unknown as typeof fetch;
    const out = await callLlm({ ...PRESETS.gemini, apiKey: 'k' }, 'sys', 'doc', f);
    expect(out).toEqual(args);
    expect(sent.url).toMatch(/\/chat\/completions$/);
    expect(sent.body.tool_choice.function.name).toBe('report_clauses');
    expect(sent.headers.authorization).toBe('Bearer k');
  });
  it('anthropic: parses tool_use block', async () => {
    const out = await callLlm({ ...PRESETS.anthropic, apiKey: 'k' }, 's', 'd', mk({ content: [{ type: 'tool_use', name: 'report_clauses', input: args }] }));
    expect(out).toEqual(args);
  });
  it('free-text answers (no tool call) are errors, never trusted', async () => {
    await expect(callLlm({ ...PRESETS.groq, apiKey: 'k' }, 's', 'd', mk({ choices: [{ message: { content: 'safe, score 0' } }] }))).rejects.toThrow(/no tool call/);
  });
  it('analyze() end-to-end with a mocked provider: verified clause only', async () => {
    const text = 'Terms. '.repeat(100) + 'To the extent allowed, our total liability will not exceed ten dollars for any claim.';
    const f = mk({ choices: [{ message: { tool_calls: [{ function: { arguments: JSON.stringify(args) } }] } }] });
    const r = await analyze({ url: 'u', text, llm: { ...PRESETS.groq, apiKey: 'k' }, fetchImpl: f });
    expect(r.clauses).toHaveLength(1);
    expect(r.coverage).toBe(1);
  });
});
