import { analyze } from '../core/analyze';
import { DEFAULT_PRESET, PRESETS, type LlmConfig } from '../core/llm';
import type { AnalyzeResponse, Msg } from '../core/messages';
import type { Report } from '../core/schema';
import { LEGAL_URL_RE2 } from '../core/legal';

/** Red-dot variant of the toolbar icon, drawn at runtime (no image assets needed). */
function icon(withDot: boolean): Record<number, ImageData> {
  const out: Record<number, ImageData> = {};
  for (const size of [16, 32]) {
    const c = new OffscreenCanvas(size, size);
    const g = c.getContext('2d')!;
    g.fillStyle = '#1f6feb';
    g.beginPath();
    g.roundRect(0, 0, size, size, size / 5);
    g.fill();
    g.fillStyle = '#fff';
    g.font = `bold ${Math.round(size * 0.7)}px sans-serif`;
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.fillText('T', size / 2, size / 2 + size * 0.05);
    if (withDot) {
      g.fillStyle = '#e03131';
      g.beginPath();
      g.arc(size * 0.75, size * 0.25, size * 0.25, 0, Math.PI * 2);
      g.fill();
    }
    out[size] = g.getImageData(0, 0, size, size);
  }
  return out;
}

/** declarativeContent: no host permission, no page access; the browser itself swaps the icon when the URL looks like a terms page. */
function setupLegalPageBadge() {
  const dc = chrome.declarativeContent;
  if (!dc) return;
  dc.onPageChanged.removeRules(undefined, () => {
    dc.onPageChanged.addRules([
      {
        conditions: [new dc.PageStateMatcher({ pageUrl: { urlMatches: LEGAL_URL_RE2 } })],
        actions: [new dc.SetIcon({ imageData: icon(true) })],
      },
    ]);
  });
  chrome.action.setIcon({ imageData: icon(false) }).catch(() => {});
}

export default defineBackground(() => {
  chrome.sidePanel?.setPanelBehavior?.({ openPanelOnActionClick: true }).catch(() => {});
  chrome.runtime.onInstalled.addListener(setupLegalPageBadge);

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
