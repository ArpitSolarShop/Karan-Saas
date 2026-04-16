const path = require('path');
const nextJest = require('next/jest');

const createJestConfig = nextJest({
  // Use absolute path so it works regardless of cwd
  dir: path.resolve(__dirname),
});

const customJestConfig = {
  displayName: 'frontend',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testMatch: [
    '<rootDir>/../test/unit/frontend/**/*.test.[jt]s?(x)',
    '<rootDir>/src/**/*.test.[jt]s?(x)',
  ],
};

module.exports = createJestConfig(customJestConfig);
