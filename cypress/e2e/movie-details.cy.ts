describe('Movie Details Page', () => {
  // Free content (not requiring login)
  describe('Free Content', () => {
    beforeEach(() => {
      // Visit a known free content, for example with ID 3 (based on API response)
      cy.visit('/movie/3');
    });

    it('should display movie title and details', () => {
      cy.get('h1').should('be.visible');
      cy.get('p.description').should('be.visible');
      cy.contains('Release Year').should('be.visible');
      cy.contains('Duration').should('be.visible');
    });

    it('should show trailer player for free content', () => {
      cy.get('video').should('be.visible');
      cy.get('.video-controls').should('be.visible');
    });

    it('should display subscription prompt for premium content', () => {
      cy.contains('Subscribe to Premium').should('be.visible');
    });

    it('should have working social features', () => {
      // Rating component
      cy.get('.rating-stars').should('be.visible');
      
      // Reviews section
      cy.contains('Reviews').should('be.visible');
      
      // Social share
      cy.get('.social-share-button').should('be.visible');
    });

    it('should display ads for free users', () => {
      // This may need adjustment based on actual ad implementation
      cy.get('.ad-container').should('exist');
    });
  });

  // Premium content (requiring login)
  describe('Premium Content (Authenticated)', () => {
    beforeEach(() => {
      // Login with test premium account
      cy.login('premiumuser', 'password');
      
      // Visit a known premium content, for example with ID 4 (based on API response)
      cy.visit('/movie/4');
    });

    it('should display full movie player for premium users', () => {
      cy.get('video.full-movie-player').should('be.visible');
      cy.get('.video-controls').should('be.visible');
    });

    it('should not display ads for premium users', () => {
      cy.get('.ad-container').should('not.exist');
    });

    it('should allow adding to watchlist', () => {
      cy.get('.add-to-watchlist-button').click();
      cy.contains('Added to Watchlist').should('be.visible');
    });

    it('should update watch history automatically', () => {
      // Play the video for a few seconds
      cy.get('video').then(($video) => {
        $video[0].play();
      });
      cy.wait(5000); // Wait for 5 seconds of playing
      
      // Visit watch history page to verify
      cy.visit('/profile');
      cy.contains('Watch History').click();
      
      // The movie should appear in watch history
      cy.get('.watch-history-item').first().should('contain', cy.get('h1').invoke('text'));
    });
  });
});