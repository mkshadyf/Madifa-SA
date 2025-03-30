/** @type {import('ts-jest').JestConfigWithTsJest} */
export default {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  testMatch: ['**/*.test.ts?(x)'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/client/src/$1',
    '^@shared/(.*)$': '<rootDir>/shared/$1',
    // Handle CSS imports (with CSS modules)
    '\\.css$': 'identity-obj-proxy',
    // Handle ESM modules
    "^(\\.{1,2}/.*)\\.js$": "$1"
  },
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { 
      tsconfig: 'tsconfig.json',
      useESM: true,
    }],
  },
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  testPathIgnorePatterns: ['/node_modules/', '/cypress/'],
  // Used for component tests that require a DOM
  projects: [
    {
      displayName: 'node',
      preset: 'ts-jest/presets/default-esm',
      testEnvironment: 'node',
      testMatch: [
        '<rootDir>/tests/integration/**/*.test.ts',
        '<rootDir>/tests/api.test.ts',
        '<rootDir>/tests/auth.test.ts',
        '<rootDir>/tests/storage.test.ts',
        '<rootDir>/tests/payment.test.ts',
        '<rootDir>/tests/utils.test.ts',
        '<rootDir>/tests/vimeo.test.ts',
      ],
      transform: {
        '^.+\\.tsx?$': ['ts-jest', { 
          tsconfig: 'tsconfig.json',
          useESM: true,
        }],
      },
    },
    {
      displayName: 'jsdom',
      preset: 'ts-jest/presets/default-esm',
      testEnvironment: 'jsdom',
      testMatch: [
        '<rootDir>/tests/unit/**/*.test.ts?(x)',
        '<rootDir>/tests/components.test.ts?(x)',
      ],
      setupFilesAfterEnv: [
        '<rootDir>/tests/setup.ts'
      ],
      transform: {
        '^.+\\.tsx?$': ['ts-jest', { 
          tsconfig: 'tsconfig.json',
          useESM: true,
        }],
      },
    },
  ],
  // Global settings
  verbose: true,
  collectCoverage: false,
  coverageReporters: ['text', 'html'],
  coverageDirectory: 'coverage',
};