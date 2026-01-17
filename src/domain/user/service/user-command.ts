import {
  CreateAdminDto,
  CreateSuperAdminDto,
  DeleteAdminDto,
  SignUpResidentAccountReqDto,
  UpdateAdminDto,
  UpdateAdminjoinedStatusDto,
  UpdateAdminjoinedStatusesDto,
  UpdateAvatarUrlReqDto,
  UpdatePasswordReqDto,
} from '../dto/user-request';
import { BusinessException } from '../../../shared/exception/business-exception/business-exception';
import { BusinessExceptionType } from '../../../shared/exception/business-exception/exception-info';
import { TechnicalExceptionType } from '../../../shared/exception/technical-exception/exception-info';
import {
  isTechnicalException,
  TechnicalException,
} from '../../../shared/exception/technical-exception/technical-exception';
import { IUnitOfWork } from '../../../shared/interface/i-unit-of-work';
import { IHashManager } from '../../../shared/interface/i-bcrypt-hash-manager';
import { IApartmentCommandRepo } from '../../apartment/i-apartment-command-repo';
import { IUserCommandRepo } from '../interface/i-user-command-repo';
import { ApartmentEntity } from '../../apartment/apartment-entity';
import { AdminAccountEntity } from '../entity/admin-account';
import { BaseUserEntity, Role, Status } from '../entity/base-user';
import { ResidentAccountEntity } from '../entity/resident-account';
import { UserApartmentLinkVO } from '../entity/vo/user-apartment-link';

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
          throw BusinessException({ type: BusinessExceptionType.EMAIL_ALREADY_IN_USE });
        }
        if (err.type === TechnicalExceptionType.UNIQUE_VIOLATION_USERNAME) {
          throw BusinessException({ type: BusinessExceptionType.USERNAME_ALREADY_IN_USE });
        }
        if (err.type === TechnicalExceptionType.UNIQUE_VIOLATION_CONTACT) {
          throw BusinessException({ type: BusinessExceptionType.CONTACT_ALREADY_IN_USE });
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

    try {
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

      await userCommandRepo.create(userEntity);
    } catch (err) {
      if (isTechnicalException(err)) {
        if (err.type === TechnicalExceptionType.UNIQUE_VIOLATION_EMAIL) {
          throw BusinessException({ type: BusinessExceptionType.EMAIL_ALREADY_IN_USE });
        }
        if (err.type === TechnicalExceptionType.UNIQUE_VIOLATION_USERNAME) {
          throw BusinessException({ type: BusinessExceptionType.USERNAME_ALREADY_IN_USE });
        }
        if (err.type === TechnicalExceptionType.UNIQUE_VIOLATION_CONTACT) {
          throw BusinessException({ type: BusinessExceptionType.CONTACT_ALREADY_IN_USE });
        }
        if (err.type === TechnicalExceptionType.UNIQUE_VIOLATION_ADDRESS) {
          throw BusinessException({ type: BusinessExceptionType.ADDRESS_ALREADY_IN_USE });
        }
      }
      throw err;
    }
  };

  const updateAdmin = async (dto: UpdateAdminDto): Promise<void> => {
    // 1. 특정 Admin 계정 가져오기
    const foundUser = await userCommandRepo.findAdminUserById(dto.adminId);

    if (!foundUser) {
      throw BusinessException({ type: BusinessExceptionType.USER_NOT_FOUND });
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
      throw BusinessException({ type: BusinessExceptionType.APARTMENT_NOT_FOUND });
    }
    const updatedApartmentEntity = ApartmentEntity.update({
      apartment: foundApartment,
      name: dto.adminOf.name,
      address: dto.adminOf.address,
      description: dto.adminOf.description,
      officeNumber: dto.adminOf.officeNumber,
    });

    try {
      await apartmentRepo.update(updatedApartmentEntity);
      await userCommandRepo.update(updatedUserEntity);
    } catch (err) {
      if (isTechnicalException(err)) {
        if (err.type === TechnicalExceptionType.UNIQUE_VIOLATION_EMAIL) {
          throw BusinessException({ type: BusinessExceptionType.EMAIL_ALREADY_IN_USE });
        }
        if (err.type === TechnicalExceptionType.UNIQUE_VIOLATION_USERNAME) {
          throw BusinessException({ type: BusinessExceptionType.USERNAME_ALREADY_IN_USE });
        }
        if (err.type === TechnicalExceptionType.UNIQUE_VIOLATION_CONTACT) {
          throw BusinessException({ type: BusinessExceptionType.CONTACT_ALREADY_IN_USE });
        }
        if (err.type === TechnicalExceptionType.OPTIMISTIC_LOCK_FAILED) {
          throw BusinessException({ type: BusinessExceptionType.CONCURRENT_MODIFICATION });
        }
        if (err.type === TechnicalExceptionType.UNIQUE_VIOLATION_ADDRESS) {
          throw BusinessException({ type: BusinessExceptionType.ADDRESS_ALREADY_IN_USE });
        }

        throw TechnicalException({
          type: TechnicalExceptionType.UNKNOWN_ERROR,
          error: err,
        });
      }
      throw err;
    }
  };

  const updateAdminJoinedStatuses = async (dto: UpdateAdminjoinedStatusesDto): Promise<void> => {
    try {
      const users = await userCommandRepo.findPendingAdminUsers();

      if (!users) {
        throw BusinessException({
          type: BusinessExceptionType.USER_NOT_FOUND,
        });
      }

      await userCommandRepo.updateJoinedStatuses(
        users.map((user) => AdminAccountEntity.updateJoinedStatus(user, dto.joinStatus)),
      );
    } catch (err) {
      if (isTechnicalException(err) && err.type === TechnicalExceptionType.OPTIMISTIC_LOCK_FAILED) {
        throw BusinessException({
          type: BusinessExceptionType.CONCURRENT_MODIFICATION,
        });
      }

      throw err;
    }
  };

  const updateAdminJoinedStatus = async (dto: UpdateAdminjoinedStatusDto) => {
    const user = await userCommandRepo.findAdminUserById(dto.id);

    if (!user) {
      throw BusinessException({
        type: BusinessExceptionType.USER_NOT_FOUND,
      });
    }

    await userCommandRepo.updateJoinedStatus(
      AdminAccountEntity.updateJoinedStatus(user, dto.joinStatus),
    );
  };

  const deleteAdmin = async (dto: DeleteAdminDto): Promise<void> => {
    const user = await userCommandRepo.findAdminUserById(dto.adminId);
    if (!user) {
      throw BusinessException({
        type: BusinessExceptionType.USER_NOT_FOUND,
      });
    }
    await userCommandRepo.deleteUser(user.id);
  };

  const deleteRejectedAdmins = async (): Promise<void> => {
    const users = await userCommandRepo.findRejectedAdminUsers();
    if (!users) {
      return;
    }

    await userCommandRepo.deleteUsers(users);
  };
  // 입주민 계정
  const createResidentAccount = async (dto: SignUpResidentAccountReqDto) => {};

  // 입주민(가입한 입주민 + 미가입한 입주민)

  // 기타
  const updateAvatarUrl = async (dto: UpdateAvatarUrlReqDto): Promise<void> => {
    try {
      await uow.doWork(async () => {
        const user = await userCommandRepo.findBaseUserById(dto.userId);

        if (!user) {
          throw BusinessException({
            type: BusinessExceptionType.USER_NOT_FOUND,
          });
        }

        await userCommandRepo.updateAvatar(BaseUserEntity.updateAvatar(user, dto.avatarUrl));
      });
    } catch (err) {
      if (isTechnicalException(err) && err.type === TechnicalExceptionType.OPTIMISTIC_LOCK_FAILED) {
        throw BusinessException({
          type: BusinessExceptionType.CONCURRENT_MODIFICATION,
        });
      }

      throw err;
    }
  };

  const updatePassword = async (dto: UpdatePasswordReqDto): Promise<void> => {
    try {
      uow.doWork(async () => {
        const user = await userCommandRepo.findJoinedUserById(dto.userId);

        if (!user) {
          throw BusinessException({
            type: BusinessExceptionType.USER_NOT_FOUND,
          });
        }

        // 입력한 현재 비번과 DB 비번 불일치하는지 비교
        if (!(await BaseUserEntity.isPasswordMatch(user.password, dto.password, hashManager))) {
          throw BusinessException({
            type: BusinessExceptionType.INCORRECT_PASSWORD,
          });
        }

        // 입력한 새 비번과 DB 비번 일치하는지 비교
        if (await BaseUserEntity.isPasswordMatch(user.password, dto.newpassword, hashManager)) {
          throw BusinessException({
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
    } catch (err) {
      if (isTechnicalException(err) && err.type === TechnicalExceptionType.OPTIMISTIC_LOCK_FAILED) {
        throw BusinessException({
          type: BusinessExceptionType.CONCURRENT_MODIFICATION,
        });
      }

      throw err;
    }
  };

  return {
    createSuperAdmin,
    createAdmin,
    updateAdmin,
    updateAdminJoinedStatuses,
    updateAdminJoinedStatus,
    deleteAdmin,
    deleteRejectedAdmins,
    createResidentAccount,
    updateAvatarUrl,
    updatePassword,
  };
};

export type UserCommandService = ReturnType<typeof createUserCommandService>;
