import { PrismaClient } from '@prisma/client';
import { Application } from 'express';
import { randomUUID } from 'node:crypto';
import request from 'supertest';
import { createInjector } from '../../injector';
import { TokenUtil } from '../../shared/utils/token-manager';

describe('comment 통합 테스트', () => {
  let app: Application;
  let prisma: PrismaClient;
  let redis: any;
  let residentToken: string;
  let otherResidentToken: string;
  let adminToken: string;

  const mockAptId = 'apt-id';
  const residentId = 'resident-id';
  const otherResidentId = 'resident-id-2';
  const adminId = 'admin-id';

  const createComplaint = async (overrides?: { id?: string; userId?: string }) => {
    return prisma.complaint.create({
      data: {
        id: overrides?.id ?? randomUUID(),
        createdAt: new Date(),
        updatedAt: new Date(),
        title: '민원 제목',
        content: '민원 내용',
        status: 'PENDING',
        isPublic: true,
        viewsCount: 0,
        version: 1,
        apartmentId: mockAptId,
        userId: overrides?.userId ?? residentId,
      },
    });
  };

  const createComment = async (props: {
    complaintId: string;
    userId?: string;
    content?: string;
  }) => {
    return prisma.comment.create({
      data: {
        id: randomUUID(),
        content: props.content ?? '댓글 내용',
        userId: props.userId ?? residentId,
        complaintId: props.complaintId,
        noticeId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
  };

  beforeAll(async () => {
    prisma = new PrismaClient();
    const { httpServer, redisExternal } = createInjector(prisma);
    redis = redisExternal;
    app = httpServer.app;

    await prisma.apartment.upsert({
      where: { id: mockAptId },
      update: {},
      create: {
        id: mockAptId,
        address: '서울시 강남구',
        name: '테스트아파트',
        description: '테스트용 아파트',
        officeNumber: '0212345678',
        buildingNumberFrom: 1,
        buildingNumberTo: 10,
        floorCountPerBuilding: 20,
        unitCountPerFloor: 4,
        version: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    await prisma.user.upsert({
      where: { id: residentId },
      update: {},
      create: {
        id: residentId,
        username: 'resident1',
        password: 'test!@1234',
        name: 'resident1',
        email: 'resident1@test.com',
        contact: '01011112221',
        role: 'RESIDENT',
        joinedStatus: 'APPROVED',
        version: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        UserApartmentLink: {
          create: [{ apartmentId: mockAptId }],
        },
      },
    });

    await prisma.user.upsert({
      where: { id: otherResidentId },
      update: {},
      create: {
        id: otherResidentId,
        username: 'resident2',
        password: 'test!@1234',
        name: 'resident2',
        email: 'resident2@test.com',
        contact: '01011112222',
        role: 'RESIDENT',
        joinedStatus: 'APPROVED',
        version: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        UserApartmentLink: {
          create: [{ apartmentId: mockAptId }],
        },
      },
    });

    await prisma.user.upsert({
      where: { id: adminId },
      update: {},
      create: {
        id: adminId,
        username: 'admin1',
        password: 'test!@1234',
        name: 'admin1',
        email: 'admin1@test.com',
        contact: '01011112223',
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
    residentToken = tokenManager.generateAccessToken({
      userId: residentId,
      role: 'RESIDENT',
    });
    otherResidentToken = tokenManager.generateAccessToken({
      userId: otherResidentId,
      role: 'RESIDENT',
    });
    adminToken = tokenManager.generateAccessToken({
      userId: adminId,
      role: 'ADMIN',
    });
  });

  afterEach(async () => {
    await prisma.comment.deleteMany();
    await prisma.complaint.deleteMany();
  });

  afterAll(async () => {
    await prisma.comment.deleteMany();
    await prisma.complaint.deleteMany();
    await prisma.user.deleteMany();
    await prisma.apartment.deleteMany();
    await prisma.$disconnect();
    await redis.quit();
  });

  describe('GET /comments - 목록 조회', () => {
    describe('권한 및 보안', () => {
      it('토큰이 없으면 401을 반환한다', async () => {
        const res = await request(app).get('/api/v2/comments').query({
          page: 1,
          limit: 20,
          resourceId: 'resource',
          resourceType: 'NOTICE',
        });

        expect(res.status).toBe(401);
      });
    });
    describe('유효성 검사', () => {
      it('쿼리 파라미터 타입이 올바르지 않으면 422를 반환한다', async () => {
        const res = await request(app)
          .get('/api/v2/comments')
          .set('Cookie', [`access_token=${residentToken}`])
          .query({
            page: 'abc',
            limit: 'def',
            resourceId: 'resource',
            resourceType: 'NOTICE',
          });

        expect(res.status).toBe(422);
      });
      it('리소스 TYPE이 유효하지 않으면 422를 반환한다', async () => {
        const res = await request(app)
          .get('/api/v2/comments')
          .set('Cookie', [`access_token=${residentToken}`])
          .query({
            page: 1,
            limit: 20,
            resourceId: 'resource',
            resourceType: 'INVALID',
          });

        expect(res.status).toBe(422);
      });
    });
    describe('데이터 조회', () => {
      it('기본 페이징: page와 limit에 맞는 개수와 데이터를 반환한다', async () => {
        const complaint = await createComplaint();
        await prisma.comment.createMany({
          data: [
            {
              id: randomUUID(),
              content: '댓글 1',
              userId: residentId,
              complaintId: complaint.id,
              noticeId: null,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
            {
              id: randomUUID(),
              content: '댓글 2',
              userId: residentId,
              complaintId: complaint.id,
              noticeId: null,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
            {
              id: randomUUID(),
              content: '댓글 3',
              userId: residentId,
              complaintId: complaint.id,
              noticeId: null,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          ],
        });

        const res = await request(app)
          .get('/api/v2/comments')
          .set('Cookie', [`access_token=${residentToken}`])
          .query({
            page: 1,
            limit: 2,
            resourceId: complaint.id,
            resourceType: 'COMPLAINT',
          });

        expect(res.status).toBe(200);
        expect(res.body.totalCount).toBe(3);
        expect(res.body.data).toHaveLength(2);
        expect(res.body.page).toBe(1);
        expect(res.body.limit).toBe(2);
        expect(res.body.hasNext).toBe(true);
      });
    });
  });

  describe('POST /comments - 댓글 등록', () => {
    describe('권한 및 보안', () => {
      it('토큰이 없으면 401을 반환한다', async () => {
        const complaint = await createComplaint();
        const res = await request(app).post('/api/v2/comments').send({
          content: '댓글 내용',
          resourceId: complaint.id,
          resourceType: 'COMPLAINT',
        });

        expect(res.status).toBe(401);
      });
    });
    describe('유효성 검사', () => {
      it('필수 값이 누락되면 422를 반환한다', async () => {
        const complaint = await createComplaint();
        const res = await request(app)
          .post('/api/v2/comments')
          .set('Cookie', [`access_token=${residentToken}`])
          .send({
            resourceId: complaint.id,
            resourceType: 'COMPLAINT',
          });

        expect(res.status).toBe(422);
      });
      it('리소스 TYPE이 유효하지 않으면 422를 반환한다', async () => {
        const complaint = await createComplaint();
        const res = await request(app)
          .post('/api/v2/comments')
          .set('Cookie', [`access_token=${residentToken}`])
          .send({
            content: '댓글 내용',
            resourceId: complaint.id,
            resourceType: 'INVALID',
          });

        expect(res.status).toBe(422);
      });
    });
    describe('데이터 저장', () => {
      it('사용자가 댓글을 등록하면 201을 반환하고 DB에 저장한다', async () => {
        const complaint = await createComplaint();
        const res = await request(app)
          .post('/api/v2/comments')
          .set('Cookie', [`access_token=${residentToken}`])
          .send({
            content: '댓글 저장',
            resourceId: complaint.id,
            resourceType: 'COMPLAINT',
          });

        expect(res.status).toBe(201);

        const saved = await prisma.comment.findFirst({
          where: {
            complaintId: complaint.id,
            content: '댓글 저장',
            userId: residentId,
          },
        });

        expect(saved).not.toBeNull();
      });
    });
  });

  describe('PATCH /comments - 댓글 수정', () => {
    describe('권한 및 보안', () => {
      it('토큰이 없으면 401을 반환한다', async () => {
        const res = await request(app)
          .patch(`/api/v2/comments/${randomUUID()}`)
          .send({ content: '수정 내용' });

        expect(res.status).toBe(401);
      });
      it('작성자 아닌 다른 사용자가 호출 시 403을 반환한다', async () => {
        const complaint = await createComplaint();
        const comment = await createComment({ complaintId: complaint.id, userId: residentId });

        const res = await request(app)
          .patch(`/api/v2/comments/${comment.id}`)
          .set('Cookie', [`access_token=${otherResidentToken}`])
          .send({ content: '수정 내용' });

        expect(res.status).toBe(403);
      });
    });
    describe('유효성 검사', () => {
      it('존재하지 않는 id로 조회 시 404를 반환한다', async () => {
        const res = await request(app)
          .patch(`/api/v2/comments/${randomUUID()}`)
          .set('Cookie', [`access_token=${residentToken}`])
          .send({ content: '수정 내용' });

        expect(res.status).toBe(404);
      });
      it('필수 값이 누락되면 422를 반환한다', async () => {
        const complaint = await createComplaint();
        const comment = await createComment({ complaintId: complaint.id, userId: residentId });

        const res = await request(app)
          .patch(`/api/v2/comments/${comment.id}`)
          .set('Cookie', [`access_token=${residentToken}`])
          .send({});

        expect(res.status).toBe(422);
      });
    });
    describe('데이터 저장', () => {
      it('사용자가 댓글을 수정하면 204를 반환하고 DB에 저장한다', async () => {
        const complaint = await createComplaint();
        const comment = await createComment({ complaintId: complaint.id, userId: residentId });

        const res = await request(app)
          .patch(`/api/v2/comments/${comment.id}`)
          .set('Cookie', [`access_token=${residentToken}`])
          .send({ content: '수정 완료' });

        expect(res.status).toBe(204);

        const updated = await prisma.comment.findUnique({
          where: { id: comment.id },
        });

        expect(updated?.content).toBe('수정 완료');
      });
    });
  });

  describe('DELETE /comments - 댓글 삭제', () => {
    describe('권한 및 보안', () => {
      it('토큰이 없으면 401을 반환한다', async () => {
        const res = await request(app).delete(`/api/v2/comments/${randomUUID()}`);

        expect(res.status).toBe(401);
      });
      it('작성자나 관리자가 아닌 사용자가 다른 사용자의 댓글을 삭제하려 하면 403을 반환한다', async () => {
        const complaint = await createComplaint();
        const comment = await createComment({ complaintId: complaint.id, userId: residentId });

        const res = await request(app)
          .delete(`/api/v2/comments/${comment.id}`)
          .set('Cookie', [`access_token=${otherResidentToken}`]);

        expect(res.status).toBe(403);
      });
    });
    describe('유효성 검사', () => {
      it('존재하지 않는 id로 조회 시 404를 반환한다.', async () => {
        const res = await request(app)
          .delete(`/api/v2/comments/${randomUUID()}`)
          .set('Cookie', [`access_token=${residentToken}`]);

        expect(res.status).toBe(404);
      });
    });
    describe('데이터 삭제', () => {
      it('해당 민원을 DB에서 삭제한 후 204를 반환한다', async () => {
        const complaint = await createComplaint();
        const comment = await createComment({ complaintId: complaint.id, userId: residentId });

        const res = await request(app)
          .delete(`/api/v2/comments/${comment.id}`)
          .set('Cookie', [`access_token=${adminToken}`]);

        expect(res.status).toBe(204);

        const deleted = await prisma.comment.findUnique({
          where: { id: comment.id },
        });

        expect(deleted).toBeNull();
      });
    });
  });
});
