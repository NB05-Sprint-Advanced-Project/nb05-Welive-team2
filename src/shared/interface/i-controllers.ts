import { NoticeController } from '../../domain/notice/controller/notice';
import { PollController } from '../../domain/poll/poll-controller';
import { UserController } from '../../domain/user/controller/user-controller';

export type Controllers = {
  userController: UserController;
  pollController: PollController;
  noticeController: NoticeController;
};
