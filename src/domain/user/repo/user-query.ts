import { PrismaClient } from '@prisma/client';
import { IUserQueryRepo } from '../interface/i-user-query-repo';
import { Role, Status } from '../entity/base-user';

export const createUserQueryRepo = (prisma: PrismaClient): IUserQueryRepo => {
  const findAllAdmins = async (
    page: number,
    limit: number,
    searchKeyword: string,
    joinStatus: Status,
  ) => {
    const skip = (page - 1) * limit;

    const where = {
      role: Role.ADMIN,
      ...(searchKeyword && {
        OR: [{ username: { contains: searchKeyword } }, { email: { contains: searchKeyword } }],
      }),
      // ...(joinStatus && { joinedStatus: { equals: joinStatus } }),
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

    console.log('users:', users);

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
        }))[0],
      })),
      totalCount,
      page,
      limit,
      hasNext: page * limit < totalCount,
    };
  };

  const findByUsername = async (username: string) => {
    const user = await prisma.user.findUnique({
      where: { username },
      include: {
        UserApartmentLink: {
          include: { apartment: true },
        },
        Address: true,
      },
    });
    if (!user) {
      return null;
    }

    return {
      id: user.id,
      username: user.username || '',
      password: user.password || '',
      email: user.email,
      contact: user.contact,
      name: user.name,
      role: user.role,
      avatar: user.avatarUrl || '',
      joinStatus: user.joinedStatus,
      isActive: true as const,
      adminOf: {
        id: user.UserApartmentLink[0]?.apartment.id || '',
        name: user.UserApartmentLink[0]?.apartment.name || '',
      },
      resident: {
        id: user.id,
        apartmentId: user.UserApartmentLink[0]?.apartment.id || '',
        building: user.Address?.building || 0,
        unit: user.Address?.unit || 0,
        isHouseholder: user.Address?.isHouseholder || false,
      },
    };
  };

  return {
    findAllAdmins,
    findByUsername,
  };
};
