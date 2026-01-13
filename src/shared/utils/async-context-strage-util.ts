import { AsyncLocalStorage } from 'node:async_hooks';
import { TxPrismaClient } from '../../application/ports/i-repos';

const storage = new AsyncLocalStorage<TxPrismaClient>();

export const asyncContextStorage = {
  run: <T>(data: TxPrismaClient, callback: () => Promise<T>) => {
    return storage.run(data, callback);
  },

  get: (): TxPrismaClient | undefined => {
    return storage.getStore();
  },
};
