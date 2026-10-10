import type { PageText } from '../../core/messages';
import type { Report } from '../../core/schema';
import { host, isExtension } from './host';

const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;
const CAT_TR: Record<string, string> = {
  auto_renewal: 'Otomatik yenileme', arbitration_waiver: 'Tahkim / dava hakkından feragat', data_sale: 'Veri paylaşımı/satışı',
  unilateral_change: 'Tek taraflı değişiklik', liability_cap: 'Sorumluluk sınırı', content_license: 'İçerik lisansı',
  cancellation_friction: 'İptal zorluğu', tracking: 'İzleme', account_termination: 'Hesap kapatma', other: 'Diğer',
};
const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);

function render(r: Report) {
  const lvl = { low: 'Düşük risk', medium: 'Orta risk', high: 'Yüksek risk' }[r.level];
  let h = `<div class="score ${r.level}" data-testid="score"><div class="num">${r.score}</div><div><b>${lvl}</b><br><small>${r.clauses.length} doğrulanmış madde · kapsam %${Math.round(r.coverage * 100)}</small></div></div>`;
  if (r.injectionFlags.length)
    h += `<div class="notice inj" data-testid="injection">🚨 Sayfada yapay zekâya yönelik gizli/açık talimat benzeri metin bulundu (${esc(r.injectionFlags.join(', '))}). Yok sayıldı; skoru etkilemedi.</div>`;
  if (r.injectionFlags.length && !r.clauses.length)
    h += '<div class="notice inj" data-testid="unreliable">⚠️ Talimat benzeri metin var ve hiç madde doğrulanamadı: bu skora güvenmeyin, belgeyi elle okuyun.</div>';
  for (const u of r.uncertainties) h += `<div class="notice" data-testid="uncertainty">❓ ${esc(u)}</div>`;
  for (const c of r.clauses)
    h += `<div class="clause" data-testid="clause"><span class="tag sev${c.severity}">${'●'.repeat(c.severity)}</span><b>${CAT_TR[c.category]}</b>
      ${c.confidence === 'low' ? '<span class="conf-low" data-testid="lowconf"> · emin değilim</span>' : ''}
      <p>${esc(c.explanationTr)}</p><blockquote data-quote="${esc(c.quote)}" title="Sayfada göster">“${esc(c.quote)}”</blockquote></div>`;
  if (!r.clauses.length && r.coverage > 0) h += '<div class="notice">Doğrulanmış riskli madde bulunamadı. Bu, belgenin risksiz olduğu anlamına gelmez.</div>';
  $('result').innerHTML = h;
  $('result').querySelectorAll<HTMLElement>('blockquote').forEach((b) => b.addEventListener('click', () => host.highlight(b.dataset.quote!)));
}

async function scan() {
  const btn = $<HTMLButtonElement>('scan');
  btn.disabled = true;
  $('result').innerHTML = '';
  $('status').textContent = 'Sayfa okunuyor…';
  try {
    const page: PageText = await host.extract();
    if (page.text.length < 500) throw new Error('Bu sayfada analiz edilecek kadar metin yok.');
    $('status').textContent = page.looksLikeLegal ? 'Analiz ediliyor…' : 'Bu sayfa bir ToS/gizlilik sayfasına benzemiyor, yine de analiz ediliyor…';
    const res = await host.analyze(page);
    if (!res.ok) throw new Error(res.error);
    $('status').textContent = 'Tamamlandı.';
    render(res.report);
  } catch (e) {
    $('status').textContent = `Hata: ${(e as Error).message}`;
  } finally {
    btn.disabled = false;
  }
}

host.onProgress((done, total) => ($('status').textContent = `Analiz ediliyor… ${done}/${total}`));
$('scan').addEventListener('click', scan);
$('settings').addEventListener('click', (e) => {
  e.preventDefault();
  if (isExtension()) chrome.runtime.openOptionsPage();
});
if (!isExtension()) document.body.classList.add('harness');
