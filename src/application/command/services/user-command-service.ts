import {
  CreateAdminDto,
  CreateSuperAdminDto,
  SignUpResidentAccountReqDto,
  UpdateAdminDto,
  UpdateAvatarUrlReqDto,
  UpdatePasswordReqDto,
} from '../../../inbound/requests/user-request';
import { createBusinessException } from '../../../shared/exceptioins/business-exception/business-exception';
import { BusinessExceptionType } from '../../../shared/exceptioins/business-exception/exception-info';
import { TechnicalExceptionType } from '../../../shared/exceptioins/technical-exception/exception-info';
import { isTechnicalException } from '../../../shared/exceptioins/technical-exception/technical-exception';
import { IUnitOfWork } from '../../ports/i-unit-of-work';
import { IHashManager } from '../../ports/managers/i-bcrypt-hash-manager';
import { IApartmentCommandRepo } from '../../ports/repos/command/i-apartment-command-repo';
import { IUserCommandRepo } from '../../ports/repos/command/i-user-command-repo';
import { ApartmentEntity } from '../entities/apartment/apartment-entity';
import { AdminAccountEntity } from '../entities/user/admin-account-entity';
import { BaseUserEntity, Role, Status } from '../entities/user/base-user-entity';
import { ResidentAccountEntity } from '../entities/user/resident-account-entity';
import { UserApartmentLinkVO } from '../entities/user/user-apartment-link-vo';

export const createUserCommandService = (
  uow: IUnitOfWork,
  hashManager: IHashManager,
  userCommandRepo: IUserCommandRepo,
  apartmentRepo: IApartmentCommandRepo,
) => {
  // 관리자
  const createSuperAdmin = async (dto: CreateSuperAdminDto): Promise<void> => {
    const userEntity = await AdminAccountEntity.create({
      username: dto.username,
      password: dto.password,
      name: dto.name,
      email: dto.email,
      contact: dto.contact,
      role: Role.SUPERADMIN,
      hashManager: hashManager,
    });

    try {
      await userCommandRepo.create(userEntity);
    } catch (err) {
      if (isTechnicalException(err)) {
        if (err.type === TechnicalExceptionType.UNIQUE_VIOLATION_EMAIL) {
          throw createBusinessException({ type: BusinessExceptionType.EMAIL_ALREADY_IN_USE });
        }
        if (err.type === TechnicalExceptionType.UNIQUE_VIOLATION_USERNAME) {
          throw createBusinessException({ type: BusinessExceptionType.USERNAME_ALREADY_IN_USE });
        }
        if (err.type === TechnicalExceptionType.UNIQUE_VIOLATION_CONTACT) {
          throw createBusinessException({ type: BusinessExceptionType.CONTACT_ALREADY_IN_USE });
        }
      }
      throw err;
    }
  };

  const createAdmin = async (dto: CreateAdminDto): Promise<void> => {
    // 1. 아파트 생성
    const apartmentEntity = ApartmentEntity.create({
      name: dto.adminOf.name,
      address: dto.adminOf.address,
      description: dto.adminOf.description,
      officeNumber: dto.adminOf.officeNumber,
      buildingNumberFrom: dto.adminOf.buildingNumberFrom,
      buildingNumberTo: dto.adminOf.buildingNumberTo,
      floorCountPerBuilding: dto.adminOf.floorCountPerBuilding,
      unitCountPerFloor: dto.adminOf.unitCountPerFloor,
    });

    const apartment = await apartmentRepo.create(apartmentEntity);

    // 2. 관리자 계정 생성
    const userEntity = await AdminAccountEntity.create({
      username: dto.username,
      email: dto.email,
      contact: dto.contact,
      name: dto.name,
      password: dto.password,
      userApartmentLink: [UserApartmentLinkVO.create(apartment.id)],
      role: Role.ADMIN,
      hashManager: hashManager,
    });

    try {
      await userCommandRepo.create(userEntity);
    } catch (err) {
      if (isTechnicalException(err)) {
        if (err.type === TechnicalExceptionType.UNIQUE_VIOLATION_EMAIL) {
          throw createBusinessException({ type: BusinessExceptionType.EMAIL_ALREADY_IN_USE });
        }
        if (err.type === TechnicalExceptionType.UNIQUE_VIOLATION_USERNAME) {
          throw createBusinessException({ type: BusinessExceptionType.USERNAME_ALREADY_IN_USE });
        }
        if (err.type === TechnicalExceptionType.UNIQUE_VIOLATION_CONTACT) {
          throw createBusinessException({ type: BusinessExceptionType.CONTACT_ALREADY_IN_USE });
        }
      }
      throw err;
    }
  };

  const updateAdmin = async (dto: UpdateAdminDto): Promise<void> => {
    // 1. 특정 Admin 계정 가져오기
    const foundUser = await userCommandRepo.findAdminUserById(dto.adminId);

    if (!foundUser) {
      throw createBusinessException({ type: BusinessExceptionType.USER_NOT_FOUND });
    }

    // 2. 유저 정보 수정
    const updatedUserEntity = AdminAccountEntity.update({
      user: foundUser,
      name: dto.name,
      email: dto.email,
      contact: dto.contact,
    });

    // 3. 아파트 정보 조회
    const foundApartment = await apartmentRepo.findById(
      foundUser.userApartmentLink![0].apartmentId,
    );

    // 4. 아파트 정보 수정
    if (!foundApartment) {
      throw createBusinessException({ type: BusinessExceptionType.APARTMENT_NOT_FOUND });
    }
    const updatedApartmentEntity = ApartmentEntity.update({
      apartment: foundApartment,
      name: dto.adminOf.name,
      address: dto.adminOf.address,
      description: dto.adminOf.description,
      officeNumber: dto.adminOf.officeNumber,
    });

    const updatedApartment = await apartmentRepo.update(updatedApartmentEntity);

    try {
      await userCommandRepo.update(updatedUserEntity);
    } catch (err) {
      if (isTechnicalException(err)) {
        if (err.type === TechnicalExceptionType.UNIQUE_VIOLATION_EMAIL) {
          throw createBusinessException({ type: BusinessExceptionType.EMAIL_ALREADY_IN_USE });
        }
        if (err.type === TechnicalExceptionType.UNIQUE_VIOLATION_USERNAME) {
          throw createBusinessException({ type: BusinessExceptionType.USERNAME_ALREADY_IN_USE });
        }
        if (err.type === TechnicalExceptionType.UNIQUE_VIOLATION_CONTACT) {
          throw createBusinessException({ type: BusinessExceptionType.CONTACT_ALREADY_IN_USE });
        }
        if (err.type === TechnicalExceptionType.OPTIMISTIC_LOCK_FAILED) {
          throw createBusinessException({ type: BusinessExceptionType.CONCURRENT_MODIFICATION });
        }
        throw err;
      }
      throw err;
    }
  };

  // const updateAdminsJoinedStatus = async (status: string) => {
  //   const user = await userCommandRepo.findAdminUserByRole()
  //   AdminAccountEntity.
  //   return userCommandRepo.approveAllAdmin(status);
  // };

  // const approveAdmin = async (status: string, adminId: string) => {
  //   return userCommandRepo.approveAdmin(status, adminId);
  // };

  // 입주민 계정
  const createResidentAccount = async (dto: SignUpResidentAccountReqDto) => {};

  // 입주민(가입한 입주민 + 미가입한 입주민)

  // 기타
  const updateAvatarUrl = async (dto: UpdateAvatarUrlReqDto): Promise<void> => {
    uow.doWork(async () => {
      try {
        const user = await userCommandRepo.findBaseUserById(dto.userId);

        if (!user) {
          throw createBusinessException({
            type: BusinessExceptionType.USER_NOT_FOUND,
          });
        }

        await userCommandRepo.updateAvatar(BaseUserEntity.updateAvatar(user, dto.avatarUrl));
      } catch (err) {
        if (isTechnicalException(err)) {
          if (err.type === TechnicalExceptionType.OPTIMISTIC_LOCK_FAILED) {
            throw createBusinessException({
              type: BusinessExceptionType.CONCURRENT_MODIFICATION,
            });
          }
        }
      }
    });
  };

  const updatePassword = async (dto: UpdatePasswordReqDto): Promise<void> => {
    uow.doWork(async () => {
      const user = await userCommandRepo.findJoinedUserById(dto.userId);

      if (!user) {
        throw createBusinessException({
          type: BusinessExceptionType.USER_NOT_FOUND,
        });
      }

      // 입력한 현재 비번과 DB 비번 불일치하는지 비교
      if (!(await BaseUserEntity.isPasswordMatch(user.password, dto.password, hashManager))) {
        throw createBusinessException({
          type: BusinessExceptionType.INCORRECT_PASSWORD,
        });
      }

      // 입력한 새 비번과 DB 비번 일치하는지 비교
      if (await BaseUserEntity.isPasswordMatch(user.password, dto.newpassword, hashManager)) {
        throw createBusinessException({
          type: BusinessExceptionType.CORRECT_PASSWORD,
        });
      }

      if (user.role === Role.ADMIN || user.role === Role.SUPERADMIN) {
        await userCommandRepo.updatePassword(
          await AdminAccountEntity.updatePassword(user, dto.newpassword, hashManager),
        );
      }

      if (user.role === Role.RESIDENT) {
        await userCommandRepo.updatePassword(
          await ResidentAccountEntity.updatePassword(user, dto.newpassword, hashManager),
        );
      }
    });
  };

  return {
    createSuperAdmin,
    createAdmin,
    updateAdmin,
    // approveAllAdmins,
    // approveAdmin,
    createResidentAccount,
    updateAvatarUrl,
    updatePassword,
  };
};

export type UserCommandService = ReturnType<typeof createUserCommandService>;
