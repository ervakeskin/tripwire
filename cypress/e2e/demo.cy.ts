/// <reference types="cypress" />
// Demo (≤90 s video). The Claude API is stubbed with recorded-shape responses (cypress/fixtures/llm-*.json) so the run is
// deterministic and keyless; everything else (extraction, sanitizer, schema+quote validator, scorer, UI) is the real code.

const slow = () => cy.wait(1500); // pacing for the video only

describe('Tripwire demo', () => {
  it('happy path: scan a ToS -> verified clauses with quotes + disclaimer', () => {
    cy.intercept('POST', 'https://api.anthropic.com/v1/messages', { fixture: 'llm-happy.json' }).as('claude');
    cy.visit('/sidepanel.html?doc=tos-demo');
    cy.get('[data-testid=disclaimer]').should('contain', 'hukuki tavsiye vermez');
    slow();
    cy.get('[data-testid=scan]').click();
    cy.wait('@claude');
    cy.get('[data-testid=score]', { timeout: 15000 }).should('be.visible');
    cy.get('[data-testid=clause]').should('have.length', 7);
    cy.get('[data-testid=clause] blockquote').first().click(); // highlights the quote in the page
    slow();
    cy.get('[data-testid=clause]').eq(3).scrollIntoView();
    slow();
    cy.get('[data-testid=clause]').eq(5).scrollIntoView();
    slow();
  });

  it('honest uncertainty: fabricated quote dropped, vague clause marked low-confidence, hidden injection flagged', () => {
    cy.intercept('POST', 'https://api.anthropic.com/v1/messages', { fixture: 'llm-uncertain.json' }).as('claude');
    cy.visit('/sidepanel.html?doc=injection');
    slow();
    cy.get('[data-testid=scan]').click();
    cy.wait('@claude');
    cy.get('[data-testid=score]', { timeout: 15000 }).should('be.visible');
    cy.get('[data-testid=injection]').should('be.visible'); // hidden + visible instructions detected, ignored
    cy.get('[data-testid=uncertainty]').should('contain', 'doğrulanamadığı için atıldı'); // invented "safe" claim rejected
    cy.get('[data-testid=lowconf]').should('exist'); // "emin değilim"
    cy.get('[data-testid=clause]').should('have.length', 3); // 4 returned, 1 fabricated -> 3 verified
    slow();
    cy.get('[data-testid=injection]').scrollIntoView();
    slow();
    cy.get('[data-testid=lowconf]').first().scrollIntoView();
    slow();
  });
});
