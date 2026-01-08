import { PrismaClient } from '@prisma/client';

export type TxPrismaClient = Omit<
  PrismaClient,
  '$connect' | '$disconnect' | '$on' | '$transaction' | '$extends'
>;

export type BasePrismaClient = PrismaClient | TxPrismaClient;

export interface IRepos {}
