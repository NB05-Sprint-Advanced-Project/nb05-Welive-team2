import { NoticeCategory } from '@prisma/client';
import { NoticesView, NoticeView } from '../../../query/views/notice-view';

export interface INoticeQueryRepo {
  findById(noticeId: string): Promise<NoticeView | null>;
  findAll(
    page: number,
    limit: number,
    searchKeyword: string,
    category: NoticeCategory,
  ): Promise<NoticesView>;
}
