import { Router } from 'express';
import { NoticeHandler } from './notice-handler';
import { Middlewares } from '../../../shared/interface/i-middlewares';
import { catchHandler } from '../../../shared/utils/controller-util';

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
    '/notices',
    catchHandler(middleware.auth.authenticate),
    catchHandler(handler.getAllNotices),
  );

  router.post(
    '/notices',
    catchHandler(middleware.auth.authAdmin),
    catchHandler(handler.createNotice),
  );

  router.patch(
    '/notices/:noticeId',
    // catchHandler(middleware.auth.authAdmin),
    catchHandler(handler.updateNotice),
  );

  router.delete(
    '/notices/:noticeId',
    catchHandler(middleware.auth.authAdmin),
    catchHandler(handler.deleteNotice),
  );

  router.get(
    '/events',
    catchHandler(middleware.auth.authenticate),
    catchHandler(handler.getEvents),
  );
};
