import { PrismaClient } from '@prisma/client';
import { IApartmentCommandRepo } from '../../../application/ports/repos/command/i-apartment-command-repo';
import { Apartment } from '../../../generated/prisma';

export const createApartmentCommandRepo = (prisma: PrismaClient): IApartmentCommandRepo => {
  const create = async (model: Apartment): Promise<Apartment> => {
    return await prisma.apartment.create({
      data: model,
    });
  };
  const update = async (model: Apartment): Promise<Apartment> => {
    return await prisma.apartment.update({
      where: {
        id: model.id,
      },
      data: model,
    });
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
