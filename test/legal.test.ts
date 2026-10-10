import { describe, it, expect } from 'vitest';
import { isLegalUrl, pickLegalLinks, LEGAL_URL_RE2 } from '../src/core/legal';

describe('isLegalUrl', () => {
  it.each([
    'https://www.dropbox.com/terms',
    'https://www.redditinc.com/policies/user-agreement',
    'https://www.spotify.com/us/legal/end-user-agreement/',
    'https://www.linkedin.com/legal/user-agreement',
    'https://example.com/privacy-policy',
    'https://example.com/privacy_policy.html',
    'https://example.com/tr/gizlilik',
    'https://example.com/kullanim-kosullari/sozlesme',
    'https://example.com/privacy_policy.html',
    'https://slack.com/terms-of-service/user',
  ])('detects %s', (u) => expect(isLegalUrl(u)).toBe(true));

  it.each([
    'https://example.com/',
    'https://news.example.com/2024/05/interest-terms-explained-in-politics',
    'https://example.com/blog/how-we-built-search',
    'https://shop.example.com/product/12?ref=termsheet',
    'https://example.com/legalese-podcast', // not a path token
  ])('ignores %s', (u) => expect(isLegalUrl(u)).toBe(false));

  it('falls back to the title', () => {
    expect(isLegalUrl('https://example.com/x/12', 'Acme Terms of Service')).toBe(true);
    expect(isLegalUrl('https://example.com/x/12', 'Gizlilik Politikası')).toBe(true);
    expect(isLegalUrl('https://example.com/x/12', 'Our story')).toBe(false);
  });

  it('declarativeContent pattern is RE2-safe (no lookarounds/backrefs)', () => {
    expect(LEGAL_URL_RE2).not.toMatch(/\(\?[=!<]|\\[1-9]/);
  });
});

describe('pickLegalLinks', () => {
  const links = [
    { text: 'Terms of Service', href: '/terms' },
    { text: 'Terms of Service', href: '/terms#top' }, // duplicate after hash removal
    { text: 'Privacy', href: 'https://example.com/privacy' },
    { text: 'Pricing', href: '/pricing' },
    { text: 'Gizlilik Politikası', href: '/tr/gizlilik' },
    { text: 'Mail us', href: 'mailto:a@b.c' },
    { text: 'Help', href: '/help/terms-explained' }, // matched by URL token
    { text: 'x'.repeat(200), href: '/terms' }, // overlong label ignored
  ];
  it('returns deduplicated absolute http(s) legal links', () => {
    const out = pickLegalLinks(links, 'https://example.com/');
    expect(out.map((l) => l.href)).toEqual([
      'https://example.com/terms',
      'https://example.com/privacy',
      'https://example.com/tr/gizlilik',
      'https://example.com/help/terms-explained',
    ]);
  });
  it('respects max', () => {
    expect(pickLegalLinks(links, 'https://example.com/', 2)).toHaveLength(2);
  });
});
