const config = {
  testEnvironment: 'node',
  transform: {},
  testMatch: [
    '**/test/**/*.test.js'
  ],
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/**/*.test.js'
  ]
};

export default config; 