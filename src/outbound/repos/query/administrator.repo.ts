import { PrismaClient } from '@prisma/client';
import { IAdministratorQueryRepo } from '../../../application/ports/repos/I.administrator.query.repo';

export const createAdministratorQueryRepo = (prisma: PrismaClient): IAdministratorQueryRepo => {
  const findAll = (page: number, limit: number, searchKeyword: string, joinStatus: string) => {
    const skip = (page - 1) * limit;

    return prisma.users.findMany({
      where: {
        role: 'USER',
        ...(searchKeyword && {
          OR: [{ username: { contains: searchKeyword } }, { email: { contains: searchKeyword } }],
        }),
      },
      include: {
        apartment: true,
      },
      skip: skip,
      take: limit,
    });
  };
  return {
    findAll,
  };
};
