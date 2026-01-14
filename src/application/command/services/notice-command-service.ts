import {
  CreateNoticeDto,
  DeleteNoticeDto,
  UpdateNoticeDto,
} from '../../../inbound/requests/notice-request';
import { IUnitOfWork } from '../../ports/i-unit-of-work';
import { INoticeCommandRepo } from '../../ports/repos/command/i-notice-command-repo';
import { NoticeEntity, NoticeProps } from '../entities/notice/notice-entity';

export const createNoticeCommandService = (uow: IUnitOfWork, repo: INoticeCommandRepo) => {
  const createNotice = async (dto: CreateNoticeDto): Promise<NoticeProps> => {
    return await uow.doWork(
      async () => {
        const { title, content, category, isPinned, apartmentId, event } = dto;
        return await repo.create(
          NoticeEntity.create({
            title,
            content,
            category,
            isPinned,
            apartmentId,
            event,
          }),
        );
      },
      {
        transactionOptions: { useTransaction: true, isolationLevel: 'ReadCommitted' },
        useOptimisticLock: false,
      },
    );
  };

  const updateNotice = async (dto: UpdateNoticeDto): Promise<void> => {
    return await uow.doWork(
      async () => {
        const { title, content, category, isPinned, event, noticeId } = dto;
        const foundNotice = await repo.findById(noticeId);
        if (!foundNotice) {
          throw new Error();
        }
        await repo.update(
          NoticeEntity.update(foundNotice, { title, content, category, isPinned, event }),
        );
      },
      {
        transactionOptions: { useTransaction: true, isolationLevel: 'ReadCommitted' },
        useOptimisticLock: true,
      },
    );
  };

  const deleteNotice = async (dto: DeleteNoticeDto): Promise<void> => {
    return await uow.doWork(
      async () => {
        const { noticeId } = dto;
        await repo.deleteNotice(noticeId);
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
