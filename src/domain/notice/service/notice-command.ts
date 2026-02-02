import { IUnitOfWork } from '../../../shared/interface/i-unit-of-work';
import { INoticeCommandRepo } from '../interface/i-notice-command-repo';
import { CreateNoticeDto, UpdateNoticeDto, DeleteNoticeDto } from '../dto/notice-request';
import { NoticeProps, NoticeEntity } from '../entity/notice';
import {
  isTechnicalException,
  TechnicalException,
} from '../../../shared/exception/technical-exception/technical-exception';
import { TechnicalExceptionType } from '../../../shared/exception/technical-exception/exception-info';
import { BusinessException } from '../../../shared/exception/business-exception/business-exception';
import { BusinessExceptionType } from '../../../shared/exception/business-exception/exception-info';
import { StateEntity, WorkType } from '../../state/entity/state';
import { randomUUID } from 'crypto';
import { Role } from '../../user/entity/base-user';
import { IStateCommandRepo } from '../../state/interface/i-state-command-repo';
import { IRedisExternal } from '../../../shared/interface/i-redis';

export const createNoticeCommandService = (
  uow: IUnitOfWork,
  noticeRepo: INoticeCommandRepo,
  stateRepo: IStateCommandRepo,
  redisExternal: IRedisExternal,
) => {
  const createNotice = async (dto: CreateNoticeDto, userId: string): Promise<NoticeProps> => {
    return await uow.doWork(
      async () => {
        const notice = await noticeRepo.create(
          NoticeEntity.create({
            ...dto,
          }),
          userId,
        );

        const stateEntity = StateEntity.create({
          workType: WorkType.ALARM,
          payload: {
            id: randomUUID(),
            receiverType: Role.USER,
            message: `[공지사항] ${notice.title} 등록됨`,
          } as unknown as JSON,
        });

        await stateRepo.create(stateEntity);
        return notice;
      },
      {
        transactionOptions: { useTransaction: true, isolationLevel: 'ReadCommitted' },
        useOptimisticLock: false,
      },
    );
  };

  const updateNotice = async (dto: UpdateNoticeDto): Promise<void> => {
    try {
      return await uow.doWork(async () => {
        const { noticeId, ...data } = dto;
        const foundNotice = await noticeRepo.findById(noticeId);
        if (!foundNotice) {
          throw BusinessException({
            type: BusinessExceptionType.NOTICE_NOT_FOUND,
          });
        }
        await noticeRepo.update(NoticeEntity.update(foundNotice, { ...data }));
        await redisExternal.del(`noticeId:${noticeId}`);
      });
    } catch (err) {
      if (isTechnicalException(err)) {
        if (err.type === TechnicalExceptionType.OPTIMISTIC_LOCK_FAILED) {
          throw BusinessException({ type: BusinessExceptionType.CONCURRENT_MODIFICATION });
        }

        throw TechnicalException({
          type: TechnicalExceptionType.UNKNOWN_ERROR,
          error: err,
        });
      }
      throw err;
    }
  };

  const deleteNotice = async (dto: DeleteNoticeDto): Promise<void> => {
    return await uow.doWork(
      async () => {
        const { noticeId } = dto;
        await noticeRepo.deleteNotice(noticeId);
        await redisExternal.del(`noticeId:${noticeId}`);
      },
      { transactionOptions: { useTransaction: false }, useOptimisticLock: false },
    );
  };
  return {
    createNotice,
    updateNotice,
    deleteNotice,
  };
};

export type NoticeCommandService = ReturnType<typeof createNoticeCommandService>;
