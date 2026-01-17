import { AsyncLocalStorage } from 'node:async_hooks';
import { TxPrismaClient } from '../shared/base-command-repo';

const storage = new AsyncLocalStorage<TxPrismaClient>();

export const asyncContextStorage = {
  run: async <T>(data: TxPrismaClient, callback: () => Promise<T>) => {
    console.log('Async Context Storage Run - Storing TxPrismaClient');
    const result = await storage.run(data, callback);
    console.log(
      'Async Context Storage Run - Stored TxPrismaClient',
      result ? 'Success' : 'Failure',
    );
    return result;
  },

  get: (): TxPrismaClient | undefined => {
    const result = storage.getStore();
    return result;
  },
};
