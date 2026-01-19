import { NoticeCommandService } from '../service/notice-command';
import { NoticeQueryService } from '../service/notice-query';
import { createBaseController } from '../../../utils/controller-util';
import { Middlewares } from '../../../shared/interface/i-middlewares';
import { createNoticeHandler } from './notice-handler';
import { registerNoticeRoutes } from './notice-router';

export const createNoticeController = (
  middlewares: Middlewares,
  noticeQueryService: NoticeQueryService,
  noticeCommandService: NoticeCommandService,
) => {
  const { path, router } = createBaseController('/api/v2');

  const handler = createNoticeHandler(middlewares, noticeQueryService, noticeCommandService);

  registerNoticeRoutes(router, handler);

  return { path, router };
};

export type NoticeController = ReturnType<typeof createNoticeController>;
