import { PrismaClient } from '@prisma/client';
import { Status } from '../../../application/command/entities/user/base-entity';
import { IUserQueryRepo } from '../../../application/ports/repos/I.user.query.repo';

export const createUserQueryRepo = (prisma: PrismaClient): IUserQueryRepo => {
  const findAllAdmins = async (
    page: number,
    limit: number,
    searchKeyword: string,
    joinStatus: Status,
  ) => {
    const skip = (page - 1) * limit;

    const where = {
      role: 'ADMIN' as const,
      ...(searchKeyword && {
        OR: [{ username: { contains: searchKeyword } }, { email: { contains: searchKeyword } }],
      }),
      ...(joinStatus && { joinStatus: { equals: joinStatus } }),
    };

    const [users, totalCount] = await Promise.all([
      prisma.user.findMany({
        where,
        include: {
          UserApartmentLink: {
            include: { apartment: true },
          },
        },
        skip,
        take: limit,
      }),
      prisma.user.count({ where }),
    ]);

    return {
      data: users.map((user) => ({
        id: user.id,
        email: user.email,
        contact: user.contact,
        name: user.name,
        joinStatus: user.joinedStatus, // align with AdministratorView
        adminOf: user.UserApartmentLink.map((link) => ({
          id: link.apartment.id,
          name: link.apartment.name,
          address: link.apartment.address,
          description: link.apartment.description,
          officeNumber: link.apartment.officeNumber,
        })),
      })),
      totalCount,
      page,
      limit,
      hasNext: page * limit < totalCount,
    };
  };

  return {
    findAllAdmins,
  };
};
