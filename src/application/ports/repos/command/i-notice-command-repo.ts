import { NoticeProps } from '../../../command/entities/notice/notice-entity';

export interface INoticeCommandRepo {
  findById(noticeId: string, pessimisticLock?: 'share' | 'exclusive'): Promise<NoticeProps | null>;
  create(props: NoticeProps, pessimisticLock?: 'share' | 'exclusive'): Promise<NoticeProps>;
  update(props: NoticeProps, pessimisticLock?: 'share' | 'exclusive'): Promise<void>;
  deleteNotice(noticeId: string, pessimisticLock?: 'share' | 'exclusive'): Promise<void>;
}
