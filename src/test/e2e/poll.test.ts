/* eslint-disable @typescript-eslint/no-explicit-any */
import { PrismaClient } from '@prisma/client';
import { Application } from 'express';
import { TokenUtil } from '../../shared/utils/token-manager';
import { createInjector } from '../../injector';
import request from 'supertest';
import { Role } from '../../domain/user/entity/base-user';

describe('Poll 통합 테스트', () => {
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
    await mockPrisma.userVoteOption.deleteMany();
    await mockPrisma.options.deleteMany();
    await mockPrisma.polls.deleteMany();
    await mockPrisma.notices.deleteMany();
  });

  afterAll(async () => {
    await mockPrisma.user.deleteMany();
    await mockPrisma.apartment.deleteMany();
    await mockPrisma.$disconnect();
    await redis.quit();
  });

  describe('POST /polls API', () => {
    test('성공: 입렵값을 전부 입력하면 투표 생성', async () => {
      const data = {
        title: '첫번째 투표',
        content: '첫번째 투표입니다.',
        startDate: '2026-01-22T07:47:32.781Z',
        endDate: '2026-01-22T07:47:32.781Z',
        apartmentId: mockAptId,
        building: 1,
        options: [
          {
            title: '투표 항목 1',
          },
          {
            title: '투표 항목 2',
          },
        ],
      };
      const res = await request(app)
        .post('/api/v2/polls')
        .set(`Cookie`, [`access_token=${accessToken}`])
        .send(data);

      expect(res.status).toBe(201);
      expect(res.body.title).toBe(data.title);
    });

    test('실패: 토큰 없으면 에러: 401', async () => {
      const data = {
        title: '무단 투표 생성',
        content: '실패해야할 post',
        startDate: '2026-01-22T07:47:32.781Z',
        endDate: '2026-01-22T07:47:32.781Z',
        apartmentId: mockAptId,
        building: 1,
        options: [
          {
            title: '투표 항목 1',
          },
          {
            title: '투표 항목 2',
          },
        ],
      };
      const res = await request(app).post('/api/v2/polls').send(data);

      expect(res.status).toBe(401);
    });

    test('실패: 입력값이 하나라도 없으면 에러: 422', async () => {
      const data = {
        title: '실패할 투표',
        content: '옵션이 없는 투표글.',
        startDate: '2026-01-22T07:47:32.781Z',
        endDate: '2026-01-22T07:47:32.781Z',
        apartmentId: mockAptId,
        building: 1,
      };
      const res = await request(app)
        .post('/api/v2/polls')
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
        title: '첫번째 투표',
        content: '첫번째 투표입니다.',
        startDate: '2026-01-22T07:47:32.781Z',
        endDate: '2026-01-22T07:47:32.781Z',
        apartmentId: mockAptId,
        building: 1,
        options: [
          {
            title: '투표 항목 1',
          },
          {
            title: '투표 항목 2',
          },
        ],
      };

      const res = await request(app)
        .post('/api/v2/polls')
        .set('Cookie', [`access_token=${residentToken}`])
        .send(data);

      expect(res.status).toBe(403);
    });

    test('실패: 존재하지 않는 apartmentId 인 경우 에러: TechnicalException', async () => {
      const data = {
        title: '첫번째 투표',
        content: '첫번째 투표입니다.',
        startDate: '2026-01-22T07:47:32.781Z',
        endDate: '2026-01-22T07:47:32.781Z',
        apartmentId: 'none-exist-apartmentId',
        building: 1,
        options: [
          {
            title: '투표 항목 1',
          },
          {
            title: '투표 항목 2',
          },
        ],
      };
      const res = await request(app)
        .post('/api/v2/polls')
        .set('Cookie', [`access_token=${accessToken}`])
        .send(data);
      expect(res.status).toBe(500);
    });
  });

  describe('PATCH /polls API', () => {
    const patchPollId = 'patch-poll-id';
    beforeEach(async () => {
      const poll = await mockPrisma.polls.upsert({
        where: { id: patchPollId },
        update: {
          title: '수정 전 제목',
          content: '수정 전 내용',
        },
        create: {
          id: patchPollId,
          createdAt: new Date(),
          updatedAt: new Date(),
          title: '수정 전 제목',
          content: '수정 전 내용',
          status: 'IN_PROGRESS',
          startDate: new Date(),
          endDate: new Date(),
          apartmentId: mockAptId,
          building: 1,
          userId: mockAdminId,
          version: 1,
        },
      });
    });

    test('성공: 제목과 내용을 수정하면 DB에 반영', async () => {
      const data = {
        title: '수정 후 내용',
        content: '수정 후 내용',
      };

      const res = await request(app)
        .patch(`/api/v2/polls/${patchPollId}`)
        .set('Cookie', [`access_token=${accessToken}`])
        .send(data);

      expect(res.status).toBe(200);
    });
    test('실패: 존재하지 않는 pollId 에러: 404', async () => {
      const data = {
        title: '수정 후 제목',
        content: '수정 후 내용',
      };

      const nonePollId = 'none-exist-pollId';

      const res = await request(app)
        .patch(`/api/v2/polls/${nonePollId}`)
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
        title: '주민이 쓴 투표',
        content: '주민이 작성한 투표 입니다. 성공하면 안됨.',
      };

      const res = await request(app)
        .patch(`/api/v2/polls/${patchPollId}`)
        .set('Cookie', [`access_token=${residentToken}`])
        .send(data);

      expect(res.status).toBe(403);
    });
  });

  describe('DELETE /polls API', () => {
    const deleteTargetId = 'delete-poll-id';

    beforeEach(async () => {
      await mockPrisma.polls.upsert({
        where: {
          id: deleteTargetId,
        },
        update: { title: '수정 전 제목', content: '수정 전 내용' },
        create: {
          id: deleteTargetId,
          createdAt: new Date(),
          updatedAt: new Date(),
          title: '수정 전 제목',
          content: '수정 전 내용',
          status: 'IN_PROGRESS',
          startDate: new Date(),
          endDate: new Date(),
          apartmentId: mockAptId,
          building: 1,
          userId: mockAdminId,
          version: 1,
        },
      });
    });

    test('성공: 투표 삭제 시 DB에서 제거됨', async () => {
      const res = await request(app)
        .delete(`/api/v2/polls/${deleteTargetId}`)
        .set('Cookie', [`access_token=${accessToken}`]);

      expect(res.status).toBe(204);

      const deletedPoll = await mockPrisma.polls.findUnique({
        where: { id: deleteTargetId },
      });
      expect(deletedPoll).toBeNull();
    });

    test('성공: 존재하지 않는 pollId 삭제 시 성공처리', async () => {
      const wrongId = 'wrong-id';
      const res = await request(app)
        .delete(`/api/v2/polls/${wrongId}`)
        .set('Cookie', [`access_token=${accessToken}`]);

      expect(res.status).toBe(204);
    });

    test('실패: 권한 없음 에러: 403', async () => {
      const residentToken = TokenUtil().generateAccessToken({
        userId: 'some-resident',
        role: Role.USER,
      });

      const res = await request(app)
        .delete(`/api/v2/polls/${deleteTargetId}`)
        .set('Cookie', [`access_token=${residentToken}`]);

      expect(res.status).toBe(403);

      const poll = await mockPrisma.polls.findUnique({
        where: { id: deleteTargetId },
      });
      expect(poll).not.toBeNull();
    });
  });

  describe('POST /polls/vote API', () => {
    const votePollId = 'vote-poll-id';
    const mockOptionId1 = 'test-optioin-id1';
    const mockOptionId2 = 'test-optioin-id2';

    beforeEach(async () => {
      await mockPrisma.polls.upsert({
        where: { id: votePollId },
        update: {},
        create: {
          id: votePollId,
          createdAt: new Date(),
          updatedAt: new Date(),
          title: '수정 전 제목',
          content: '수정 전 내용',
          status: 'IN_PROGRESS',
          startDate: new Date(),
          endDate: new Date(Date.now() + 3600000),
          apartmentId: mockAptId,
          building: 1,
          userId: mockAdminId,
          version: 1,
          options: {
            create: [
              {
                id: mockOptionId1,
                title: 'option1',
              },
              {
                id: mockOptionId2,
                title: 'option2',
              },
            ],
          },
        },
      });
    });

    test('성공: 투표하지 않은 유저가 투표하면 성공', async () => {
      const res = await request(app)
        .post(`/api/v2/polls/${votePollId}/options/${mockOptionId1}/vote`)
        .set('Cookie', [`access_token=${accessToken}`]);
      expect(res.status).toBe(201);
    });

    test('실패: 중복 투표 에러: 409', async () => {
      await request(app)
        .post(`/api/v2/polls/${votePollId}/options/${mockOptionId1}/vote`)
        .set('Cookie', [`access_token=${accessToken}`]);

      const res = await request(app)
        .post(`/api/v2/polls/${votePollId}/options/${mockOptionId1}/vote`)
        .set('Cookie', [`access_token=${accessToken}`]);
      expect(res.status).toBe(409);
    });
  });

  describe('DELETE /polls/vote API', () => {
    const canclePollId = 'cancle-poll-id';
    const mockOptionId1 = 'test-optioin-id1';
    const mockOptionId2 = 'test-optioin-id2';

    beforeEach(async () => {
      await mockPrisma.polls.upsert({
        where: { id: canclePollId },
        update: {},
        create: {
          id: canclePollId,
          createdAt: new Date(),
          updatedAt: new Date(),
          title: '수정 전 제목',
          content: '수정 전 내용',
          status: 'IN_PROGRESS',
          startDate: new Date(),
          endDate: new Date(Date.now() + 3600000),
          apartmentId: mockAptId,
          building: 1,
          userId: mockAdminId,
          version: 1,
          options: {
            create: [
              {
                id: mockOptionId1,
                title: 'option1',
              },
              {
                id: mockOptionId2,
                title: 'option2',
              },
            ],
          },
        },
      });
    });

    test('성공: 투표한 유저가 취소하면 성공', async () => {
      await request(app)
        .post(`/api/v2/polls/${canclePollId}/options/${mockOptionId1}/vote`)
        .set('Cookie', [`access_token=${accessToken}`]);

      const res = await request(app)
        .delete(`/api/v2/polls/${canclePollId}/options/${mockOptionId1}/vote`)
        .set('Cookie', [`access_token=${accessToken}`]);
      expect(res.status).toBe(204);

      const vote = await mockPrisma.userVoteOption.findUnique({
        where: {
          userId_optionId: { userId: mockAdminId, optionId: mockOptionId1 },
        },
      });
      expect(vote).toBeNull();
    });
  });
});

// todo:
// 내 투표가 아닌데 취소하려 할 때: 다른 사람의 투표 기록을 지울 수 없는지 확인 (권한 체크).
// 존재하지 않는 선택지에 투표할 때: 잘못된 optionId로 요청 시 에러 처리.
// 종료된 투표에 투표할 때: endDate가 지난 투표에 투표 시 실패하는지.
