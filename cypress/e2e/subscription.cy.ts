describe('Subscription', () => {
  beforeEach(() => {
    // Start from a clean state - logged out
    cy.clearCookies();
    cy.clearLocalStorage();
    
    // Login as a regular user without subscription
    cy.login('regularuser', 'password');
  });

  it('should display subscription page', () => {
    cy.visit('/subscription');
    cy.contains('Choose Your Plan').should('be.visible');
  });

  it('should display subscription plans', () => {
    cy.visit('/subscription');
    cy.get('.subscription-plan').should('have.length.at.least', 1);
    cy.contains('R 59').should('be.visible'); // Price for South African Rand
  });

  it('should highlight benefits of premium subscription', () => {
    cy.visit('/subscription');
    cy.contains('Ad-free viewing').should('be.visible');
    cy.contains('Full movie access').should('be.visible');
    cy.contains('Offline downloads').should('be.visible');
  });

  describe('PayFast Integration', () => {
    it('should initiate payment flow when selecting a plan', () => {
      cy.visit('/subscription');
      cy.get('.subscription-plan').first().within(() => {
        cy.contains('Subscribe').click();
      });
      
      // Should navigate to payment confirmation page
      cy.url().should('include', '/payment/confirm');
      cy.contains('Confirm Your Subscription').should('be.visible');
    });

    it('should redirect to PayFast when confirming payment', () => {
      // Note: We'll intercept the redirect to PayFast instead of actually navigating there
      cy.visit('/payment/confirm');
      
      // Stub out the PayFast redirect
      cy.intercept('POST', '/api/payments/create', {
        statusCode: 200,
        body: { success: true, redirect_url: 'https://sandbox.payfast.co.za/eng/process' }
      }).as('paymentCreation');
      
      cy.contains('Proceed to Payment').click();
      cy.wait('@paymentCreation');
      
      // Since we're stubbing, check if the app tried to redirect
      cy.url().should('include', '/payment/processing');
    });

    it('should handle successful payment callback', () => {
      // Simulate return from PayFast after successful payment
      cy.visit('/payment/success?pf_payment_id=12345');
      cy.contains('Payment Successful').should('be.visible');
      cy.contains('You now have premium access').should('be.visible');
      
      // Should update user subscription status
      cy.visit('/profile');
      cy.contains('Subscription Status').should('be.visible');
      cy.contains('Premium').should('be.visible');
    });

    it('should handle canceled payment', () => {
      // Simulate return from PayFast after canceled payment
      cy.visit('/payment/cancel');
      cy.contains('Payment Canceled').should('be.visible');
      cy.contains('Try Again').should('be.visible');
      
      // Subscription status should remain free
      cy.visit('/profile');
      cy.contains('Subscription Status').should('be.visible');
      cy.contains('Free').should('be.visible');
    });
  });

  describe('Subscription Management', () => {
    // First login as a premium user
    beforeEach(() => {
      cy.login('premiumuser', 'password');
    });
    
    it('should display current subscription details', () => {
      cy.visit('/profile');
      cy.contains('Subscription Status').should('be.visible');
      cy.contains('Premium').should('be.visible');
      cy.contains('Next Billing Date').should('be.visible');
    });
    
    it('should allow canceling subscription', () => {
      cy.visit('/profile');
      cy.contains('Manage Subscription').click();
      cy.contains('Cancel Subscription').click();
      
      // Confirmation dialog
      cy.contains('Are you sure?').should('be.visible');
      cy.contains('Yes, Cancel').click();
      
      // Confirmation message
      cy.contains('Subscription Canceled').should('be.visible');
      cy.contains('Your subscription will remain active until').should('be.visible');
    });
  });
});