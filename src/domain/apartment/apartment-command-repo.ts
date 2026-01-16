import { Apartment, Prisma, PrismaClient } from '@prisma/client';
import { IApartmentCommandRepo } from './i-apartment-command-repo';
import { TechnicalExceptionType } from '../../shared/exception/technical-exception/exception-info';
import { TechnicalException } from '../../shared/exception/technical-exception/technical-exception';

export const createApartmentCommandRepo = (prisma: PrismaClient): IApartmentCommandRepo => {
  const create = async (model: Apartment): Promise<Apartment> => {
    try {
      return await prisma.apartment.create({
        data: model,
      });
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
  const update = async (model: Apartment): Promise<Apartment> => {
    try {
      return await prisma.apartment.update({
        where: {
          id: model.id,
        },
        data: model,
      });
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

  const remove = async (apartmentId: string): Promise<void> => {
    await prisma.apartment.delete({
      where: {
        id: apartmentId,
      },
    });
  };

  const findById = async (apartmentId: string): Promise<Apartment | null> => {
    return await prisma.apartment.findUnique({
      where: {
        id: apartmentId,
      },
    });
  };

  return {
    create,
    update,
    remove,
    findById,
  };
};
