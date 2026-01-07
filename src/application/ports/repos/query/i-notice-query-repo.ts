import { NoticeCategory } from '@prisma/client';
import { NoticeView } from '../../../query/views/notice-view';

export interface INoticeQueryRepo {
  findById(noticeId: string): Promise<NoticeView>;
  findAll(
    page: number,
    limit: number,
    searchKeyword: string,
    category: NoticeCategory,
  ): Promise<NoticeView[]>;
}
