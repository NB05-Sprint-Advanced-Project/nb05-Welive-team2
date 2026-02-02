/* eslint-disable @typescript-eslint/no-explicit-any */
import { PrismaClient, Apartment, User } from '@prisma/client';
import { randomUUID } from 'crypto';
import { Application } from 'express';
import request from 'supertest';
import { CreateResidentReqDto } from '../../domain/user/dto/resident-user-response';
import {
  SignUpResidentAccountReqDto,
  UpdatePasswordReqDto,
} from '../../domain/user/dto/user-request';
import { userInclude } from '../../domain/user/user-mapper';
import { createInjector } from '../../injector';
import { BusinessExceptionType } from '../../shared/exception/business-exception/exception-info';
import { IHashManager } from '../../shared/interface/i-bcrypt-hash-manager';
import http from 'http';
import { Role, Status } from '../../domain/user/entity/base-user';

describe('user service e2e 테스트', () => {
  let app: Application;
  let prisma: PrismaClient;
  let baseApartment: Apartment;
  let baseAdmin: User;
  let baseSuperAdmin: User;
  let baseResident: User;
  let baseNotJoinedResident: User;
  let server: http.Server;
  let hashManager: IHashManager;
  let adminCookies: string;
  let superAdminCookies: string;
  let redis: any;

  beforeAll(async () => {
    prisma = new PrismaClient();
    const injector = createInjector(prisma);
    app = injector.httpServer.app;
    server = injector.httpServer.defaultHttpServer;
    hashManager = injector.hashManager;
    redis = injector.redisExternal;
    const now = new Date();

    /* ---------- DB 초기화 ---------- */
    await prisma.apartment.deleteMany();
    await prisma.user.deleteMany();

    /* ---------- 아파트 생성 ---------- */
    baseApartment = await prisma.apartment.create({
      data: {
        id: randomUUID(),
        name: '월드아파트',
        address: '서울특별시 강남구 테헤란로 12322',
        description: '강남 중심 대단지 아파트',
        officeNumber: '02-555-1234',
        buildingNumberFrom: 101,
        buildingNumberTo: 110,
        floorCountPerBuilding: 15,
        unitCountPerFloor: 4,
        createdAt: now,
        updatedAt: now,
      },
    });

    /* ---------- 관리자 생성 ---------- */
    baseAdmin = await prisma.user.create({
      data: {
        id: randomUUID(),
        username: 'admin1',
        name: '박관리',
        email: 'park.admin1@example.com',
        contact: '01012321678',
        password: await hashManager.hash('123123qwe!'),
        role: 'ADMIN',
        joinedStatus: 'APPROVED',
        version: 1,
        createdAt: now,
        updatedAt: now,

        UserApartmentLink: {
          create: {
            apartmentId: baseApartment.id,
          },
        },
      },
    });

    /* ---------- 슈퍼 관리자 생성 ---------- */
    baseSuperAdmin = await prisma.user.create({
      data: {
        id: randomUUID(),
        username: 'superadmin1',
        name: '슈퍼관리',
        email: 'superadmin1@example.com',
        contact: '01012345679',
        password: await hashManager.hash('123123qwe!'),
        role: 'SUPER_ADMIN',
        joinedStatus: Status.APPROVED,
        version: 1,
        createdAt: now,
        updatedAt: now,
      },
    });

    /* ---------- 입주민(가입자) 생성 ---------- */
    baseResident = await prisma.user.create({
      data: {
        id: randomUUID(),
        username: 'resident6',
        name: '정입주',
        email: 'resident6@example.com',
        contact: '01048164363',
        password: await hashManager.hash('123123qwe!'),
        role: Role.USER,
        joinedStatus: Status.APPROVED,
        version: 1,
        createdAt: now,
        updatedAt: now,

        UserApartmentLink: {
          create: {
            apartmentId: baseApartment.id,
          },
        },

        Address: {
          create: {
            building: 103,
            unit: 701,
            isHouseholder: true,
          },
        },
      },
    });

    /* ---------- 입주민(미가입자) 생성 ---------- */
    baseNotJoinedResident = await prisma.user.create({
      data: {
        id: randomUUID(),
        name: '최입주',
        email: 'resident3@example.com',
        contact: '01048164311',
        role: Role.USER,
        joinedStatus: Status.NOT_JOINED,
        version: 1,
        createdAt: now,
        updatedAt: now,

        UserApartmentLink: {
          create: {
            apartmentId: baseApartment.id,
          },
        },

        Address: {
          create: {
            building: 102,
            unit: 1203,
            isHouseholder: true,
          },
        },
      },
    });

    // 토큰 가져오기
    const res = await request(app).post('/api/v2/auth/login').send({
      username: baseAdmin.username,
      password: '123123qwe!', // 관리자 초기 비밀번호
    });

    adminCookies = res.headers['set-cookie'];

    const superAdminRes = await request(app).post('/api/v2/auth/login').send({
      username: baseSuperAdmin.username,
      password: '123123qwe!',
    });

    superAdminCookies = superAdminRes.headers['set-cookie'];
  });

  afterAll(async () => {
    await prisma.apartment.deleteMany();
    await prisma.user.deleteMany();
    await new Promise((resolve) => server.close(resolve));
    await prisma.$disconnect();
    await redis.quit();
  });

  // 관리자 계정
  describe('관리자 계정 생성 (createSuperAdmin)', () => {
    test('슈퍼 관리자 생성 성공', async () => {
      const dto = {
        username: 'superadmin2',
        name: '슈퍼관리2',
        email: 'superadmin2@test.com',
        contact: '01099990001',
        password: '123123qwe!',
      };

      await request(app).post('/api/v2/users/super-admins').send(dto).expect(204);

      const user = await prisma.user.findUnique({
        where: { email: dto.email },
      });

      expect(user).not.toBeNull();
      expect(user!.role).toBe('SUPER_ADMIN');
      expect(user!.joinedStatus).toBe(Status.APPROVED);
    });

    test('슈퍼 관리자 100명 생성 성공', async () => {
      const dtos = Array.from({ length: 100 }, (_, index) => {
        const i = index + 1;
        return {
          username: `superadmin-bulk-${i}`,
          name: `슈퍼관리${i}`,
          email: `superadmin-bulk-${i}@test.com`,
          contact: `0108888${String(i).padStart(4, '0')}`,
          password: '123123qwe!',
        };
      });

      for (const dto of dtos) {
        await request(app).post('/api/v2/users/super-admins').send(dto).expect(204);
      }

      const users = await prisma.user.findMany({
        where: { email: { in: dtos.map((d) => d.email) } },
      });

      expect(users.length).toBe(dtos.length);
      expect(users.every((u) => u.role === 'SUPER_ADMIN')).toBe(true);

      await prisma.user.deleteMany({
        where: { email: { in: dtos.map((d) => d.email) } },
      });
    }, 30_000);

    test('중복 이메일이면 409 반환', async () => {
      const dto = {
        username: 'superadmin3',
        name: '슈퍼관리3',
        email: baseSuperAdmin.email,
        contact: '01099990002',
        password: '123123qwe!',
      };

      const res = await request(app).post('/api/v2/users/super-admins').send(dto).expect(409);

      expect(res.body).toHaveProperty('type', BusinessExceptionType.EMAIL_ALREADY_IN_USE);
    });
  });

  describe('관리자 계정 생성 (createAdmin)', () => {
    test('관리자 계정 생성 성공', async () => {
      const dto = {
        username: 'admin100',
        name: '관리자100',
        email: 'admin100@test.com',
        contact: '01099990003',
        password: '123123qwe!',
        adminOf: {
          name: '신규아파트',
          address: '서울특별시 테스트구 100',
          description: '테스트 아파트',
          officeNumber: '02-111-0000',
          buildingNumberFrom: 1,
          buildingNumberTo: 3,
          floorCountPerBuilding: 10,
          unitCountPerFloor: 4,
        },
      };

      await request(app).post('/api/v2/users/admins').send(dto).expect(204);

      const user = await prisma.user.findUnique({
        where: { email: dto.email },
        include: { UserApartmentLink: true },
      });

      const apartment = await prisma.apartment.findFirst({
        where: { address: dto.adminOf.address },
      });

      expect(user).not.toBeNull();
      expect(user!.role).toBe('ADMIN');
      expect(user!.joinedStatus).toBe(Status.PENDING);
      expect(user!.UserApartmentLink.length).toBe(1);
      expect(apartment).not.toBeNull();
    });

    test('중복 이메일이면 409 반환', async () => {
      const dto = {
        username: 'admin101',
        name: '관리자101',
        email: baseAdmin.email,
        contact: '01099990004',
        password: '123123qwe!',
        adminOf: {
          name: '중복아파트',
          address: '서울특별시 테스트구 101',
          description: '테스트 아파트',
          officeNumber: '02-111-0001',
          buildingNumberFrom: 1,
          buildingNumberTo: 3,
          floorCountPerBuilding: 10,
          unitCountPerFloor: 4,
        },
      };

      const res = await request(app).post('/api/v2/users/admins').send(dto).expect(409);

      expect(res.body).toHaveProperty('type', BusinessExceptionType.EMAIL_ALREADY_IN_USE);
    });
  });

  describe('관리자 계정 목록 조회 (getAdministrators)', () => {
    test('관리자 계정 목록 조회 성공', async () => {
      const res = await request(app)
        .get('/api/v2/users/admins')
        .set('Cookie', superAdminCookies)
        .query({ page: 1, limit: 10 })
        .expect(200);

      const names = res.body.data.map((r: any) => r.name);

      expect(names).toContain(baseAdmin.name);
    });
  });

  describe('관리자 계정 수정 (updateAdmin)', () => {
    let targetAdmin: User;

    beforeEach(async () => {
      targetAdmin = await prisma.user.create({
        data: {
          id: randomUUID(),
          username: 'admin-update',
          name: '수정대상',
          email: 'admin-update@test.com',
          contact: '01088887777',
          password: await hashManager.hash('123123qwe!'),
          role: 'ADMIN',
          joinedStatus: Status.PENDING,
          version: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
          UserApartmentLink: {
            create: { apartmentId: baseApartment.id },
          },
        },
      });
    });

    afterEach(async () => {
      await prisma.user.deleteMany({
        where: { id: targetAdmin.id },
      });
    });

    test('관리자 계정이 없으면 USER_NOT_FOUND 반환', async () => {
      const res = await request(app)
        .patch(`/api/v2/users/admins/${randomUUID()}`)
        .set('Cookie', superAdminCookies)
        .send({
          name: '수정',
          email: 'admin-update2@test.com',
          contact: '01088887776',
          adminOf: {
            name: '수정아파트',
            address: '서울특별시 수정구 1',
            description: '수정 설명',
            officeNumber: '02-222-0000',
          },
        })
        .expect(404);

      expect(res.body).toHaveProperty('type', BusinessExceptionType.USER_NOT_FOUND);
    });

    test('관리자 정보 수정 성공', async () => {
      await request(app)
        .patch(`/api/v2/users/admins/${targetAdmin.id}`)
        .set('Cookie', superAdminCookies)
        .send({
          name: '수정이름',
          email: 'admin-update3@test.com',
          contact: '01088887775',
          adminOf: {
            name: '수정아파트',
            address: '서울특별시 수정구 2',
            description: '수정 설명',
            officeNumber: '02-222-0001',
          },
        })
        .expect(204);

      const updated = await prisma.user.findUnique({
        where: { id: targetAdmin.id },
      });

      expect(updated).not.toBeNull();
      expect(updated!.name).toBe('수정이름');
      expect(updated!.email).toBe('admin-update3@test.com');
      expect(updated!.contact).toBe('01088887775');
    });
  });

  describe('관리자 가입 상태 변경 (updateAdminJoinStatus)', () => {
    let pendingAdmin: User;
    let approvedAdmin: User;

    beforeEach(async () => {
      pendingAdmin = await prisma.user.create({
        data: {
          id: randomUUID(),
          username: 'pending-admin',
          name: '팬딩관리자',
          email: 'pending-admin@test.com',
          contact: '01077776666',
          password: await hashManager.hash('123123qwe!'),
          role: 'ADMIN',
          joinedStatus: Status.PENDING,
          version: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
          UserApartmentLink: { create: { apartmentId: baseApartment.id } },
        },
      });

      approvedAdmin = await prisma.user.create({
        data: {
          id: randomUUID(),
          username: 'approved-admin',
          name: '승인관리자',
          email: 'approved-admin@test.com',
          contact: '01077775555',
          password: await hashManager.hash('123123qwe!'),
          role: 'ADMIN',
          joinedStatus: Status.APPROVED,
          version: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
          UserApartmentLink: { create: { apartmentId: baseApartment.id } },
        },
      });
    });

    afterEach(async () => {
      await prisma.user.deleteMany({
        where: { id: { in: [pendingAdmin.id, approvedAdmin.id] } },
      });
    });

    test('팬딩 상태 -> 승인 상태로 변경 성공', async () => {
      await request(app)
        .patch(`/api/v2/users/admins/${pendingAdmin.id}/join-status`)
        .set('Cookie', superAdminCookies)
        .send({ joinStatus: Status.APPROVED })
        .expect(204);

      const updated = await prisma.user.findUnique({
        where: { id: pendingAdmin.id },
      });

      expect(updated).not.toBeNull();
      expect(updated!.joinedStatus).toBe(Status.APPROVED);
    });

    test('이미 승인된 관리자는 상태 변경 불가', async () => {
      const res = await request(app)
        .patch(`/api/v2/users/admins/${approvedAdmin.id}/join-status`)
        .set('Cookie', superAdminCookies)
        .send({ joinStatus: Status.REJECTED })
        .expect(409);

      expect(res.body).toHaveProperty('type', BusinessExceptionType.NOT_UPDATE_JOINEDSTATUS);
    });
  });

  describe('관리자 가입 상태 일괄 변경 (updateAdminsJoinStatuses)', () => {
    let pendingAdmin1: User;
    let pendingAdmin2: User;

    beforeEach(async () => {
      pendingAdmin1 = await prisma.user.create({
        data: {
          id: randomUUID(),
          username: 'pending-admin-1',
          name: '팬딩관리자1',
          email: 'pending-admin-1@test.com',
          contact: '01066665555',
          password: await hashManager.hash('123123qwe!'),
          role: 'ADMIN',
          joinedStatus: Status.PENDING,
          version: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
          UserApartmentLink: { create: { apartmentId: baseApartment.id } },
        },
      });

      pendingAdmin2 = await prisma.user.create({
        data: {
          id: randomUUID(),
          username: 'pending-admin-2',
          name: '팬딩관리자2',
          email: 'pending-admin-2@test.com',
          contact: '01066664444',
          password: await hashManager.hash('123123qwe!'),
          role: 'ADMIN',
          joinedStatus: Status.PENDING,
          version: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
          UserApartmentLink: { create: { apartmentId: baseApartment.id } },
        },
      });
    });

    afterEach(async () => {
      await prisma.user.deleteMany({
        where: { id: { in: [pendingAdmin1.id, pendingAdmin2.id] } },
      });
    });

    test('모든 PENDING 관리자 상태를 APPROVED로 변경', async () => {
      await request(app)
        .patch('/api/v2/users/admins/join-status')
        .set('Cookie', superAdminCookies)
        .send({ joinStatus: Status.APPROVED })
        .expect(204);

      const updatedUsers = await prisma.user.findMany({
        where: { id: { in: [pendingAdmin1.id, pendingAdmin2.id] } },
      });

      expect(updatedUsers.find((u) => u.id === pendingAdmin1.id)!.joinedStatus).toBe(
        Status.APPROVED,
      );
      expect(updatedUsers.find((u) => u.id === pendingAdmin2.id)!.joinedStatus).toBe(
        Status.APPROVED,
      );
    });

    test('PENDING 관리자가 없으면 USER_NOT_FOUND 반환', async () => {
      await prisma.user.updateMany({
        where: { joinedStatus: Status.PENDING, role: 'ADMIN' },
        data: { joinedStatus: Status.APPROVED },
      });

      const res = await request(app)
        .patch('/api/v2/users/admins/join-status')
        .set('Cookie', superAdminCookies)
        .send({ joinStatus: Status.APPROVED })
        .expect(404);

      expect(res.body).toHaveProperty('type', BusinessExceptionType.USER_NOT_FOUND);
    });
  });

  describe('관리자 계정 삭제 (deleteAdmin)', () => {
    let targetAdmin: User;

    beforeEach(async () => {
      targetAdmin = await prisma.user.create({
        data: {
          id: randomUUID(),
          username: 'delete-admin',
          name: '삭제관리자',
          email: 'delete-admin@test.com',
          contact: '01055554444',
          password: await hashManager.hash('123123qwe!'),
          role: 'ADMIN',
          joinedStatus: Status.PENDING,
          version: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
          UserApartmentLink: { create: { apartmentId: baseApartment.id } },
        },
      });
    });

    test('관리자 계정 삭제 성공', async () => {
      await request(app)
        .delete(`/api/v2/users/admins/${targetAdmin.id}`)
        .set('Cookie', superAdminCookies)
        .expect(204);

      const deleted = await prisma.user.findUnique({
        where: { id: targetAdmin.id },
      });

      expect(deleted).toBeNull();
    });
  });

  describe('거절된 관리자 계정 삭제 (deleteRejectedAdmins)', () => {
    let rejectedAdmin1: User;
    let rejectedAdmin2: User;

    beforeEach(async () => {
      rejectedAdmin1 = await prisma.user.create({
        data: {
          id: randomUUID(),
          username: 'rejected-admin-1',
          name: '거절관리자1',
          email: 'rejected-admin-1@test.com',
          contact: '01044443333',
          password: await hashManager.hash('123123qwe!'),
          role: 'ADMIN',
          joinedStatus: Status.REJECTED,
          version: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
          UserApartmentLink: { create: { apartmentId: baseApartment.id } },
        },
      });

      rejectedAdmin2 = await prisma.user.create({
        data: {
          id: randomUUID(),
          username: 'rejected-admin-2',
          name: '거절관리자2',
          email: 'rejected-admin-2@test.com',
          contact: '01044442222',
          password: await hashManager.hash('123123qwe!'),
          role: 'ADMIN',
          joinedStatus: Status.REJECTED,
          version: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
          UserApartmentLink: { create: { apartmentId: baseApartment.id } },
        },
      });
    });

    test('거절된 관리자 계정 일괄 삭제 성공', async () => {
      await request(app)
        .delete('/api/v2/users/admins/rejected')
        .set('Cookie', superAdminCookies)
        .expect(204);

      const users = await prisma.user.findMany({
        where: { id: { in: [rejectedAdmin1.id, rejectedAdmin2.id] } },
      });

      expect(users.length).toBe(0);
    });
  });

  // 입주민 계정
  describe('입주민 회원가입 (createResidentAccount)', () => {
    test('회원가입 성공', async () => {
      await request(app)
        .post('/api/v2/users/residents')
        .send({
          username: 'resident100',
          name: '김입주',
          email: 'resident100@test.com',
          contact: '01099998888',
          password: '123123qwe!',
          resident: {
            apartmentId: baseApartment.id,
            building: 101,
            unit: 1201,
          },
        } as SignUpResidentAccountReqDto)
        .expect(204);

      /* ---------- DB 검증 ---------- */
      const user = await prisma.user.findUnique({
        where: { email: 'resident100@test.com' },
        include: userInclude,
      });

      expect(user).not.toBeNull();
      expect(user!.role).toBe(Role.USER);
      expect(user!.joinedStatus).toBe('PENDING');
      expect(user!.username).toBe('resident100');
      expect(user!.Address).not.toBeNull();
      expect(user!.UserApartmentLink.some((link) => link.apartmentId === baseApartment.id)).toBe(
        true,
      );
    });

    test('중복 아이디이면 409 반환', async () => {
      const res = await request(app)
        .post('/api/v2/users/residents')
        .send({
          username: 'resident100', // 아이디만 중복
          name: '김입주',
          email: 'resident1011@test.com',
          contact: '01099998881',
          password: '123123qwe!',
          resident: {
            // <- DTO 구조 그대로
            apartmentId: baseApartment.id,
            building: 102,
            unit: 1203,
            isHouseholder: true,
          },
        });

      expect(res.status).toBe(409);
      expect(res.body).toHaveProperty('message', '이미 사용중인 아이디입니다.');
      expect(res.body).toHaveProperty('type', BusinessExceptionType.USERNAME_ALREADY_IN_USE);
    });

    test('중복 이메일이면 미가입 입주민인지 확인후 아니면 중복 이메일 409 반환', async () => {
      const res = await request(app)
        .post('/api/v2/users/residents')
        .send({
          username: 'resident101',
          name: '최입주',
          email: baseNotJoinedResident.email, // 기존 이메일
          contact: '01099998888',
          password: '123123qwe!',
          resident: {
            // <- DTO 구조 그대로
            apartmentId: baseApartment.id,
            building: 102,
            unit: 1203,
            isHouseholder: true,
          },
        });

      expect(res.status).toBe(409);
      expect(res.body).toHaveProperty('message', '이미 사용중인 이메일입니다.');
      expect(res.body).toHaveProperty('type', BusinessExceptionType.EMAIL_ALREADY_IN_USE);
    });

    test('중복 이메일이면 미가입 입주민인지 확인 후 맞으면 가입 입주민으로 승격', async () => {
      const dto = {
        username: 'resident3_new',
        name: baseNotJoinedResident.name,
        email: baseNotJoinedResident.email, // 기존 미가입 입주민 이메일
        contact: baseNotJoinedResident.contact,
        password: '123123qwe!',
        resident: {
          // 동일 주소
          apartmentId: baseApartment.id,
          building: 102,
          unit: 1203,
          isHouseholder: true,
        },
      } as SignUpResidentAccountReqDto;

      const res = await request(app).post('/api/v2/users/residents').send(dto);

      const user = await prisma.user.findUnique({
        where: { email: dto.email },
        include: userInclude,
      });

      if (!user) throw new Error('사용자 생성 실패');

      expect(user.joinedStatus).toBe('PENDING');
      expect(user.username).toBe(user.username); // 기존 데이터에 필수 데이터 추가되었는지 확인

      expect(res.status).toBe(204);
    });
  });

  describe('입주민 계정 목록 조회 (getResidentAccounts)', () => {
    let joinedId: string;
    let notJoinedId: string;

    beforeAll(async () => {
      joinedId = randomUUID();
      notJoinedId = randomUUID();

      await prisma.user.create({
        data: {
          id: joinedId,
          name: '가입입주민',
          email: 'joined@test.com',
          contact: '01011112222',
          role: Role.USER,
          joinedStatus: Status.APPROVED,
          version: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
          UserApartmentLink: {
            create: { apartmentId: baseApartment.id },
          },
          Address: {
            create: {
              building: 101,
              unit: 1001,
              isHouseholder: true,
            },
          },
        },
      });

      await prisma.user.create({
        data: {
          id: notJoinedId,
          name: '미가입입주민',
          email: 'not@test.com',
          contact: '01022223333',
          role: Role.USER,
          joinedStatus: Status.NOT_JOINED,
          version: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
          UserApartmentLink: {
            create: { apartmentId: baseApartment.id },
          },
          Address: {
            create: {
              building: 102,
              unit: 1002,
              isHouseholder: false,
            },
          },
        },
      });
    });

    afterAll(async () => {
      await prisma.user.deleteMany({
        where: {
          id: { in: [joinedId, notJoinedId] },
        },
      });
    });

    test('가입한 입주민 목록 조회 성공', async () => {
      const res = await request(app)
        .get('/api/v2/users/residents')
        .set('Cookie', adminCookies)
        .query({
          page: 1,
          limit: 10,
        })
        .expect(200);

      const names = res.body.data.map((r: any) => r.name);

      expect(names).toContain('가입입주민');
      expect(names).not.toContain('미가입입주민');
    });
  });

  describe('입주민 가입 상태 변경 (updateResidentAccountJoinStatus)', () => {
    let pendingResident: User;
    let approvedResident: User;

    beforeEach(async () => {
      const now = new Date();

      // 테스트용 입주민 생성 (PENDING 상태)
      pendingResident = await prisma.user.create({
        data: {
          id: randomUUID(),
          name: '팬딩입주',
          email: 'pending@test.com',
          contact: '01022223333',
          username: 'pendinguser',
          password: await hashManager.hash('123123qwe!'),
          role: Role.USER,
          joinedStatus: Status.PENDING, // 초기 상태 PENDING
          version: 1,
          createdAt: now,
          updatedAt: now,
          UserApartmentLink: { create: { apartmentId: baseApartment.id } },
          Address: { create: { building: 101, unit: 101, isHouseholder: true } },
        },
      });

      // 테스트용 입주민 생성 (APPROVED 상태)
      approvedResident = await prisma.user.create({
        data: {
          id: randomUUID(),
          name: '승인입주',
          email: 'approved@test.com',
          contact: '01011112222',
          username: 'approveduser',
          password: await hashManager.hash('123123qwe!'),
          role: Role.USER,
          joinedStatus: Status.APPROVED,
          version: 1,
          createdAt: now,
          updatedAt: now,
          UserApartmentLink: { create: { apartmentId: baseApartment.id } },
          Address: { create: { building: 101, unit: 102, isHouseholder: true } },
        },
      });
    });

    afterEach(async () => {
      // 테스트 후 삭제
      await prisma.user.deleteMany({
        where: {
          id: { in: [pendingResident.id, approvedResident.id] },
        },
      });
    });

    test('팬딩 상태 -> 승인 상태로 변경 성공', async () => {
      await request(app)
        .patch(`/api/v2/users/residents/${pendingResident.id}/join-status`)
        .set('Cookie', adminCookies)
        .send({ joinStatus: Status.APPROVED })
        .expect(204);

      // DB 검증
      const updated = await prisma.user.findUnique({
        where: { id: pendingResident.id },
      });

      expect(updated).not.toBeNull();
      expect(updated!.joinedStatus).toBe(Status.APPROVED);
    });

    test('팬딩 상태 -> 거절(REJECTED) 상태로 변경 성공', async () => {
      await request(app)
        .patch(`/api/v2/users/residents/${pendingResident.id}/join-status`)
        .set('Cookie', adminCookies)
        .send({ joinStatus: Status.REJECTED })
        .expect(204);

      const updated = await prisma.user.findUnique({
        where: { id: pendingResident.id },
      });

      expect(updated).not.toBeNull();
      expect(updated!.joinedStatus).toBe(Status.REJECTED);
    });

    // 이미 거절 상태인 입주인도 상태 변경 불가
    test('이미 승인 상태인 입주민은 상태 변경 불가', async () => {
      const res = await request(app)
        .patch(`/api/v2/users/residents/${approvedResident.id}/join-status`)
        .set('Cookie', adminCookies)
        .send({ joinStatus: Status.REJECTED })
        .expect(409);

      expect(res.status).toBe(409);
      expect(res.body).toHaveProperty(
        'message',
        '승인, 거절 상태에서는 다른 상태로 변경할 수 없습니다.',
      );
      expect(res.body).toHaveProperty('type', BusinessExceptionType.NOT_UPDATE_JOINEDSTATUS);
    });
  });

  describe('입주민 가입 상태 일괄 변경 및 일괄 삭제 (updateResidentAccountJoinStatuses, deleteResidentAccounts)', () => {
    let pendingResident1: User;
    let pendingResident2: User;

    beforeEach(async () => {
      const now = new Date();

      // 테스트용 PENDING 입주민 생성
      pendingResident1 = await prisma.user.create({
        data: {
          id: randomUUID(),
          name: '팬딩입주1',
          email: 'pending1@test.com',
          contact: '01011112222',
          username: 'pendinguser1',
          password: await hashManager.hash('123123qwe!'),
          role: Role.USER,
          joinedStatus: Status.PENDING,
          version: 1,
          createdAt: now,
          updatedAt: now,
          UserApartmentLink: { create: { apartmentId: baseApartment.id } },
          Address: { create: { building: 101, unit: 101, isHouseholder: true } },
        },
      });

      pendingResident2 = await prisma.user.create({
        data: {
          id: randomUUID(),
          name: '팬딩입주2',
          email: 'pending2@test.com',
          contact: '01022223333',
          username: 'pendinguser2',
          password: await hashManager.hash('123123qwe!'),
          role: Role.USER,
          joinedStatus: Status.PENDING,
          version: 1,
          createdAt: now,
          updatedAt: now,
          UserApartmentLink: { create: { apartmentId: baseApartment.id } },
          Address: { create: { building: 101, unit: 102, isHouseholder: true } },
        },
      });
    });

    afterEach(async () => {
      // 테스트용 생성 계정 삭제
      await prisma.user.deleteMany({
        where: {
          id: { in: [pendingResident1.id, pendingResident2.id] },
        },
      });
    });

    test('모든 PENDING 입주민 상태를 APPROVED로 변경', async () => {
      await request(app)
        .patch(`/api/v2/users/residents/join-status`)
        .set('Cookie', adminCookies)
        .send({ joinStatus: Status.APPROVED })
        .expect(204);

      const updatedUsers = await prisma.user.findMany({
        where: { id: { in: [pendingResident1.id, pendingResident2.id] } },
      });

      expect(updatedUsers.find((u) => u.id === pendingResident1.id)!.joinedStatus).toBe(
        Status.APPROVED,
      );
      expect(updatedUsers.find((u) => u.id === pendingResident2.id)!.joinedStatus).toBe(
        Status.APPROVED,
      );
    });

    test('PENDING 입주민이 없으면 USER_NOT_FOUND 반환', async () => {
      // 먼저 모든 PENDING 제거
      await prisma.user.updateMany({
        where: { joinedStatus: Status.PENDING },
        data: { joinedStatus: Status.APPROVED },
      });

      const res = await request(app)
        .patch(`/api/v2/users/residents/join-status`)
        .set('Cookie', adminCookies)
        .send({ joinStatus: Status.APPROVED })
        .expect(404);

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('message', '유저를 찾을 수 없습니다.');
      expect(res.body).toHaveProperty('type', BusinessExceptionType.USER_NOT_FOUND);
    });

    test('모든 입주민 계정 삭제 성공', async () => {
      // 대기중인 모든 입주민을 일괄 거절 상태로 변경
      await request(app)
        .patch(`/api/v2/users/residents/join-status`)
        .set('Cookie', adminCookies)
        .send({ joinStatus: Status.REJECTED })
        .expect(204);

      await request(app)
        .delete('/api/v2/users/residents/rejected')
        .set('Cookie', adminCookies)
        .expect(204);

      const users = await prisma.user.findMany({
        where: { id: { in: [pendingResident1.id, pendingResident2.id] } },
      });

      expect(users.length).toBe(0); // 삭제되었는지 확인
    });
  });

  // 입주민 관리(가입/미가입 입주민)
  describe('입주민 관리 (가입 + 미가입 포함)', () => {
    let createdResidentId: string;

    test('입주민 생성 성공 (createResident)', async () => {
      const dto = {
        apartmentId: baseApartment.id,
        email: 'resident_new@test.com',
        contact: '01012345678',
        name: '테스트입주민',
        building: 105,
        unit: 101,
        isHouseholder: true,
      } as CreateResidentReqDto;

      await request(app)
        .post('/api/v2/residents')
        .set('Cookie', adminCookies)
        .send(dto)
        .expect(201);

      const user = await prisma.user.findUnique({
        where: { email: dto.email },
        include: userInclude,
      });

      expect(user).not.toBeNull();
      expect(user!.joinedStatus).toBe(Status.NOT_JOINED);
      expect(user!.Address!.building).toBe(dto.building);
      createdResidentId = user!.id;
    });

    test('입주민 생성 실패 - 이메일 중복', async () => {
      const dto = {
        apartmentId: baseApartment.id,
        email: baseResident.email, // ❗ 이미 존재
        contact: '01099998888',
        name: '중복이메일',
        building: 101,
        unit: 101,
        isHouseholder: true,
      } as CreateResidentReqDto;

      const res = await request(app)
        .post('/api/v2/residents')
        .set('Cookie', adminCookies)
        .send(dto)
        .expect(409);

      expect(res.body.type).toBe(BusinessExceptionType.EMAIL_ALREADY_IN_USE);
    });

    test('입주민 정보 수정 성공 (updateResident)', async () => {
      const dto = {
        email: 'resident_new@test.com',
        contact: '01012345678',
        name: '테스트입주민(수정)', // 수정
        building: 105,
        unit: 101,
        isHouseholder: true,
      };

      await request(app)
        .patch(`/api/v2/residents/${createdResidentId}`)
        .set('Cookie', adminCookies)
        .send(dto)
        .expect(204);

      const updated = await prisma.user.findUnique({
        where: { id: createdResidentId },
      });

      expect(updated).not.toBeNull();
      expect(updated!.name).toBe(dto.name);
    });

    test('입주민 수정 실패 - 존재하지 않는 입주민', async () => {
      const id = randomUUID();
      const dto = {
        id: id,
        email: 'notfound@test.com',
        contact: '01099990000',
        name: '없는입주민',
        building: 101,
        unit: 101,
        isHouseholder: true,
      };

      const res = await request(app)
        .patch(`/api/v2/residents/${id}`)
        .set('Cookie', adminCookies)
        .send(dto)
        .expect(404);

      expect(res.body.type).toBe(BusinessExceptionType.USER_NOT_FOUND);
    });

    test('입주민 수정 실패 - 연락처 중복', async () => {
      // 다른 입주민 하나 더 생성
      const another = await prisma.user.create({
        data: {
          id: randomUUID(),
          name: '다른입주민',
          email: 'another@test.com',
          contact: '01055556666',
          role: Role.USER,
          joinedStatus: Status.NOT_JOINED,
          version: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
          UserApartmentLink: { create: { apartmentId: baseApartment.id } },
        },
      });

      const dto = {
        apartmentId: baseApartment.id,
        email: baseResident.email,
        contact: another.contact, // 연락처 중복
        name: '테스트입주민',
        building: 105,
        unit: 101,
        isHouseholder: true,
      };

      const res = await request(app)
        .patch(`/api/v2/residents/${createdResidentId}`)
        .set('Cookie', adminCookies)
        .send(dto)
        .expect(409);

      expect(res.body.type).toBe(BusinessExceptionType.CONTACT_ALREADY_IN_USE);

      await prisma.user.delete({ where: { id: another.id } });
    });

    test('입주민 삭제 성공 (deleteResident)', async () => {
      await request(app)
        .delete(`/api/v2/residents/${createdResidentId}`)
        .set('Cookie', adminCookies)
        .expect(204);

      const deleted = await prisma.user.findUnique({
        where: { id: createdResidentId },
      });

      expect(deleted).toBeNull();
    });

    describe('입주민 단건 조회 (getResidentById)', () => {
      let residentId: string;

      beforeAll(async () => {
        const resident = await prisma.user.create({
          data: {
            id: randomUUID(),
            name: '조회입주민',
            email: 'getone@test.com',
            contact: '01011112222',
            role: Role.USER,
            joinedStatus: Status.NOT_JOINED,
            version: 1,
            createdAt: new Date(),
            updatedAt: new Date(),
            UserApartmentLink: {
              create: { apartmentId: baseApartment.id },
            },
            Address: {
              create: {
                building: 101,
                unit: 1001,
                isHouseholder: true,
              },
            },
          },
        });

        residentId = resident.id;
      });

      test('입주민 단건 조회 성공', async () => {
        const res = await request(app)
          .get(`/api/v2/residents/${residentId}`)
          .set('Cookie', adminCookies)
          .expect(200);

        expect(res.body.id).toBe(residentId);
        expect(res.body.name).toBe('조회입주민');
      });

      test('입주민 단건 조회 실패 - 존재하지 않음', async () => {
        const res = await request(app)
          .get(`/api/v2/residents/${randomUUID()}`)
          .set('Cookie', adminCookies)
          .expect(404);

        expect(res.body.type).toBe(BusinessExceptionType.USER_NOT_FOUND);
      });
    });

    describe('입주민 목록 조회 (getResidents)', () => {
      let notJoinedId: string;
      let joinedId: string;

      beforeAll(async () => {
        notJoinedId = randomUUID();
        joinedId = randomUUID();

        await prisma.user.create({
          data: {
            id: notJoinedId,
            name: '미가입입주민',
            email: 'notjoined@test.com',
            contact: '01022223333',
            role: Role.USER,
            joinedStatus: Status.NOT_JOINED,
            version: 1,
            createdAt: new Date(),
            updatedAt: new Date(),
            UserApartmentLink: {
              create: { apartmentId: baseApartment.id },
            },
            Address: {
              create: {
                building: 101,
                unit: 1001,
                isHouseholder: true,
              },
            },
          },
        });

        await prisma.user.create({
          data: {
            id: joinedId,
            name: '가입입주민',
            email: 'joined@test.com',
            contact: '01033334444',
            role: Role.USER,
            joinedStatus: Status.APPROVED,
            version: 1,
            createdAt: new Date(),
            updatedAt: new Date(),
            UserApartmentLink: {
              create: { apartmentId: baseApartment.id },
            },
            Address: {
              create: {
                building: 102,
                unit: 1002,
                isHouseholder: false,
              },
            },
          },
        });
      });

      test('입주민 목록 조회 성공 (가입 + 미가입)', async () => {
        const res = await request(app)
          .get('/api/v2/residents')
          .set('Cookie', adminCookies)
          .query({ page: 1, limit: 10 })
          .expect(200);

        const names = res.body.data.map((r: any) => r.name);

        expect(names).toContain('미가입입주민');
        expect(names).toContain('가입입주민');

        const notJoined = res.body.data.find((r: any) => r.name === '미가입입주민');
        expect(notJoined.building).toBe(101);
        expect(notJoined.unit).toBe(1001);
        expect(notJoined.isHouseholder).toBe(true);
      });
    });
  });

  // 기타
  describe('유저(대표로 입주민만) 비밀번호 변경 (updatePassword)', () => {
    let residentCookies: string;

    beforeAll(async () => {
      const res = await request(app).post('/api/v2/auth/login').send({
        username: baseResident.username,
        password: '123123qwe!',
      });

      residentCookies = res.headers['set-cookie'];
    });

    test('입주민 비밀번호 변경 성공', async () => {
      const dto = {
        password: '123123qwe!',
        newPassword: 'newPassword1!',
      } as UpdatePasswordReqDto;

      await request(app)
        .patch(`/api/v2/users/me/password`)
        .set('Cookie', residentCookies)
        .send(dto)
        .expect(204);

      // DB 검증
      const updated = await prisma.user.findUnique({ where: { id: baseResident.id } });
      expect(await hashManager.compare('newPassword1!', updated!.password!)).toBe(true);
    });

    test('현재 비밀번호 틀리면 409 반환', async () => {
      const dto = {
        password: 'wrongPassword2!',
        newPassword: 'newPassword2!',
      } as UpdatePasswordReqDto;

      const res = await request(app)
        .patch(`/api/v2/users/me/password`)
        .set('Cookie', residentCookies)
        .send(dto)
        .expect(401);

      expect(res.body.type).toBe(BusinessExceptionType.INCORRECT_PASSWORD);
    });

    test('새 비밀번호가 기존 비밀번호와 같으면 409 반환', async () => {
      const dto = {
        password: 'newPassword1!', // 이전에 변경된 비밀번호
        newPassword: 'newPassword1!',
      } as UpdatePasswordReqDto;

      const res = await request(app)
        .patch(`/api/v2/users/me/password`)
        .set('Cookie', residentCookies)
        .send(dto)
        .expect(401);

      expect(res.body.type).toBe(BusinessExceptionType.CORRECT_PASSWORD);
    });
  });
});
