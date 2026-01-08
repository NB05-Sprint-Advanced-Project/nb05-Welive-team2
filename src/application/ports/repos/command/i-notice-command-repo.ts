import { NoticeModel } from '../../../command/entities/notice/notice-entity';

export interface INoticeCommandRepo {
  create(dto: NoticeModel): Promise<NoticeModel>;
  findById(noticeId: string): Promise<NoticeModel>;
  update(dto: NoticeModel): Promise<void>;
  delete(noticeId: string): Promise<void>;
}
