import type { PageText } from '../../core/messages';
import type { Report } from '../../core/schema';
import { host, isExtension, NO_ACCESS, requestSiteAccess } from './host';

const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;
const CAT_TR: Record<string, string> = {
  auto_renewal: 'Otomatik yenileme', arbitration_waiver: 'Tahkim / dava hakkından feragat', data_sale: 'Veri paylaşımı/satışı',
  unilateral_change: 'Tek taraflı değişiklik', liability_cap: 'Sorumluluk sınırı', content_license: 'İçerik lisansı',
  cancellation_friction: 'İptal zorluğu', tracking: 'İzleme', account_termination: 'Hesap kapatma', other: 'Diğer',
};
const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);

let lastPage: PageText | null = null;
let lastReport: Report | null = null;

function render(r: Report) {
  lastReport = r;
  const lvl = { low: 'Düşük risk', medium: 'Orta risk', high: 'Yüksek risk' }[r.level];
  let h = `<div class="score ${r.level}" data-testid="score"><div class="num">${r.score}</div><div><b>${lvl}</b><br><small>${r.clauses.length} doğrulanmış madde · kapsam %${Math.round(r.coverage * 100)}</small></div></div>`;
  if (lastPage)
    h += `<div class="meta" data-testid="source">Okuma katmanı: ${lastPage.textSource === 'page-agent' ? 'page-agent (PageController)' : 'yedek çıkarıcı'} · ${lastPage.agentChars}/${lastPage.ownChars} karakter</div>`;
  h += '<button id="copyjson" class="linkbtn" data-testid="copyjson">Raporu JSON olarak kopyala</button>';
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
  $('copyjson')?.addEventListener('click', async () => {
    await navigator.clipboard.writeText(JSON.stringify(lastReport, null, 2)).catch(() => {});
    $('copyjson').textContent = 'Kopyalandı ✓';
  });
  $('result').querySelectorAll<HTMLElement>('blockquote').forEach((b) => b.addEventListener('click', () => host.highlight(b.dataset.quote!)));
}

/** activeTab only covers a tab the user opened the extension on; otherwise Chrome needs explicit site access (one click, user-approved). */
function showAccessNotice() {
  $('status').textContent = '';
  $('result').innerHTML =
    '<div class="notice" data-testid="noaccess">🔒 Bu sayfayı okumak için Chrome izni gerekiyor. Uzantı simgesine sayfadayken tıklayarak açmak yeterli olur; olmazsa aşağıdaki düğmeyle siteye erişim izni verin.<br><button id="grant" class="linkbtn">Siteye erişim izni ver</button></div>';
  $('grant').addEventListener('click', async () => {
    if (await requestSiteAccess()) void scan();
  });
}

async function scan() {
  const btn = $<HTMLButtonElement>('scan');
  btn.disabled = true;
  $('result').innerHTML = '';
  $('status').textContent = 'Sayfa okunuyor…';
  try {
    const page: PageText = await host.extract();
    lastPage = page;
    if (page.text.length < 500) throw new Error('Bu sayfada analiz edilecek kadar metin yok.');
    $('status').textContent = page.looksLikeLegal ? 'Analiz ediliyor…' : 'Bu sayfa bir ToS/gizlilik sayfasına benzemiyor, yine de analiz ediliyor…';
    const res = await host.analyze(page);
    if (!res.ok) throw new Error(res.error);
    $('status').textContent = 'Tamamlandı.';
    render(res.report);
  } catch (e) {
    if ((e as Error).message === NO_ACCESS) showAccessNotice();
    else $('status').textContent = `Hata: ${(e as Error).message}`;
  } finally {
    btn.disabled = false;
  }
}

host.onProgress((done, total) => ($('status').textContent = `Analiz ediliyor… ${done}/${total}`));
$('scan').addEventListener('click', scan);

/** Opening the panel on a terms-like page scans it right away (setting `autoScan`, default on); on other pages it offers links to legal documents instead. */
async function autoStart() {
  try {
    const page = await host.extract();
    lastPage = page;
    if (page.looksLikeLegal && (await host.getAutoScan())) {
      $('status').textContent = 'Koşul sayfası algılandı, otomatik taranıyor…';
      await scan();
      return;
    }
    if (!page.looksLikeLegal) {
      const links = await host.findLegalLinks();
      if (links.length) {
        $('result').innerHTML =
          '<div class="notice" data-testid="links">🔗 Bu sayfa bir koşul sayfası gibi görünmüyor. Şu bağlantılar koşul/gizlilik sayfalarına gidiyor olabilir:<ul>' +
          links.map((l, i) => `<li><button class="linkbtn" data-i="${i}">${esc(l.text)}</button></li>`).join('') +
          '</ul></div>';
        $('result').querySelectorAll<HTMLElement>('button[data-i]').forEach((b) => b.addEventListener('click', () => host.openUrl(links[Number(b.dataset.i)].href)));
      }
    }
  } catch (e) {
    if ((e as Error).message === NO_ACCESS) showAccessNotice();
    /* other errors (e.g. chrome:// pages): the manual scan button reports a proper message */
  }
}
void autoStart();
$('settings').addEventListener('click', (e) => {
  e.preventDefault();
  if (isExtension()) chrome.runtime.openOptionsPage();
});
if (!isExtension()) document.body.classList.add('harness');
