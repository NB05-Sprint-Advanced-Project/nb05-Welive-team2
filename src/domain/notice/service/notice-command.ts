import { IUnitOfWork } from '../../../shared/interface/i-unit-of-work';
import { INoticeCommandRepo } from '../interface/i-notice-command-repo';
import { CreateNoticeDto, UpdateNoticeDto, DeleteNoticeDto } from '../dto/notice-request';
import { NoticeProps, NoticeEntity } from '../entity/notice';

export const createNoticeCommandService = (uow: IUnitOfWork, repo: INoticeCommandRepo) => {
  const createNotice = async (dto: CreateNoticeDto): Promise<NoticeProps> => {
    return await uow.doWork(
      async () => {
        return await repo.create(
          NoticeEntity.create({
            ...dto,
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
        const { noticeId, ...data } = dto;
        const foundNotice = await repo.findById(noticeId, 'exclusive');
        if (!foundNotice) {
          throw new Error();
        }
        await repo.update(NoticeEntity.update(foundNotice, { ...data }));
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
