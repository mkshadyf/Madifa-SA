// ***********************************************
// This file implements custom commands for Cypress
// ***********************************************

// Login command
Cypress.Commands.add('login', (username: string, password: string) => {
  cy.visit('/login');
  cy.get('input[name="username"]').type(username);
  cy.get('input[name="password"]').type(password);
  cy.get('button[type="submit"]').click();
  
  // Wait for the login to complete and redirect
  cy.url().should('not.include', '/login');
});

// Check if element is in viewport
Cypress.Commands.add('inViewport', { prevSubject: true }, (subject) => {
  const bottom = Cypress.$(cy.state('window')).height();
  const rect = subject[0].getBoundingClientRect();
  
  expect(rect.top).to.be.lessThan(bottom);
  expect(rect.bottom).to.be.greaterThan(0);
  
  return subject;
});

// Check if ad is loaded
Cypress.Commands.add('checkAdLoaded', () => {
  // For Google AdSense integration
  cy.get('iframe[id^="google_ads_iframe"]').should('be.visible');
  cy.wait(1000); // Wait for ad to load
  
  // Check if the ad is not empty
  cy.get('iframe[id^="google_ads_iframe"]')
    .its('0.contentDocument.body')
    .should('not.be.empty');
});

// Declare the types
declare global {
  namespace Cypress {
    interface Chainable {
      login(username: string, password: string): Chainable<Element>;
      inViewport(): Chainable<Element>;
      checkAdLoaded(): Chainable<Element>;
    }
  }
}