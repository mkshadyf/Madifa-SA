/// <reference types="cypress" />

declare namespace Cypress {
  interface Chainable {
    /**
     * Custom command to login as a test user
     * @example cy.login('testuser', 'password')
     */
    login(username: string, password: string): Chainable<Element>;
    
    /**
     * Custom command to check if element is in viewport
     * @example cy.get('.element').inViewport()
     */
    inViewport(): Chainable<Element>;
    
    /**
     * Custom command to check if an ad is loaded
     * @example cy.checkAdLoaded()
     */
    checkAdLoaded(): Chainable<Element>;
  }
}