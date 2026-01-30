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
  UpdateResidentAccountJoinedStatusesReqDto,
  UpdateResidentAccountJoinedStatusReqDto,
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
import { IUserCommandRepo } from '../interface/i-user-command-repo';
import { AdminAccountEntity } from '../entity/admin-account';
import { BaseUserEntity, Role, Status } from '../entity/base-user';
import { ResidentAccountEntity, ResidentAccountProps } from '../entity/resident-account';
import { UserApartmentLinkVO } from '../entity/vo/user-apartment-link';
import { ApartmentEntity } from '../../apartment/entity/apartment-entity';
import { IApartmentCommandRepo } from '../../apartment/interface/i-apartment-command';
import {
  toAdminJoinRequestAlarmState,
  toResidentAccountEntityFromDto,
  toNotJoinedResidentEntityFromDto,
  toUpdateNotJoinedEntityDataFromDto,
  toUpdateResidentAccountEntityDataFromDto,
} from '../user-mapper';
import { NotJoinedResidentEntity } from '../entity/not-joined-resident';
import {
  CreateResidentReqDto,
  UpdateResidentReqDto,
  DeleteResidentReqDto,
  ExportResidentsReqDto,
} from '../dto/resident-user-response';
import { INotificationCommandRepo } from '../../notification/interface/i-notification-command';
import { IStateCommandRepo } from '../../state/interface/i-state-command-repo';
import { StateEntity, StatusType, WorkType } from '../../state/entity/state';
import { randomUUID } from 'crypto';
import { IRedisExternal } from '../../../shared/interface/i-redis';
import readline from 'readline';
import { ResidentAddressVO } from '../entity/vo/resident-address';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { s3 } from '../../../utils/s3-client';
import { Readable } from 'stream';
import { clean, importResidentRowSchema } from '../dto/import-resident-row-dto';

export const createUserCommandService = (
  uow: IUnitOfWork,
  hashManager: IHashManager,
  userCommandRepo: IUserCommandRepo,
  apartmentCommandRepo: IApartmentCommandRepo,
  stateCommandRepo: IStateCommandRepo,
  redisExternal: IRedisExternal,
) => {
  // 관리자
  const createSuperAdmin = async (dto: CreateSuperAdminDto): Promise<void> => {
    const userEntity = await AdminAccountEntity.create({
      username: dto.username,
      password: dto.password,
      name: dto.name,
      email: dto.email,
      contact: dto.contact,
      role: Role.SUPER_ADMIN,
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
      await uow.doWork(
        async () => {
          const apartment = await apartmentCommandRepo.create(apartmentEntity);

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

          // 알림 상태 데이터 생성
          const stateEntity = StateEntity.create({
            workType: WorkType.ALARM,
            status: StatusType.PENDING,
            payload: {
              receiverType: Role.SUPER_ADMIN,
              message: `[회원가입] 관리자 ${userEntity.name}님이 회원가입을 요청했습니다.`,
            } as unknown as JSON,
          });

          await stateCommandRepo.create(stateEntity);
        },
        {
          transactionOptions: {
            useTransaction: true,
            isolationLevel: 'ReadCommitted',
          },
          useOptimisticLock: false,
        },
      );
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
    // 트랜잭션 + 낙관적 락킹
    try {
      await uow.doWork(
        async () => {
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

          await userCommandRepo.update(updatedUserEntity);

          // // 3. 아파트 정보 조회
          const foundApartment = await apartmentCommandRepo.findById(
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

          // const updatedApartmentEntity = ApartmentEntity.update({
          //   apartment: foundApartment,
          //   name: dto.adminOf.name,
          //   address: dto.adminOf.address,
          //   description: dto.adminOf.description,
          //   officeNumber: dto.adminOf.officeNumber,
          // });

          await apartmentCommandRepo.update(updatedApartmentEntity);
        },
        {
          transactionOptions: {
            useTransaction: true,
            isolationLevel: 'ReadCommitted',
          },
          useOptimisticLock: true,
        },
      );
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

    if (user.joinedStatus === Status.APPROVED || user.joinedStatus === Status.REJECTED) {
      throw BusinessException({
        type: BusinessExceptionType.NOT_UPDATE_JOINEDSTATUS,
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

    await userCommandRepo.deleteUsers();
  };

  // 입주민 계정
  const createResidentAccount = async (dto: SignUpResidentAccountReqDto): Promise<void> => {
    try {
      await uow.doWork(async () => {
        let residentEntity: ResidentAccountProps;

        const resident = await userCommandRepo.findNotJoinedResidentByEmail(dto.email);

        if (!resident) {
          // 새로운 입주민이면 새로운 row 등록
          residentEntity = await toResidentAccountEntityFromDto(dto, hashManager);
          await userCommandRepo.create(residentEntity);
        } else {
          // 미가입했던 입주민이면(입주민 관리에서 등록된 입주민) 가입 상태를 Pending으로 승격
          if (NotJoinedResidentEntity.isNotJoinedResident(dto, resident)) {
            residentEntity = await ResidentAccountEntity.requestJoin(resident, dto, hashManager);

            await userCommandRepo.update(residentEntity);
            return;
          }
          // 새로운 입주민인데 이메일이 중복되었을 때
          throw BusinessException({
            type: BusinessExceptionType.EMAIL_ALREADY_IN_USE,
          });
        }

        const stateEntity = toAdminJoinRequestAlarmState(residentEntity);

        await stateCommandRepo.create(stateEntity);

        redisExternal.del('residentAccounts:1:10');
        redisExternal.del('residents:1:10');
      });
    } catch (err) {
      if (isTechnicalException(err)) {
        if (err.type === TechnicalExceptionType.OPTIMISTIC_LOCK_FAILED) {
          throw BusinessException({
            type: BusinessExceptionType.CONCURRENT_MODIFICATION,
          });
        }
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

  const updateResidentAccountJoinStatus = async (dto: UpdateResidentAccountJoinedStatusReqDto) => {
    try {
      await uow.doWork(async () => {
        const user = await userCommandRepo.findResidentAccountUserById(dto.id);

        if (!user) {
          throw BusinessException({
            type: BusinessExceptionType.USER_NOT_FOUND,
          });
        }

        if (user.joinedStatus === Status.APPROVED || user.joinedStatus === Status.REJECTED) {
          throw BusinessException({
            type: BusinessExceptionType.NOT_UPDATE_JOINEDSTATUS,
          });
        }

        await userCommandRepo.updateJoinedStatus(
          ResidentAccountEntity.updateJoinedStatus(user, dto.joinStatus),
        );

        redisExternal.del('residentAccounts:1:10');
        redisExternal.del('residents:1:10');
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

  const updateResidentAccountJoinStatuses = async (
    dto: UpdateResidentAccountJoinedStatusesReqDto,
  ) => {
    try {
      await uow.doWork(async () => {
        const users = await userCommandRepo.findPendingResidentUsers();

        if (!users) {
          throw BusinessException({
            type: BusinessExceptionType.USER_NOT_FOUND,
          });
        }

        await userCommandRepo.updateJoinedStatuses(
          users.map((user) => ResidentAccountEntity.updateJoinedStatus(user, dto.joinStatus)),
        );
        redisExternal.del('residentAccounts:1:10');
        redisExternal.del('residents:1:10');
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

  const deleteResidentAccounts = async (): Promise<void> => {
    await userCommandRepo.deleteUsers();
    redisExternal.del('residentAccounts:1:10');
    redisExternal.del('residents:1:10');
  };

  // 입주민(가입한 입주민 + 미가입한 입주민)
  const createResident = async (dto: CreateResidentReqDto): Promise<void> => {
    try {
      await userCommandRepo.create(toNotJoinedResidentEntityFromDto(dto));
      redisExternal.del('residents:1:10');
    } catch (err) {
      if (isTechnicalException(err)) {
        if (err.type === TechnicalExceptionType.UNIQUE_VIOLATION_EMAIL) {
          throw BusinessException({ type: BusinessExceptionType.EMAIL_ALREADY_IN_USE });
        }
        if (err.type === TechnicalExceptionType.UNIQUE_VIOLATION_CONTACT) {
          throw BusinessException({ type: BusinessExceptionType.CONTACT_ALREADY_IN_USE });
        }
      }
      throw err;
    }
  };

  const updateResident = async (dto: UpdateResidentReqDto): Promise<void> => {
    try {
      await uow.doWork(async () => {
        const user = await userCommandRepo.findResidentById(dto.id);

        if (!user) {
          throw BusinessException({
            type: BusinessExceptionType.USER_NOT_FOUND,
          });
        }

        if (user.joinedStatus === Status.NOT_JOINED) {
          await userCommandRepo.update(toUpdateNotJoinedEntityDataFromDto(dto, user));
        } else {
          await userCommandRepo.update(toUpdateResidentAccountEntityDataFromDto(dto, user));
        }
        redisExternal.del('residents:1:10');
      });
    } catch (err) {
      if (isTechnicalException(err)) {
        if (err.type === TechnicalExceptionType.OPTIMISTIC_LOCK_FAILED) {
          throw BusinessException({
            type: BusinessExceptionType.CONCURRENT_MODIFICATION,
          });
        }
        if (err.type === TechnicalExceptionType.UNIQUE_VIOLATION_CONTACT) {
          throw BusinessException({ type: BusinessExceptionType.CONTACT_ALREADY_IN_USE });
        }
      }
      throw err;
    }
  };

  const deleteResident = async (dto: DeleteResidentReqDto): Promise<void> => {
    await userCommandRepo.deleteUser(dto.id);
    redisExternal.del('residents:1:10');
  };

  const createResidentBulk = async (s3Dto: { userId: string; bucket: string; key: string }) => {
    const apartmentId = (await userCommandRepo.findAdminUserById(s3Dto.userId))!
      .userApartmentLink![0].apartmentId;

    if (!apartmentId) {
      throw BusinessException({ type: BusinessExceptionType.USER_NOT_FOUND });
    }

    const command = new GetObjectCommand({
      Bucket: s3Dto.bucket,
      Key: s3Dto.key,
    });

    const { Body } = await s3.send(command);

    if (!Body || typeof Body === 'string') {
      throw BusinessException({ type: BusinessExceptionType.NOT_CSV_FILE });
    }

    const rl = readline.createInterface({
      input: Body as NodeJS.ReadableStream,
      crlfDelay: Infinity,
    });

    let batchEntities = [];
    let processCount = 0;

    const apartmentInfo = await apartmentCommandRepo.findById(apartmentId);

    if (!apartmentInfo) {
      throw BusinessException({
        type: BusinessExceptionType.APARTMENT_NOT_FOUND,
      });
    }
    const { buildingNumberTo, buildingNumberFrom, floorCountPerBuilding, unitCountPerFloor } =
      apartmentInfo;

    for await (const line of rl) {
      // "동","호수","이름","연락처","이메일","세대주여부"
      const [buildingRaw, unitRaw, nameRaw, contactRaw, emailRaw, isHouseholderRaw] =
        line.split(',');

      const rawRow = {
        building: clean(buildingRaw),
        unit: clean(unitRaw),
        name: clean(nameRaw),
        contact: clean(contactRaw),
        email: clean(emailRaw),
        isHouseholder: clean(isHouseholderRaw),
      };

      // 데이터 형식 검증
      const parsed = importResidentRowSchema.safeParse(rawRow);

      if (!parsed.success) {
        continue;
      }

      const { building, unit, name, contact, email, isHouseholder } = parsed.data;

      // 비즈니즈 검증
      const buildingNumber = Number(building);
      const unitNumber = Number(unit);

      if (buildingNumber < buildingNumberFrom || buildingNumber > buildingNumberTo) {
        continue;
      }

      const floor = Math.floor(unitNumber / 100);
      const unitInFloor = unitNumber % 100;

      if (floor < 1 || floor > floorCountPerBuilding) {
        continue;
      }

      if (unitInFloor < 1 || unitInFloor > unitCountPerFloor) {
        continue;
      }

      batchEntities.push(
        NotJoinedResidentEntity.create({
          name,
          email,
          contact,
          address: ResidentAddressVO.create({
            isHouseholder: isHouseholder,
            building: Number(building),
            unit: Number(unit),
          }),
          userApartmentLink: [UserApartmentLinkVO.create(apartmentId)],
        }),
      );
      if (batchEntities.length === 1000) {
        await userCommandRepo.createManyBulk(batchEntities);
        processCount += 1000;
        console.log(`${processCount} 벌크 크리에이트 완료`);
        batchEntities = [];
      }
    }

    await userCommandRepo.createManyBulk(batchEntities);
    console.log(`${processCount + batchEntities.length} 벌크 크리에이트 완료`);
    batchEntities = [];

    return {
      count: processCount + batchEntities.length,
    };
  };

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
      await uow.doWork(async () => {
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
        if (await BaseUserEntity.isPasswordMatch(user.password, dto.newPassword, hashManager)) {
          throw BusinessException({
            type: BusinessExceptionType.CORRECT_PASSWORD,
          });
        }

        if (user.role === Role.ADMIN || user.role === Role.SUPER_ADMIN) {
          await userCommandRepo.updatePassword(
            await AdminAccountEntity.updatePassword(user, dto.newPassword, hashManager),
          );
        } else if (user.role === Role.USER) {
          await userCommandRepo.updatePassword(
            await ResidentAccountEntity.updatePassword(user, dto.newPassword, hashManager),
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
    updateResidentAccountJoinStatus,
    updateResidentAccountJoinStatuses,
    deleteResidentAccounts,
    createResident,
    updateResident,
    deleteResident,
    updateAvatarUrl,
    updatePassword,
    createResidentBulk,
  };
};

export type UserCommandService = ReturnType<typeof createUserCommandService>;
