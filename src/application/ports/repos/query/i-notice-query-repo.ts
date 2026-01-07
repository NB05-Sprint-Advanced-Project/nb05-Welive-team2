<<<<<<< HEAD
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
=======
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
>>>>>>> cef6f2a ([fix] schema에 options 테이블 추가)
