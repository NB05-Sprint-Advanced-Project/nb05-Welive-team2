import { IApartmentCommandRepo } from '../../domain/apartment/interface/i-apartment-command';
import {
  CreateAdminDto,
  CreateSuperAdminDto,
  DeleteAdminDto,
  SignUpResidentAccountReqDto,
  UpdateAdminDto,
  UpdateAdminjoinedStatusDto,
  UpdateAdminjoinedStatusesDto,
  UpdatePasswordReqDto,
  UpdateResidentAccountJoinedStatusesReqDto,
  UpdateResidentAccountJoinedStatusReqDto,
} from '../../domain/user/dto/user-request';
import { IUserCommandRepo } from '../../domain/user/interface/i-user-command-repo';
import { IHashManager } from '../../shared/interface/i-bcrypt-hash-manager';
import { IUnitOfWork } from '../../shared/interface/i-unit-of-work';
import {
  createUserCommandService,
  UserCommandService,
} from '../../domain/user/service/user-command';
import {
  NotJoinedResidentEntity,
  NotJoinedResidentProps,
} from '../../domain/user/entity/not-joined-resident';
import { BusinessExceptionType } from '../../shared/exception/business-exception/exception-info';
import { BaseUserEntity, Role, Status } from '../../domain/user/entity/base-user';
import { TechnicalExceptionType } from '../../shared/exception/technical-exception/exception-info';
import { TechnicalException } from '../../shared/exception/technical-exception/technical-exception';
import {
  ResidentAccountEntity,
  ResidentAccountProps,
} from '../../domain/user/entity/resident-account';
import { AdminAccountEntity, AdminAccountProps } from '../../domain/user/entity/admin-account';
import {
  CreateResidentReqDto,
  DeleteResidentReqDto,
  UpdateResidentReqDto,
} from '../../domain/user/dto/resident-user-response';
import * as userMapper from '../../domain/user/user-mapper';
import { IStateCommandRepo } from '../../domain/state/interface/i-state-command-repo';
import { IRedisExternal } from '../../shared/interface/i-redis';

describe('user service 유닛 테스트', () => {
  let mockUow: IUnitOfWork;
  let mockHashManager: IHashManager;
  let mockUserCommandRepo: IUserCommandRepo;
  let mockApartmentRepo: IApartmentCommandRepo;
  let mockStateCommandRepo: IStateCommandRepo;
  let userCommandService: UserCommandService;
  let mockRedisExternal: IRedisExternal;

  beforeAll(() => {});

  beforeEach(() => {
    mockUow = {
      doWork: jest.fn(),
    };

    mockHashManager = {
      hash: jest.fn(),
      compare: jest.fn(),
    };

    mockRedisExternal = {
      get: jest.fn(),
      getMany: jest.fn(),
      set: jest.fn(),
      setIfNotExist: jest.fn(),
      del: jest.fn(),
      delifmatch: jest.fn(),
      getMembersFromSet: jest.fn(),
      addToSet: jest.fn(),
      removeMemberFromSet: jest.fn(),
      popFromSet: jest.fn(),
      increase: jest.fn(),
      decrease: jest.fn(),
      quit: jest.fn(),
    };

    mockUserCommandRepo = {
      findAdminUserById: jest.fn(),
      findResidentAccountUserById: jest.fn(),
      findBaseUserById: jest.fn(),
      findJoinedUserById: jest.fn(),
      findUserByRole: jest.fn(),

      findPendingAdminUsers: jest.fn(),
      findRejectedAdminUsers: jest.fn(),
      findPendingResidentUsers: jest.fn(),

      findNotJoinedResidentByEmail: jest.fn(),
      findResidentById: jest.fn(),

      create: jest.fn(),
      update: jest.fn(),
      updateAvatar: jest.fn(),
      updateJoinedStatus: jest.fn(),
      updateJoinedStatuses: jest.fn(),
      updatePassword: jest.fn(),

      deleteUser: jest.fn(),
      deleteUsers: jest.fn(),

      createManyBulk: jest.fn(),
    };

    mockApartmentRepo = {
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    mockStateCommandRepo = {
      create: jest.fn(),
      findAllByStatus: jest.fn(),
      bulkUpdate: jest.fn(),
    };

    userCommandService = createUserCommandService(
      mockUow,
      mockHashManager,
      mockUserCommandRepo,
      mockApartmentRepo,
      mockStateCommandRepo,
      mockRedisExternal,
    );
  });

  afterAll(() => {});

  afterEach(() => {
    jest.restoreAllMocks();
  });
  // 관리자 계정
  describe('관리자 계정 생성 테스트(createSuperAdmin())', () => {
    const dto: CreateSuperAdminDto = {
      username: 'admin01',
      password: 'Password123!',
      name: '관리자',
      email: 'admin01@test.com',
      contact: '010-1111-2222',
    };

    beforeEach(() => {
      (mockHashManager.hash as jest.Mock).mockResolvedValue('hashed');
    });

    test('정상적으로 슈퍼 관리자 계정을 생성한다', async () => {
      // given
      (mockUserCommandRepo.create as jest.Mock).mockResolvedValue(undefined);

      // when
      await userCommandService.createSuperAdmin(dto);

      // then
      expect(mockUserCommandRepo.create).toHaveBeenCalled();
    });

    test.each([
      [TechnicalExceptionType.UNIQUE_VIOLATION_EMAIL, BusinessExceptionType.EMAIL_ALREADY_IN_USE],
      [
        TechnicalExceptionType.UNIQUE_VIOLATION_USERNAME,
        BusinessExceptionType.USERNAME_ALREADY_IN_USE,
      ],
      [
        TechnicalExceptionType.UNIQUE_VIOLATION_CONTACT,
        BusinessExceptionType.CONTACT_ALREADY_IN_USE,
      ],
    ])('%s 발생 시 %s 예외를 던진다', async (technicalType, businessType) => {
      // given
      (mockUserCommandRepo.create as jest.Mock).mockRejectedValue(
        TechnicalException({ type: technicalType }),
      );

      // when & then
      await expect(userCommandService.createSuperAdmin(dto)).rejects.toMatchObject({
        type: businessType,
      });
    });
  });

  describe('관리자 계정 생성 테스트(createAdmin())', () => {
    const dto: CreateAdminDto = {
      username: 'admin02',
      password: 'Password123!',
      name: '관리자',
      email: 'admin02@test.com',
      contact: '010-2222-3333',
      adminOf: {
        name: '테스트 아파트',
        address: '서울시 테스트구',
        description: '설명',
        officeNumber: '02-000-0000',
        buildingNumberFrom: 1,
        buildingNumberTo: 10,
        floorCountPerBuilding: 20,
        unitCountPerFloor: 4,
      },
    };

    beforeEach(() => {
      (mockHashManager.hash as jest.Mock).mockResolvedValue('hashed');
      (mockUow.doWork as jest.Mock).mockImplementation(async (work) => {
        await work();
      });
    });

    test('아파트와 관리자 계정을 생성한다', async () => {
      // given
      (mockApartmentRepo.create as jest.Mock).mockResolvedValue({ id: 'apt-1' });
      (mockUserCommandRepo.create as jest.Mock).mockResolvedValue(undefined);

      // when
      await userCommandService.createAdmin(dto);

      // then
      expect(mockApartmentRepo.create).toHaveBeenCalled();
      expect(mockUserCommandRepo.create).toHaveBeenCalled();
    });

    test.each([
      [TechnicalExceptionType.UNIQUE_VIOLATION_EMAIL, BusinessExceptionType.EMAIL_ALREADY_IN_USE],
      [
        TechnicalExceptionType.UNIQUE_VIOLATION_USERNAME,
        BusinessExceptionType.USERNAME_ALREADY_IN_USE,
      ],
      [
        TechnicalExceptionType.UNIQUE_VIOLATION_CONTACT,
        BusinessExceptionType.CONTACT_ALREADY_IN_USE,
      ],
      [
        TechnicalExceptionType.UNIQUE_VIOLATION_ADDRESS,
        BusinessExceptionType.ADDRESS_ALREADY_IN_USE,
      ],
    ])('%s 발생 시 %s 예외를 던진다', async (technicalType, businessType) => {
      // given
      (mockUow.doWork as jest.Mock).mockRejectedValue(TechnicalException({ type: technicalType }));

      // when & then
      await expect(userCommandService.createAdmin(dto)).rejects.toMatchObject({
        type: businessType,
      });
    });
  });

  describe('관리자 계정 수정 테스트(updateAdmin())', () => {
    const dto: UpdateAdminDto = {
      adminId: 'admin-1',
      name: '관리자 수정',
      email: 'admin-update@test.com',
      contact: '010-9999-0000',
      adminOf: {
        name: '수정 아파트',
        address: '서울시 수정구',
        description: '수정 설명',
        officeNumber: '02-111-2222',
      },
    };

    const adminUser: AdminAccountProps = {
      id: 'admin-1',
      username: 'admin01',
      password: 'hashed',
      name: '관리자',
      email: 'admin01@test.com',
      contact: '010-1111-2222',
      role: Role.ADMIN,
      joinedStatus: Status.PENDING,
      version: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      userApartmentLink: [{ apartmentId: 'apt-1' }],
    };

    beforeEach(() => {
      (mockUow.doWork as jest.Mock).mockImplementation(async (work) => {
        await work();
      });
    });

    test('관리자 계정이 없으면 USER_NOT_FOUND 예외를 던진다', async () => {
      // given
      (mockUserCommandRepo.findAdminUserById as jest.Mock).mockResolvedValue(null);

      // when & then
      await expect(userCommandService.updateAdmin(dto)).rejects.toMatchObject({
        type: BusinessExceptionType.USER_NOT_FOUND,
      });
    });

    test('아파트가 없으면 APARTMENT_NOT_FOUND 예외를 던진다', async () => {
      // given
      (mockUserCommandRepo.findAdminUserById as jest.Mock).mockResolvedValue(adminUser);
      (mockApartmentRepo.findById as jest.Mock).mockResolvedValue(null);

      // when & then
      await expect(userCommandService.updateAdmin(dto)).rejects.toMatchObject({
        type: BusinessExceptionType.APARTMENT_NOT_FOUND,
      });
    });

    test('관리자 정보를 수정한다', async () => {
      // given
      (mockUserCommandRepo.findAdminUserById as jest.Mock).mockResolvedValue(adminUser);
      (mockApartmentRepo.findById as jest.Mock).mockResolvedValue({ id: 'apt-1' });
      (mockUserCommandRepo.update as jest.Mock).mockResolvedValue(undefined);

      // when
      await userCommandService.updateAdmin(dto);

      // then
      expect(mockUserCommandRepo.update).toHaveBeenCalled();
      expect(mockApartmentRepo.findById).toHaveBeenCalledWith('apt-1');
    });

    test.each([
      [TechnicalExceptionType.UNIQUE_VIOLATION_EMAIL, BusinessExceptionType.EMAIL_ALREADY_IN_USE],
      [
        TechnicalExceptionType.UNIQUE_VIOLATION_USERNAME,
        BusinessExceptionType.USERNAME_ALREADY_IN_USE,
      ],
      [
        TechnicalExceptionType.UNIQUE_VIOLATION_CONTACT,
        BusinessExceptionType.CONTACT_ALREADY_IN_USE,
      ],
      [
        TechnicalExceptionType.UNIQUE_VIOLATION_ADDRESS,
        BusinessExceptionType.ADDRESS_ALREADY_IN_USE,
      ],
      [
        TechnicalExceptionType.OPTIMISTIC_LOCK_FAILED,
        BusinessExceptionType.CONCURRENT_MODIFICATION,
      ],
    ])('%s 발생 시 %s 예외를 던진다', async (technicalType, businessType) => {
      // given
      (mockUow.doWork as jest.Mock).mockRejectedValue(TechnicalException({ type: technicalType }));

      // when & then
      await expect(userCommandService.updateAdmin(dto)).rejects.toMatchObject({
        type: businessType,
      });
    });

    test('알 수 없는 기술 예외는 UNKNOWN_ERROR로 변환한다', async () => {
      // given
      (mockUow.doWork as jest.Mock).mockRejectedValue(
        TechnicalException({ type: TechnicalExceptionType.DB_ERROR }),
      );

      // when & then
      await expect(userCommandService.updateAdmin(dto)).rejects.toMatchObject({
        type: TechnicalExceptionType.UNKNOWN_ERROR,
      });
    });
  });

  describe('관리자 계정 가입 상태 일괄 변경 테스트(updateAdminJoinedStatuses())', () => {
    const dto: UpdateAdminjoinedStatusesDto = {
      joinStatus: Status.APPROVED,
    };

    const pendingAdmins: AdminAccountProps[] = [
      {
        id: 'admin-1',
        username: 'admin01',
        password: 'hashed',
        name: '관리자',
        email: 'admin01@test.com',
        contact: '010-1111-2222',
        role: Role.ADMIN,
        joinedStatus: Status.PENDING,
        version: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    test('대기 중인 관리자 계정이 없으면 USER_NOT_FOUND 예외를 던진다', async () => {
      // given
      (mockUserCommandRepo.findPendingAdminUsers as jest.Mock).mockResolvedValue(null);

      // when & then
      await expect(userCommandService.updateAdminJoinedStatuses(dto)).rejects.toMatchObject({
        type: BusinessExceptionType.USER_NOT_FOUND,
      });

      expect(mockUserCommandRepo.updateJoinedStatuses).not.toHaveBeenCalled();
    });

    test('대기 중인 관리자 계정이 있으면 가입 상태를 일괄 변경한다', async () => {
      // given
      (mockUserCommandRepo.findPendingAdminUsers as jest.Mock).mockResolvedValue(pendingAdmins);

      // when
      await userCommandService.updateAdminJoinedStatuses(dto);

      // then
      expect(mockUserCommandRepo.findPendingAdminUsers).toHaveBeenCalled();
      expect(mockUserCommandRepo.updateJoinedStatuses).toHaveBeenCalledWith(expect.any(Array));
    });

    test('낙관적 락 실패 시 CONCURRENT_MODIFICATION 예외를 던진다', async () => {
      // given
      (mockUserCommandRepo.findPendingAdminUsers as jest.Mock).mockResolvedValue(pendingAdmins);
      (mockUserCommandRepo.updateJoinedStatuses as jest.Mock).mockRejectedValue(
        TechnicalException({
          type: TechnicalExceptionType.OPTIMISTIC_LOCK_FAILED,
        }),
      );

      // when & then
      await expect(userCommandService.updateAdminJoinedStatuses(dto)).rejects.toMatchObject({
        type: BusinessExceptionType.CONCURRENT_MODIFICATION,
      });
    });
  });

  describe('관리자 계정 가입 상태 변경 테스트(updateAdminJoinedStatus())', () => {
    const dto: UpdateAdminjoinedStatusDto = {
      id: 'admin-1',
      joinStatus: Status.APPROVED,
    };

    test('관리자 계정이 없으면 USER_NOT_FOUND 예외를 던진다', async () => {
      // given
      (mockUserCommandRepo.findAdminUserById as jest.Mock).mockResolvedValue(null);

      // when & then
      await expect(userCommandService.updateAdminJoinedStatus(dto)).rejects.toMatchObject({
        type: BusinessExceptionType.USER_NOT_FOUND,
      });
    });

    test('이미 승인된 관리자면 상태를 변경할 수 없다', async () => {
      // given
      (mockUserCommandRepo.findAdminUserById as jest.Mock).mockResolvedValue({
        joinedStatus: Status.APPROVED,
      });

      // when & then
      await expect(userCommandService.updateAdminJoinedStatus(dto)).rejects.toMatchObject({
        type: BusinessExceptionType.NOT_UPDATE_JOINEDSTATUS,
      });
    });

    test('이미 거절된 관리자면 상태를 변경할 수 없다', async () => {
      // given
      (mockUserCommandRepo.findAdminUserById as jest.Mock).mockResolvedValue({
        joinedStatus: Status.REJECTED,
      });

      // when & then
      await expect(userCommandService.updateAdminJoinedStatus(dto)).rejects.toMatchObject({
        type: BusinessExceptionType.NOT_UPDATE_JOINEDSTATUS,
      });
    });

    test('대기 상태 관리자면 가입 상태를 변경한다', async () => {
      // given
      (mockUserCommandRepo.findAdminUserById as jest.Mock).mockResolvedValue({
        joinedStatus: Status.PENDING,
      });

      // when
      await userCommandService.updateAdminJoinedStatus(dto);

      // then
      expect(mockUserCommandRepo.updateJoinedStatus).toHaveBeenCalled();
    });
  });

  describe('관리자 계정 삭제 테스트(deleteAdmin())', () => {
    const dto: DeleteAdminDto = {
      adminId: 'admin-1',
    };

    test('관리자 계정이 없으면 USER_NOT_FOUND 예외를 던진다', async () => {
      // given
      (mockUserCommandRepo.findAdminUserById as jest.Mock).mockResolvedValue(null);

      // when & then
      await expect(userCommandService.deleteAdmin(dto)).rejects.toMatchObject({
        type: BusinessExceptionType.USER_NOT_FOUND,
      });
    });

    test('관리자 계정을 삭제한다', async () => {
      // given
      (mockUserCommandRepo.findAdminUserById as jest.Mock).mockResolvedValue({
        id: 'admin-1',
      });

      // when
      await userCommandService.deleteAdmin(dto);

      // then
      expect(mockUserCommandRepo.deleteUser).toHaveBeenCalledWith('admin-1');
    });
  });

  describe('거절된 관리자 계정 삭제 테스트(deleteRejectedAdmins())', () => {
    test('거절된 관리자 계정이 없으면 삭제하지 않는다', async () => {
      // given
      (mockUserCommandRepo.findRejectedAdminUsers as jest.Mock).mockResolvedValue(null);

      // when
      await userCommandService.deleteRejectedAdmins();

      // then
      expect(mockUserCommandRepo.deleteUsers).not.toHaveBeenCalled();
    });

    test('거절된 관리자 계정이 있으면 일괄 삭제한다', async () => {
      // given
      (mockUserCommandRepo.findRejectedAdminUsers as jest.Mock).mockResolvedValue([
        { id: 'admin-1' },
      ]);

      // when
      await userCommandService.deleteRejectedAdmins();

      // then
      expect(mockUserCommandRepo.deleteUsers).toHaveBeenCalled();
    });
  });

  // 입주민 계정
  describe('입주민 계정 생성 테스트(createResidentAccount())', () => {
    const dto: SignUpResidentAccountReqDto = {
      username: 'resident01',
      password: 'Password123!',
      name: '홍길동',
      email: 'resident01@test.com',
      contact: '010-1234-5678',
      resident: {
        apartmentId: 'apt_001',
        building: 101,
        unit: 1203,
      },
    };

    // doWork가 낙관적 검증을 위해 재시도 콜백 로직이 있는데 콜백을 실행 안 하면 내부 로직 스킵돼서 전달 받은 함수를 실제로 실행하게 설정
    beforeEach(() => {
      (mockUow.doWork as jest.Mock).mockImplementation(async (work) => {
        await work();
      });
    });

    const NotJoinedResident: NotJoinedResidentProps = {} as NotJoinedResidentProps;

    test('해당 미가입 입주민이 없으면 신규 입주민 계정을 생성한다.', async () => {
      // given
      (mockUserCommandRepo.findNotJoinedResidentByEmail as jest.Mock).mockResolvedValue(null);

      // when
      await userCommandService.createResidentAccount(dto);

      // then
      expect(mockUserCommandRepo.findNotJoinedResidentByEmail).toHaveBeenCalledWith(dto.email);
      expect(mockUserCommandRepo.create).toHaveBeenCalled();
      expect(mockUserCommandRepo.update).not.toHaveBeenCalled();
    });

    test('해당 미가입 입주민이 있고 정보가 일치하면 가입 상태를 pending으로 승격한다.', async () => {
      // given
      (mockUserCommandRepo.findNotJoinedResidentByEmail as jest.Mock).mockResolvedValue(
        NotJoinedResident,
      );

      // 들어온 dto 정보와 NotJoinedResident의 정보가 일치하면
      jest.spyOn(NotJoinedResidentEntity, 'isNotJoinedResident').mockReturnValue(true);

      // when
      await userCommandService.createResidentAccount(dto);

      // then
      expect(NotJoinedResidentEntity.isNotJoinedResident).toHaveBeenCalled();
      expect(mockUserCommandRepo.update).toHaveBeenCalled();
      expect(mockUserCommandRepo.create).not.toHaveBeenCalled();
    });

    test('해당 미가입 입주민이 있지만 정보가 일치하지 않으면 EMAIL_ALREADY_IN_USE 예외를 던진다.', async () => {
      // given
      (mockUserCommandRepo.findNotJoinedResidentByEmail as jest.Mock).mockResolvedValue(
        NotJoinedResident,
      );

      // dto 정보와 미가입 입주민 정보가 일치하지 않음
      jest.spyOn(NotJoinedResidentEntity, 'isNotJoinedResident').mockReturnValue(false);

      // when & then
      await expect(userCommandService.createResidentAccount(dto)).rejects.toMatchObject({
        type: BusinessExceptionType.EMAIL_ALREADY_IN_USE,
      });

      expect(mockUserCommandRepo.create).not.toHaveBeenCalled();
      expect(mockUserCommandRepo.update).not.toHaveBeenCalled();
    });

    test('낙관적 락 실패 시 CONCURRENT_MODIFICATION 예외를 던진다.', async () => {
      // given
      (mockUow.doWork as jest.Mock).mockRejectedValue(
        TechnicalException({
          type: TechnicalExceptionType.OPTIMISTIC_LOCK_FAILED,
        }),
      );

      // when & then
      await expect(userCommandService.createResidentAccount(dto)).rejects.toMatchObject({
        type: BusinessExceptionType.CONCURRENT_MODIFICATION,
      });
    });

    describe('unique 제약 조건 위반 시 예외 변환', () => {
      test.each([
        [TechnicalExceptionType.UNIQUE_VIOLATION_EMAIL, BusinessExceptionType.EMAIL_ALREADY_IN_USE],
        [
          TechnicalExceptionType.UNIQUE_VIOLATION_USERNAME,
          BusinessExceptionType.USERNAME_ALREADY_IN_USE,
        ],
        [
          TechnicalExceptionType.UNIQUE_VIOLATION_CONTACT,
          BusinessExceptionType.CONTACT_ALREADY_IN_USE,
        ],
      ])('%s 발생 시 %s 예외를 던진다', async (technicalType, businessType) => {
        // given
        (mockUow.doWork as jest.Mock).mockRejectedValue(
          TechnicalException({ type: technicalType }),
        );

        // when & then
        await expect(userCommandService.createResidentAccount(dto)).rejects.toMatchObject({
          type: businessType,
        });
      });
    });
  });

  describe('입주민 계정 가입 상태 변경 테스트(updateResidentAccountJoinStatus())', () => {
    const dto: UpdateResidentAccountJoinedStatusReqDto = {
      id: 'user-1',
      joinStatus: Status.APPROVED,
    };

    beforeEach(() => {
      (mockUow.doWork as jest.Mock).mockImplementation(async (work) => {
        await work();
      });
    });

    test('입주민 계정이 없으면 USER_NOT_FOUND 예외를 던진다', async () => {
      // given
      (mockUserCommandRepo.findResidentAccountUserById as jest.Mock).mockResolvedValue(null);

      // when & then
      await expect(userCommandService.updateResidentAccountJoinStatus(dto)).rejects.toMatchObject({
        type: BusinessExceptionType.USER_NOT_FOUND,
      });
    });

    test('이미 승인된 입주민이면 상태를 변경할 수 없다', async () => {
      // given
      (mockUserCommandRepo.findResidentAccountUserById as jest.Mock).mockResolvedValue({
        joinedStatus: Status.APPROVED,
      });

      // when & then
      await expect(userCommandService.updateResidentAccountJoinStatus(dto)).rejects.toMatchObject({
        type: BusinessExceptionType.NOT_UPDATE_JOINEDSTATUS,
      });
    });

    test('이미 거절된 입주민이면 상태를 변경할 수 없다', async () => {
      // given
      (mockUserCommandRepo.findResidentAccountUserById as jest.Mock).mockResolvedValue({
        joinedStatus: Status.REJECTED,
      });

      // when & then
      await expect(userCommandService.updateResidentAccountJoinStatus(dto)).rejects.toMatchObject({
        type: BusinessExceptionType.NOT_UPDATE_JOINEDSTATUS,
      });
    });

    test('대기 상태 입주민이면 가입 상태를 변경한다', async () => {
      // given
      const resident = {
        joinedStatus: Status.PENDING,
      };

      (mockUserCommandRepo.findResidentAccountUserById as jest.Mock).mockResolvedValue(resident);

      // when
      await userCommandService.updateResidentAccountJoinStatus(dto);

      // then
      expect(mockUserCommandRepo.updateJoinedStatus).toHaveBeenCalled();
    });

    test('낙관적 락 실패 시 CONCURRENT_MODIFICATION 예외를 던진다', async () => {
      // given
      (mockUserCommandRepo.findResidentAccountUserById as jest.Mock).mockResolvedValue({
        joinedStatus: Status.PENDING,
      });

      (mockUow.doWork as jest.Mock).mockImplementation(async (work) => {
        throw TechnicalException({
          type: TechnicalExceptionType.OPTIMISTIC_LOCK_FAILED,
        });
      });

      // when & then
      await expect(userCommandService.updateResidentAccountJoinStatus(dto)).rejects.toMatchObject({
        type: BusinessExceptionType.CONCURRENT_MODIFICATION,
      });
    });
  });

  describe('입주민 계정 가입 상태 일괄 변경 테스트(updateResidentAccountJoinStatuses())', () => {
    const dto: UpdateResidentAccountJoinedStatusesReqDto = {
      joinStatus: Status.APPROVED,
    };

    const PendingResidents = [{} as ResidentAccountProps, {} as ResidentAccountProps];

    beforeEach(() => {
      (mockUow.doWork as jest.Mock).mockImplementation(async (work) => {
        await work();
      });
    });

    test('대기 중인 입주민이 없으면 USER_NOT_FOUND 예외를 던진다.', async () => {
      // given
      (mockUserCommandRepo.findPendingResidentUsers as jest.Mock).mockResolvedValue(null);

      // when & then
      await expect(userCommandService.updateResidentAccountJoinStatuses(dto)).rejects.toMatchObject(
        {
          type: BusinessExceptionType.USER_NOT_FOUND,
        },
      );

      expect(mockUserCommandRepo.updateJoinedStatuses).not.toHaveBeenCalled();
    });

    test('대기 중인 입주민이 있으면 가입 상태를 일괄 변경한다.', async () => {
      // given
      (mockUserCommandRepo.findPendingResidentUsers as jest.Mock).mockResolvedValue(
        PendingResidents,
      );

      // when
      await userCommandService.updateResidentAccountJoinStatuses(dto);

      // then
      expect(mockUserCommandRepo.findPendingResidentUsers).toHaveBeenCalled();
      expect(mockUserCommandRepo.updateJoinedStatuses).toHaveBeenCalledWith(expect.any(Array));
    });

    test('낙관적 락 실패 시 CONCURRENT_MODIFICATION 예외를 던진다.', async () => {
      // given
      (mockUow.doWork as jest.Mock).mockImplementation(async () => {
        throw TechnicalException({
          type: TechnicalExceptionType.OPTIMISTIC_LOCK_FAILED,
        });
      });

      // when & then
      await expect(userCommandService.updateResidentAccountJoinStatuses(dto)).rejects.toMatchObject(
        {
          type: BusinessExceptionType.CONCURRENT_MODIFICATION,
        },
      );
    });
  });

  describe('입주민 계정 일괄 삭제 테스트(deleteResidentAccounts())', () => {
    test('입주민 계정 삭제를 위해 deleteUsers를 호출한다.', async () => {
      // given
      (mockUserCommandRepo.deleteUsers as jest.Mock).mockResolvedValue(undefined);

      // when
      await userCommandService.deleteResidentAccounts();

      // then
      expect(mockUserCommandRepo.deleteUsers).toHaveBeenCalled();
    });
  });

  // 입주민 관리(입주민 계정 + 미가입 입주민)
  describe('입주민 생성(createResident)', () => {
    const dto: CreateResidentReqDto = {
      name: '세대주-아들',
      email: 'test@test.com',
      contact: '010-1234-5678',
    } as CreateResidentReqDto;

    test('정상적으로 입주민을 생성한다', async () => {
      // given
      (mockUserCommandRepo.create as jest.Mock).mockResolvedValue(undefined);

      // when
      await userCommandService.createResident(dto);

      // then
      expect(mockUserCommandRepo.create).toHaveBeenCalled();
    });

    test('이메일이 중복되면 EMAIL_ALREADY_IN_USE 예외를 던진다', async () => {
      // given
      (mockUserCommandRepo.create as jest.Mock).mockRejectedValue(
        TechnicalException({
          type: TechnicalExceptionType.UNIQUE_VIOLATION_EMAIL,
        }),
      );

      // when & then
      await expect(userCommandService.createResident(dto)).rejects.toMatchObject({
        type: BusinessExceptionType.EMAIL_ALREADY_IN_USE,
      });
    });

    test('연락처가 중복되면 CONTACT_ALREADY_IN_USE 예외를 던진다', async () => {
      // given
      (mockUserCommandRepo.create as jest.Mock).mockRejectedValue(
        TechnicalException({
          type: TechnicalExceptionType.UNIQUE_VIOLATION_CONTACT,
        }),
      );

      // when & then
      await expect(userCommandService.createResident(dto)).rejects.toMatchObject({
        type: BusinessExceptionType.CONTACT_ALREADY_IN_USE,
      });
    });
  });

  describe('입주민 수정(updateResident)', () => {
    const dto: UpdateResidentReqDto = {
      id: 'user-1',
      name: '홍길동',
      email: 'new@test.com',
      contact: '010-9999-8888',
    } as UpdateResidentReqDto;

    beforeEach(() => {
      (mockUow.doWork as jest.Mock).mockImplementation(async (work) => {
        await work();
      });
    });

    test('유저가 없으면 USER_NOT_FOUND 예외를 던진다', async () => {
      // given
      (mockUserCommandRepo.findResidentById as jest.Mock).mockResolvedValue(null);

      // when & then
      await expect(userCommandService.updateResident(dto)).rejects.toMatchObject({
        type: BusinessExceptionType.USER_NOT_FOUND,
      });
    });

    test('미가입 입주민이면 NOT_JOINED mapper를 사용해 수정한다', async () => {
      // given
      const notJoinedUser: NotJoinedResidentProps = {
        id: 'user-1',
        joinedStatus: Status.NOT_JOINED,
      } as NotJoinedResidentProps;

      (mockUserCommandRepo.findResidentById as jest.Mock).mockResolvedValue(notJoinedUser);

      const notJoinedMapperSpy = jest
        .spyOn(userMapper, 'toUpdateNotJoinedEntityDataFromDto')
        .mockReturnValue({} as NotJoinedResidentProps);

      const joinedMapperSpy = jest
        .spyOn(userMapper, 'toUpdateResidentAccountEntityDataFromDto')
        .mockReturnValue({} as ResidentAccountProps);

      // when
      await userCommandService.updateResident(dto);

      // then
      expect(notJoinedMapperSpy).toHaveBeenCalledWith(dto, notJoinedUser);
      expect(joinedMapperSpy).not.toHaveBeenCalled();
      expect(mockUserCommandRepo.update).toHaveBeenCalledTimes(1);
    });

    test('가입된 입주민이면 RESIDENT 데이터로 수정한다', async () => {
      // given
      const joinedUser: ResidentAccountProps = {} as ResidentAccountProps;

      (mockUserCommandRepo.findResidentById as jest.Mock).mockResolvedValue(joinedUser);

      const notJoinedMapperSpy = jest
        .spyOn(userMapper, 'toUpdateNotJoinedEntityDataFromDto')
        .mockReturnValue({} as NotJoinedResidentProps);

      const joinedMapperSpy = jest
        .spyOn(userMapper, 'toUpdateResidentAccountEntityDataFromDto')
        .mockReturnValue({} as ResidentAccountProps);

      // when
      await userCommandService.updateResident(dto);

      // then
      expect(notJoinedMapperSpy).not.toHaveBeenCalled();
      expect(joinedMapperSpy).toHaveBeenCalledWith(dto, joinedUser);
      expect(mockUserCommandRepo.update).toHaveBeenCalledTimes(1);
    });

    test('낙관적 락 실패 시 CONCURRENT_MODIFICATION 예외를 던진다', async () => {
      // given
      (mockUow.doWork as jest.Mock).mockRejectedValue(
        TechnicalException({
          type: TechnicalExceptionType.OPTIMISTIC_LOCK_FAILED,
        }),
      );

      // when & then
      await expect(userCommandService.updateResident(dto)).rejects.toMatchObject({
        type: BusinessExceptionType.CONCURRENT_MODIFICATION,
      });
    });

    test.each([
      [TechnicalExceptionType.UNIQUE_VIOLATION_EMAIL, BusinessExceptionType.EMAIL_ALREADY_IN_USE],
      [
        TechnicalExceptionType.UNIQUE_VIOLATION_CONTACT,
        BusinessExceptionType.CONTACT_ALREADY_IN_USE,
      ],
    ])('%s 발생 시 %s 예외로 변환한다', async (technicalType, businessType) => {
      // given
      (mockUow.doWork as jest.Mock).mockRejectedValue(TechnicalException({ type: technicalType }));

      // when & then
      await expect(userCommandService.updateResident(dto)).rejects.toMatchObject({
        type: businessType,
      });
    });
  });

  describe('입주민 삭제(deleteResident)', () => {
    const dto: DeleteResidentReqDto = {
      id: 'user-1',
    };

    test('deleteUser를 dto.id로 호출한다', async () => {
      // given
      (mockUserCommandRepo.deleteUser as jest.Mock).mockResolvedValue(undefined);

      // when
      await userCommandService.deleteResident(dto);

      // then
      expect(mockUserCommandRepo.deleteUser).toHaveBeenCalledTimes(1);
      expect(mockUserCommandRepo.deleteUser).toHaveBeenCalledWith(dto.id);
    });
  });

  // 기타
  describe('계정 프로필 변경', () => {});

  describe('계정 비밀번호 변경', () => {
    const dto: UpdatePasswordReqDto = {
      userId: 'user-1',
      password: 'oldPassword!',
      newPassword: 'newPassword!',
    };

    const adminUser: AdminAccountProps = {
      id: 'user-1',
      password: 'hashed-old-password',
      role: Role.ADMIN || Role.SUPER_ADMIN,
    } as AdminAccountProps;

    const residentUser: ResidentAccountProps = {
      id: 'user-2',
      password: 'hashed-old-password',
      role: Role.USER,
    } as ResidentAccountProps;

    beforeEach(() => {
      jest.clearAllMocks();

      (mockUow.doWork as jest.Mock).mockImplementation(async (work) => {
        await work();
      });
    });

    test('유저가 없으면 USER_NOT_FOUND 예외를 던진다', async () => {
      // given
      (mockUserCommandRepo.findJoinedUserById as jest.Mock).mockResolvedValue(null);

      // when & then
      await expect(userCommandService.updatePassword(dto)).rejects.toMatchObject({
        type: BusinessExceptionType.USER_NOT_FOUND,
      });
    });

    test('현재 비밀번호가 틀리면 INCORRECT_PASSWORD 예외를 던진다', async () => {
      // given
      (mockUserCommandRepo.findJoinedUserById as jest.Mock).mockResolvedValue(residentUser);

      jest.spyOn(BaseUserEntity, 'isPasswordMatch').mockResolvedValueOnce(false); // 현재 비번 불일치

      // when & then
      await expect(userCommandService.updatePassword(dto)).rejects.toMatchObject({
        type: BusinessExceptionType.INCORRECT_PASSWORD,
      });
    });

    test('새 비밀번호가 기존 비밀번호와 같으면 CORRECT_PASSWORD 예외를 던진다', async () => {
      // given
      (mockUserCommandRepo.findJoinedUserById as jest.Mock).mockResolvedValue(residentUser);

      jest
        .spyOn(BaseUserEntity, 'isPasswordMatch')
        .mockResolvedValueOnce(true) // 현재 비번 일치
        .mockResolvedValueOnce(true); // 새 비번도 일치

      // when & then
      await expect(userCommandService.updatePassword(dto)).rejects.toMatchObject({
        type: BusinessExceptionType.CORRECT_PASSWORD,
      });
    });

    test('RESIDENT 유저면 비밀번호를 변경한다', async () => {
      // given
      (mockUserCommandRepo.findJoinedUserById as jest.Mock).mockResolvedValue(residentUser);

      jest
        .spyOn(BaseUserEntity, 'isPasswordMatch')
        .mockResolvedValueOnce(true) // 현재 비번 일치
        .mockResolvedValueOnce(false); // 새 비번은 다름

      const updateSpy = jest
        .spyOn(ResidentAccountEntity, 'updatePassword')
        .mockResolvedValue({ ...residentUser, password: 'hashed-new' });

      // when
      await userCommandService.updatePassword(dto);

      // then
      expect(updateSpy).toHaveBeenCalled();
      expect(mockUserCommandRepo.updatePassword).toHaveBeenCalled();
    });

    test('SUPERADMIN/ADMIN 유저면 비밀번호를 변경한다', async () => {
      // given
      (mockUserCommandRepo.findJoinedUserById as jest.Mock).mockResolvedValue(adminUser);

      jest
        .spyOn(BaseUserEntity, 'isPasswordMatch')
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(false);

      const updateSpy = jest
        .spyOn(AdminAccountEntity, 'updatePassword')
        .mockResolvedValue({ ...adminUser, password: 'hashed-new' });

      // when
      await userCommandService.updatePassword(dto);

      // then
      expect(updateSpy).toHaveBeenCalled();
      expect(mockUserCommandRepo.updatePassword).toHaveBeenCalled();
    });

    test('낙관적 락 실패 시 CONCURRENT_MODIFICATION 예외를 던진다', async () => {
      // given
      (mockUow.doWork as jest.Mock).mockRejectedValue(
        TechnicalException({
          type: TechnicalExceptionType.OPTIMISTIC_LOCK_FAILED,
        }),
      );

      // when & then
      await expect(userCommandService.updatePassword(dto)).rejects.toMatchObject({
        type: BusinessExceptionType.CONCURRENT_MODIFICATION,
      });
    });
  });
});
