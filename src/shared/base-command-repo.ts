import { Prisma, PrismaClient } from '@prisma/client';
import { asyncContextStorage } from '../utils/async-context-storage-util';

export type TxPrismaClient = Prisma.TransactionClient;

export type BasePrismaClient = PrismaClient | TxPrismaClient;

export const BaseRepo = (basePrisma: PrismaClient) => {
  const prisma: TxPrismaClient | BasePrismaClient = asyncContextStorage.get() ?? basePrisma;

  const getPrisma = () => {
    return asyncContextStorage.get() ?? prisma;
  };

  return {
    getPrisma,
  };
};
