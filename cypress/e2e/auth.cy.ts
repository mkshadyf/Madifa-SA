describe('Authentication Flow', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should allow users to register', () => {
    // Open auth modal
    cy.get('[data-test="sign-up-button"]').click();
    
    // Fill out registration form
    cy.get('input[name="username"]').type('testuser');
    cy.get('input[name="email"]').type('test@example.com');
    cy.get('input[name="password"]').type('Password123!');
    cy.get('input[name="confirmPassword"]').type('Password123!');
    
    // Submit form
    cy.get('form').submit();
    
    // Verify successful registration (might redirect to profile completion)
    cy.url().should('include', '/profile');
    cy.contains('Welcome').should('be.visible');
  });

  it('should allow users to login', () => {
    // Open auth modal
    cy.get('[data-test="sign-in-button"]').click();
    
    // Fill out login form
    cy.get('input[name="email"]').type('test@example.com');
    cy.get('input[name="password"]').type('Password123!');
    
    // Submit form
    cy.get('form').submit();
    
    // Verify successful login
    cy.url().should('include', '/browse');
    cy.get('[data-test="user-menu"]').should('be.visible');
  });

  it('should display error message for invalid login', () => {
    // Open auth modal
    cy.get('[data-test="sign-in-button"]').click();
    
    // Fill out login form with invalid credentials
    cy.get('input[name="email"]').type('wrong@example.com');
    cy.get('input[name="password"]').type('WrongPassword123!');
    
    // Submit form
    cy.get('form').submit();
    
    // Verify error message appears
    cy.contains('Invalid email or password').should('be.visible');
    cy.url().should('not.include', '/browse');
  });

  it('should allow users to logout', () => {
    // Login first
    cy.login('test@example.com', 'Password123!');
    
    // Then logout
    cy.logout();
    
    // Verify logged out state
    cy.get('[data-test="sign-in-button"]').should('be.visible');
  });

  it('should redirect unauthenticated users trying to access premium content', () => {
    // Try to visit premium content page directly
    cy.visit('/movie/1');
    
    // Verify auth modal appears with appropriate message
    cy.contains('Premium Content').should('be.visible');
    cy.contains('Sign in to continue watching').should('be.visible');
  });
});