import { NoticeProps } from '../../../command/entities/notice/notice-entity';

export interface INoticeCommandRepo {
  create(dto: NoticeProps): Promise<NoticeProps>;
  findById(noticeId: string): Promise<NoticeProps>;
  update(dto: NoticeProps): Promise<void>;
  delete(noticeId: string): Promise<void>;
}
