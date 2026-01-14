import { NoticeController } from './controllers/notice-controller';
import { PollController } from './controllers/poll-controller';
import { UserController } from './controllers/user-controller';

export type Controllers = {
  userController: UserController;
  pollController: PollController;
  noticeController: NoticeController;
};
