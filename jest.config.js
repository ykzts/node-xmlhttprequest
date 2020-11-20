module.exports = {
  globals: {
    'ts-jest': {
      tsConfig: '<rootDir>/test/tsconfig.json'
    }
  },
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['<rootDir>/test/integration/**/*.ts']
};
