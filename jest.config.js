module.exports = {
  projects: [
    '<rootDir>/backend/jest.config.js',
    '<rootDir>/frontend/jest.config.js'
  ],
  collectCoverage: true,
  coverageDirectory: '<rootDir>/test-results/coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  reporters: [
    "default",
    ["jest-html-reporter", {
      "pageTitle": "Unit Test Report",
      "outputPath": "test-results/unit/report.html"
    }]
  ]
};
