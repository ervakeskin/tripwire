import { TOOL_INPUT_SCHEMA } from './schema';

/** Provider-agnostic LLM config. 'openai' = any OpenAI-compatible /chat/completions endpoint (Gemini, Groq, OpenRouter, Ollama...). */
export interface LlmConfig {
  provider: 'anthropic' | 'openai';
  baseURL: string;
  model: string;
  apiKey: string;
}

export const PRESETS: Record<string, Omit<LlmConfig, 'apiKey'> & { label: string; keyHint: string }> = {
  gemini: { label: 'Google Gemini (ücretsiz kota)', provider: 'openai', baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai', model: 'gemini-2.5-flash', keyHint: 'aistudio.google.com/apikey — kart gerekmez' },
  groq: { label: 'Groq (ücretsiz kota)', provider: 'openai', baseURL: 'https://api.groq.com/openai/v1', model: 'llama-3.3-70b-versatile', keyHint: 'console.groq.com/keys — kart gerekmez' },
  ollama: { label: 'Ollama (yerel, anahtarsız)', provider: 'openai', baseURL: 'http://localhost:11434/v1', model: 'qwen2.5:7b-instruct', keyHint: 'Anahtar gerekmez; `ollama serve` çalışmalı' },
  anthropic: { label: 'Anthropic Claude', provider: 'anthropic', baseURL: 'https://api.anthropic.com', model: 'claude-haiku-4-5-20251001', keyHint: 'console.anthropic.com' },
};
export const DEFAULT_PRESET = 'gemini';

const TOOL_NAME = 'report_clauses';
const TOOL_DESC = 'Report risky clauses found in the document.';

/** One schema-forced call. Returns the raw tool input (unvalidated: validation is the caller's job). */
export async function callLlm(cfg: LlmConfig, system: string, userContent: string, fetchImpl: typeof fetch = fetch): Promise<unknown> {
  const base = cfg.baseURL.replace(/\/+$/, '');
  if (cfg.provider === 'anthropic') {
    const res = await fetchImpl(`${base}/v1/messages`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-api-key': cfg.apiKey, 'anthropic-version': '2023-06-01', 'anthropic-dangerous-direct-browser-access': 'true' },
      body: JSON.stringify({
        model: cfg.model, max_tokens: 4096, temperature: 0, system,
        tools: [{ name: TOOL_NAME, description: TOOL_DESC, input_schema: TOOL_INPUT_SCHEMA }],
        tool_choice: { type: 'tool', name: TOOL_NAME },
        messages: [{ role: 'user', content: userContent }],
      }),
    });
    if (!res.ok) throw new Error(`LLM API ${res.status}: ${(await res.text()).slice(0, 200)}`);
    const json: any = await res.json();
    const block = (json.content ?? []).find((b: any) => b.type === 'tool_use' && b.name === TOOL_NAME);
    if (!block) throw new Error('no tool_use block in response');
    return block.input;
  }

  const res = await fetchImpl(`${base}/chat/completions`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...(cfg.apiKey ? { authorization: `Bearer ${cfg.apiKey}` } : {}) },
    body: JSON.stringify({
      model: cfg.model, temperature: 0,
      messages: [{ role: 'system', content: system }, { role: 'user', content: userContent }],
      tools: [{ type: 'function', function: { name: TOOL_NAME, description: TOOL_DESC, parameters: TOOL_INPUT_SCHEMA } }],
      tool_choice: { type: 'function', function: { name: TOOL_NAME } },
    }),
  });
  if (!res.ok) throw new Error(`LLM API ${res.status}: ${(await res.text()).slice(0, 200)}`);
  const json: any = await res.json();
  const args = json.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
  if (typeof args !== 'string') throw new Error('no tool call in response');
  try {
    return JSON.parse(args);
  } catch {
    throw new Error('tool arguments were not valid JSON');
  }
}
