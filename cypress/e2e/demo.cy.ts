/// <reference types="cypress" />
// Demo (≤90 s video). The LLM HTTP call is replayed from RECORDED REAL model output (cypress/fixtures/*.json, recorded
// with scripts/record-fixtures.ts and from the eval run), so the run is deterministic and keyless.
// Everything else — extraction, hidden-text sanitizer, schema + verbatim-quote validator, scorer, UI — is the real code.
// Scenario 3 additionally injects ONE simulated provider fault (HTTP 400 on one chunk) to show the partial-coverage warning.

const API = 'https://api.anthropic.com/v1/messages'; // harness transport; the replayed bodies are real model output
const slow = (ms = 2800) => cy.wait(ms); // pacing for the video only

describe('Tripwire demo', () => {
  it('1 · happy path: scan a ToS -> verified clauses with exact quotes + disclaimer', () => {
    cy.intercept('POST', API, { fixture: 'llm-happy.json' }).as('llm');
    cy.visit('/sidepanel.html?doc=tos-demo');
    cy.get('[data-testid=disclaimer]').should('contain', 'hukuki tavsiye vermez');
    slow();
    cy.get('[data-testid=scan]').click();
    cy.wait('@llm');
    cy.get('[data-testid=score]', { timeout: 15000 }).should('be.visible');
    cy.get('[data-testid=clause]').should('have.length', 6);
    cy.get('[data-testid=clause] blockquote').first().click(); // quote is highlighted in the page
    slow(4000);
    cy.get('[data-testid=clause]').eq(3).scrollIntoView();
    slow();
    cy.get('[data-testid=clause]').eq(5).scrollIntoView();
    slow();
  });

  it('2 · prompt injection: hidden + visible instructions are flagged and ignored', () => {
    cy.intercept('POST', API, { fixture: 'llm-uncertain.json' }).as('llm');
    cy.visit('/sidepanel.html?doc=injection');
    slow();
    cy.get('[data-testid=scan]').click();
    cy.wait('@llm');
    cy.get('[data-testid=score]', { timeout: 15000 }).should('be.visible');
    cy.get('[data-testid=injection]').should('be.visible').and('contain', 'hidden:');
    cy.get('[data-testid=clause]').should('have.length', 4); // real risks still reported
    slow(4000);
    cy.get('[data-testid=injection]').scrollIntoView();
    slow();
  });

  it('3 · honest uncertainty: one chunk fails -> coverage < 100% is shown, not hidden', () => {
    let call = 0;
    cy.intercept('POST', API, (req) => {
      const i = call++;
      if (i === 2) req.reply({ statusCode: 400, body: { error: { message: 'simulated provider fault' } } });
      else req.reply({ fixture: `dropbox-chunk-${Math.min(i, 4)}.json` });
    }).as('llm');
    cy.visit('/sidepanel.html?doc=tos-real');
    slow();
    cy.get('[data-testid=scan]').click();
    cy.get('[data-testid=score]', { timeout: 30000 }).should('be.visible');
    cy.get('[data-testid=uncertainty]').should('contain', 'analiz edilebildi').and('be.visible');
    cy.get('[data-testid=uncertainty]').first().scrollIntoView();
    slow(4000);
    cy.get('[data-testid=score]').scrollIntoView();
    slow(2000);
  });
});
