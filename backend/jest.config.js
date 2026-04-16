module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  transformIgnorePatterns: [
    '/node_modules/(?!.*(@scure|otplib|@noble|@whiskeysockets|libsignal))',
  ],
  collectCoverageFrom: ['**/*.(t|j)s'],
  coverageDirectory: '../coverage',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@whiskeysockets/baileys$': '<rootDir>/../test/mocks/baileys.mock.ts',
    '^otplib$': '<rootDir>/../test/mocks/otplib.mock.ts'
  }
};
