/** Deterministic injection heuristics: flag, never obey. */
const INJECTION_PATTERNS: [RegExp, string][] = [
  [/ignore (all |any )?(previous|prior|above) (instructions|prompts?)/i, 'ignore-previous'],
  [/disregard (all |any )?(previous|prior|above)/i, 'disregard-previous'],
  [/(you are|as) an? (ai|assistant|language model)[^.]{0,80}(report|rate|mark|say|output)/i, 'addresses-ai'],
  [/(risk|skor|score)[^.]{0,40}\b(0|sıfır|zero)\b/i, 'score-manipulation'],
  [/(report|mark|rate|label)[^.]{0,40}(safe|harmless|güvenli)/i, 'safe-labelling'],
  [/system prompt|<\/?(system|assistant|document)>/i, 'prompt-markup'],
  [/önceki (tüm )?talimatları (yok say|unut)/i, 'ignore-previous-tr'],
];

export function detectInjection(text: string): string[] {
  const out = new Set<string>();
  for (const [re, label] of INJECTION_PATTERNS) if (re.test(text)) out.add(label);
  return [...out];
}

/** Strip page-controller index markup (`[12]<a ...>` / ` />`) and collapse blank lines. */
export function stripMarkup(s: string): string {
  return s
    .replace(/\[\d+\]<[a-z0-9]+[^>]*?>/gi, '')
    .replace(/\s*\/>/g, '')
    .replace(/<[^>]+>/g, '')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * Visible text only: skips hidden / zero-size / aria-hidden / script content.
 * Hidden text is returned separately so it can be flagged but never sent to the LLM.
 */
export function extractVisibleText(root: Element, win: Window = window): { visible: string; hidden: string } {
  const doc = root.ownerDocument;
  const vis: string[] = [];
  const hid: string[] = [];
  const isHidden = (el: Element): boolean => {
    for (let e: Element | null = el; e; e = e.parentElement) {
      if (['SCRIPT', 'STYLE', 'NOSCRIPT', 'TEMPLATE'].includes(e.tagName)) return true;
      if (e.getAttribute('aria-hidden') === 'true' || e.hasAttribute('hidden')) return true;
      const cs = win.getComputedStyle(e);
      if (cs.display === 'none' || cs.visibility === 'hidden' || parseFloat(cs.opacity || '1') === 0) return true;
      if (cs.fontSize && parseFloat(cs.fontSize) < 2) return true;
      if (cs.color && cs.color === cs.backgroundColor) return true;
      if (cs.textIndent && parseFloat(cs.textIndent) <= -999) return true;
      if (cs.position === 'absolute' && (parseFloat(cs.left) <= -999 || parseFloat(cs.top) <= -999)) return true;
    }
    return false;
  };
  const walker = doc.createTreeWalker(root, 4 /* NodeFilter.SHOW_TEXT */);
  let prevBlock: Element | null = null;
  for (let n = walker.nextNode(); n; n = walker.nextNode()) {
    const t = (n.textContent ?? '').replace(/\s+/g, ' ').trim();
    if (!t) continue;
    const el = n.parentElement!;
    const block = el.closest('p,li,h1,h2,h3,h4,h5,h6,div,section,td,tr') ?? el;
    const sep = block !== prevBlock ? '\n' : ' ';
    prevBlock = block;
    (isHidden(el) ? hid : vis).push(sep + t);
  }
  return { visible: vis.join('').trim(), hidden: hid.join('').trim() };
}
