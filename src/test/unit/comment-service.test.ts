import { ICommentQueryRepo } from '../../domain/comment/interface/i-comment-query-repo';
import { createCommentQueryService } from '../../domain/comment/service/comment-query';
import { ICommentCommandRepo } from '../../domain/comment/interface/i-comment-command-repo';
import { createCommentCommandService } from '../../domain/comment/service/comment-command';
import { CommentProps } from '../../domain/comment/comment-entity';
import { BusinessExceptionType } from '../../shared/exception/business-exception/exception-info';
import { TechnicalExceptionType } from '../../shared/exception/technical-exception/exception-info';
import { TechnicalException as createTechnicalException } from '../../shared/exception/technical-exception/technical-exception';
import { IUnitOfWork } from '../../shared/interface/i-unit-of-work';
import { Role } from '../../domain/user/entity/base-user';

describe('comment service 단위 테스트', () => {
  describe('QUERY service', () => {
    const mockRepo = {
      findAll: jest.fn(),
    } as unknown as ICommentQueryRepo;

    const service = createCommentQueryService(mockRepo);

    const mockQuery = {
      page: 1,
      limit: 20,
      resourceId: 'resource',
      resourceType: 'NOTICE',
    };

    afterEach(() => {
      jest.clearAllMocks();
    });

    describe('getAllComments', () => {
      it('성공: 레포지토리가 반환한 댓글 목록을 그대로 반환한다', async () => {
        const mockResult = {
          data: [],
          totalCount: 0,
          page: 1,
          limit: 20,
          hasNext: false,
        };
        (mockRepo.findAll as jest.Mock).mockResolvedValue(mockResult);

        const result = await service.getAllComments(mockQuery);

        expect(mockRepo.findAll).toHaveBeenCalledWith(1, 20, 'resource', 'NOTICE');
        expect(result).toEqual(mockResult);
      });

      it('예외: 레포지토리에서 RECORD_NOT_FOUND가 발생하면 BusinessException을 던져야 한다', async () => {
        const technicalErr = createTechnicalException({
          type: TechnicalExceptionType.RECORD_NOT_FOUND,
        });
        (mockRepo.findAll as jest.Mock).mockRejectedValue(technicalErr);

        await expect(service.getAllComments(mockQuery)).rejects.toMatchObject({
          type: BusinessExceptionType.COMMENTS_LIST_NOT_FOUND,
        });
      });

      it('예외: 예상치 못한 에러는 그대로 다시 던져야 한다', async () => {
        const unknownErr = new Error('DB Connection Error');
        (mockRepo.findAll as jest.Mock).mockRejectedValue(unknownErr);

        await expect(service.getAllComments(mockQuery)).rejects.toThrow('DB Connection Error');
      });
    });
  });

  describe('COMMAND service', () => {
    const mockRepo = {
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    } as unknown as ICommentCommandRepo;

    const mockUow = {
      doWork: jest.fn(),
    } as unknown as IUnitOfWork;

    const service = createCommentCommandService(mockUow, mockRepo);

    const baseComment: CommentProps = {
      id: 'comment-1',
      content: 'before',
      createdAt: new Date('2024-01-01T00:00:00Z'),
      updatedAt: new Date('2024-01-01T00:00:00Z'),
      userId: 'user-1',
      noticeId: 'notice-1',
      complaintId: null,
    };

    afterEach(() => {
      jest.clearAllMocks();
    });

    describe('createComment', () => {
      it('성공: 생성된 댓글을 반환한다', async () => {
        const userId = 'user-1';
        const args = { content: 'hello', resourceId: 'notice-1', resourceType: 'NOTICE' as const };
        const saved: CommentProps = {
          ...baseComment,
          content: 'hello',
        };

        (mockRepo.create as jest.Mock).mockResolvedValue(saved);

        const result = await service.createComment(userId, args);

        expect(mockRepo.create).toHaveBeenCalledWith(
          expect.objectContaining({
            content: 'hello',
            userId,
            noticeId: 'notice-1',
            complaintId: null,
          }),
        );
        expect(result).toEqual(saved);
      });

      it('예외: FOREIGN_KEY_VIOLATION이면 FAIL_SAVE_COMMENT를 던진다', async () => {
        (mockRepo.create as jest.Mock).mockRejectedValue(
          createTechnicalException({ type: TechnicalExceptionType.FOREIGN_KEY_VIOLATION }),
        );

        await expect(
          service.createComment('user-1', {
            content: 'hi',
            resourceId: 'bad',
            resourceType: 'NOTICE',
          }),
        ).rejects.toMatchObject({
          type: BusinessExceptionType.FAIL_SAVE_COMMENT,
        });
      });

      it('예외: 예상치 못한 에러는 그대로 다시 던져야 한다', async () => {
        const unknownErr = new Error('DB Connection Error');
        (mockRepo.create as jest.Mock).mockRejectedValue(unknownErr);

        await expect(
          service.createComment('user-1', {
            content: 'hi',
            resourceId: 'notice-1',
            resourceType: 'NOTICE',
          }),
        ).rejects.toThrow('DB Connection Error');
      });
    });

    describe('updateComment', () => {
      it('예외: 존재하지 않는 댓글이면 REQ_INFO_INVALID를 던진다', async () => {
        (mockRepo.findById as jest.Mock).mockResolvedValue(null);

        await expect(
          service.updateComment('user-1', 'comment-1', { content: 'new' }),
        ).rejects.toMatchObject({
          type: BusinessExceptionType.REQ_INFO_INVALID,
        });
      });

      it('예외: 본인 댓글이 아니면 FORBIDDEN을 던진다', async () => {
        (mockRepo.findById as jest.Mock).mockResolvedValue({
          ...baseComment,
          userId: 'other-user',
        });

        await expect(
          service.updateComment('user-1', 'comment-1', { content: 'new' }),
        ).rejects.toMatchObject({
          type: BusinessExceptionType.FORBIDDEN,
        });
      });

      it('성공: 댓글 내용을 수정한다', async () => {
        (mockRepo.findById as jest.Mock).mockResolvedValue(baseComment);
        (mockRepo.update as jest.Mock).mockResolvedValue(undefined);

        await service.updateComment('user-1', 'comment-1', { content: 'new' });

        expect(mockRepo.update).toHaveBeenCalledWith(
          expect.objectContaining({
            id: 'comment-1',
            content: 'new',
            userId: 'user-1',
          }),
        );
      });

      it('예외: RECORD_NOT_FOUND면 FAIL_SAVE_COMMENT를 던진다', async () => {
        (mockRepo.findById as jest.Mock).mockResolvedValue(baseComment);
        (mockRepo.update as jest.Mock).mockRejectedValue(
          createTechnicalException({ type: TechnicalExceptionType.RECORD_NOT_FOUND }),
        );

        await expect(
          service.updateComment('user-1', 'comment-1', { content: 'new' }),
        ).rejects.toMatchObject({
          type: BusinessExceptionType.FAIL_SAVE_COMMENT,
        });
      });
    });

    describe('deleteComment', () => {
      it('예외: 존재하지 않는 댓글이면 REQ_INFO_INVALID를 던진다', async () => {
        (mockRepo.findById as jest.Mock).mockResolvedValue(null);

        await expect(service.deleteComment('user-1', Role.USER, 'comment-1')).rejects.toMatchObject(
          {
            type: BusinessExceptionType.REQ_INFO_INVALID,
          },
        );
      });

      it('예외: 본인 댓글이 아니면 FORBIDDEN을 던진다', async () => {
        (mockRepo.findById as jest.Mock).mockResolvedValue({
          ...baseComment,
          userId: 'other-user',
        });

        await expect(service.deleteComment('user-1', Role.USER, 'comment-1')).rejects.toMatchObject(
          {
            type: BusinessExceptionType.FORBIDDEN,
          },
        );
      });

      it('성공: 댓글을 삭제한다', async () => {
        (mockRepo.findById as jest.Mock).mockResolvedValue(baseComment);
        (mockRepo.delete as jest.Mock).mockResolvedValue(undefined);

        await service.deleteComment('user-1', 'ADMIN', 'comment-1');

        expect(mockRepo.delete).toHaveBeenCalledWith('comment-1');
      });

      it('예외: RECORD_NOT_FOUND면 DELETED를 던진다', async () => {
        (mockRepo.findById as jest.Mock).mockResolvedValue(baseComment);
        (mockRepo.delete as jest.Mock).mockRejectedValue(
          createTechnicalException({ type: TechnicalExceptionType.RECORD_NOT_FOUND }),
        );

        await expect(service.deleteComment('user-1', 'ADMIN', 'comment-1')).rejects.toMatchObject({
          type: BusinessExceptionType.DELETED,
        });
      });
    });
  });
});
