// test/jest.setup.ts
jest.mock('@/config', () => ({
  getConfig: () => ({
    databaseUrl: 'mock-db-url',
  }),
}));
