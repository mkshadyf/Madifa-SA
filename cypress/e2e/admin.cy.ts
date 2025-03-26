describe('Admin Dashboard', () => {
  beforeEach(() => {
    // Login as admin
    cy.login('admin', 'adminpassword');
    cy.visit('/admin');
  });

  it('should display admin dashboard', () => {
    cy.contains('Admin Dashboard').should('be.visible');
    cy.get('.dashboard-stats').should('be.visible');
  });

  it('should display user management section', () => {
    cy.contains('User Management').click();
    cy.url().should('include', '/admin/users');
    cy.get('.user-table').should('be.visible');
  });

  it('should display content management section', () => {
    cy.contains('Content Management').click();
    cy.url().should('include', '/admin/contents');
    cy.get('.content-table').should('be.visible');
  });
  
  describe('Vimeo Management', () => {
    beforeEach(() => {
      cy.contains('Vimeo Management').click();
      cy.url().should('include', '/admin/vimeo');
    });
    
    it('should display Vimeo management interface', () => {
      cy.get('.vimeo-management').should('be.visible');
      cy.contains('Vimeo Videos').should('be.visible');
    });
    
    it('should list Vimeo videos', () => {
      cy.get('.video-list-item').should('have.length.at.least', 1);
    });
    
    it('should display video details when selected', () => {
      cy.get('.video-list-item').first().click();
      cy.get('.video-details').should('be.visible');
      cy.contains('Video Details').should('be.visible');
    });
    
    it('should allow caption management', () => {
      cy.get('.video-list-item').first().click();
      cy.contains('Captions').click();
      cy.get('.caption-management').should('be.visible');
      
      // Check caption list
      cy.get('.caption-list-item').should('exist');
      
      // Check add caption feature
      cy.contains('Add Caption').should('be.visible');
    });
  });
  
  describe('Analytics Dashboard', () => {
    beforeEach(() => {
      cy.contains('Analytics').click();
      cy.url().should('include', '/admin/analytics');
    });
    
    it('should display analytics dashboard', () => {
      cy.get('.analytics-dashboard').should('be.visible');
    });
    
    it('should display user metrics', () => {
      cy.contains('User Metrics').should('be.visible');
      cy.get('.user-growth-chart').should('be.visible');
    });
    
    it('should display content metrics', () => {
      cy.contains('Content Metrics').should('be.visible');
      cy.get('.content-performance-chart').should('be.visible');
    });
    
    it('should allow date range selection', () => {
      cy.get('.date-range-selector').should('be.visible');
      cy.get('.date-range-selector').click();
      cy.contains('Last 30 Days').click();
      cy.get('.analytics-loading').should('be.visible');
      // Wait for loading to complete
      cy.get('.analytics-loading', { timeout: 10000 }).should('not.exist');
      // Verify charts updated
      cy.get('.analytics-updated-at').should('contain', 'Updated');
    });
  });
});