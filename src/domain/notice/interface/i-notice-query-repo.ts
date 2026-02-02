import { NoticeCategory } from '@prisma/client';
import { NoticesView, NoticeView } from '../dto/notice-view';
import { EventView } from '../dto/event-view';

export interface INoticeQueryRepo {
  findById(noticeId: string): Promise<NoticeView | null>;
  findAll(
    page: number,
    limit: number,
    searchKeyword: string,
    category: NoticeCategory | 'ALL',
    userId: string,
  ): Promise<NoticesView>;
  findEvents(apartmentId: string, year: number, month: number): Promise<EventView[]>;
}
