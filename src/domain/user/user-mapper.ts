import { BaseUserEntity, BaseUserProps, Role, Status } from './entity/base-user';
import { UserApartmentLinkVO } from './entity/vo/user-apartment-link';
import { AdminAccountEntity, AdminAccountProps } from './entity/admin-account';
import { Prisma } from '@prisma/client';
import { ResidentAccountEntity, ResidentAccountProps } from './entity/resident-account';
import { NotJoinedResidentEntity, NotJoinedResidentProps } from './entity/not-joined-resident';

export const userInclude = Prisma.validator<Prisma.UserInclude>()({
  Address: true,
  UserApartmentLink: true,
});

export type UserModel = Prisma.UserGetPayload<{
  include: typeof userInclude;
}>;

export const toCreateAdminAccountData = (entity: AdminAccountProps): Prisma.UserCreateInput => {
  return {
    id: entity.id,
    username: entity.username,
    password: entity.password,
    name: entity.name,
    email: entity.email,
    contact: entity.contact,
    role: entity.role,
    joinedStatus: entity.joinedStatus,
    version: entity.version,
    createdAt: entity.createdAt,
    updatedAt: entity.updatedAt,
    UserApartmentLink: {
      create: entity.userApartmentLink!.map((link) => ({
        apartmentId: link.apartmentId,
      })),
    },
  };
};

export const toCreateResidentAccountData = (
  entity: ResidentAccountProps,
): Prisma.UserCreateInput => {
  return {
    id: entity.id,
    username: entity.username,
    password: entity.password,
    name: entity.name,
    email: entity.email,
    contact: entity.contact,
    role: entity.role,
    joinedStatus: entity.joinedStatus,
    version: entity.version,
    createdAt: entity.createdAt,
    updatedAt: entity.updatedAt,
    UserApartmentLink: {
      create: entity.userApartmentLink!.map((link) => ({
        apartmentId: link.apartmentId,
      })),
    },
    Address: {
      create: entity.address,
    },
  };
};

export const toCreateNotJoinedResidentData = (
  entity: NotJoinedResidentProps,
): Prisma.UserCreateInput => {
  return {
    id: entity.id,
    name: entity.name,
    email: entity.email,
    contact: entity.contact,
    role: entity.role,
    version: entity.version,
    joinedStatus: entity.joinedStatus,
    createdAt: entity.createdAt,
    updatedAt: entity.updatedAt,
    UserApartmentLink: {
      create: entity.userApartmentLink!.map((link) => ({
        apartmentId: link.apartmentId,
      })),
    },
    Address: {
      create: entity.address,
    },
  };
};

export const toUpdateAdminAccountData = (entity: AdminAccountProps): Prisma.UserUpdateInput => {
  return {
    id: entity.id,
    name: entity.name,
    email: entity.email,
    contact: entity.contact,
    version: entity.version,
    updatedAt: entity.updatedAt,
  };
};

export const toUpdateResidentData = (
  entity: ResidentAccountProps | NotJoinedResidentProps,
): Prisma.UserUpdateInput => {
  return {
    id: entity.id,
    name: entity.name,
    email: entity.email,
    contact: entity.contact,
    version: entity.version,
    updatedAt: entity.updatedAt,
    Address: {
      delete: {},
      create: { ...entity.address },
    },
  };
};

export const toUpdateAvatarData = (entity: BaseUserProps): Prisma.UserUpdateInput => {
  return {
    avatarUrl: entity.avatarUrl!,
    version: entity.version,
    updatedAt: entity.updatedAt,
  };
};

export const toUpdateJoinedStatusData = (
  entity: AdminAccountProps | ResidentAccountProps | NotJoinedResidentProps,
): Prisma.UserUpdateInput => {
  return {
    joinedStatus: entity.joinedStatus,
    version: entity.version,
    updatedAt: entity.updatedAt,
  };
};

export const toUpdatePasswordData = (
  entity: AdminAccountProps | ResidentAccountProps,
): Prisma.UserUpdateInput => {
  return {
    password: entity.password,
    version: entity.version,
    updatedAt: entity.updatedAt,
  };
};

export const toBaseUserEntity = (DBUserEntity: UserModel): BaseUserProps => {
  return BaseUserEntity.restore({
    id: DBUserEntity.id,
    name: DBUserEntity.name,
    email: DBUserEntity.email,
    contact: DBUserEntity.contact,
    avatarUrl: DBUserEntity.avatarUrl ?? undefined,
    role: DBUserEntity.role as unknown as Role, // 이미 생성할 때 검증된 값
    version: DBUserEntity.version,
    createdAt: DBUserEntity.createdAt,
    updatedAt: DBUserEntity.updatedAt,
    userApartmentLink: DBUserEntity.UserApartmentLink.map((row) =>
      UserApartmentLinkVO.create(row.apartmentId),
    ),
  });
};

export const toAdminAccountEntity = (DBUserEntity: UserModel): AdminAccountProps => {
  return AdminAccountEntity.restore({
    id: DBUserEntity.id,
    username: DBUserEntity.username!,
    password: DBUserEntity.password!,
    name: DBUserEntity.name,
    email: DBUserEntity.email,
    contact: DBUserEntity.contact,
    avatarUrl: DBUserEntity.avatarUrl ?? undefined,
    role: DBUserEntity.role as Role.SUPERADMIN | Role.ADMIN,
    joinedStatus: DBUserEntity.joinedStatus as Status.APPROVED | Status.PENDING | Status.REJECTED,
    version: DBUserEntity.version,
    createdAt: DBUserEntity.createdAt,
    updatedAt: DBUserEntity.updatedAt,
    userApartmentLink: DBUserEntity.UserApartmentLink.map((row) =>
      UserApartmentLinkVO.create(row.apartmentId),
    ),
  });
};

export const toResidentAccountEntity = (DBUserEntity: UserModel): ResidentAccountProps => {
  return ResidentAccountEntity.restore({
    id: DBUserEntity.id,
    username: DBUserEntity.username!,
    password: DBUserEntity.password!,
    name: DBUserEntity.name,
    email: DBUserEntity.email,
    contact: DBUserEntity.contact,
    avatarUrl: DBUserEntity.avatarUrl ?? undefined,
    role: DBUserEntity.role as Role.RESIDENT,
    joinedStatus: DBUserEntity.joinedStatus as Status.APPROVED | Status.PENDING | Status.REJECTED,
    version: DBUserEntity.version,
    createdAt: DBUserEntity.createdAt,
    updatedAt: DBUserEntity.updatedAt,
    userApartmentLink: DBUserEntity.UserApartmentLink.map((row) =>
      UserApartmentLinkVO.create(row.apartmentId),
    ),
    address: {
      isHouseholder: DBUserEntity.Address!.isHouseholder,
      building: DBUserEntity.Address!.building,
      unit: DBUserEntity.Address!.unit,
    },
  });
};

export const toNotJoindeResidentEntity = (DBUserEntity: UserModel): NotJoinedResidentProps => {
  return NotJoinedResidentEntity.restore({
    id: DBUserEntity.id,
    name: DBUserEntity.name,
    email: DBUserEntity.email,
    contact: DBUserEntity.contact,
    role: DBUserEntity.role as Role.RESIDENT,
    joinedStatus: DBUserEntity.joinedStatus as Status.NOT_JOINED,
    version: DBUserEntity.version,
    createdAt: DBUserEntity.createdAt,
    updatedAt: DBUserEntity.updatedAt,
    userApartmentLink: DBUserEntity.UserApartmentLink.map((row) =>
      UserApartmentLinkVO.create(row.apartmentId),
    ),
    address: {
      isHouseholder: DBUserEntity.Address!.isHouseholder,
      building: DBUserEntity.Address!.building,
      unit: DBUserEntity.Address!.unit,
    },
  });
};
