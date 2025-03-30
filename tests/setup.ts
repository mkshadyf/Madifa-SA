import '@testing-library/jest-dom';
import { jest } from '@jest/globals';

// Replace global fetch with a mock
global.fetch = jest.fn() as jest.MockedFunction<typeof fetch>;
(global.fetch as jest.Mock).mockResolvedValue({
  ok: true,
  json: async () => ({}),
  text: async () => "",
  status: 200,
  statusText: "OK",
  headers: new Headers(),
  clone: () => ({} as Response),
  redirected: false,
  type: 'basic',
  url: 'https://example.com',
  body: null,
  bodyUsed: false,
  arrayBuffer: async () => new ArrayBuffer(0),
  blob: async () => new Blob(),
  formData: async () => new FormData(),
} as Response);

// Reset mocks between tests
beforeEach(() => {
  jest.resetAllMocks();
});