/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: '.',
  testMatch: ['<rootDir>/src/__tests__/**/*.test.ts'],
  setupFiles: ['<rootDir>/src/__tests__/env.setup.ts'],
  setupFilesAfterEnv: [],
  moduleNameMapper: {
    '^@adoptame/schemas$': '<rootDir>/../../packages/schemas/dist/index.js',
    '^@adoptame/types$': '<rootDir>/../../packages/types/dist/index.js',
  },
  transform: {
    '^.+\\.ts$': ['ts-jest', { tsconfig: { module: 'commonjs' } }],
  },
  testTimeout: 30000,
  collectCoverageFrom: ['src/**/*.ts', '!src/seed/**', '!src/server.ts'],
}
