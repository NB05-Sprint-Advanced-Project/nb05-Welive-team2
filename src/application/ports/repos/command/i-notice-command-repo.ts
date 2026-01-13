import { NoticeProps } from '../../../command/entities/notice/notice-entity';

export interface INoticeCommandRepo {
  findById(noticeId: string): Promise<NoticeProps | null>;
  create(props: NoticeProps): Promise<NoticeProps>;
  update(props: NoticeProps): Promise<void>;
  deleteNotice(noticeId: string): Promise<void>;
}
