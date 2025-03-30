# Madifa Streams Tests

This directory contains unit and integration tests for the Madifa Streams application.

## Framework

We use Jest as our testing framework with:
- TypeScript support
- React Testing Library for component tests
- Supertest for API endpoint tests

## Structure

- `/unit` - Unit tests
  - `/components` - Component unit tests
  - `/services` - Service unit tests
  - `/utils` - Utility function tests
- `/integration` - Integration tests
  - `/api` - API endpoint tests
  - `/db` - Database integration tests

## Running Tests

### All Tests

```bash
npm run test
```

### Single Test File

```bash
npm run test -- -t "test name pattern"
```

### With Coverage

```bash
npm run test:coverage
```

## Writing Tests

### Component Tests

For React components, use React Testing Library:

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '@/components/ui/button';

describe('Button component', () => {
  it('renders correctly', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const onClick = jest.fn();
    render(<Button onClick={onClick}>Click me</Button>);
    fireEvent.click(screen.getByText('Click me'));
    expect(onClick).toHaveBeenCalled();
  });
});
```

### API Tests

For API endpoints, use Supertest:

```typescript
import request from 'supertest';
import express from 'express';
import { registerRoutes } from '../server/routes';

describe('Content API', () => {
  let app: express.Express;

  beforeAll(async () => {
    app = express();
    await registerRoutes(app);
  });

  it('retrieves content items', async () => {
    const response = await request(app).get('/api/contents');
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });
});
```

## Mocking

### API Mocks

Use Jest's mocking capabilities to mock API calls:

```typescript
jest.mock('@/lib/api', () => ({
  fetchData: jest.fn().mockResolvedValue([{ id: 1, title: 'Test' }])
}));
```

### Component Context Mocks

Wrap components with necessary providers:

```typescript
const wrapper = ({ children }) => (
  <AuthProvider>
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  </AuthProvider>
);

render(<Component />, { wrapper });
```

## Test Coverage

The project aims for at least 80% test coverage. Coverage reports are generated in the `/coverage` directory when running `npm run test:coverage`.