/** Downloads real ToS pages and stores their visible text (same extractor as the extension) in eval/corpus. */
import { JSDOM } from 'jsdom';
import { writeFileSync, mkdirSync } from 'node:fs';
import { extractVisibleText } from '../src/core/sanitize';

const SOURCES: Record<string, string> = {
  spotify: 'https://www.spotify.com/us/legal/end-user-agreement/',
  dropbox: 'https://www.dropbox.com/terms',
  reddit: 'https://www.redditinc.com/policies/user-agreement',
  grammarly: 'https://www.grammarly.com/terms',
  linkedin: 'https://www.linkedin.com/legal/user-agreement',
  slack: 'https://slack.com/terms-of-service/user',
};

mkdirSync('eval/corpus', { recursive: true });
const meta: Record<string, { url: string; fetched: string; chars: number }> = {};
for (const [name, url] of Object.entries(SOURCES)) {
  const html = await (await fetch(url, { headers: { 'user-agent': 'Mozilla/5.0' } })).text();
  const dom = new JSDOM(html.replace(/<style[\s\S]*?<\/style>/gi, ''), { url });
  const main = dom.window.document.querySelector('main, article, [role=main]') ?? dom.window.document.body;
  const { visible } = extractVisibleText(main, dom.window as unknown as Window);
  writeFileSync(`eval/corpus/${name}.txt`, visible, 'utf8');
  meta[name] = { url, fetched: new Date().toISOString().slice(0, 10), chars: visible.length };
  console.log(name, visible.length);
}
writeFileSync('eval/corpus/SOURCES.json', JSON.stringify(meta, null, 2));
