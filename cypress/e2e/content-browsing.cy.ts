describe('Content Browsing', () => {
  beforeEach(() => {
    // Start from home page
    cy.visit('/');
  });

  it('should display featured content on the home page', () => {
    // Verify hero/featured section exists
    cy.get('[data-test="hero-section"]').should('be.visible');
    
    // Verify featured content title
    cy.get('[data-test="hero-section"]').find('h1').should('exist');
    
    // Verify play button is present in hero section
    cy.get('[data-test="hero-section"]')
      .find('[data-test="play-button"]')
      .should('be.visible');
  });

  it('should navigate to browse page and display content categories', () => {
    // Navigate to browse page
    cy.get('[data-test="browse-link"]').click();
    cy.url().should('include', '/browse');
    
    // Verify category sections exist
    cy.get('[data-test="category-section"]').should('have.length.at.least', 1);
    
    // Verify at least one video card is displayed
    cy.get('[data-test="video-card"]').should('have.length.at.least', 1);
  });

  it('should filter content by category', () => {
    // Navigate to browse page
    cy.visit('/browse');
    
    // Click on a specific category (if categories are in sidebar or tabs)
    cy.get('[data-test="category-filter"]').first().click();
    
    // Verify filtered results
    cy.get('[data-test="video-card"]').should('have.length.at.least', 1);
    
    // Click on another category
    cy.get('[data-test="category-filter"]').eq(1).click();
    
    // Verify different content is shown
    cy.get('[data-test="active-category"]').should('exist');
  });

  it('should perform a search and display results', () => {
    // Navigate to browse page
    cy.visit('/browse');
    
    // Find search input and type a search term
    cy.get('[data-test="search-input"]').type('test video');
    cy.get('[data-test="search-button"]').click();
    
    // Verify search results container exists
    cy.get('[data-test="search-results"]').should('exist');
    
    // Verify search title is displayed
    cy.get('[data-test="search-results-title"]')
      .should('contain', 'test video');
  });

  it('should open and play a video when clicked', () => {
    // Navigate to browse page
    cy.visit('/browse');
    
    // Click on first video card
    cy.get('[data-test="video-card"]').first().click();
    
    // Verify we are on video detail page
    cy.url().should('include', '/watch');
    
    // Verify video player exists
    cy.get('[data-test="video-player"]').should('be.visible');
    
    // Click play button if video doesn't autoplay
    cy.get('[data-test="play-button"]').click();
    
    // Verify video is playing
    cy.isVideoPlaying().should('eq', true);
  });

  it('should navigate through pagination', () => {
    // Navigate to browse page with many results
    cy.visit('/browse');
    
    // Verify pagination controls exist (if implemented)
    cy.get('[data-test="pagination"]').should('exist');
    
    // Store title of first video on page 1
    cy.get('[data-test="video-card"]')
      .first()
      .find('[data-test="video-title"]')
      .invoke('text')
      .as('firstPageTitle');
    
    // Click next page button
    cy.get('[data-test="next-page"]').click();
    
    // Verify we're on page 2
    cy.get('[data-test="current-page"]').should('contain', '2');
    
    // Store title of first video on page 2
    cy.get('[data-test="video-card"]')
      .first()
      .find('[data-test="video-title"]')
      .invoke('text')
      .as('secondPageTitle');
    
    // Compare titles to ensure they're different (page changed)
    cy.get('@firstPageTitle').then((firstTitle) => {
      cy.get('@secondPageTitle').then((secondTitle) => {
        expect(firstTitle).not.to.equal(secondTitle);
      });
    });
  });
});