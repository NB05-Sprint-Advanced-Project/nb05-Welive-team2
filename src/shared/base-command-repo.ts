import { Prisma, PrismaClient } from '@prisma/client';
import { asyncContextStorage } from '../utils/async-context-storage-util';

export type TxPrismaClient = Prisma.TransactionClient;
export type BasePrismaClient = PrismaClient | TxPrismaClient;

export const BaseRepo = (basePrisma: PrismaClient) => {
  // const prisma = asyncContextStorage.get() ?? basePrisma;
  // return prisma;

  const prisma = () => {
    const prisma: BasePrismaClient = asyncContextStorage.get() ?? basePrisma;
    console.log(
      'Prisma Client 사용중 ',
      prisma === basePrisma ? 'BasePrismaClient' : 'TxPrismaClient',
    );
    return prisma;
  };

  return {
    prisma,
  };
};
