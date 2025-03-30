/// <reference types="cypress" />

declare namespace Cypress {
  interface Chainable {
    /**
     * Custom command to login with email and password
     * @example cy.login('user@example.com', 'password')
     */
    login(email: string, password: string): Chainable<void>;

    /**
     * Custom command to logout the current user
     * @example cy.logout()
     */
    logout(): Chainable<void>;

    /**
     * Custom command to select a content item by title
     * @example cy.selectContent('Movie Title')
     */
    selectContent(title: string): Chainable<void>;

    /**
     * Custom command to verify premium access
     * @example cy.verifyPremiumAccess()
     */
    verifyPremiumAccess(): Chainable<void>;

    /**
     * Custom command to check if content is playing
     * @example cy.isVideoPlaying()
     */
    isVideoPlaying(): Chainable<boolean>;
  }
}