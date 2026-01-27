import { PrismaClient } from '@prisma/client';
import { Application } from 'express';
import { createInjector } from '../../injector';
import { TokenUtil } from '../../shared/utils/token-manager';
import request from 'supertest';
import { Role } from '../../domain/user/entity/base-user';

describe('Notice 통합 테스트', () => {
  let app: Application;
  let mockPrisma: PrismaClient;
  let accessToken: string;
  let redis: any;

  const mockAptId = 'test-apt-id';
  const mockAdminId = 'test-admin-id';

  beforeAll(async () => {
    mockPrisma = new PrismaClient();
    const { httpServer, redisExternal } = createInjector(mockPrisma);
    redis = redisExternal;
    app = httpServer.app;

    await mockPrisma.apartment.upsert({
      where: { id: mockAptId },
      update: {},
      create: {
        id: mockAptId,
        address: '경기도 용인시 기흥구',
        name: '자이아파트',
        description: '살기 좋은 아파트',
        officeNumber: '0311234567',
        buildingNumberFrom: 1,
        buildingNumberTo: 10,
        floorCountPerBuilding: 20,
        unitCountPerFloor: 4,
        version: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    await mockPrisma.user.upsert({
      where: { id: mockAdminId },
      update: {},
      create: {
        id: mockAdminId,
        username: 'admin1',
        password: 'test!@1234',
        name: 'admin1',
        email: 'admin1@test.com',
        contact: '01011112222',
        role: 'ADMIN',
        joinedStatus: 'APPROVED',
        version: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        UserApartmentLink: {
          create: [{ apartmentId: mockAptId }],
        },
      },
    });

    const tokenManager = TokenUtil();
    accessToken = tokenManager.generateAccessToken({
      userId: mockAdminId,
      role: 'ADMIN',
    });
  });

  afterEach(async () => {
    await mockPrisma.notices.deleteMany();
    await mockPrisma.polls.deleteMany();
  });

  afterAll(async () => {
    await mockPrisma.user.deleteMany();
    await mockPrisma.apartment.deleteMany();
    await mockPrisma.$disconnect();
    await redis.quit();
  });

  describe('POST /notices API', () => {
    test('성공: 입력값을 전부 입력하면 공지사항이 생성', async () => {
      const data = {
        title: '첫번째 공지사항',
        content: '첫번째 공지사항 입니다.',
        category: 'MAINTENANCE',
        isPinned: true,
        apartmentId: mockAptId,
        event: {
          startDate: '2026-01-22T01:39:05.325Z',
          endDate: '2026-01-22T01:39:05.325Z',
        },
      };

      const res = await request(app)
        .post('/api/v2/notices')
        .set('Cookie', [`access_token=${accessToken}`])
        .send(data);

      expect(res.status).toBe(201);
      expect(res.body.title).toBe(data.title);

      const savedNotice = await mockPrisma.notices.findFirst({
        where: { title: data.title },
      });
      expect(savedNotice).not.toBeNull();
    });

    test('실패: 토큰 없으면 에러: 401', async () => {
      const data = {
        title: '무단 공지사항',
        content: '권한없는 공지사항 입니다.',
        category: 'MAINTENACE',
        isPinned: true,
        apartmentId: mockAptId,
        event: {
          startDate: '2026-01-22T01:39:05.325Z',
          endDate: '2026-01-22T01:39:05.325Z',
        },
      };
      const res = await request(app).post('/api/v2/notices').send(data);

      expect(res.status).toBe(401);
    });

    test('실패: 입력값이 하나라도 없으면 에러: 422', async () => {
      const data = {
        title: '내용 없는 공지사항',
        category: 'MAINTENACE',
        isPinned: true,
        apartmentId: mockAptId,
        event: {
          startDate: '2026-01-22T01:39:05.325Z',
          endDate: '2026-01-22T01:39:05.325Z',
        },
      };
      const res = await request(app)
        .post('/api/v2/notices')
        .set('Cookie', [`access_token=${accessToken}`])
        .send(data);
      expect(res.status).toBe(422);
    });

    test('실패: role이 Admin이 아니면 에러: 403', async () => {
      const residentToken = TokenUtil().generateAccessToken({
        userId: 'some-resident-id',
        role: Role.USER,
      });

      const data = {
        title: '주민이 쓴 공지사항',
        content: '주민이 작성한 공지사항 입니다. 성공하면 안됨.',
        category: 'MAINTENANCE',
        isPinned: true,
        apartmentId: mockAptId,
        event: {
          startDate: '2026-01-22T01:39:05.325Z',
          endDate: '2026-01-22T01:39:05.325Z',
        },
      };

      const res = await request(app)
        .post('/api/v2/notices')
        .set('Cookie', [`access_token=${residentToken}`])
        .send(data);

      expect(res.status).toBe(403);
    });

    test('실패: 존재하지 않는 apartmentId 인 경우 에러: TechnicalException', async () => {
      const data = {
        title: '첫번째 공지사항',
        content: '첫번째 공지사항 입니다.',
        category: 'MAINTENANCE',
        isPinned: true,
        apartmentId: 'none-exist-apartmentId',
        event: {
          startDate: '2026-01-22T01:39:05.325Z',
          endDate: '2026-01-22T01:39:05.325Z',
        },
      };
      const res = await request(app)
        .post('/api/v2/notices')
        .set('Cookie', [`access_token=${accessToken}`])
        .send(data);
      expect(res.status).toBe(400);
    });
  });

  describe('PATCH /notices API', () => {
    let mockNoticeId = 'test-notice-id';
    beforeEach(async () => {
      const notice = await mockPrisma.notices.create({
        data: {
          id: mockNoticeId,
          createdAt: new Date(),
          updatedAt: new Date(),
          title: '수정 전 제목',
          content: '수정 전 내용',
          category: 'MAINTENANCE',
          isPinned: false,
          viewCount: 0,
          apartmentId: mockAptId,
          userId: mockAdminId,
          version: 1,
        },
      });
    });

    test('성공: 제목과 내용을 수정하면 DB에 반영', async () => {
      const data = {
        title: '수정 후 제목',
        content: '수정 후 내용',
      };

      const res = await request(app)
        .patch(`/api/v2/notices/${mockNoticeId}`)
        .set('Cookie', [`access_token=${accessToken}`])
        .send(data);

      expect(res.status).toBe(200);
    });

    test('실패: 존재하지 않는 noticeId 에러: 404', async () => {
      const data = {
        title: '수정 후 제목',
        content: '수정 후 내용',
      };

      const noneNoticeId = 'none-exist-noticeId';

      const res = await request(app)
        .patch(`/api/v2/notices/${noneNoticeId}`)
        .set('Cookie', [`access_token=${accessToken}`])
        .send(data);

      expect(res.status).toBe(404);
    });

    test('실패: role이 Admin이 아니면 에러: 403', async () => {
      const residentToken = TokenUtil().generateAccessToken({
        userId: 'some-resident-id',
        role: Role.USER,
      });

      const data = {
        title: '주민이 쓴 공지사항',
        content: '주민이 작성한 공지사항 입니다. 성공하면 안됨.',
      };

      const res = await request(app)
        .patch(`/api/v2/notices/${mockNoticeId}`)
        .set('Cookie', [`access_token=${residentToken}`])
        .send(data);

      expect(res.status).toBe(403);
    });
  });

  describe('DELETE /notices API', () => {
    let deleteTargetId = 'delete-test-id';

    beforeEach(async () => {
      const notice = await mockPrisma.notices.create({
        data: {
          id: deleteTargetId,
          createdAt: new Date(),
          updatedAt: new Date(),
          title: '삭제될 공지 제목',
          content: '삭제될 공지 내용',
          category: 'MAINTENANCE',
          isPinned: false,
          viewCount: 0,
          apartmentId: mockAptId,
          userId: mockAdminId,
          version: 1,
        },
      });
    });

    test('성공: 공지사항 삭제 시 DB에서 제거됨', async () => {
      const res = await request(app)
        .delete(`/api/v2/notices/${deleteTargetId}`)
        .set('Cookie', [`access_token=${accessToken}`]);

      expect(res.status).toBe(204);

      const deletedNotice = await mockPrisma.notices.findUnique({
        where: { id: deleteTargetId },
      });
      expect(deletedNotice).toBeNull();
    });

    test('성공: 존재하지 않는 noticeId 삭제 시 성공처리', async () => {
      const wrongId = 'wrong-id';
      const res = await request(app)
        .delete(`/api/v2/notices/${wrongId}`)
        .set('Cookie', [`access_token=${accessToken}`]);

      expect(res.status).toBe(204);
    });

    test('실패: 권한 없음 에러: 403', async () => {
      const residentToken = TokenUtil().generateAccessToken({
        userId: 'some-resident',
        role: Role.USER,
      });

      const res = await request(app)
        .delete(`/api/v2/notices/${deleteTargetId}`)
        .set('Cookie', [`access_token=${residentToken}`]);

      expect(res.status).toBe(403);

      const notice = await mockPrisma.notices.findUnique({
        where: { id: deleteTargetId },
      });
      expect(notice).not.toBeNull();
    });
  });
});
