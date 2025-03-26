module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  testMatch: ['**/*.test.ts?(x)'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/client/src/$1',
    '^@shared/(.*)$': '<rootDir>/shared/$1',
    // Handle CSS imports (with CSS modules)
    '\\.css$': 'identity-obj-proxy',
  },
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { 
      tsconfig: 'tsconfig.json',
    }],
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  testPathIgnorePatterns: ['/node_modules/', '/cypress/'],
  // Used for component tests that require a DOM
  projects: [
    {
      displayName: 'node',
      testEnvironment: 'node',
      testMatch: [
        '<rootDir>/tests/api.test.ts',
        '<rootDir>/tests/auth.test.ts',
        '<rootDir>/tests/storage.test.ts',
        '<rootDir>/tests/payment.test.ts',
        '<rootDir>/tests/utils.test.ts',
        '<rootDir>/tests/vimeo.test.ts',
      ],
    },
    {
      displayName: 'jsdom',
      testEnvironment: 'jsdom',
      testMatch: [
        '<rootDir>/tests/components.test.ts?(x)',
      ],
      setupFilesAfterEnv: [
        '<rootDir>/tests/setup.ts',
        '@testing-library/jest-dom/extend-expect'
      ],
    },
  ],
  // Global settings
  verbose: true,
  collectCoverage: false,
  coverageReporters: ['text', 'html'],
  coverageDirectory: 'coverage',
};