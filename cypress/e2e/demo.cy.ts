/// <reference types="cypress" />
// Demo video (≤90 s). The LLM HTTP call is replayed from RECORDED REAL model output (cypress/fixtures/*.json, recorded with
// scripts/record-fixtures.ts and from the eval run) so the run is deterministic and keyless. Everything else — extraction,
// hidden-text sanitizer, schema + verbatim-quote validator, scorer, auto-detection, link finder, UI — is the real code.
// Scene 3 adds ONE simulated provider fault (HTTP 400 on one chunk) to show the partial-coverage warning; the caption says so.

const API = 'https://api.anthropic.com/v1/messages'; // harness transport; the replayed bodies are real model output
const pause = (ms = 3000) => cy.wait(ms); // pacing for the video only
const caption = (text: string) =>
  cy.document().then((d) => {
    const c = d.getElementById('caption')!;
    c.hidden = false;
    c.textContent = text;
  });

describe('Tripwire demo', () => {
  it('1 · find the terms link, scan, get verified clauses with exact quotes', () => {
    cy.intercept('POST', API, { fixture: 'llm-happy.json' }).as('llm');
    cy.visit('/sidepanel.html?doc=home');
    cy.get('[data-testid=disclaimer]').should('contain', 'hukuki tavsiye vermez');
    caption('1 · Mutlu yol — ana sayfada koşul bağlantısını bul (LLM yok, deterministik)');
    cy.get('[data-testid=links]', { timeout: 10000 }).should('be.visible');
    pause();
    cy.contains('button.linkbtn', 'Terms of Service').click();
    caption('Koşul sayfası açıldı → tara');
    pause(2000);
    cy.get('[data-testid=scan]').click();
    cy.wait('@llm');
    cy.get('[data-testid=score]', { timeout: 15000 }).should('be.visible');
    cy.get('[data-testid=clause]').should('have.length', 6);
    caption('Her madde: sade Türkçe açıklama + orijinal metinden birebir alıntı');
    pause();
    cy.get('[data-testid=clause] blockquote').first().click(); // quote is highlighted in the page
    caption('Alıntıya tıkla → sayfada vurgulanır');
    pause(3500);
    cy.get('[data-testid=clause]').eq(4).scrollIntoView();
    pause(2500);
  });

  it('2 · auto-capture on a terms page + prompt injection is flagged and ignored', () => {
    cy.intercept('POST', API, { fixture: 'llm-uncertain.json' }).as('llm');
    cy.visit('/sidepanel.html?doc=injection&auto=1'); // opening the panel on a terms-like page scans it
    caption('2 · Koşul sayfası açılınca otomatik tarama — sayfada gizli + görünür “AI’ya talimat” var');
    cy.wait('@llm');
    cy.get('[data-testid=score]', { timeout: 15000 }).should('be.visible');
    cy.get('[data-testid=injection]').should('be.visible').and('contain', 'hidden:');
    cy.get('[data-testid=clause]').should('have.length', 4);
    caption('Talimatlar işaretlendi ve yok sayıldı; gerçek riskler yine raporlandı');
    pause(4000);
    cy.get('[data-testid=injection]').scrollIntoView();
    pause(3500);
  });

  it('3 · honest uncertainty: one chunk fails -> coverage < 100% is shown, not hidden', () => {
    let call = 0;
    cy.intercept('POST', API, (req) => {
      const i = call++;
      if (i === 2) req.reply({ statusCode: 400, body: { error: { message: 'simulated provider fault' } } });
      else req.reply({ fixture: `dropbox-chunk-${Math.min(i, 4)}.json` });
    }).as('llm');
    cy.visit('/sidepanel.html?doc=tos-real');
    caption('3 · Belirsizlik — gerçek Dropbox ToS’u; 5 bölümden biri için sağlayıcı hatası (benzetim)');
    pause(3000);
    cy.get('[data-testid=scan]').click();
    cy.get('[data-testid=score]', { timeout: 30000 }).should('be.visible');
    cy.get('[data-testid=uncertainty]').should('contain', 'analiz edilebildi').and('be.visible');
    caption('Sistem eksik bölümü saklamıyor: “metnin yalnızca %80’i analiz edilebildi”');
    cy.get('[data-testid=uncertainty]').first().scrollIntoView();
    pause(5000);
    cy.get('[data-testid=score]').scrollIntoView();
    pause(3000);
  });
});
