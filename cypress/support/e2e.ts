// ***********************************************************
// This is the main support file. It's processed before test files.
// ***********************************************************

// Import commands.ts for custom commands
import './commands';

// Preserve cookies between tests for maintaining login state
Cypress.Cookies.defaults({
  preserve: ['connect.sid', 'jwt', 'user'],
});

// Handling uncaught exceptions
Cypress.on('uncaught:exception', (err) => {
  // Returning false here prevents Cypress from failing the test
  console.error('Uncaught exception:', err);
  return false;
});

// Log custom info about the test run
before(() => {
  const info = {
    browser: Cypress.browser.name,
    viewport: `${Cypress.config('viewportWidth')}x${Cypress.config('viewportHeight')}`,
    time: new Date().toISOString(),
  };
  
  console.log('Test run info:', info);
});