import { Router } from 'express';
import { NoticeHandler } from './notice-handler';
import { catchHandler } from '../../../utils/controller-util';

export const registerNoticeRoutes = (router: Router, handler: NoticeHandler) => {
  router.get('/notices/:noticeId', catchHandler(handler.getNotice));

  router.get('/notices/', catchHandler(handler.getAllNotices));

  router.post('/notices/', catchHandler(handler.createNotice));

  router.patch('/notices/:noticeId', catchHandler(handler.updateNotice));

  router.delete('/notices/:noticeId', catchHandler(handler.deleteNotice));

  router.get('/events', catchHandler(handler.getEvents));
};
