import { Router } from 'express';
import { NoticeHandler } from './notice-handler';
import { catchHandler } from '../../../utils/controller-util';
import { createAuthMiddleware } from '../../../middlewares/auth-middleware';

export const registerNoticeRoutes = (router: Router, handler: NoticeHandler) => {
  router.get('/notices/:noticeId', createAuthMiddleware, catchHandler(handler.getNotice));

  router.get('/notices/', createAuthMiddleware, catchHandler(handler.getAllNotices));

  router.post('/notices/', createAuthMiddleware, catchHandler(handler.createNotice));

  router.patch('/notices/:noticeId', createAuthMiddleware, catchHandler(handler.updateNotice));

  router.delete('/notices/:noticeId', createAuthMiddleware, catchHandler(handler.deleteNotice));

  router.get('/events', createAuthMiddleware, catchHandler(handler.getEvents));
};
