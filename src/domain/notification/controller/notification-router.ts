import { Router } from 'express';
import path from 'path';
import { catchHandler } from '../../../utils/controller-util';
import { NotificationHandlers } from './notification-handler';
import { Middlewares } from '../../../shared/interface/i-middlewares';

export const registerNotificationRoutes = (
  router: Router,
  middleware: Middlewares,
  handlers: NotificationHandlers,
) => {
  router.get('/', middleware.auth.authAdmin, catchHandler(handlers.getNotifications));

  router.patch(
    '/:notificationId/read',
    middleware.auth.authAdmin,
    catchHandler(handlers.markAsRead),
  );

  router.get('/sse', middleware.auth.authenticate, catchHandler(handlers.getNotification));

  return { path, router };
};
