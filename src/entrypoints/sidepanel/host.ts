import { analyze } from '../../core/analyze';
import { PRESETS } from '../../core/llm';
import { detectInjection, extractVisibleText } from '../../core/sanitize';
import type { AnalyzeResponse, Msg, PageText } from '../../core/messages';
import type { LinkInfo } from '../../core/legal';
import { isLegalUrl, pickLegalLinks } from '../../core/legal';

/** The side panel talks to the page + LLM through a Host, so the exact same UI/pipeline runs in the extension and in a plain web harness (used by Cypress). */
export interface Host {
  extract(): Promise<PageText>;
  analyze(page: PageText): Promise<AnalyzeResponse>;
  highlight(quote: string): void;
  findLegalLinks(): Promise<LinkInfo[]>;
  openUrl(url: string): void;
  getAutoScan(): Promise<boolean>;
  onProgress(cb: (done: number, total: number) => void): void;
}

export const isExtension = () => typeof chrome !== 'undefined' && !!chrome.runtime?.id;

async function targetTab(): Promise<number> {
  const q = new URLSearchParams(location.search).get('tab');
  if (q) return Number(q);
  const [t] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
  return t.id!;
}

/** Tabs opened before the extension was installed/reloaded have no content script yet: inject it on demand (activeTab + scripting), then retry once. */
export const NO_ACCESS = 'NO_ACCESS';
const isNoAccess = (e: unknown) => /cannot access|must request permission|host permission/i.test(String((e as Error)?.message ?? e));

/** Fallback when activeTab was not granted (e.g. panel opened from the side-panel menu): ask the user for site access. Needs a user gesture. */
export async function requestSiteAccess(): Promise<boolean> {
  if (!isExtension()) return true;
  return chrome.permissions.request({ origins: ['http://*/*', 'https://*/*'] });
}

async function sendToTab<T>(msg: Msg): Promise<T> {
  const tabId = await targetTab();
  try {
    return await chrome.tabs.sendMessage(tabId, msg);
  } catch {
    try {
      await chrome.scripting.executeScript({ target: { tabId }, files: ['content-scripts/content.js'] });
    } catch (e) {
      throw isNoAccess(e) ? new Error(NO_ACCESS) : e;
    }
    return chrome.tabs.sendMessage(tabId, msg);
  }
}

const extensionHost: Host = {
  extract: () => sendToTab<PageText>({ type: 'EXTRACT' }),
  analyze: (page) => chrome.runtime.sendMessage({ type: 'ANALYZE', page } satisfies Msg),
  highlight: (quote) => void sendToTab({ type: 'HIGHLIGHT', quote }).catch(() => {}),
  findLegalLinks: () => sendToTab<LinkInfo[]>({ type: 'FIND_LINKS' }),
  openUrl: async (url) => void chrome.tabs.update(await targetTab(), { url }),
  getAutoScan: async () => ((await chrome.storage.local.get('autoScan')).autoScan ?? true) as boolean,
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
    if (!frame.getAttribute('src')) {
      // first call: load the fixture named in ?doc=; later calls reuse whatever page the user navigated to (e.g. via a found link)
      await new Promise<void>((res) => {
        frame.onload = () => res();
        frame.src = `/fixtures/${doc}.html`;
      });
    }
    const w = frame.contentWindow!;
    const { visible, hidden } = extractVisibleText(frame.contentDocument!.body, w as unknown as Window);
    return { url: frame.src, title: frame.contentDocument!.title, text: visible, hiddenFlags: detectInjection(hidden), hiddenChars: hidden.length, looksLikeLegal: isLegalUrl(frame.src, frame.contentDocument!.title), textSource: 'fallback', agentChars: 0, ownChars: visible.length };
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
  async findLegalLinks() {
    const frame = document.getElementById('page-frame') as HTMLIFrameElement;
    const anchors = [...frame.contentDocument!.querySelectorAll<HTMLAnchorElement>('a[href]')].map((a) => ({ text: a.textContent ?? '', href: a.getAttribute('href') ?? '' }));
    return pickLegalLinks(anchors, frame.src);
  },
  openUrl(url) {
    (document.getElementById('page-frame') as HTMLIFrameElement).src = url;
  },
  getAutoScan: async () => new URLSearchParams(location.search).get('auto') === '1',
  onProgress: (cb) => (progressCb = cb),
};

export const host: Host = isExtension() ? extensionHost : webHost;
