import {
  CreateNoticeDto,
  DeleteNoticeDto,
  UpdateNoticeDto,
} from '../../../inbound/requests/notice-request';
import { INoticeCommandRepo } from '../../ports/repos/command/i-notice-command-repo';
import { NoticeEntity, NoticeProps } from '../entities/notice/notice-entity';

export const createNoticeCommandService = (repo: INoticeCommandRepo) => {
  const createNotice = async (dto: CreateNoticeDto): Promise<NoticeProps> => {
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
  };

  const updateNotice = async (dto: UpdateNoticeDto): Promise<void> => {
    const { title, content, category, isPinned, event, noticeId } = dto;
    const foundNotice = await repo.findById(noticeId);
    await repo.update(
      NoticeEntity.update(foundNotice, { title, content, category, isPinned, event }),
    );
  };

  const deleteNotice = async (dto: DeleteNoticeDto): Promise<void> => {
    const { noticeId } = dto;
    await repo.delete(noticeId);
  };
  return {
    createNotice,
    updateNotice,
    deleteNotice,
  };
};

export type NoticeCommandService = ReturnType<typeof createNoticeCommandService>;
