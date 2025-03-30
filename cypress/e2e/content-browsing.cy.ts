describe('Content Browsing', () => {
  beforeEach(() => {
    // Start from the homepage
    cy.visit('/');
  });

  it('should display featured content on homepage', () => {
    // Verify hero section exists with content
    cy.get('[data-test="hero-section"]').should('be.visible');
    cy.get('[data-test="hero-title"]').should('be.visible');
    cy.get('[data-test="hero-description"]').should('be.visible');
    cy.get('[data-test="hero-play-button"]').should('be.visible');
  });

  it('should display category sections on homepage', () => {
    // Verify at least one category section exists
    cy.get('[data-test="category-section"]').should('exist');
    
    // Verify category heading and content cards
    cy.get('[data-test="category-title"]').should('be.visible');
    cy.get('[data-test="content-card"]').should('be.visible');
  });

  it('should allow navigation to content details page', () => {
    // Click on a content card
    cy.get('[data-test="content-card"]').first().click();
    
    // Verify redirected to content details page
    cy.url().should('include', '/movie/');
    
    // Verify content details are visible
    cy.get('[data-test="content-title"]').should('be.visible');
    cy.get('[data-test="content-description"]').should('be.visible');
    cy.get('[data-test="play-button"]').should('be.visible');
  });

  it('should allow filtering content by category', () => {
    // Go to browse page
    cy.visit('/browse');
    
    // Select a category from the filter dropdown
    cy.get('[data-test="category-filter"]').click();
    cy.get('[data-test="category-option"]').first().click();
    
    // Verify content is filtered
    cy.get('[data-test="active-filter"]').should('be.visible');
    cy.get('[data-test="content-card"]').should('exist');
  });

  it('should allow searching for content', () => {
    // Click search icon
    cy.get('[data-test="search-button"]').click();
    
    // Type search term
    cy.get('[data-test="search-input"]').type('Movie');
    cy.get('[data-test="search-input"]').type('{enter}');
    
    // Verify search results appear
    cy.get('[data-test="search-results"]').should('be.visible');
    cy.get('[data-test="content-card"]').should('exist');
  });

  it('should play content when play button is clicked', () => {
    // Login first to access content
    cy.login('test@example.com', 'Password123!');
    
    // Navigate to a movie
    cy.get('[data-test="content-card"]').first().click();
    
    // Click play button
    cy.get('[data-test="play-button"]').click();
    
    // Verify video player is visible and playing
    cy.get('video').should('be.visible');
    cy.isVideoPlaying().should('be.true');
    
    // Verify player controls are visible
    cy.get('[data-test="player-controls"]').should('be.visible');
  });

  it('should display relevant recommendations on content details page', () => {
    // Navigate to a movie
    cy.get('[data-test="content-card"]').first().click();
    
    // Scroll down to recommendations section
    cy.get('[data-test="recommendations-section"]').scrollIntoView();
    
    // Verify recommendations are visible
    cy.get('[data-test="recommendations-title"]').should('be.visible');
    cy.get('[data-test="recommendation-card"]').should('have.length.at.least', 1);
  });
});