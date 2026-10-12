import { PageController } from '@page-agent/page-controller';
import { detectInjection, extractVisibleText, stripMarkup } from '../core/sanitize';
import { isLegalUrl, pickLegalLinks } from '../core/legal';
import type { Msg, PageText } from '../core/messages';

/**
 * Read layer: page-agent's PageController renders the full page (viewportExpansion -1) as text.
 * Read-only: we never call click/input/execute. Our own visibility-aware extractor is the ground truth
 * for hidden-text detection; whatever is invisible is flagged and NEVER forwarded to the LLM.
 */
async function extract(): Promise<PageText> {
  const { visible, hidden } = extractVisibleText(document.body);
  let text = visible;
  let textSource: PageText['textSource'] = 'fallback';
  let agentChars = 0;
  let pc: PageController | null = null;
  try {
    pc = new PageController({ viewportExpansion: -1 });
    const state = await pc.getBrowserState();
    const viaAgent = stripMarkup(state.content);
    agentChars = viaAgent.length;
    // Prefer page-agent's view only if it is complete enough AND does not leak any hidden text.
    const leaks = hidden.length > 20 && viaAgent.includes(hidden.slice(0, 40));
    if (!leaks && viaAgent.length >= visible.length * 0.6) {
      text = viaAgent;
      textSource = 'page-agent';
    }
  } catch {
    /* fall back to own extractor */
  } finally {
    pc?.dispose(); // also removes the index overlays page-agent draws on the page while building its tree
  }
  return {
    url: location.href,
    title: document.title,
    text,
    hiddenFlags: detectInjection(hidden),
    hiddenChars: hidden.length,
    looksLikeLegal: isLegalUrl(location.href, document.title),
    textSource,
    agentChars,
    ownChars: visible.length,
  };
}

function highlight(quote: string) {
  const sel = window.getSelection();
  const needle = quote.slice(0, 60).toLowerCase().replace(/\s+/g, ' ');
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  for (let n = walker.nextNode(); n; n = walker.nextNode()) {
    const t = n.textContent ?? '';
    const i = t.replace(/\s+/g, ' ').toLowerCase().indexOf(needle.slice(0, 30));
    if (i === -1) continue;
    const el = (n as Text).parentElement!;
    el.scrollIntoView({ block: 'center', behavior: 'smooth' });
    const prev = el.style.cssText;
    el.style.cssText += ';background:#ffe08a!important;outline:2px solid #e8590c;';
    setTimeout(() => (el.style.cssText = prev), 3500);
    sel?.removeAllRanges();
    return;
  }
}

export default defineContentScript({
  matches: ['http://*/*', 'https://*/*'],
  registration: 'runtime', // not injected into every page: only on demand when the user scans (activeTab + scripting)
  main() {
    chrome.runtime.onMessage.addListener((msg: Msg, _s, sendResponse) => {
      if (msg.type === 'EXTRACT') {
        extract().then(sendResponse);
        return true;
      }
      if (msg.type === 'FIND_LINKS') {
        const anchors = [...document.querySelectorAll<HTMLAnchorElement>('a[href]')].map((a) => ({ text: a.textContent ?? '', href: a.getAttribute('href') ?? '' }));
        sendResponse(pickLegalLinks(anchors, location.href));
        return;
      }
      if (msg.type === 'HIGHLIGHT') highlight(msg.quote);
    });
  },
});
