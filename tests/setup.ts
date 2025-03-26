/**
 * Test setup file
 */

import supertest from 'supertest';
import '@testing-library/jest-dom';

// Import necessary polyfills
import 'whatwg-fetch';
import 'jest-environment-jsdom';

// Make sure we can use expect().toHaveProperty() etc
import expect from 'expect';
global.expect = expect;

// Set up the test environment
const setupTestEnvironment = () => {
  // Provide global request agent for API tests
  if (typeof window === 'undefined') {
    // Node environment
    try {
      // Try importing the app (for API tests)
      // Note: This is wrapped in try/catch as it might not exist in all environments
      const { app } = require('../server/index');
      if (app) {
        (global as any).request = supertest(app);
      }
    } catch (e) {
      console.log('App not available for testing, skipping request setup');
    }
  } else {
    // Browser (JSDOM) environment
    // Set up any browser-specific globals here
  }
};

setupTestEnvironment();

// Mock Supabase
jest.mock('@supabase/supabase-js', () => {
  return {
    createClient: jest.fn(() => ({
      auth: {
        signUp: jest.fn().mockResolvedValue({ data: { user: { id: 1 } }, error: null }),
        signIn: jest.fn().mockResolvedValue({ data: { user: { id: 1 } }, error: null }),
        signOut: jest.fn().mockResolvedValue({ error: null }),
        user: jest.fn().mockReturnValue({ id: 1, email: 'test@example.com' }),
        session: jest.fn().mockReturnValue({ user: { id: 1 } })
      },
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn(),
      single: jest.fn().mockResolvedValue({ data: {}, error: null }),
      storage: {
        from: jest.fn().mockReturnThis(),
        upload: jest.fn().mockResolvedValue({ data: {}, error: null }),
        getPublicUrl: jest.fn().mockReturnValue({ publicUrl: 'https://example.com/image.jpg' })
      }
    }))
  };
});

// Mock localStorage for browser-like environment
class LocalStorageMock {
  private store: Record<string, string>;

  constructor() {
    this.store = {};
  }

  getItem(key: string): string | null {
    return this.store[key] || null;
  }

  setItem(key: string, value: string): void {
    this.store[key] = value;
  }

  removeItem(key: string): void {
    delete this.store[key];
  }

  clear(): void {
    this.store = {};
  }
}

// Set up localStorage mock only in jsdom environment
if (typeof window !== 'undefined') {
  // Browser-like environment
  Object.defineProperty(window, 'localStorage', {
    value: new LocalStorageMock(),
    writable: true
  });

  // Mock matchMedia which is not implemented in JSDOM
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });
} else {
  // Node environment
  if (!global.localStorage) {
    (global as any).localStorage = new LocalStorageMock();
  }
}

// Mock fetch API
global.fetch = jest.fn().mockImplementation(() => 
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({}),
    text: () => Promise.resolve(''),
    status: 200,
    headers: new Headers()
  })
) as jest.Mock;

// Reset mocks between tests
beforeEach(() => {
  jest.clearAllMocks();
  if (global.localStorage) {
    const storage = global.localStorage as any;
    if (typeof storage.clear === 'function') {
      storage.clear();
    }
  }
});

// Clean up after all tests
afterAll(() => {
  jest.restoreAllMocks();
});