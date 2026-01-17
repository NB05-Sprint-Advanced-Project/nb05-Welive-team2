import { Prisma, PrismaClient } from '@prisma/client';
import { asyncContextStorage } from '../utils/async-context-storage-util';

export type TxPrismaClient = Prisma.TransactionClient;

export type BasePrismaClient = PrismaClient | TxPrismaClient;

export const BaseRepo = {
  get: (): TxPrismaClient | undefined => {
    return asyncContextStorage.get() ?? undefined;
  },
};
