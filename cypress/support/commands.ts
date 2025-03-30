// ***********************************************
// This file defines custom commands for Cypress
// https://on.cypress.io/custom-commands
// ***********************************************

Cypress.Commands.add('login', (email, password) => {
  cy.visit('/login');
  cy.get('input[name="email"]').type(email);
  cy.get('input[name="password"]').type(password);
  cy.get('form').submit();
  // Wait for login to complete
  cy.url().should('include', '/browse');
});

Cypress.Commands.add('logout', () => {
  // Find user menu and click
  cy.get('[data-test="user-menu"]').click();
  // Click logout button
  cy.get('[data-test="logout-button"]').click();
  // Verify logout by checking URL or login button presence
  cy.url().should('include', '/');
});

Cypress.Commands.add('selectContent', (title) => {
  // Find content by title
  cy.contains('.movie-card', title).click();
  // Wait for content page to load
  cy.url().should('include', '/movie/');
});

Cypress.Commands.add('verifyPremiumAccess', () => {
  // Check if premium badge is visible somewhere on the page
  cy.get('[data-test="premium-badge"]').should('be.visible');
  // Verify premium content is accessible
  cy.get('[data-test="play-button"]').should('be.visible');
});

Cypress.Commands.add('isVideoPlaying', () => {
  return cy.get('video').then($video => {
    const video = $video[0] as HTMLVideoElement;
    return !video.paused;
  });
});