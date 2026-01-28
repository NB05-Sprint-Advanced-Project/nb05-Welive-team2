import { BaseUserEntity, BaseAllUserProps, Role, Status } from './entity/base-user';
import { UserApartmentLinkVO } from './entity/vo/user-apartment-link';
import { AdminAccountEntity, AdminAccountProps } from './entity/admin-account';
import { Prisma } from '@prisma/client';
import { ResidentAccountEntity, ResidentAccountProps } from './entity/resident-account';
import { NotJoinedResidentEntity, NotJoinedResidentProps } from './entity/not-joined-resident';
import { IHashManager } from '../../shared/interface/i-bcrypt-hash-manager';
import { UpdateResidentReqDto, CreateResidentReqDto } from './dto/resident-user-response';
import { SignUpResidentAccountReqDto } from './dto/user-request';
import { ResidentAddressVO } from './entity/vo/resident-address';
import { StateEntity, StateProps, StatusType, WorkType } from '../state/entity/state';
import { randomUUID } from 'crypto';

export const userInclude = Prisma.validator<Prisma.UserInclude>()({
  Address: true,
  UserApartmentLink: true,
});

export type UserModel = Prisma.UserGetPayload<{
  include: typeof userInclude;
}>;

export const toCreateAdminAccountDBData = (entity: AdminAccountProps): Prisma.UserCreateInput => {
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

export const toCreateSuperAdminAccountDBData = (
  entity: AdminAccountProps,
): Prisma.UserCreateInput => {
  return {
    id: entity.id,
    username: entity.username,
    password: entity.password,
    name: entity.name,
    email: entity.email,
    contact: entity.contact,
    role: entity.role,
    joinedStatus: Status.APPROVED,
    version: entity.version,
    createdAt: entity.createdAt,
    updatedAt: entity.updatedAt,
  };
};

export const toCreateResidentAccountDBData = (
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

export const toCreateNotJoinedResidentDBData = (
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

export const toUpdateAdminAccountDBData = (entity: AdminAccountProps): Prisma.UserUpdateInput => {
  return {
    id: entity.id,
    name: entity.name,
    email: entity.email,
    contact: entity.contact,
    version: entity.version,
    updatedAt: entity.updatedAt,
  };
};

export const toUpdateResidentAccountDBData = (
  entity: ResidentAccountProps,
): Prisma.UserUpdateInput => {
  return {
    id: entity.id,
    username: entity.username,
    password: entity.password,
    name: entity.name,
    email: entity.email,
    contact: entity.contact,
    joinedStatus: entity.joinedStatus,
    version: entity.version,
    updatedAt: entity.updatedAt,
    Address: {
      upsert: {
        create: { ...entity.address },
        update: { ...entity.address },
      },
    },
  };
};

export const toUpdateNotJoinedResidentDBData = (
  entity: NotJoinedResidentProps,
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

export const toUpdateAvatarDBData = (entity: BaseAllUserProps): Prisma.UserUpdateInput => {
  return {
    avatarUrl: entity.avatarUrl!,
    version: entity.version,
    updatedAt: entity.updatedAt,
  };
};

export const toUpdateJoinedStatusDBData = (
  entity: AdminAccountProps | ResidentAccountProps | NotJoinedResidentProps,
): Prisma.UserUpdateInput => {
  return {
    joinedStatus: entity.joinedStatus,
    version: entity.version,
    updatedAt: entity.updatedAt,
  };
};

export const toUpdatePasswordDBData = (
  entity: AdminAccountProps | ResidentAccountProps,
): Prisma.UserUpdateInput => {
  return {
    password: entity.password,
    version: entity.version,
    updatedAt: entity.updatedAt,
  };
};

export const toUpdateResidentAccountEntityDataFromDto = (
  dto: UpdateResidentReqDto,
  residentAccountUser: ResidentAccountProps,
): ResidentAccountProps => {
  return ResidentAccountEntity.update({
    user: residentAccountUser,
    name: dto.name,
    contact: dto.contact,
    residentAddress: ResidentAddressVO.create({
      building: dto.building,
      unit: dto.unit,
      isHouseholder: dto.isHouseholder,
    }),
  });
};

export const toUpdateNotJoinedEntityDataFromDto = (
  dto: UpdateResidentReqDto,
  residentAccountUser: NotJoinedResidentProps,
): NotJoinedResidentProps => {
  return NotJoinedResidentEntity.update({
    user: residentAccountUser,
    name: dto.name,
    contact: dto.contact,
    residentAddress: ResidentAddressVO.create({
      building: dto.building,
      unit: dto.unit,
      isHouseholder: dto.isHouseholder,
    }),
  });
};

export const toBaseUserEntity = (DBUserEntity: UserModel): BaseAllUserProps => {
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
    role: DBUserEntity.role as Role.SUPER_ADMIN | Role.ADMIN,
    joinedStatus: DBUserEntity.joinedStatus as Status.APPROVED | Status.PENDING | Status.REJECTED,
    version: DBUserEntity.version,
    createdAt: DBUserEntity.createdAt,
    updatedAt: DBUserEntity.updatedAt,
    userApartmentLink: DBUserEntity.UserApartmentLink.map((row) =>
      UserApartmentLinkVO.create(row.apartmentId),
    ),
  });
};

export const toResidentAccountEntityFromDB = (DBUserEntity: UserModel): ResidentAccountProps => {
  return ResidentAccountEntity.restore({
    id: DBUserEntity.id,
    username: DBUserEntity.username!,
    password: DBUserEntity.password!,
    name: DBUserEntity.name,
    email: DBUserEntity.email,
    contact: DBUserEntity.contact,
    avatarUrl: DBUserEntity.avatarUrl ?? undefined,
    role: DBUserEntity.role as Role.USER,
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

export const toResidentAccountEntityFromDto = async (
  dto: SignUpResidentAccountReqDto,
  hashManager: IHashManager,
): Promise<ResidentAccountProps> => {
  return await ResidentAccountEntity.create({
    username: dto.username!,
    password: dto.password!,
    name: dto.name,
    email: dto.email,
    contact: dto.contact,
    userApartmentLink: [UserApartmentLinkVO.create(dto.resident.apartmentId)],
    address: {
      isHouseholder: true,
      building: dto.resident.building,
      unit: dto.resident.unit,
    },
    hashManager: hashManager,
  });
};

export const toResidentEntityFromDto = (dto: CreateResidentReqDto): NotJoinedResidentProps => {
  return NotJoinedResidentEntity.create({
    name: dto.name,
    email: dto.email,
    contact: dto.contact,
    address: {
      isHouseholder: dto.isHouseholder,
      building: dto.building,
      unit: dto.unit,
    },
    userApartmentLink: [UserApartmentLinkVO.create(dto.apartmentId)],
  });
};

export const toNotJoinedResidentEntity = (DBUserEntity: UserModel): NotJoinedResidentProps => {
  return NotJoinedResidentEntity.restore({
    id: DBUserEntity.id,
    name: DBUserEntity.name,
    email: DBUserEntity.email,
    contact: DBUserEntity.contact,
    role: DBUserEntity.role as Role.USER,
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

export const toAdminJoinRequestAlarmState = (residentEntity: ResidentAccountProps): StateProps => {
  return StateEntity.create({
    workType: WorkType.ALARM,
    status: StatusType.PENDING,
    payload: {
      id: randomUUID(),
      receiverType: Role.ADMIN,
      message: `[회원가입] 입주민 ${residentEntity.name}님이 회원가입을 요청했습니다.`,
    },
  });
};
