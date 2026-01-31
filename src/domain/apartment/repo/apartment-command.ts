/* eslint-disable @typescript-eslint/no-explicit-any */
import { PrismaClient, Prisma, Apartment } from '@prisma/client';
import { TechnicalExceptionType } from '../../../shared/exception/technical-exception/exception-info';
import { TechnicalException } from '../../../shared/exception/technical-exception/technical-exception';
import { ApartmentProps } from '../entity/apartment-entity';
import { IApartmentCommandRepo } from '../interface/i-apartment-command';
import { BaseRepo } from '../../../shared/base-command-repo';

export const createApartmentCommandRepo = (prismaClient: PrismaClient): IApartmentCommandRepo => {
  const { prisma } = BaseRepo(prismaClient);

  const create = async (data: Apartment): Promise<Apartment> => {
    try {
      return await prisma().apartment.create({ data });
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
        const target = (err.meta as any)?.target;
        if (target?.includes('address')) {
          throw TechnicalException({
            type: TechnicalExceptionType.UNIQUE_VIOLATION_ADDRESS,
          });
        }
      }

      throw err;
    }
  };

  const update = async (data: Apartment): Promise<Apartment> => {
    try {
      return await prisma().apartment.update({
        where: {
          id: data.id,
          version: data.version,
        },
        data: {
          ...data,
          version: { increment: 1 },
        },
      });
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
        throw TechnicalException({
          type: TechnicalExceptionType.OPTIMISTIC_LOCK_FAILED,
          error: err,
        });
      }

      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
        const target = (err.meta as any)?.target;
        if (target?.includes('address')) {
          throw TechnicalException({
            type: TechnicalExceptionType.UNIQUE_VIOLATION_ADDRESS,
          });
        }
      }

      throw err;
    }
  };

  const removeById = async (id: string): Promise<void> => {
    await prisma().apartment.delete({
      where: { id },
    });
  };

  const findById = async (id: string): Promise<ApartmentProps | null> => {
    return await prisma().apartment.findUnique({
      where: { id },
    });
  };

  return {
    create,
    update,
    removeById,
    findById,
  };
};
