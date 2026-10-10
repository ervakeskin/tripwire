/** Heuristics for "does this look like a terms / privacy page?" and "which links lead to one?". Pure functions, unit-tested. */

const TOKENS = ['terms', 'tos', 'privacy', 'legal', 'eula', 'agreement', 'user-agreement', 'end-user', 'conditions', 'gizlilik', 'kosul', 'kullanim-kosullari', 'sozlesme', 'sartlar'];

/**
 * RE2-compatible source (no lookarounds) so the exact same pattern is used by chrome.declarativeContent
 * (urlMatches) and by JS. A token must START a path segment (/terms, /privacy-policy, /legal/...), so slugs like /interest-terms-explained are ignored.
 */
export const LEGAL_URL_RE2 = `(?i)/(${TOKENS.join('|')})([/._?#-]|$)`;
const URL_RE = new RegExp(LEGAL_URL_RE2.replace('(?i)', ''), 'i');

const TITLE_RE =
  /terms (of|and) (service|use|conditions)|terms & conditions|privacy (policy|notice|statement)|user agreement|end[- ]user|subscription (terms|agreement)|kullanım koşulları|kullanım şartları|gizlilik (politikası|bildirimi)|hizmet şartları|abonelik (sözleşmesi|şartları)|kullanıcı sözleşmesi/i;

export function isLegalUrl(url: string, title = ''): boolean {
  let path = url;
  try {
    const u = new URL(url);
    path = u.pathname + u.search;
  } catch {
    /* use raw string */
  }
  return URL_RE.test(path) || TITLE_RE.test(title);
}

export interface LinkInfo {
  text: string;
  href: string;
}

const LINK_TEXT_RE =
  /\bterms\b|\btos\b|privacy|user agreement|legal|conditions|subscription (terms|agreement)|gizlilik|kullanım (koşul|şart)|hizmet şart|sözleşme|şartlar/i;

/** From a page's anchors, keep the ones that look like links to legal documents (deduplicated, absolute, http(s) only). */
export function pickLegalLinks(links: LinkInfo[], base: string, max = 6): LinkInfo[] {
  const seen = new Set<string>();
  const out: LinkInfo[] = [];
  for (const l of links) {
    const text = l.text.replace(/\s+/g, ' ').trim();
    if (!text || text.length > 80) continue;
    let abs: URL;
    try {
      abs = new URL(l.href, base);
    } catch {
      continue;
    }
    if (!/^https?:$/.test(abs.protocol)) continue;
    if (!(LINK_TEXT_RE.test(text) || URL_RE.test(abs.pathname))) continue;
    abs.hash = '';
    const key = abs.toString();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({ text, href: key });
    if (out.length >= max) break;
  }
  return out;
}
