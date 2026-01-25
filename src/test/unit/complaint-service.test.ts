import { createComplaintQueryService } from '../../domain/complaint/service/complaint-query';
import { createComplaintCommandService } from '../../domain/complaint/service/complaint-command';
import { IComplaintQueryRepo } from '../../domain/complaint/interface/i-complaint-query-repo';
import { IComplaintCommandRepo } from '../../domain/complaint/interface/i-complaint-command-repo';
import { ComplaintProps } from '../../domain/complaint/complaint-entity';
import { ComplaintView } from '../../domain/complaint/dto/complaint-veiw';
import { IRedisExternal } from '../../shared/interface/i-redis';
import { IRedisLocker } from '../../shared/interface/i-redis-locker';
import { IUnitOfWork } from '../../shared/interface/i-unit-of-work';
import { BusinessExceptionType } from '../../shared/exception/business-exception/exception-info';
import { TechnicalExceptionType } from '../../shared/exception/technical-exception/exception-info';
import { TechnicalException as createTechnicalException } from '../../shared/exception/technical-exception/technical-exception';

describe('complaint service 단위 테스트', () => {
  describe('QUERY service', () => {
    const mockRepo = {
      findById: jest.fn(),
      findAll: jest.fn(),
    } as unknown as IComplaintQueryRepo;

    const mockRedisLocker = {
      doWork: jest.fn(),
    } as unknown as IRedisLocker;

    const mockRedis = {
      setIfNotExist: jest.fn(),
      increase: jest.fn(),
      addToSet: jest.fn(),
    } as unknown as IRedisExternal;

    const service = createComplaintQueryService(mockRedisLocker, mockRedis, mockRepo);

    beforeEach(() => {
      (mockRedis.setIfNotExist as jest.Mock).mockResolvedValue(true);
      (mockRedis.increase as jest.Mock).mockResolvedValue(6);
      (mockRedis.addToSet as jest.Mock).mockResolvedValue(1);
      (mockRedisLocker.doWork as jest.Mock).mockImplementation(async ({ work }) => {
        if (typeof work === 'function') {
          return await work();
        }
        return await work;
      });
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    describe('getComplaint', () => {
      it('성공: 민원을 조회한다', async () => {
        const foundComplaint: ComplaintView = {
          id: 'complaint-1',
          createdAt: new Date('2024-01-01T00:00:00Z'),
          updatedAt: new Date('2024-01-01T00:00:00Z'),
          title: 'title',
          content: 'content',
          status: 'PENDING',
          isPublic: true,
          viewsCount: 5,
          apartmentId: 'apt-1',
          complainant: { id: 'user-1', name: 'tester' },
          commentCount: 0,
        };

        (mockRepo.findById as jest.Mock).mockResolvedValue(foundComplaint);

        const result = await service.getComplaint('complaint-1');

        expect(mockRepo.findById).toHaveBeenCalledWith('complaint-1');
        expect(result.id).toBe('complaint-1');
      });

      it('예외: 민원이 존재하지 않으면 COMPLAINT_NOT_FOUND를 던진다', async () => {
        (mockRepo.findById as jest.Mock).mockResolvedValue(null);

        await expect(service.getComplaint('not-exist')).rejects.toMatchObject({
          type: BusinessExceptionType.COMPLAINT_NOT_FOUND,
        });
      });
    });

    describe('getAllComplaints', () => {
      const params = {
        page: 1,
        limit: 10,
      };

      it('성공: 레포지토리 결과를 그대로 반환한다', async () => {
        const mockResult = {
          data: [],
          totalCount: 0,
          page: 1,
          limit: 10,
          hasNext: false,
        };
        (mockRepo.findAll as jest.Mock).mockResolvedValue(mockResult);

        const result = await service.getAllComplaints('user-1', params);

        expect(mockRepo.findAll).toHaveBeenCalledWith('user-1', 1, 10, {
          status: undefined,
          isPublic: undefined,
        });
        expect(result).toEqual(mockResult);
      });

      it('예외: FOREIGN_KEY_VIOLATION이면 COMPLAINTS_LIST_NOT_FOUND를 던진다', async () => {
        (mockRepo.findAll as jest.Mock).mockRejectedValue(
          createTechnicalException({ type: TechnicalExceptionType.FOREIGN_KEY_VIOLATION }),
        );

        await expect(service.getAllComplaints('user-1', params)).rejects.toMatchObject({
          type: BusinessExceptionType.COMPLAINTS_LIST_NOT_FOUND,
        });
      });
    });
  });

  describe('COMMAND service', () => {
    const mockRepo = {
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      updateStatus: jest.fn(),
      updateViewCountBulk: jest.fn(),
    } as unknown as IComplaintCommandRepo;

    const mockUow = {
      doWork: jest.fn().mockImplementation(async (work) => await work()),
    } as unknown as IUnitOfWork;

    const mockRedis = {
      del: jest.fn(),
    } as unknown as IRedisExternal;

    const service = createComplaintCommandService(mockUow, mockRedis, mockRepo);

    const baseComplaint: ComplaintProps = {
      id: 'complaint-1',
      title: 'title',
      content: 'content',
      status: 'PENDING',
      isPublic: true,
      createdAt: new Date('2024-01-01T00:00:00Z'),
      updatedAt: new Date('2024-01-01T00:00:00Z'),
      viewsCount: 0,
      version: 1,
      apartmentId: 'apt-1',
      userId: 'user-1',
    };

    afterEach(() => {
      jest.clearAllMocks();
    });

    describe('createComplaint', () => {
      it('성공: 생성된 민원을 반환한다', async () => {
        const saved = { ...baseComplaint };
        (mockRepo.create as jest.Mock).mockResolvedValue(saved);

        const result = await service.createComplaint('user-1', {
          title: 'title',
          content: 'content',
          isPublic: true,
          apartmentId: 'apt-1',
        });

        expect(mockRepo.create).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'title',
            content: 'content',
            isPublic: true,
            apartmentId: 'apt-1',
            userId: 'user-1',
          }),
        );
        expect(result).toEqual(saved);
      });

      it('예외: FOREIGN_KEY_VIOLATION이면 FAIL_SAVE_COMPALINT를 던진다', async () => {
        (mockRepo.create as jest.Mock).mockRejectedValue(
          createTechnicalException({ type: TechnicalExceptionType.FOREIGN_KEY_VIOLATION }),
        );

        await expect(
          service.createComplaint('user-1', {
            title: 'title',
            content: 'content',
            isPublic: true,
            apartmentId: 'bad-apt',
          }),
        ).rejects.toMatchObject({
          type: BusinessExceptionType.FAIL_SAVE_COMPALINT,
        });
      });
    });

    describe('updateComplaint', () => {
      it('예외: 존재하지 않는 민원이면 REQ_INFO_INVALID를 던진다', async () => {
        (mockRepo.findById as jest.Mock).mockResolvedValue(null);

        await expect(
          service.updateComplaint('user-1', 'complaint-1', {
            title: 'new',
            content: 'new',
            isPublic: true,
          }),
        ).rejects.toMatchObject({
          type: BusinessExceptionType.REQ_INFO_INVALID,
        });
      });

      it('예외: 작성자가 아니면 FORBIDDEN을 던진다', async () => {
        (mockRepo.findById as jest.Mock).mockResolvedValue({
          ...baseComplaint,
          userId: 'other-user',
        });

        await expect(
          service.updateComplaint('user-1', 'complaint-1', {
            title: 'new',
            content: 'new',
            isPublic: true,
          }),
        ).rejects.toMatchObject({
          type: BusinessExceptionType.FORBIDDEN,
        });
      });

      it('예외: 접수된 민원은 수정할 수 없다', async () => {
        (mockRepo.findById as jest.Mock).mockResolvedValue({
          ...baseComplaint,
          status: 'IN_PROGRESS',
        });

        await expect(
          service.updateComplaint('user-1', 'complaint-1', {
            title: 'new',
            content: 'new',
            isPublic: true,
          }),
        ).rejects.toMatchObject({
          type: BusinessExceptionType.DONT_MODIFY_COMPLAINT,
        });
      });

      it('성공: 민원을 수정하고 캐시를 삭제한다', async () => {
        (mockRepo.findById as jest.Mock).mockResolvedValue(baseComplaint);
        (mockRepo.update as jest.Mock).mockResolvedValue(undefined);
        (mockRedis.del as jest.Mock).mockResolvedValue(1);

        await service.updateComplaint('user-1', 'complaint-1', {
          title: 'new',
          content: 'new',
          isPublic: false,
        });

        expect(mockRepo.update).toHaveBeenCalledWith(
          expect.objectContaining({
            id: 'complaint-1',
            title: 'new',
            content: 'new',
            isPublic: false,
          }),
        );
      });

      it('예외: RECORD_NOT_FOUND면 FAIL_SAVE_COMPALINT를 던진다', async () => {
        (mockRepo.findById as jest.Mock).mockResolvedValue(baseComplaint);
        (mockRepo.update as jest.Mock).mockRejectedValue(
          createTechnicalException({ type: TechnicalExceptionType.RECORD_NOT_FOUND }),
        );

        await expect(
          service.updateComplaint('user-1', 'complaint-1', {
            title: 'new',
            content: 'new',
            isPublic: true,
          }),
        ).rejects.toMatchObject({
          type: BusinessExceptionType.FAIL_SAVE_COMPALINT,
        });
      });
    });

    describe('deleteComplaint', () => {
      it('예외: 존재하지 않는 민원이면 REQ_INFO_INVALID를 던진다', async () => {
        (mockRepo.findById as jest.Mock).mockResolvedValue(null);

        await expect(
          service.deleteComplaint('user-1', 'RESIDENT', 'complaint-1'),
        ).rejects.toMatchObject({ type: BusinessExceptionType.REQ_INFO_INVALID });
      });

      it('예외: 작성자가 아니면 FORBIDDEN을 던진다', async () => {
        (mockRepo.findById as jest.Mock).mockResolvedValue({
          ...baseComplaint,
          userId: 'other-user',
        });

        await expect(
          service.deleteComplaint('user-1', 'RESIDENT', 'complaint-1'),
        ).rejects.toMatchObject({ type: BusinessExceptionType.FORBIDDEN });
      });

      it('성공: 민원을 삭제하고 캐시를 삭제한다', async () => {
        (mockRepo.findById as jest.Mock).mockResolvedValue(baseComplaint);
        (mockRepo.delete as jest.Mock).mockResolvedValue(undefined);
        (mockRedis.del as jest.Mock).mockResolvedValue(1);

        await service.deleteComplaint('user-1', 'ADMIN', 'complaint-1');

        expect(mockRepo.delete).toHaveBeenCalledWith('complaint-1');
      });

      it('예외: RECORD_NOT_FOUND면 DELETED를 던진다', async () => {
        (mockRepo.findById as jest.Mock).mockResolvedValue(baseComplaint);
        (mockRepo.delete as jest.Mock).mockRejectedValue(
          createTechnicalException({ type: TechnicalExceptionType.RECORD_NOT_FOUND }),
        );

        await expect(
          service.deleteComplaint('user-1', 'ADMIN', 'complaint-1'),
        ).rejects.toMatchObject({ type: BusinessExceptionType.DELETED });
      });
    });

    describe('updateComplaintStatus', () => {
      it('예외: 관리자만 상태를 변경할 수 있다', async () => {
        await expect(
          service.updateComplaintStatus('RESIDENT', 'complaint-1', 'IN_PROGRESS'),
        ).rejects.toMatchObject({ type: BusinessExceptionType.FORBIDDEN });
      });

      it('예외: 존재하지 않는 민원이면 REQ_INFO_INVALID를 던진다', async () => {
        (mockRepo.findById as jest.Mock).mockResolvedValue(null);

        await expect(
          service.updateComplaintStatus('ADMIN', 'complaint-1', 'IN_PROGRESS'),
        ).rejects.toMatchObject({ type: BusinessExceptionType.REQ_INFO_INVALID });
      });

      it('예외: IN_PROGRESS에서 PENDING으로 변경 불가', async () => {
        (mockRepo.findById as jest.Mock).mockResolvedValue({
          ...baseComplaint,
          status: 'IN_PROGRESS',
        });

        await expect(
          service.updateComplaintStatus('ADMIN', 'complaint-1', 'PENDING'),
        ).rejects.toMatchObject({ type: BusinessExceptionType.DONT_MODIFY_PENDING });
      });

      it('성공: 상태를 변경하고 캐시를 삭제한다', async () => {
        (mockRepo.findById as jest.Mock).mockResolvedValue({
          ...baseComplaint,
          status: 'PENDING',
        });
        (mockRepo.updateStatus as jest.Mock).mockResolvedValue(undefined);
        (mockRedis.del as jest.Mock).mockResolvedValue(1);

        await service.updateComplaintStatus('ADMIN', 'complaint-1', 'IN_PROGRESS');

        expect(mockRepo.updateStatus).toHaveBeenCalledWith(
          expect.objectContaining({
            id: 'complaint-1',
            status: 'IN_PROGRESS',
          }),
        );
      });

      it('예외: RECORD_NOT_FOUND면 FAIL_SAVE_COMPALINT를 던진다', async () => {
        (mockRepo.findById as jest.Mock).mockResolvedValue(baseComplaint);
        (mockRepo.updateStatus as jest.Mock).mockRejectedValue(
          createTechnicalException({ type: TechnicalExceptionType.RECORD_NOT_FOUND }),
        );

        await expect(
          service.updateComplaintStatus('ADMIN', 'complaint-1', 'IN_PROGRESS'),
        ).rejects.toMatchObject({ type: BusinessExceptionType.FAIL_SAVE_COMPALINT });
      });
    });
  });
});
