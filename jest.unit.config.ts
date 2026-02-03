export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/*-unit.ts'],
  setupFilesAfterEnv: ['<rootDir>/test/jest.setup.ts'],
};
