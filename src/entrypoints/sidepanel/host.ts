import { analyze } from '../../core/analyze';
import { PRESETS } from '../../core/llm';
import { detectInjection, extractVisibleText } from '../../core/sanitize';
import type { AnalyzeResponse, Msg, PageText } from '../../core/messages';

/** The side panel talks to the page + LLM through a Host, so the exact same UI/pipeline runs in the extension and in a plain web harness (used by Cypress). */
export interface Host {
  extract(): Promise<PageText>;
  analyze(page: PageText): Promise<AnalyzeResponse>;
  highlight(quote: string): void;
  onProgress(cb: (done: number, total: number) => void): void;
}

export const isExtension = () => typeof chrome !== 'undefined' && !!chrome.runtime?.id;

async function targetTab(): Promise<number> {
  const q = new URLSearchParams(location.search).get('tab');
  if (q) return Number(q);
  const [t] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
  return t.id!;
}

const extensionHost: Host = {
  async extract() {
    return chrome.tabs.sendMessage(await targetTab(), { type: 'EXTRACT' } satisfies Msg);
  },
  analyze: (page) => chrome.runtime.sendMessage({ type: 'ANALYZE', page } satisfies Msg),
  highlight: async (quote) => chrome.tabs.sendMessage(await targetTab(), { type: 'HIGHLIGHT', quote } satisfies Msg),
  onProgress: (cb) =>
    chrome.runtime.onMessage.addListener((m: Msg) => {
      if (m.type === 'PROGRESS') cb(m.done, m.total);
    }),
};

/** Web harness: `sidepanel.html?doc=tos-demo` loads fixtures/<doc>.html in an iframe and analyses it with the same core code. */
let progressCb: (d: number, t: number) => void = () => {};
const webHost: Host = {
  async extract() {
    const doc = new URLSearchParams(location.search).get('doc') ?? 'tos-demo';
    const frame = document.getElementById('page-frame') as HTMLIFrameElement;
    await new Promise<void>((res) => {
      frame.onload = () => res();
      frame.src = `/fixtures/${doc}.html`;
    });
    const w = frame.contentWindow!;
    const { visible, hidden } = extractVisibleText(frame.contentDocument!.body, w as unknown as Window);
    return { url: frame.src, title: frame.contentDocument!.title, text: visible, hiddenFlags: detectInjection(hidden), hiddenChars: hidden.length, looksLikeLegal: /terms|privacy/i.test(frame.contentDocument!.title) };
  },
  async analyze(page) {
    try {
      const report = await analyze({ url: page.url, text: page.text, llm: { ...PRESETS.anthropic, apiKey: 'harness' }, onProgress: progressCb });
      report.injectionFlags = [...new Set([...report.injectionFlags, ...page.hiddenFlags.map((f) => `hidden:${f}`)])];
      return { ok: true, report };
    } catch (e) {
      return { ok: false, error: (e as Error).message };
    }
  },
  highlight(quote) {
    const frame = document.getElementById('page-frame') as HTMLIFrameElement;
    const needle = quote.slice(0, 30).toLowerCase();
    const walker = frame.contentDocument!.createTreeWalker(frame.contentDocument!.body, NodeFilter.SHOW_TEXT);
    for (let n = walker.nextNode(); n; n = walker.nextNode()) {
      if ((n.textContent ?? '').replace(/\s+/g, ' ').toLowerCase().includes(needle)) {
        const el = (n as Text).parentElement!;
        el.scrollIntoView({ block: 'center' });
        el.style.background = '#ffe08a';
        return;
      }
    }
  },
  onProgress: (cb) => (progressCb = cb),
};

export const host: Host = isExtension() ? extensionHost : webHost;
