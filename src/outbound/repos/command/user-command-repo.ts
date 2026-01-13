import { Prisma, PrismaClient } from '@prisma/client';
import { BaseUserProps } from '../../../application/command/entities/user/base-user-entity';
import { IUserCommandRepo } from '../../../application/ports/repos/command/i-user-command-repo';
import { toBaseUserEntity, toUpdateAvatarData } from '../../mapper/user-mapper';
import { TechnicalException } from '../../../shared/exceptioins/technical-exception/technical-exception';
import { TechnicalExceptionType } from '../../../shared/exceptioins/technical-exception/exception-info';
import { AdminProps } from '../../../application/command/entities/user/admin-account-entity';

const userInclude = Prisma.validator<Prisma.UserInclude>()({
  Address: true,
  UserApartmentLink: true,
});

export type PersistUser = Prisma.UserGetPayload<{
  include: typeof userInclude;
}>;

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
          version: entity.version,
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

  const findUserById = async (id: string): Promise<BaseUserProps | null> => {
    const user = await prisma.user.findUnique({
      where: { id },
      include: userInclude,
    });
    return user ? toBaseUserEntity(user) : null;
  };

  const updateAvatar = async (entity: BaseUserProps): Promise<void> => {
    const updateAvatarData = toUpdateAvatarData(entity);

    const result = await prisma.user.updateMany({
      where: {
        id: entity.id,
        version: entity.version,
      },
      data: {
        ...updateAvatarData,
        version: { increment: 1 },
      },
    });

    // 성공
    if (result.count === 1) {
      return;
    }

    const exists = await prisma.user.findUnique({
      where: { id: entity.id },
      select: { id: true }, // id 컬럼만 존재하는지 보기, 다른 컬럼은 안봄
    });

    // P2025 중에서도 해당 유저가 없을 때
    if (!exists) {
      throw TechnicalException({
        type: TechnicalExceptionType.ROW_NOT_FOUND,
      });
    }

    // P2025 중에서도 다른 변경이 감지되었을 때
    throw TechnicalException({
      type: TechnicalExceptionType.OPTIMISTIC_LOCK_FAILED,
    });
  };

  return {
    createAdmin,
    findAdminById,
    updateAdmin,
    approveAllAdmin,
    approveAdmin,
    findUserById,
    updateAvatar,
  };
};
export type UserCommandRepo = ReturnType<typeof createUserCommandRepo>;
