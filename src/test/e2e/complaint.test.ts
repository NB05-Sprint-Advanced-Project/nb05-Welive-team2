/* eslint-disable @typescript-eslint/no-explicit-any */
import { PrismaClient } from '@prisma/client';
import { Application } from 'express';
import { randomUUID } from 'node:crypto';
import request from 'supertest';
import { createInjector } from '../../injector';
import { TokenUtil } from '../../shared/utils/token-manager';
import { Role } from '../../domain/user/entity/base-user';

describe('complaint 통합 테스트', () => {
  let app: Application;
  let prisma: PrismaClient;
  let redis: any;
  let residentToken: string;
  let otherResidentToken: string;
  let adminToken: string;

  const mockAptId = 'apt-id';
  const otherAptId = 'apt-id-2';
  const residentId = 'resident-id';
  const otherResidentId = 'resident-id-2';
  const adminId = 'admin-id';

  const createComplaint = async (
    overrides?: Partial<{
      id: string;
      title: string;
      content: string;
      status: 'PENDING' | 'IN_PROGRESS' | 'RESOLVED' | 'REJECTED';
      isPublic: boolean;
      viewsCount: number;
      apartmentId: string;
      userId: string;
    }>,
  ) => {
    return prisma.complaint.create({
      data: {
        id: overrides?.id ?? randomUUID(),
        title: overrides?.title ?? '민원 제목',
        content: overrides?.content ?? '민원 내용',
        status: overrides?.status ?? 'PENDING',
        isPublic: overrides?.isPublic ?? true,
        viewsCount: overrides?.viewsCount ?? 0,
        version: 1,
        apartmentId: overrides?.apartmentId ?? mockAptId,
        userId: overrides?.userId ?? residentId,
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

    await prisma.apartment.upsert({
      where: { id: otherAptId },
      update: {},
      create: {
        id: otherAptId,
        address: '서울시 서초구',
        name: '테스트아파트2',
        description: '테스트용 아파트2',
        officeNumber: '0212345679',
        buildingNumberFrom: 1,
        buildingNumberTo: 5,
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
        role: Role.USER,
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
        role: Role.USER,
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
          create: [{ apartmentId: mockAptId }, { apartmentId: otherAptId }],
        },
      },
    });

    const tokenManager = TokenUtil();
    residentToken = tokenManager.generateAccessToken({
      userId: residentId,
      role: Role.USER,
    });
    otherResidentToken = tokenManager.generateAccessToken({
      userId: otherResidentId,
      role: Role.USER,
    });
    adminToken = tokenManager.generateAccessToken({
      userId: adminId,
      role: 'ADMIN',
    });
  });

  afterEach(async () => {
    await prisma.complaint.deleteMany();
  });

  afterAll(async () => {
    await prisma.complaint.deleteMany();
    await prisma.user.deleteMany();
    await prisma.apartment.deleteMany();
    await prisma.$disconnect();
    await redis.quit();
  });

  describe('GET /complaints - 목록 조회 및 검색', () => {
    describe('권한 및 보안', () => {
      it('토큰이 없으면 401을 반환한다', async () => {
        const res = await request(app).get('/api/v2/complaints').query({
          page: 1,
          limit: 10,
        });

        expect(res.status).toBe(401);
      });
    });
    describe('유효성 검사', () => {
      it('쿼리 파라미터 타입이 올바르지 않으면 422를 반환한다', async () => {
        const res = await request(app)
          .get('/api/v2/complaints')
          .set('Cookie', [`access_token=${residentToken}`])
          .query({
            page: 'abc',
            limit: 'def',
          });

        expect(res.status).toBe(422);
      });
    });
    describe('데이터 조회', () => {
      it('기본 페이징: page와 limit에 맞는 개수와 데이터를 반환한다', async () => {
        await createComplaint({ title: '민원 1' });
        await createComplaint({ title: '민원 2' });
        await createComplaint({ title: '민원 3', userId: otherResidentId });

        const res = await request(app)
          .get('/api/v2/complaints')
          .set('Cookie', [`access_token=${residentToken}`])
          .query({
            page: 1,
            limit: 2,
          });

        expect(res.status).toBe(200);
        expect(res.body.totalCount).toBe(3);
        expect(res.body.data).toHaveLength(2);
        expect(res.body.page).toBe(1);
        expect(res.body.limit).toBe(2);
        expect(res.body.hasNext).toBe(true);
      });
      it('조건부 필터링: status와 isPublic 조건이 겹칠 때 교집합을 반환한다', async () => {
        await createComplaint({ title: '대상', status: 'RESOLVED', isPublic: true });
        await createComplaint({ title: '비공개', status: 'RESOLVED', isPublic: false });
        await createComplaint({ title: '미해결', status: 'PENDING', isPublic: true });

        const res = await request(app)
          .get('/api/v2/complaints')
          .set('Cookie', [`access_token=${residentToken}`])
          .query({
            page: 1,
            limit: 10,
            status: 'RESOLVED',
            isPublic: 'true',
          });

        expect(res.status).toBe(200);
        expect(res.body.totalCount).toBe(1);
        expect(res.body.data).toHaveLength(1);
        expect(res.body.data[0].status).toBe('RESOLVED');
        expect(res.body.data[0].isPublic).toBe(true);
      });
      it('검색어 조회: 제목이나 내용에 searchKeyword가 포함된 결과만 반환한다', async () => {
        await createComplaint({ title: '키워드 포함 제목', content: '기본 내용' });
        await createComplaint({ title: '일반 제목', content: '키워드 포함 내용' });
        await createComplaint({ title: '일반 제목2', content: '일반 내용2' });

        const res = await request(app)
          .get('/api/v2/complaints')
          .set('Cookie', [`access_token=${residentToken}`])
          .query({
            page: 1,
            limit: 10,
            searchKeyword: '키워드',
          });

        expect(res.status).toBe(200);
        expect(res.body.totalCount).toBe(2);
        expect(res.body.data).toHaveLength(2);
      });
    });
    describe('특수 권한 조회', () => {
      it('일반 사용자는 연결된 아파트의 민원만 조회할 수 있다', async () => {
        await createComplaint({ title: '우리 아파트', apartmentId: mockAptId });
        await createComplaint({ title: '다른 아파트', apartmentId: otherAptId, userId: adminId });

        const res = await request(app)
          .get('/api/v2/complaints')
          .set('Cookie', [`access_token=${residentToken}`])
          .query({
            page: 1,
            limit: 10,
          });

        expect(res.status).toBe(200);
        expect(res.body.totalCount).toBe(1);
        expect(res.body.data[0].title).toBe('우리 아파트');
      });
      it('관리자는 연결된 모든 아파트의 민원을 조회할 수 있다', async () => {
        await createComplaint({ title: '우리 아파트', apartmentId: mockAptId });
        await createComplaint({ title: '다른 아파트', apartmentId: otherAptId, userId: adminId });

        const res = await request(app)
          .get('/api/v2/complaints')
          .set('Cookie', [`access_token=${adminToken}`])
          .query({
            page: 1,
            limit: 10,
          });

        expect(res.status).toBe(200);
        expect(res.body.totalCount).toBe(2);
      });
    });
  });

  describe('GET /complaints/:id', () => {
    describe('권한 및 보안', () => {
      it('토큰이 없으면 401을 반환한다', async () => {
        const res = await request(app).get(`/api/v2/complaints/${randomUUID()}`);

        expect(res.status).toBe(401);
      });
    });
    describe('유효성 검사', () => {
      it('존재하지 않는 id로 조회 시 404를 반환한다', async () => {
        const res = await request(app)
          .get(`/api/v2/complaints/${randomUUID()}`)
          .set('Cookie', [`access_token=${residentToken}`]);

        expect(res.status).toBe(404);
      });
    });
    describe('데이터 조회', () => {
      it('민원 상세 내용을 반환하고 조회수가 캐시에서 1 증가한다', async () => {
        const complaint = await createComplaint({ viewsCount: 0 });
        const viewCountKey = `complaint:${complaint.id}:viewCount`;
        await redis.del(viewCountKey);

        const res = await request(app)
          .get(`/api/v2/complaints/${complaint.id}`)
          .set('Cookie', [`access_token=${residentToken}`]);

        const cachedViewCount = await redis.get(viewCountKey);

        expect(res.status).toBe(200);
        expect(res.body.id).toBe(complaint.id);
        expect(res.body.viewsCount).toBe(1);
        expect(cachedViewCount).toBe('1');
      });
    });
  });

  describe('POST /complaints', () => {
    describe('권한 및 보안', () => {
      it('토큰이 없으면 401을 반환한다', async () => {
        const res = await request(app).post('/api/v2/complaints').send({
          title: '민원 제목',
          content: '민원 내용',
          isPublic: true,
          apartmentId: mockAptId,
        });

        expect(res.status).toBe(401);
      });
    });
    describe('유효성 검사', () => {
      it('필수 값이 누락되면 422를 반환한다', async () => {
        const res = await request(app)
          .post('/api/v2/complaints')
          .set('Cookie', [`access_token=${residentToken}`])
          .send({
            content: '민원 내용',
            isPublic: true,
            apartmentId: mockAptId,
          });

        expect(res.status).toBe(422);
      });
      it('존재하지 않는 apartmentId로 요청하면 409를 반환한다', async () => {
        const res = await request(app)
          .post('/api/v2/complaints')
          .set('Cookie', [`access_token=${residentToken}`])
          .send({
            title: '민원 제목',
            content: '민원 내용',
            isPublic: true,
            apartmentId: 'not-exist-apt',
          });

        expect(res.status).toBe(409);
      });
    });
    describe('데이터 저장', () => {
      it('사용자가 민원을 등록하면 201을 반환하고 DB에 저장된다', async () => {
        const res = await request(app)
          .post('/api/v2/complaints')
          .set('Cookie', [`access_token=${residentToken}`])
          .send({
            title: '민원 등록',
            content: '민원 내용',
            isPublic: true,
            apartmentId: mockAptId,
          });

        expect(res.status).toBe(201);

        const saved = await prisma.complaint.findFirst({
          where: {
            title: '민원 등록',
            userId: residentId,
          },
        });

        expect(saved).not.toBeNull();
      });
    });
  });

  describe('PATCH /complaints/:id', () => {
    describe('권한 및 보안', () => {
      it('토큰이 없으면 401을 반환한다', async () => {
        const res = await request(app).patch(`/api/v2/complaints/${randomUUID()}`).send({
          title: '수정 제목',
          content: '수정 내용',
          isPublic: true,
        });

        expect(res.status).toBe(401);
      });
      it('다른 사용자의 민원을 수정하려고 하면 403을 반환한다', async () => {
        const complaint = await createComplaint({ userId: residentId });

        const res = await request(app)
          .patch(`/api/v2/complaints/${complaint.id}`)
          .set('Cookie', [`access_token=${otherResidentToken}`])
          .send({
            title: '수정 제목',
            content: '수정 내용',
            isPublic: true,
          });

        expect(res.status).toBe(403);
      });
    });
    describe('유효성 검사', () => {
      it('존재하지 않는 id로 조회 시 404를 반환한다', async () => {
        const res = await request(app)
          .patch(`/api/v2/complaints/${randomUUID()}`)
          .set('Cookie', [`access_token=${residentToken}`])
          .send({
            title: '수정 제목',
            content: '수정 내용',
            isPublic: true,
          });

        expect(res.status).toBe(404);
      });
      it('필수 값이 누락되면 422를 반환한다', async () => {
        const complaint = await createComplaint({ userId: residentId });

        const res = await request(app)
          .patch(`/api/v2/complaints/${complaint.id}`)
          .set('Cookie', [`access_token=${residentToken}`])
          .send({});

        expect(res.status).toBe(422);
      });
    });
    describe('데이터 저장', () => {
      it('사용자가 민원을 수정하면 204를 반환하고 DB에 저장한다', async () => {
        const complaint = await createComplaint({ userId: residentId });

        const res = await request(app)
          .patch(`/api/v2/complaints/${complaint.id}`)
          .set('Cookie', [`access_token=${residentToken}`])
          .send({
            title: '수정 제목',
            content: '수정 내용',
            isPublic: false,
          });

        expect(res.status).toBe(204);

        const updated = await prisma.complaint.findUnique({
          where: { id: complaint.id },
        });

        expect(updated?.title).toBe('수정 제목');
        expect(updated?.content).toBe('수정 내용');
        expect(updated?.isPublic).toBe(false);
      });
    });
  });

  describe('DELETE /complaints/:id', () => {
    describe('권한 및 보안', () => {
      it('토큰이 없으면 401을 반환한다', async () => {
        const res = await request(app).delete(`/api/v2/complaints/${randomUUID()}`);

        expect(res.status).toBe(401);
      });
      it('작성자나 관리자가 아닌 사용자가 다른 사용자의 민원을 삭제하려 하면 403을 반환한다', async () => {
        const complaint = await createComplaint({ userId: residentId });

        const res = await request(app)
          .delete(`/api/v2/complaints/${complaint.id}`)
          .set('Cookie', [`access_token=${otherResidentToken}`]);

        expect(res.status).toBe(403);
      });
    });
    describe('유효성 검사', () => {
      it('존재하지 않는 id로 조회 시 404를 반환한다.', async () => {
        const res = await request(app)
          .delete(`/api/v2/complaints/${randomUUID()}`)
          .set('Cookie', [`access_token=${residentToken}`]);

        expect(res.status).toBe(404);
      });
    });
    describe('데이터 삭제', () => {
      it('해당 민원을 DB에서 삭제한 후 204를 반환한다', async () => {
        const complaint = await createComplaint({ userId: residentId });

        const res = await request(app)
          .delete(`/api/v2/complaints/${complaint.id}`)
          .set('Cookie', [`access_token=${adminToken}`]);

        expect(res.status).toBe(204);

        const deleted = await prisma.complaint.findUnique({
          where: { id: complaint.id },
        });

        expect(deleted).toBeNull();
      });
    });
  });

  describe('PATCH /complaints/:id/status - 관리자', () => {
    describe('권한 및 보안', () => {
      it('토큰이 없으면 401을 반환한다', async () => {
        const res = await request(app)
          .patch(`/api/v2/complaints/${randomUUID()}/status`)
          .send({ status: 'IN_PROGRESS' });

        expect(res.status).toBe(401);
      });
      it('관리자가 아닌 일반 유저가 호출하면 403을 반환한다', async () => {
        const complaint = await createComplaint();

        const res = await request(app)
          .patch(`/api/v2/complaints/${complaint.id}/status`)
          .set('Cookie', [`access_token=${residentToken}`])
          .send({ status: 'IN_PROGRESS' });

        expect(res.status).toBe(403);
      });
    });
    describe('유효성 검사', () => {
      it('존재하지 않는 id로 조회 시 404를 반환한다.', async () => {
        const res = await request(app)
          .patch(`/api/v2/complaints/${randomUUID()}/status`)
          .set('Cookie', [`access_token=${adminToken}`])
          .send({ status: 'IN_PROGRESS' });

        expect(res.status).toBe(404);
      });
      it('status 타입이 올바르지 않으면 422를 반환한다', async () => {
        const complaint = await createComplaint();

        const res = await request(app)
          .patch(`/api/v2/complaints/${complaint.id}/status`)
          .set('Cookie', [`access_token=${adminToken}`])
          .send({ status: 'INVALID' });

        expect(res.status).toBe(422);
      });
    });
    describe('상태 변경 저장', () => {
      it('관리자가 접수 전(PENDING) 민원을 처리 중(IN_PROGRESS)으로 변경하면 204를 반환하고 DB에 반영된다', async () => {
        const complaint = await createComplaint({ status: 'PENDING' });

        const res = await request(app)
          .patch(`/api/v2/complaints/${complaint.id}/status`)
          .set('Cookie', [`access_token=${adminToken}`])
          .send({ status: 'IN_PROGRESS' });

        expect(res.status).toBe(204);

        const updated = await prisma.complaint.findUnique({
          where: { id: complaint.id },
        });

        expect(updated?.status).toBe('IN_PROGRESS');
      });
    });
    describe('비즈니스 규칙 위반', () => {
      it('이미 처리 완료(RESOLVED)된 민원의 상태를 변경하려 하면 409를 반환한다', async () => {
        const complaint = await createComplaint({ status: 'RESOLVED' });

        const res = await request(app)
          .patch(`/api/v2/complaints/${complaint.id}/status`)
          .set('Cookie', [`access_token=${adminToken}`])
          .send({ status: 'IN_PROGRESS' });

        expect(res.status).toBe(409);
      });
    });
  });
});
