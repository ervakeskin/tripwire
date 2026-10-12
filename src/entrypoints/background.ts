import { analyze } from '../core/analyze';
import { DEFAULT_PRESET, PRESETS, type LlmConfig } from '../core/llm';
import type { AnalyzeResponse, Msg } from '../core/messages';
import type { Report } from '../core/schema';

export default defineBackground(() => {
  // Open the panel ourselves from action.onClicked: that click grants `activeTab` for the current tab (setPanelBehavior's
  // openPanelOnActionClick does NOT, which made the panel unable to read the page).
  chrome.sidePanel?.setPanelBehavior?.({ openPanelOnActionClick: false }).catch(() => {});
  chrome.action.onClicked.addListener((tab) => {
    if (tab.id !== undefined) void chrome.sidePanel.open({ tabId: tab.id });
  });

  chrome.runtime.onMessage.addListener((msg: Msg, _sender, sendResponse) => {
    if (msg.type !== 'ANALYZE') return;
    (async (): Promise<AnalyzeResponse> => {
      // API key lives only in chrome.storage.local and is read here, never in page contexts.
      const { llm: saved } = (await chrome.storage.local.get('llm')) as { llm?: Partial<LlmConfig> };
      const cfg: LlmConfig = { ...PRESETS[DEFAULT_PRESET], apiKey: '', ...saved };
      const keyless = /^https?:\/\/(localhost|127\.0\.0\.1)/.test(cfg.baseURL);
      if (!cfg.apiKey && !keyless) return { ok: false, error: 'LLM anahtarı yok. Uzantı ayarlarından sağlayıcı seçip anahtarınızı girin (Gemini/Groq ücretsiz).' };
      const report: Report = await analyze({
        url: msg.page.url,
        text: msg.page.text,
        llm: cfg,
        onProgress: (done, total) => chrome.runtime.sendMessage({ type: 'PROGRESS', done, total } satisfies Msg).catch(() => {}),
      });
      // flags found in hidden page text are merged in as well
      report.injectionFlags = [...new Set([...report.injectionFlags, ...msg.page.hiddenFlags.map((f) => `hidden:${f}`)])];
      return { ok: true, report };
    })()
      .then(sendResponse)
      .catch((e) => sendResponse({ ok: false, error: String(e?.message ?? e) } satisfies AnalyzeResponse));
    return true;
  });
});
