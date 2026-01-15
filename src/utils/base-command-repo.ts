import { Prisma, PrismaClient } from '@prisma/client';

export type TxPrismaClient = Prisma.TransactionClient;

export type BasePrismaClient = PrismaClient | TxPrismaClient;
