import { DEFAULT_PRESET, PRESETS } from '../../core/llm';

const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;
const preset = $<HTMLSelectElement>('preset');
const key = $<HTMLInputElement>('key');
const model = $<HTMLInputElement>('model');
const baseURL = $<HTMLInputElement>('baseURL');
const hint = $('hint');

preset.innerHTML = Object.entries(PRESETS).map(([id, p]) => `<option value="${id}">${p.label}</option>`).join('');

function applyPreset(id: string) {
  const p = PRESETS[id];
  model.value = p.model;
  baseURL.value = p.baseURL;
  hint.textContent = `Anahtar: ${p.keyHint}`;
}
preset.addEventListener('change', () => applyPreset(preset.value));

chrome.storage.local.get('llm').then(({ llm }: { llm?: any }) => {
  preset.value = llm?.preset ?? DEFAULT_PRESET;
  applyPreset(preset.value);
  if (llm) {
    key.value = llm.apiKey ?? '';
    model.value = llm.model ?? model.value;
    baseURL.value = llm.baseURL ?? baseURL.value;
  }
});

$('save').addEventListener('click', async () => {
  const p = PRESETS[preset.value];
  await chrome.storage.local.set({
    llm: { preset: preset.value, provider: p.provider, baseURL: baseURL.value.trim(), model: model.value.trim(), apiKey: key.value.trim() },
  });
  $('ok').textContent = 'Kaydedildi ✓';
});
