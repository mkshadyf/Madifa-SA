# Cypress End-to-End Tests

This directory contains Cypress end-to-end tests for the Madifa Streams application.

## Test Structure

The tests are organized as follows:

- `e2e/auth.cy.ts`: Tests for authentication flows (login, registration, password reset)
- `e2e/content-browsing.cy.ts`: Tests for content browsing, searching, and playback

## Running Tests

To run the Cypress tests:

1. Make sure the application is running locally
2. Open a terminal and run one of the following commands:

```bash
# Run tests in headless mode (CI-friendly)
npm run cypress:run

# Open Cypress UI for interactive testing
npm run cypress:open
```

## Test Data Prerequisites

The tests assume the following test data exists in your database:

- A user account with email `user@example.com` and password `password123`
- A premium user account with email `premium@example.com` and password `password123`
- At least one content item with ID 1 (for content detail tests)
- At least one premium content item with ID 4 (for premium access tests)

## Best Practices

When writing Cypress tests:

1. Use data attributes (e.g., `data-test="search-button"`) for test selectors
2. Avoid using CSS classes or other styling attributes as selectors
3. Set up and clean up test data appropriately
4. Test the user journey and interactions, not implementation details
5. Keep tests independent of each other

## Troubleshooting

If tests are failing, check the following:

- Is the application running?
- Do the required test users and content exist in the database?
- Are API endpoints responding correctly?
- Have selectors or page structures changed?

For more information, refer to the [Cypress documentation](https://docs.cypress.io/).