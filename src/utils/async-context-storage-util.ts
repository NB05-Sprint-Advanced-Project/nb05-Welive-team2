import { AsyncLocalStorage } from 'node:async_hooks';
import { TxPrismaClient } from '../shared/base-command-repo';

export const asyncContextStorage = {
  storage: new AsyncLocalStorage<TxPrismaClient>(),

  run: async <T>(data: TxPrismaClient, callback: () => Promise<T>) => {
    const result = await asyncContextStorage.storage.run(data, callback);
    console.log('Async Context Storage Run - TxPrismaClient 저장함', result ? '성공' : '실패');
    return result;
  },

  get: (): TxPrismaClient | undefined => {
    const result = asyncContextStorage.storage.getStore();
    return result;
  },
};
