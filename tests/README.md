# Madifa Video Platform Testing Documentation

This document provides guidance on running tests for the Madifa Video Platform, a South African streaming service delivering localized, inclusive content experiences.

## Testing Infrastructure

The project uses the following testing frameworks and tools:

- **Jest**: For unit and integration testing of components, services, and utility functions
- **Cypress**: For end-to-end testing of the user interface
- **Supertest**: For API testing

## Test Categories

The test suite is divided into several categories:

1. **Unit Tests**
   - Storage Implementation (`storage.test.ts`)
   - Authentication (`auth.test.ts`)
   - Utility Functions (`utils.test.ts`)
   - Components (`components.test.ts`)

2. **Integration Tests**
   - PayFast Payment Integration (`payment.test.ts`)
   - Vimeo API Integration (`vimeo.test.ts`)
   - API Endpoints (`api.test.ts`)

3. **End-to-End Tests**
   - User Interface (Cypress tests in `cypress/e2e/`)

## Running Tests

### Running All Tests

To run all Jest tests:

```bash
bash run-tests.sh
```

### Running Individual Test Categories

To run specific tests, you can modify the `run-tests.sh` script by uncommenting the appropriate section.

For example, to run only authentication tests:

```bash
npx jest tests/auth.test.ts
```

### Running Cypress E2E Tests

To run the Cypress end-to-end tests:

```bash
npx cypress run
```

To open the Cypress test runner:

```bash
npx cypress open
```

## Test Setup

The test environment is configured in the following files:

- `jest.config.js`: Configuration for Jest tests
- `tests/setup.ts`: Global setup for test environment
- `cypress.config.ts`: Configuration for Cypress tests

## Mocks

The testing infrastructure includes mocks for several external dependencies:

1. **Supabase**: Mocked in `tests/setup.ts` for authentication and storage operations
2. **LocalStorage**: Mocked for browser environment testing
3. **Vimeo API**: Mocked in `tests/vimeo.test.ts` to avoid actual API calls
4. **PayFast**: Mocked in `tests/payment.test.ts` for payment integration testing

## Test Coverage

To generate a test coverage report:

```bash
npx jest --coverage
```

The coverage report will be available in the `coverage` directory.

## Writing New Tests

When adding new features to the application, be sure to add corresponding tests.

### Example: Testing a Component

```typescript
import { render, screen } from '@testing-library/react';
import MyComponent from '../client/src/components/MyComponent';

describe('MyComponent', () => {
  test('renders correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });
});
```

### Example: Testing an API Endpoint

```typescript
import supertest from 'supertest';
import { app } from '../server';

describe('API Endpoint', () => {
  test('GET /api/endpoint returns expected data', async () => {
    const res = await supertest(app).get('/api/endpoint');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ data: 'expected' });
  });
});
```

## Troubleshooting

Common issues and their solutions:

1. **Tests failing with module resolution errors**
   - Make sure all dependencies are installed
   - Check import paths in test files

2. **API tests failing**
   - Ensure the server is properly mocked or running
   - Check authentication is correctly set up for protected routes

3. **Component tests failing**
   - Ensure the testing library can find elements (using correct queries)
   - Check that component renders as expected with all props