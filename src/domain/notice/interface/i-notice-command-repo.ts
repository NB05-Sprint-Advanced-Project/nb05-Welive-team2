import { NoticeProps } from '../entity/notice';

export interface INoticeCommandRepo {
  findById(noticeId: string, pessimisticLock?: 'share' | 'exclusive'): Promise<NoticeProps | null>;
  create(
    props: NoticeProps,
    userId: string,
    pessimisticLock?: 'share' | 'exclusive',
  ): Promise<NoticeProps>;
  update(props: NoticeProps, pessimisticLock?: 'share' | 'exclusive'): Promise<void>;
  deleteNotice(noticeId: string, pessimisticLock?: 'share' | 'exclusive'): Promise<void>;
  updateViewsCountBulk(props: { noticeId: string; viewsCount: number }[]): Promise<void>;
}
