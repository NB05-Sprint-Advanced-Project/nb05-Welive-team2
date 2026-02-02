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
import { StateEntity, StateProps, WorkType } from '../state/entity/state';

export const userInclude = Prisma.validator<Prisma.UserInclude>()({
  Address: true,
  UserApartmentLink: true,
});

export const userIncludeWithApartment = Prisma.validator<Prisma.UserInclude>()({
  Address: true,
  UserApartmentLink: {
    include: {
      apartment: true,
    },
  },
});

export type UserModel = Prisma.UserGetPayload<{
  include: typeof userInclude;
}>;

export const UserMapper = {
  toCreateAdminAccountDBData: (entity: AdminAccountProps): Prisma.UserCreateInput => {
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
  },

  toCreateSuperAdminAccountDBData: (entity: AdminAccountProps): Prisma.UserCreateInput => {
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
  },

  toCreateResidentAccountDBData: (entity: ResidentAccountProps): Prisma.UserCreateInput => {
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
  },

  toCreateNotJoinedResidentDBData: (entity: NotJoinedResidentProps): Prisma.UserCreateInput => {
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
  },

  toUpdateAdminAccountDBData: (entity: AdminAccountProps): Prisma.UserUpdateInput => {
    return {
      id: entity.id,
      name: entity.name,
      email: entity.email,
      contact: entity.contact,
      version: entity.version,
      updatedAt: entity.updatedAt,
    };
  },

  toUpdateResidentAccountDBData: (entity: ResidentAccountProps): Prisma.UserUpdateInput => {
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
  },

  toUpdateNotJoinedResidentDBData: (entity: NotJoinedResidentProps): Prisma.UserUpdateInput => {
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
  },

  toUpdateAvatarDBData: (entity: BaseAllUserProps): Prisma.UserUpdateInput => {
    return {
      avatarUrl: entity.avatarUrl!,
      version: entity.version,
      updatedAt: entity.updatedAt,
    };
  },

  toUpdateJoinedStatusDBData: (
    entity: AdminAccountProps | ResidentAccountProps | NotJoinedResidentProps,
  ): Prisma.UserUpdateInput => {
    return {
      joinedStatus: entity.joinedStatus,
      version: entity.version,
      updatedAt: entity.updatedAt,
    };
  },

  toUpdatePasswordDBData: (
    entity: AdminAccountProps | ResidentAccountProps,
  ): Prisma.UserUpdateInput => {
    return {
      password: entity.password,
      version: entity.version,
      updatedAt: entity.updatedAt,
    };
  },

  toUpdateResidentAccountEntityDataFromDto: (
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
  },

  toUpdateNotJoinedEntityDataFromDto: (
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
  },

  toBaseUserEntity: (DBUserEntity: UserModel): BaseAllUserProps => {
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
  },

  toAdminAccountEntity: (DBUserEntity: UserModel): AdminAccountProps => {
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
  },

  toResidentAccountEntityFromDB: (DBUserEntity: UserModel): ResidentAccountProps => {
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
  },

  toResidentAccountEntityFromDto: async (
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
  },

  toNotJoinedResidentEntityFromDto: (dto: CreateResidentReqDto): NotJoinedResidentProps => {
    return NotJoinedResidentEntity.create({
      name: dto.name,
      email: dto.email,
      contact: dto.contact,
      address: ResidentAddressVO.create({
        isHouseholder: dto.isHouseholder,
        building: dto.building,
        unit: dto.unit,
      }),
      userApartmentLink: [UserApartmentLinkVO.create(dto.apartmentId)],
    });
  },

  toNotJoinedResidentEntity: (DBUserEntity: UserModel): NotJoinedResidentProps => {
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
  },

  toAdminJoinRequestAlarmState: (residentEntity: ResidentAccountProps): StateProps => {
    return StateEntity.create({
      workType: WorkType.ALARM,
      payload: {
        receiverType: Role.ADMIN,
        message: `[회원가입] 입주민 ${residentEntity.name}님이 회원가입을 요청했습니다.`,
      },
    });
  },
};
