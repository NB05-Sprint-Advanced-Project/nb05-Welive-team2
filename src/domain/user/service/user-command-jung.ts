// import { BusinessException } from '../../../shared/exception/business-exception/business-exception';
// import { BusinessExceptionType } from '../../../shared/exception/business-exception/exception-info';
// import { TechnicalExceptionType } from '../../../shared/exception/technical-exception/exception-info';
// import {
//   isTechnicalException,
//   TechnicalException,
// } from '../../../shared/exception/technical-exception/technical-exception';
// import { IHashManager } from '../../../shared/interface/i-bcrypt-hash-manager';
// import { IUnitOfWork } from '../../../shared/interface/i-unit-of-work';
// import { ApartmentEntity } from '../../apartment/apartment-entity';
// import { IApartmentCommandRepo } from '../../apartment/i-apartment-command-repo';
// import {
//   CreateResidentReqDto,
//   DeleteResidentReqDto,
//   UpdateResidentReqDto,
// } from '../dto/resident-response';
// import {
//   CreateSuperAdminDto,
//   CreateAdminDto,
//   UpdateAdminDto,
//   UpdateAdminjoinedStatusesDto,
//   UpdateAdminjoinedStatusDto,
//   SignUpResidentAccountReqDto,
//   UpdateAvatarUrlReqDto,
//   UpdatePasswordReqDto,
//   UpdateResidentAccountJoinedStatusReqDto,
//   UpdateResidentAccountJoinedStatusesReqDto,
// } from '../dto/user-request';
// import { AdminAccountEntity } from '../entity/admin-account';
// import { Role, BaseUserEntity, Status } from '../entity/base-user';
// import { NotJoinedResidentEntity } from '../entity/not-joined-resident';
// import { ResidentAccountEntity } from '../entity/resident-account';
// import { UserApartmentLinkVO } from '../entity/vo/user-apartment-link';
// import { IUserCommandRepo } from '../interface/i-user-command-repo';
// import {
//   toResidentAccountEntityFromDto,
//   toResidentEntityFromDto,
//   toUpdateNotJoinedEntityDataFromDto,
//   toUpdateResidentAccountEntityDataFromDto,
// } from '../user-mapper-jung';

// export const createUserCommandService = (
//   uow: IUnitOfWork,
//   hashManager: IHashManager,
//   userCommandRepo: IUserCommandRepo,
//   apartmentRepo: IApartmentCommandRepo,
// ) => {
//   // 관리자 계정
//   const createSuperAdmin = async (dto: CreateSuperAdminDto): Promise<void> => {
//     const userEntity = await AdminAccountEntity.create({
//       username: dto.username,
//       password: dto.password,
//       name: dto.name,
//       email: dto.email,
//       contact: dto.contact,
//       role: Role.SUPERADMIN,
//       hashManager: hashManager,
//     });

//     try {
//       await userCommandRepo.create(userEntity);
//     } catch (err) {
//       if (isTechnicalException(err)) {
//         if (err.type === TechnicalExceptionType.UNIQUE_VIOLATION_EMAIL) {
//           throw BusinessException({ type: BusinessExceptionType.EMAIL_ALREADY_IN_USE });
//         }
//         if (err.type === TechnicalExceptionType.UNIQUE_VIOLATION_USERNAME) {
//           throw BusinessException({ type: BusinessExceptionType.USERNAME_ALREADY_IN_USE });
//         }
//         if (err.type === TechnicalExceptionType.UNIQUE_VIOLATION_CONTACT) {
//           throw BusinessException({ type: BusinessExceptionType.CONTACT_ALREADY_IN_USE });
//         }
//       }
//       throw err;
//     }
//   };

//   const createAdmin = async (dto: CreateAdminDto): Promise<void> => {
//     // 1. 아파트 생성
//     const apartmentEntity = ApartmentEntity.create({
//       name: dto.adminOf.name,
//       address: dto.adminOf.address,
//       description: dto.adminOf.description,
//       officeNumber: dto.adminOf.officeNumber,
//       buildingNumberFrom: dto.adminOf.buildingNumberFrom,
//       buildingNumberTo: dto.adminOf.buildingNumberTo,
//       floorCountPerBuilding: dto.adminOf.floorCountPerBuilding,
//       unitCountPerFloor: dto.adminOf.unitCountPerFloor,
//     });

//     try {
//       const apartment = await apartmentRepo.create(apartmentEntity);

//       // 2. 관리자 계정 생성
//       const userEntity = await AdminAccountEntity.create({
//         username: dto.username,
//         email: dto.email,
//         contact: dto.contact,
//         name: dto.name,
//         password: dto.password,
//         userApartmentLink: [UserApartmentLinkVO.create(apartment.id)],
//         role: Role.ADMIN,
//         hashManager: hashManager,
//       });

//       await userCommandRepo.create(userEntity);
//     } catch (err) {
//       if (isTechnicalException(err)) {
//         if (err.type === TechnicalExceptionType.UNIQUE_VIOLATION_EMAIL) {
//           throw BusinessException({ type: BusinessExceptionType.EMAIL_ALREADY_IN_USE });
//         }
//         if (err.type === TechnicalExceptionType.UNIQUE_VIOLATION_USERNAME) {
//           throw BusinessException({ type: BusinessExceptionType.USERNAME_ALREADY_IN_USE });
//         }
//         if (err.type === TechnicalExceptionType.UNIQUE_VIOLATION_CONTACT) {
//           throw BusinessException({ type: BusinessExceptionType.CONTACT_ALREADY_IN_USE });
//         }
//         if (err.type === TechnicalExceptionType.UNIQUE_VIOLATION_ADDRESS) {
//           throw BusinessException({ type: BusinessExceptionType.ADDRESS_ALREADY_IN_USE });
//         }
//       }
//       throw err;
//     }
//   };

//   const updateAdmin = async (dto: UpdateAdminDto): Promise<void> => {
//     // 1. 특정 Admin 계정 가져오기
//     const foundUser = await userCommandRepo.findAdminUserById(dto.adminId);

//     if (!foundUser) {
//       throw BusinessException({ type: BusinessExceptionType.USER_NOT_FOUND });
//     }

//     // 2. 유저 정보 수정
//     const updatedUserEntity = AdminAccountEntity.update({
//       user: foundUser,
//       name: dto.name,
//       email: dto.email,
//       contact: dto.contact,
//     });

//     // 3. 아파트 정보 조회
//     const foundApartment = await apartmentRepo.findById(
//       foundUser.userApartmentLink![0].apartmentId,
//     );

//     // 4. 아파트 정보 수정
//     if (!foundApartment) {
//       throw BusinessException({ type: BusinessExceptionType.APARTMENT_NOT_FOUND });
//     }
//     const updatedApartmentEntity = ApartmentEntity.update({
//       apartment: foundApartment,
//       name: dto.adminOf.name,
//       address: dto.adminOf.address,
//       description: dto.adminOf.description,
//       officeNumber: dto.adminOf.officeNumber,
//     });

//     try {
//       await apartmentRepo.update(updatedApartmentEntity);

//       await userCommandRepo.update(updatedUserEntity);
//     } catch (err) {
//       if (isTechnicalException(err)) {
//         if (err.type === TechnicalExceptionType.UNIQUE_VIOLATION_EMAIL) {
//           throw BusinessException({ type: BusinessExceptionType.EMAIL_ALREADY_IN_USE });
//         }
//         if (err.type === TechnicalExceptionType.UNIQUE_VIOLATION_USERNAME) {
//           throw BusinessException({ type: BusinessExceptionType.USERNAME_ALREADY_IN_USE });
//         }
//         if (err.type === TechnicalExceptionType.UNIQUE_VIOLATION_CONTACT) {
//           throw BusinessException({ type: BusinessExceptionType.CONTACT_ALREADY_IN_USE });
//         }
//         if (err.type === TechnicalExceptionType.OPTIMISTIC_LOCK_FAILED) {
//           throw BusinessException({ type: BusinessExceptionType.CONCURRENT_MODIFICATION });
//         }
//         if (err.type === TechnicalExceptionType.UNIQUE_VIOLATION_ADDRESS) {
//           throw BusinessException({ type: BusinessExceptionType.ADDRESS_ALREADY_IN_USE });
//         }

//         throw TechnicalException({
//           type: TechnicalExceptionType.UNKNOWN_ERROR,
//           error: err,
//         });
//       }
//       throw err;
//     }
//   };

//   const updateAdminJoinedStatuses = async (dto: UpdateAdminjoinedStatusesDto): Promise<void> => {
//     try {
//       uow.doWork(async () => {
//         const users = await userCommandRepo.findPendingAdminUsers();

//         if (!users) {
//           throw BusinessException({
//             type: BusinessExceptionType.USER_NOT_FOUND,
//           });
//         }

//         await userCommandRepo.updateJoinedStatuses(
//           users.map((user) => AdminAccountEntity.updateJoinedStatus(user, dto.joinStatus)),
//         );
//       });
//     } catch (err) {
//       if (isTechnicalException(err) && err.type === TechnicalExceptionType.OPTIMISTIC_LOCK_FAILED) {
//         throw BusinessException({
//           type: BusinessExceptionType.CONCURRENT_MODIFICATION,
//         });
//       }

//       throw err;
//     }
//   };

//   const updateAdminJoinedStatus = async (dto: UpdateAdminjoinedStatusDto) => {
//     const user = await userCommandRepo.findAdminUserById(dto.id);

//     if (!user) {
//       throw BusinessException({
//         type: BusinessExceptionType.USER_NOT_FOUND,
//       });
//     }

//     await userCommandRepo.updateJoinedStatus(
//       AdminAccountEntity.updateJoinedStatus(user, dto.joinStatus),
//     );
//   };

//   // 입주민 계정
//   const createResidentAccount = async (dto: SignUpResidentAccountReqDto) => {
//     try {
//       uow.doWork(async () => {
//         const resident = await userCommandRepo.findNotJoinedResidentByEmail(dto.email);

//         if (!resident) {
//           await userCommandRepo.create(await toResidentAccountEntityFromDto(dto, hashManager));
//         } else {
//           // 미가입했던 입주민이면 가입 상태를 Pending으로 승격
//           if (NotJoinedResidentEntity.isNotJoinedResident(dto, resident)) {
//             await userCommandRepo.update(
//               await ResidentAccountEntity.requestJoin(resident, dto, hashManager),
//             );
//           }
//         }
//       });
//     } catch (err) {
//       if (isTechnicalException(err) && err.type === TechnicalExceptionType.OPTIMISTIC_LOCK_FAILED) {
//         throw BusinessException({
//           type: BusinessExceptionType.CONCURRENT_MODIFICATION,
//         });
//       }

//       throw err;
//     }
//   };

//   const updateResidentAccountJoinStatus = async (dto: UpdateResidentAccountJoinedStatusReqDto) => {
//     try {
//       uow.doWork(async () => {
//         const user = await userCommandRepo.findResidentAccountUserById(dto.userId);

//         if (!user) {
//           throw BusinessException({
//             type: BusinessExceptionType.USER_NOT_FOUND,
//           });
//         }

//         await userCommandRepo.updateJoinedStatus(
//           ResidentAccountEntity.updateJoinedStatus(user, dto.joinStatus),
//         );
//       });
//     } catch (err) {
//       if (isTechnicalException(err) && err.type === TechnicalExceptionType.OPTIMISTIC_LOCK_FAILED) {
//         throw BusinessException({
//           type: BusinessExceptionType.CONCURRENT_MODIFICATION,
//         });
//       }

//       throw err;
//     }
//   };

//   const updateResidentAccountJoinStatuses = async (
//     dto: UpdateResidentAccountJoinedStatusesReqDto,
//   ) => {
//     try {
//       uow.doWork(async () => {
//         const users = await userCommandRepo.findPendingResidentUsers();

//         if (!users) {
//           throw BusinessException({
//             type: BusinessExceptionType.USER_NOT_FOUND,
//           });
//         }

//         await userCommandRepo.updateJoinedStatuses(
//           users.map((user) => ResidentAccountEntity.updateJoinedStatus(user, dto.joinStatus)),
//         );
//       });
//     } catch (err) {
//       if (isTechnicalException(err) && err.type === TechnicalExceptionType.OPTIMISTIC_LOCK_FAILED) {
//         throw BusinessException({
//           type: BusinessExceptionType.CONCURRENT_MODIFICATION,
//         });
//       }

//       throw err;
//     }
//   };

//   const deleteResidentAccounts = async (): Promise<void> => {
//     await userCommandRepo.deleteUsers();
//   };

//   // 입주민(가입한 입주민 + 미가입한 입주민)
//   const createResident = async (dto: CreateResidentReqDto): Promise<void> => {
//     await userCommandRepo.create(toResidentEntityFromDto(dto));
//   };

//   const updateResident = async (dto: UpdateResidentReqDto): Promise<void> => {
//     try {
//       uow.doWork(async () => {
//         const user = await userCommandRepo.findResidentById(dto.id);

//         if (!user) {
//           throw BusinessException({
//             type: BusinessExceptionType.USER_NOT_FOUND,
//           });
//         }

//         if (user.joinedStatus === Status.NOT_JOINED) {
//           await userCommandRepo.update(toUpdateNotJoinedEntityDataFromDto(dto, user));
//         } else {
//           await userCommandRepo.update(toUpdateResidentAccountEntityDataFromDto(dto, user));
//         }
//       });
//     } catch (err) {
//       if (isTechnicalException(err) && err.type === TechnicalExceptionType.OPTIMISTIC_LOCK_FAILED) {
//         throw BusinessException({
//           type: BusinessExceptionType.CONCURRENT_MODIFICATION,
//         });
//       }

//       throw err;
//     }
//   };

//   const deleteResident = async (dto: DeleteResidentReqDto): Promise<void> => {
//     await userCommandRepo.deleteUser(dto.id);
//   };

//   // 기타
//   const updateAvatarUrl = async (dto: UpdateAvatarUrlReqDto): Promise<void> => {
//     try {
//       await uow.doWork(async () => {
//         const user = await userCommandRepo.findBaseUserById(dto.userId);

//         if (!user) {
//           throw BusinessException({
//             type: BusinessExceptionType.USER_NOT_FOUND,
//           });
//         }

//         await userCommandRepo.updateAvatar(BaseUserEntity.updateAvatar(user, dto.avatarUrl));
//       });
//     } catch (err) {
//       if (isTechnicalException(err) && err.type === TechnicalExceptionType.OPTIMISTIC_LOCK_FAILED) {
//         throw BusinessException({
//           type: BusinessExceptionType.CONCURRENT_MODIFICATION,
//         });
//       }

//       throw err;
//     }
//   };

//   const updatePassword = async (dto: UpdatePasswordReqDto): Promise<void> => {
//     try {
//       uow.doWork(async () => {
//         const user = await userCommandRepo.findJoinedUserById(dto.userId);

//         if (!user) {
//           throw BusinessException({
//             type: BusinessExceptionType.USER_NOT_FOUND,
//           });
//         }

//         // 입력한 현재 비번과 DB 비번 불일치하는지 비교
//         if (!(await BaseUserEntity.isPasswordMatch(user.password, dto.password, hashManager))) {
//           throw BusinessException({
//             type: BusinessExceptionType.INCORRECT_PASSWORD,
//           });
//         }

//         // 입력한 새 비번과 DB 비번 일치하는지 비교
//         if (await BaseUserEntity.isPasswordMatch(user.password, dto.newpassword, hashManager)) {
//           throw BusinessException({
//             type: BusinessExceptionType.CORRECT_PASSWORD,
//           });
//         }

//         if (user.role === Role.ADMIN || user.role === Role.SUPERADMIN) {
//           await userCommandRepo.updatePassword(
//             await AdminAccountEntity.updatePassword(user, dto.newpassword, hashManager),
//           );
//         }

//         if (user.role === Role.RESIDENT) {
//           await userCommandRepo.updatePassword(
//             await ResidentAccountEntity.updatePassword(user, dto.newpassword, hashManager),
//           );
//         }
//       });
//     } catch (err) {
//       if (isTechnicalException(err) && err.type === TechnicalExceptionType.OPTIMISTIC_LOCK_FAILED) {
//         throw BusinessException({
//           type: BusinessExceptionType.CONCURRENT_MODIFICATION,
//         });
//       }

//       throw err;
//     }
//   };

//   return {
//     createSuperAdmin,
//     createAdmin,
//     updateAdmin,
//     updateAdminJoinedStatuses,
//     updateAdminJoinedStatus,
//     createResidentAccount,
//     updateResidentAccountJoinStatus,
//     updateResidentAccountJoinStatuses,
//     deleteResidentAccounts,
//     createResident,
//     updateResident,
//     deleteResident,
//     updateAvatarUrl,
//     updatePassword,
//   };
// };

// export type UserCommandServiceJung = ReturnType<typeof createUserCommandService>;
