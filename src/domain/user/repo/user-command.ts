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
    if (entities.length === 0) return 0;

    const userValues = entities.map(
      (e) =>
        Prisma.sql`(
      ${e.id},
      ${e.name},
      ${e.email},
      ${e.contact},
      ${e.role},
      ${e.version},
      ${e.joinedStatus},
      ${e.createdAt},
      ${e.updatedAt}
    )`,
    );

    const addressRows = entities.map(
      (e) =>
        Prisma.sql`(
      ${e.id},
      ${e.address.building},
      ${e.address.unit},
      ${e.address.isHouseholder}
    )`,
    );

    const linkRows = entities.flatMap(
      (e) => e.userApartmentLink?.map((l) => Prisma.sql`(${e.id}, ${l.apartmentId})`) ?? [],
    );

    // --- 합치기 ---
    const sql = Prisma.sql`
WITH inserted_users AS (
  INSERT INTO "User"
    ("id","name","email","contact","role","version","joinedStatus","createdAt","updatedAt")
  VALUES ${Prisma.join(userValues)}
  ON CONFLICT DO NOTHING
  RETURNING "id"
),
src_address("userId","building","unit","isHouseholder") AS (
  VALUES ${Prisma.join(addressRows)}
),
inserted_address AS (
  INSERT INTO "Address"
    ("userId","building","unit","isHouseholder")
  SELECT
    u.id,
    a."building",
    a."unit",
    a."isHouseholder"
  FROM inserted_users u
  JOIN src_address a ON a."userId" = u.id
  ON CONFLICT("userId") DO NOTHING
)
${
  linkRows.length > 0
    ? Prisma.sql`,
src_link("userId","apartmentId") AS (
  VALUES ${Prisma.join(linkRows)}
),
inserted_link AS (
  INSERT INTO "UserApartmentLink"
    ("userId","apartmentId")
  SELECT
    u.id,
    l."apartmentId"
  FROM inserted_users u
  JOIN src_link l ON l."userId" = u.id
  ON CONFLICT("userId","apartmentId") DO NOTHING
)`
    : Prisma.empty
}
SELECT COUNT(*)::int AS count FROM inserted_users;
`;

    const result = await prisma().$queryRaw<{ count: number }[]>(sql);

    return result[0]?.count ?? 0;
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
