module.exports = {
  testEnvironment: 'node',
  testMatch: [
    '**/__tests__/**/*.js',
    '**/?(*.)+(spec|test).js'
  ],
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'server.js',
    'local-backend.js',
    'content-sync.js',
    '!node_modules/**',
    '!coverage/**'
  ],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  testTimeout: 30000,
  verbose: true
};