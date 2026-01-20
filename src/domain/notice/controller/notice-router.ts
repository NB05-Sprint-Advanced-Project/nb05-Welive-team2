import { Router } from 'express';
import { NoticeHandler } from './notice-handler';
import { catchHandler } from '../../../utils/controller-util';
import { createAuthMiddleware } from '../../../middlewares/auth-middleware';
import { Middlewares } from '../../../shared/interface/i-middlewares';

export const registerNoticeRoutes = (
  router: Router,
  handler: NoticeHandler,
  middleware: Middlewares,
) => {
  router.get(
    '/notices/:noticeId',
    catchHandler(middleware.auth.authenticate),
    catchHandler(handler.getNotice),
  );

  router.get(
    '/notices/',
    catchHandler(middleware.auth.authenticate),
    catchHandler(handler.getAllNotices),
  );

  router.post(
    '/notices/',
    catchHandler(middleware.auth.authenticate),
    catchHandler(handler.createNotice),
  );

  router.patch(
    '/notices/:noticeId',
    catchHandler(middleware.auth.authenticate),
    catchHandler(handler.updateNotice),
  );

  router.delete(
    '/notices/:noticeId',
    catchHandler(middleware.auth.authenticate),
    catchHandler(handler.deleteNotice),
  );

  router.get(
    '/events',
    catchHandler(middleware.auth.authenticate),
    catchHandler(handler.getEvents),
  );
};
