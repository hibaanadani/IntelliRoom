module.exports = {
  // Jest's testing environment
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: ['**/*.(t|j)s'],
  coverageDirectory: '../coverage',
  testEnvironment: 'node',

  // This is the important part to fix the "Cannot find module" error
  // It tells Jest to map any path starting with 'src/' to the actual 'src' directory
  moduleNameMapper: {
    '^src/(.*)$': '<rootDir>/$1',
  },
};
