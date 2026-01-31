/* eslint-disable @typescript-eslint/no-explicit-any */
import { Prisma, PrismaClient } from '@prisma/client';
import { BaseAllUserProps, Role, Status } from '../entity/base-user';
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
  toResidentAccountEntityFromDB,
  toUpdatePasswordDBData,
  toCreateSuperAdminAccountDBData,
  toNotJoinedResidentEntity,
  toUpdateNotJoinedResidentDBData,
  toUpdateResidentAccountDBData,
} from '../user-mapper';
import { TechnicalException } from '../../../shared/exception/technical-exception/technical-exception';
import { TechnicalExceptionType } from '../../../shared/exception/technical-exception/exception-info';
import { AdminAccountProps } from '../entity/admin-account';
import { ResidentAccountProps } from '../entity/resident-account';
import { NotJoinedResidentProps } from '../entity/not-joined-resident';
import { BaseRepo } from '../../../shared/base-command-repo';

export const createUserCommandRepo = (prismaClient: PrismaClient): IUserCommandRepo => {
  const { prisma } = BaseRepo(prismaClient);
  // const prisma = BaseRepo(prismaClient)

  const findUserByRole = async (role: Role): Promise<BaseAllUserProps[]> => {
    const userIncludeWithApartment = Prisma.validator<Prisma.UserInclude>()({
      Address: true,
      UserApartmentLink: {
        include: {
          apartment: true,
        },
      },
    });
    const users = await prisma().user.findMany({
      where: {
        role,
      },
      include: userIncludeWithApartment,
    });

    return users.map((user) => toBaseUserEntity(user));
  };

  const findAdminUserById = async (id: string): Promise<AdminAccountProps | null> => {
    const user = await prisma().user.findUnique({
      where: { id },
      include: userInclude,
    });

    return user ? toAdminAccountEntity(user) : null;
  };

  const findPendingAdminUsers = async (): Promise<AdminAccountProps[] | null> => {
    const users = await prisma().user.findMany({
      where: {
        role: {
          in: [Role.ADMIN, Role.SUPER_ADMIN],
        },
        joinedStatus: {
          equals: Status.PENDING,
        },
      },
      include: userInclude,
    });

    if (users.length === 0) {
      return null;
    }

    return users.map((user) => toAdminAccountEntity(user));
  };

  const findRejectedAdminUsers = async (): Promise<AdminAccountProps[] | null> => {
    const users = await prisma().user.findMany({
      where: {
        role: {
          in: [Role.ADMIN, Role.SUPER_ADMIN],
        },
        joinedStatus: {
          equals: Status.REJECTED,
        },
      },
      include: userInclude,
    });

    if (users.length === 0) {
      return null;
    }

    return users.map((user) => toAdminAccountEntity(user));
  };

  const findResidentAccountUserById = async (id: string): Promise<ResidentAccountProps | null> => {
    const user = await prisma().user.findUnique({
      where: { id },
      include: userInclude,
    });

    return user ? toResidentAccountEntityFromDB(user) : null;
  };

  const findPendingResidentUsers = async (): Promise<ResidentAccountProps[] | null> => {
    const users = await prisma().user.findMany({
      where: {
        role: Role.USER,
        joinedStatus: Status.PENDING,
      },
      include: userInclude,
    });

    if (users.length === 0) {
      return null;
    }

    return users.map((user) => toResidentAccountEntityFromDB(user));
  };

  const findBaseUserById = async (id: string): Promise<BaseAllUserProps | null> => {
    const user = await prisma().user.findUnique({
      where: { id },
      include: userInclude,
    });
    return user ? toBaseUserEntity(user) : null;
  };

  const findJoinedUserById = async (
    id: string,
  ): Promise<AdminAccountProps | ResidentAccountProps | null> => {
    const user = await prisma().user.findUnique({
      where: { id },
      include: userInclude,
    });
    if (!user) {
      return null;
    }

    if (user.role === Role.ADMIN || user.role === Role.SUPER_ADMIN) {
      return toAdminAccountEntity(user);
    }

    return toResidentAccountEntityFromDB(user);
  };

  const findNotJoinedResidentByEmail = async (
    email: string,
  ): Promise<NotJoinedResidentProps | null> => {
    const user = await prisma().user.findUnique({
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
    const residentUser = await prisma().user.findUnique({
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
            return toCreateAdminAccountDBData(entity);
          case Role.SUPER_ADMIN:
            return toCreateSuperAdminAccountDBData(entity);
          case Role.USER:
            if (entity.joinedStatus === Status.NOT_JOINED) {
              return toCreateNotJoinedResidentDBData(entity);
            } else {
              return toCreateResidentAccountDBData(entity);
            }
        }
      })();

      await prisma().user.create({
        data: createUserData,
        include: userInclude,
      });
    } catch (err) {
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
          type: TechnicalExceptionType.UNKNOWN_ERROR,
          error: err,
        });
      }
    }
  };

  const createManyBulk = async (entities: NotJoinedResidentProps[]): Promise<number> => {
    const userParams: any[] = [];
    const userPlaceholders: string[] = [];

    const addrParams: any[] = [];
    const addrPlaceholders: string[] = [];

    const linkParams: any[] = [];
    const linkPlaceholders: string[] = [];
    let linkParamIdx = 1;

    entities.forEach((e, idx) => {
      // --- user ---
      const userBaseIdx = idx * 9;
      userPlaceholders.push(
        `($${userBaseIdx + 1}, $${userBaseIdx + 2}, $${userBaseIdx + 3}, $${userBaseIdx + 4}, $${userBaseIdx + 5}, $${userBaseIdx + 6}, $${userBaseIdx + 7}, $${userBaseIdx + 8}, $${userBaseIdx + 9})`,
      );
      userParams.push(
        e.id,
        e.name,
        e.email,
        e.contact,
        e.role,
        e.version,
        e.joinedStatus,
        e.createdAt,
        e.updatedAt,
      );

      // --- address ---
      const addrBaseIdx = idx * 4;
      addrPlaceholders.push(
        `($${addrBaseIdx + 1}, $${addrBaseIdx + 2}, $${addrBaseIdx + 3}, $${addrBaseIdx + 4})`,
      );
      addrParams.push(e.id, e.address.building, e.address.unit, e.address.isHouseholder);

      // --- user_apartment_link ---
      e.userApartmentLink?.forEach((link) => {
        linkPlaceholders.push(`($${linkParamIdx}, $${linkParamIdx + 1})`);
        linkParams.push(e.id, link.apartmentId);
        linkParamIdx += 2;
      });
    });

    // --- 합치기 ---
    const combinedSQL = `
    INSERT INTO "User"
      ("id","name","email","contact","role","version","joinedStatus","createdAt","updatedAt")
    VALUES ${userPlaceholders.join(',')}
    ON CONFLICT("email") DO NOTHING;

    INSERT INTO "Address"
      ("userId","building","unit","isHouseholder")
    VALUES ${addrPlaceholders.join(',')}
    ON CONFLICT("userId") DO NOTHING;

    ${
      linkPlaceholders.length > 0
        ? `
    INSERT INTO "UserApartmentLink"
      ("userId","apartmentId")
    VALUES ${linkPlaceholders.join(',')}
    ON CONFLICT("userId","apartmentId") DO NOTHING;
    `
        : ''
    }
  `;

    const count = await prisma().$executeRawUnsafe(
      combinedSQL,
      ...userParams,
      ...addrParams,
      ...linkParams,
    );

    console.log(count);

    return count;
  };

  const update = async (
    entity: AdminAccountProps | NotJoinedResidentProps | ResidentAccountProps,
  ): Promise<void> => {
    try {
      const updateUserData: Prisma.UserUpdateInput = (() => {
        switch (entity.role) {
          case Role.ADMIN:
          case Role.SUPER_ADMIN:
            return toUpdateAdminAccountDBData(entity);
          case Role.USER:
            if (entity.joinedStatus === Status.NOT_JOINED) {
              return toUpdateNotJoinedResidentDBData(entity);
            } else {
              return toUpdateResidentAccountDBData(entity);
            }
        }
      })();
      await prisma().user.update({
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
          type: TechnicalExceptionType.OPTIMISTIC_LOCK_FAILED,
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
          type: TechnicalExceptionType.UNKNOWN_ERROR,
          error: err,
        });
      }

      throw err;
    }
  };

  const updateAvatar = async (entity: BaseAllUserProps): Promise<void> => {
    try {
      await prisma().user.update({
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
      await prisma().user.update({
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

    await prisma().user.updateMany({
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
      await prisma().user.update({
        where: {
          id: entity.id,
          version: entity.version,
        },
        data: {
          ...toUpdatePasswordDBData(entity),
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
      await prisma().user.delete({
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
    await prisma().user.deleteMany({
      where: {
        joinedStatus: Status.REJECTED,
      },
    });
  };

  return {
    findUserByRole,
    findAdminUserById,
    findPendingAdminUsers,
    findRejectedAdminUsers,
    findResidentAccountUserById,
    findPendingResidentUsers,
    findBaseUserById,
    findJoinedUserById,
    findNotJoinedResidentByEmail,
    findResidentById,
    create,
    createManyBulk,
    update,
    updateAvatar,
    updateJoinedStatus,
    updateJoinedStatuses,
    updatePassword,
    deleteUser,
    deleteUsers,
  };
};
