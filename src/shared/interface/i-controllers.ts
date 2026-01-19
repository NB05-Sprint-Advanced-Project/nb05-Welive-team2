import { NoticeController } from '../../domain/notice/controller/notice-controller';
import { PollController } from '../../domain/poll/controller/poll-controller';
import { UserController } from '../../domain/user/controller/user-controller';

export type Controllers = {
  userController: UserController;
  pollController: PollController;
  noticeController: NoticeController;
};
