import { Prisma, PrismaClient } from '@prisma/client';
import { BaseUserProps, Role, Status } from '../entity/base-user';
import { IUserCommandRepo } from '../interface/i-user-command-repo';
import {
  toBaseUserEntity,
  toCreateAdminAccountDBData,
  toCreateResidentAccountDBData,
  toCreateNotJoinedResidentDBData,
  toUpdateAdminAccountDBData,
  toUpdateAvatarDBData,
  userInclude,
  toUpdateJoinedStatusDBData,
  toAdminAccountEntity,
  toNotJoinedResidentEntity,
  toResidentAccountEntityFromDB,
  toUpdatePasswordDBData,
  toUpdateNotJoinedResidentDBData,
  toUpdateResidentAccountDBData,
} from '../user-mapper-jung';
import { TechnicalException } from '../../../shared/exception/technical-exception/technical-exception';
import { TechnicalExceptionType } from '../../../shared/exception/technical-exception/exception-info';
import { AdminAccountProps } from '../entity/admin-account';
import { ResidentAccountProps } from '../entity/resident-account';
import { NotJoinedResidentProps } from '../entity/not-joined-resident';

export const createUserCommandRepo = (prisma: PrismaClient): IUserCommandRepo => {
  const findAdminUserById = async (id: string): Promise<AdminAccountProps | null> => {
    const user = await prisma.user.findUnique({
      where: { id },
      include: userInclude,
    });

    return user ? toAdminAccountEntity(user) : null;
  };

  const findPendingAdminUsers = async (): Promise<AdminAccountProps[] | null> => {
    const users = await prisma.user.findMany({
      where: {
        role: {
          in: [Role.ADMIN, Role.SUPERADMIN, Status.PENDING],
        },
      },
      include: userInclude,
    });

    if (users.length === 0) {
      return null;
    }

    return users.map((user) => toAdminAccountEntity(user));
  };

  const findPendingResidentUsers = async (): Promise<ResidentAccountProps[] | null> => {
    const users = await prisma.user.findMany({
      where: {
        role: {
          in: [Role.RESIDENT, Status.PENDING],
        },
      },
      include: userInclude,
    });

    if (users.length === 0) {
      return null;
    }

    return users.map((user) => toResidentAccountEntityFromDB(user));
  };

  const findResidentAccountUserById = async (id: string): Promise<ResidentAccountProps | null> => {
    const user = await prisma.user.findUnique({
      where: { id },
      include: userInclude,
    });

    return user ? toResidentAccountEntityFromDB(user) : null;
  };

  const findBaseUserById = async (id: string): Promise<BaseUserProps | null> => {
    const user = await prisma.user.findUnique({
      where: { id },
      include: userInclude,
    });
    return user ? toBaseUserEntity(user) : null;
  };

  const findJoinedUserById = async (
    id: string,
  ): Promise<AdminAccountProps | ResidentAccountProps | null> => {
    const user = await prisma.user.findUnique({
      where: { id },
      include: userInclude,
    });
    if (!user) {
      return null;
    }

    if (user.role === Role.ADMIN || user.role === Role.SUPERADMIN) {
      return toAdminAccountEntity(user);
    }

    return toResidentAccountEntityFromDB(user);
  };

  const findNotJoinedResidentByEmail = async (
    email: string,
  ): Promise<NotJoinedResidentProps | null> => {
    const user = await prisma.user.findUnique({
      where: {
        email,
        joinedStatus: Status.NOT_JOINED,
      },
      include: userInclude,
    });

    return user ? toNotJoinedResidentEntity(user) : null;
  };

  const findResidentById = async (
    id: string,
  ): Promise<NotJoinedResidentProps | ResidentAccountProps | null> => {
    const residentUser = await prisma.user.findUnique({
      where: {
        id,
      },
      include: userInclude,
    });

    if (!residentUser) {
      return null;
    }

    if (residentUser.joinedStatus === Status.NOT_JOINED) {
      return toNotJoinedResidentEntity(residentUser);
    }

    return toResidentAccountEntityFromDB(residentUser);
  };

  const create = async (
    entity: AdminAccountProps | ResidentAccountProps | NotJoinedResidentProps,
  ): Promise<void> => {
    try {
      // let보단 즉시 실행 함수(IIFE)함
      // 이유 - 반복적 if()문 사용으로 let으로 할당하는 것보다 깔끔하고 default로 할당 안 한 잡는 걸 안 해도 됨(컴파일 타임에서 잡아줌)
      const createUserData: Prisma.UserCreateInput = (() => {
        switch (entity.role) {
          case Role.ADMIN:
          case Role.SUPERADMIN:
            return toCreateAdminAccountDBData(entity);
          case Role.RESIDENT:
            if (entity.joinedStatus === Status.NOT_JOINED) {
              return toCreateNotJoinedResidentDBData(entity);
            } else {
              return toCreateResidentAccountDBData(entity);
            }
        }
      })();

      await prisma.user.create({
        data: createUserData,
        include: userInclude,
      });
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError) {
        if (err.code === 'P2002') {
          const target = (err.meta as any)?.target;
          if (target?.includes('email')) {
            throw TechnicalException({
              type: TechnicalExceptionType.UNIQUE_VIOLATION_EMAIL,
            });
          }

          if (target?.includes('username')) {
            throw TechnicalException({
              type: TechnicalExceptionType.UNIQUE_VIOLATION_USERNAME,
              error: err,
            });
          }

          if (target?.includes('contact')) {
            throw TechnicalException({
              type: TechnicalExceptionType.UNIQUE_VIOLATION_CONTACT,
              error: err,
            });
          }
        }

        if (err.code === 'P2025') {
          throw TechnicalException({
            type: TechnicalExceptionType.USER_NOT_FOUND,
            error: err,
          });
        }

        throw TechnicalException({
          type: TechnicalExceptionType.UNKNOWN_ERROR,
          error: err,
        });
      }

      throw err;
    }
  };

  const update = async (
    entity: AdminAccountProps | NotJoinedResidentProps | ResidentAccountProps,
  ): Promise<void> => {
    try {
      const updateUserData: Prisma.UserUpdateInput = (() => {
        switch (entity.role) {
          case Role.ADMIN:
          case Role.SUPERADMIN:
            return toUpdateAdminAccountDBData(entity);
          case Role.RESIDENT:
            if (entity.joinedStatus === Status.NOT_JOINED) {
              return toUpdateNotJoinedResidentDBData(entity);
            } else {
              return toUpdateResidentAccountDBData(entity);
            }
        }
      })();
      await prisma.user.update({
        where: {
          id: entity.id,
          version: entity.version,
        },
        data: {
          ...updateUserData,
          version: { increment: 1 },
        },
      });
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
        throw TechnicalException({
          type: TechnicalExceptionType.USER_NOT_FOUND,
          error: err,
        });
      }

      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
        const target = (err.meta as any)?.target;
        if (target?.includes('email')) {
          throw TechnicalException({
            type: TechnicalExceptionType.UNIQUE_VIOLATION_EMAIL,
          });
        }

        if (target?.includes('username')) {
          throw TechnicalException({
            type: TechnicalExceptionType.UNIQUE_VIOLATION_USERNAME,
            error: err,
          });
        }

        if (target?.includes('contact')) {
          throw TechnicalException({
            type: TechnicalExceptionType.UNIQUE_VIOLATION_CONTACT,
            error: err,
          });
        }

        throw TechnicalException({
          type: TechnicalExceptionType.UNIQUE_VIOLATION,
          error: err,
        });
      }

      throw err;
    }
  };

  const updateAvatar = async (entity: BaseUserProps): Promise<void> => {
    try {
      await prisma.user.update({
        where: {
          id: entity.id,
          version: entity.version,
        },
        data: {
          ...toUpdateAvatarDBData(entity),
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
      throw err;
    }
  };

  const updateJoinedStatus = async (
    entity: AdminAccountProps | ResidentAccountProps | NotJoinedResidentProps,
  ): Promise<void> => {
    try {
      await prisma.user.update({
        where: {
          id: entity.id,
          version: entity.version,
        },
        data: {
          ...toUpdateJoinedStatusDBData(entity),
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

      throw err;
    }
  };

  const updateJoinedStatuses = async (
    entities: AdminAccountProps[] | ResidentAccountProps[],
  ): Promise<void> => {
    const entityIds = entities.map((entity) => entity.id);

    await prisma.user.updateMany({
      where: {
        id: { in: entityIds },
        version: entities[0].version, // baseVersion
      },
      data: {
        ...toUpdateJoinedStatusDBData(entities[0]),
        version: { increment: 1 },
      }, //baseUpdateData
    });
  };

  const updatePassword = async (
    entity: AdminAccountProps | ResidentAccountProps,
  ): Promise<void> => {
    try {
      await prisma.user.update({
        where: {
          id: entity.id,
          version: entity.version,
        },
        data: {
          ...toUpdatePasswordDBData,
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

      throw err;
    }
  };

  const deleteUser = async (id: string): Promise<void> => {
    try {
      await prisma.user.delete({
        where: { id },
      });
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
        return;
      }

      throw err;
    }
  };

  const deleteUsers = async (): Promise<void> => {
    await prisma.user.deleteMany({
      where: {
        joinedStatus: Status.REJECTED,
      },
    });
  };

  return {
    findAdminUserById,
    findResidentAccountUserById,
    findBaseUserById,
    findJoinedUserById,
    findPendingAdminUsers,
    findPendingResidentUsers,
    findNotJoinedResidentByEmail,
    findResidentById,
    create,
    update,
    updateJoinedStatus,
    updateJoinedStatuses,
    updateAvatar,
    updatePassword,
    deleteUser,
    deleteUsers,
  };
};

export type UserCommandRepoJung = ReturnType<typeof createUserCommandRepo>;
