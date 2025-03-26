describe('Home Page', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should display the app name and logo', () => {
    cy.contains('Madifa').should('be.visible');
  });

  it('should have navigation links', () => {
    cy.get('nav').within(() => {
      cy.contains('Browse').should('be.visible');
      cy.contains('My List').should('be.visible');
    });
  });

  it('should display content sections', () => {
    cy.get('h2').should('have.length.at.least', 1);
    cy.contains('Featured').should('be.visible');
  });

  it('should navigate to browse page', () => {
    cy.contains('Browse').click();
    cy.url().should('include', '/browse');
  });

  it('should redirect to login page when trying to access protected content', () => {
    // Try to access protected route
    cy.visit('/profile');
    // Should redirect to login page
    cy.url().should('include', '/login');
  });
});

describe('Authentication', () => {
  it('should display login form', () => {
    cy.visit('/login');
    cy.get('form').within(() => {
      cy.get('input[name="username"]').should('be.visible');
      cy.get('input[name="password"]').should('be.visible');
      cy.get('button[type="submit"]').should('be.visible');
    });
  });

  it('should display registration form', () => {
    cy.visit('/register');
    cy.get('form').within(() => {
      cy.get('input[name="name"]').should('be.visible');
      cy.get('input[name="email"]').should('be.visible');
      cy.get('input[name="username"]').should('be.visible');
      cy.get('input[name="password"]').should('be.visible');
      cy.get('button[type="submit"]').should('be.visible');
    });
  });

  it('should show error for invalid login', () => {
    cy.visit('/login');
    cy.get('form').within(() => {
      cy.get('input[name="username"]').type('invaliduser');
      cy.get('input[name="password"]').type('invalidpass');
      cy.get('button[type="submit"]').click();
    });
    
    // Should show an error message
    cy.contains('Invalid username or password').should('be.visible');
  });
});