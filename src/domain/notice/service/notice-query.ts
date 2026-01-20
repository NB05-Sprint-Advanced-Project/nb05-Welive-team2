import { NoticeCategory } from '@prisma/client';
import { NoticesView, NoticeView } from '../dto/notice-view';
import { INoticeQueryRepo } from '../interface/i-notice-query-repo';
import { BusinessException } from '../../../shared/exception/business-exception/business-exception';
import { BusinessExceptionType } from '../../../shared/exception/business-exception/exception-info';

export const createNoticeQueryService = (repo: INoticeQueryRepo) => {
  const getNotice = async (noticeId: string): Promise<NoticeView> => {
    const notice = await repo.findById(noticeId);

    if (!notice) {
      throw BusinessException({
        type: BusinessExceptionType.NOTICE_NOT_FOUND,
      });
    }

    return notice;
  };

  const getAllNotices = async ({
    page,
    limit,
    searchKeyword,
    category,
  }: {
    page: number;
    limit: number;
    searchKeyword: string;
    category: NoticeCategory | 'ALL';
  }): Promise<NoticesView> => {
    return await repo.findAll(page, limit, searchKeyword, category);
  };

  const getEvents = async ({
    apartmentId,
    year,
    month,
  }: {
    apartmentId: string;
    year: number;
    month: number;
  }) => {
    return await repo.findEvents(apartmentId, year, month);
  };

  return { getNotice, getAllNotices, getEvents };
};

export type NoticeQueryService = ReturnType<typeof createNoticeQueryService>;
