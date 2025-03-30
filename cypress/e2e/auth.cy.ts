describe('Authentication', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should display login form', () => {
    cy.get('[data-test="login-button"]').click();
    cy.get('[data-test="auth-modal"]').should('be.visible');
    cy.get('[data-test="login-tab"]').click();
    
    cy.get('input[name="email"]').should('be.visible');
    cy.get('input[name="password"]').should('be.visible');
    cy.get('button[type="submit"]').contains('Sign In').should('be.visible');
  });

  it('should display registration form', () => {
    cy.get('[data-test="register-button"]').click();
    cy.get('[data-test="auth-modal"]').should('be.visible');
    cy.get('[data-test="register-tab"]').click();
    
    cy.get('input[name="username"]').should('be.visible');
    cy.get('input[name="email"]').should('be.visible');
    cy.get('input[name="password"]').should('be.visible');
    cy.get('input[name="confirmPassword"]').should('be.visible');
    cy.get('button[type="submit"]').contains('Create Account').should('be.visible');
  });

  it('should show error for invalid login', () => {
    cy.get('[data-test="login-button"]').click();
    cy.get('[data-test="auth-modal"]').should('be.visible');
    cy.get('[data-test="login-tab"]').click();
    
    cy.get('input[name="email"]').type('invalid@example.com');
    cy.get('input[name="password"]').type('wrongpassword');
    cy.get('button[type="submit"]').click();
    
    // Wait for error message
    cy.get('[data-test="auth-error"]').should('be.visible');
    cy.get('[data-test="auth-error"]').should('contain', 'Invalid credentials');
  });

  it('should allow user to register and then login', () => {
    // Generate unique email to avoid duplicate account issues in tests
    const uniqueId = Date.now();
    const testUser = {
      username: `testuser${uniqueId}`,
      email: `testuser${uniqueId}@example.com`,
      password: 'Password123!'
    };

    // Register new account
    cy.get('[data-test="register-button"]').click();
    cy.get('[data-test="auth-modal"]').should('be.visible');
    cy.get('[data-test="register-tab"]').click();
    
    cy.get('input[name="username"]').type(testUser.username);
    cy.get('input[name="email"]').type(testUser.email);
    cy.get('input[name="password"]').type(testUser.password);
    cy.get('input[name="confirmPassword"]').type(testUser.password);
    cy.get('button[type="submit"]').click();
    
    // Wait for success message or redirect
    cy.url().should('include', '/browse');
    
    // Log out
    cy.logout();
    
    // Log back in with new account
    cy.get('[data-test="login-button"]').click();
    cy.get('[data-test="auth-modal"]').should('be.visible');
    cy.get('[data-test="login-tab"]').click();
    
    cy.get('input[name="email"]').type(testUser.email);
    cy.get('input[name="password"]').type(testUser.password);
    cy.get('button[type="submit"]').click();
    
    // Verify login success
    cy.url().should('include', '/browse');
    cy.get('[data-test="user-menu"]').should('be.visible');
  });
});