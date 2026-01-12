import { PrismaClient } from '@prisma/client';
import { IUserCommandRepo } from '../../../application/ports/repos/command/i-user-command-repo';
import { Status } from '../../../application/command/entities/user/base-user-entity';
import { AdminProps } from '../../../application/command/entities/user/admin-account-entity';
import { userInfo } from 'node:os';
import { Prisma } from '../../../generated/prisma';
import { TechnicalException } from '../../../shared/exceptioins/technical-exception/technical-exception';
import { TechnicalExceptionType } from '../../../shared/exceptioins/technical-exception/exception-info';

export const createUserCommandRepo = (prisma: PrismaClient): IUserCommandRepo => {
  const createAdmin = async (entity: AdminProps): Promise<AdminProps> => {
    try {
      const user = await prisma.user.create({
        data: {
          id: entity.id,
          username: entity.username,
          password: entity.password,
          name: entity.name,
          email: entity.email,
          contact: entity.contact,
          role: entity.role,
          joinedStatus: entity.joinedStatus,
          refreshToken: entity.refreshToken,
          createdAt: entity.createdAt,
          updatedAt: entity.updatedAt,
          UserApartmentLink: {
            create: (entity.userApartmentLink ?? []).map((link) => ({
              apartmentId: link.apartmentId,
            })),
          },
        },
        include: {
          UserApartmentLink: true,
        },
      });

      const { refreshToken, avatarUrl, ...userInfo } = user;
      return userInfo;
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError) {
        if (err.code === 'P2002') {
          const modelName = (err.meta as any)?.modelName;
          const target = (err.meta as any)?.target;
          if (modelName === 'User' && target?.includes('email')) {
            throw TechnicalException({
              type: TechnicalExceptionType.UNIQUE_VIOLATION_EMAIL,
            });
          }
          if (modelName === 'User' && target?.includes('username')) {
            throw TechnicalException({
              type: TechnicalExceptionType.UNIQUE_VIOLATION_USERNAME,
              error: err,
            });
          }
          if (modelName === 'User' && target?.includes('contact')) {
            throw TechnicalException({
              type: TechnicalExceptionType.UNIQUE_VIOLATION_CONTACT,
              error: err,
            });
          }
          throw err;
        }
      }
      throw err;
    }
  };

  const findAdminById = async (adminId: string): Promise<AdminProps | null> => {
    const user = await prisma.user.findUnique({
      where: {
        id: adminId,
        role: 'ADMIN',
      },
    });
    if (!user) {
      return null;
    }
    const { refreshToken, avatarUrl, ...userInfo } = user;
    return userInfo;
  };

  const updateAdmin = async (entity: AdminProps): Promise<AdminProps> => {
    const user = await prisma.user.update({
      where: {
        id: entity.id,
      },
      data: {
        id: entity.id,
        username: entity.username,
        password: entity.password,
        name: entity.name,
        email: entity.email,
        contact: entity.contact,
        role: entity.role,
        joinedStatus: entity.joinedStatus,
        refreshToken: entity.refreshToken,
        createdAt: entity.createdAt,
        updatedAt: entity.updatedAt,
      },
    });

    const { refreshToken, avatarUrl, ...userInfo } = user;

    return userInfo;
  };

  const approveAllAdmin = async (status: string): Promise<void> => {
    await prisma.user.updateMany({
      where: {
        role: 'ADMIN',
      },
      data: {
        joinedStatus: status,
      },
    });
  };

  const approveAdmin = async (status: string, adminId: string): Promise<void> => {
    await prisma.user.update({
      where: {
        role: 'ADMIN',
        id: adminId,
      },
      data: {
        joinedStatus: status,
      },
    });
  };

  return {
    createAdmin,
    findAdminById,
    updateAdmin,
    approveAllAdmin,
    approveAdmin,
  };
};
