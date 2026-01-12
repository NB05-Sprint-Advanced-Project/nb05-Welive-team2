import { NoticeCategory } from '@prisma/client';
import { NoticeView } from '../views/notice-view';
import { INoticeQueryRepo } from '../../ports/repos/query/i-notice-query-repo';

export const createNoticeQueryService = (repo: INoticeQueryRepo) => {
  const getNotice = async (noticeId: string): Promise<NoticeView> => {
    const notice = await repo.findById(noticeId);

    if (!notice) {
      throw new Error();
    }

    return notice;
  };

  const getAllNotice = async ({
    page,
    limit,
    searchKeyword,
    category,
  }: {
    page: number;
    limit: number;
    searchKeyword: string;
    category: NoticeCategory;
  }): Promise<NoticeView[]> => {
    const notices = await repo.findAll(page, limit, searchKeyword, category);
    return notices;
  };

  return { getNotice, getAllNotice };
};

export type NoticeQueryService = ReturnType<typeof createNoticeQueryService>;
