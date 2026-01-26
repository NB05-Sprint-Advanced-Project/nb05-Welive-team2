import { Middlewares } from '../../../shared/interface/i-middlewares';
import { createBaseController } from '../../../utils/controller-util';
import { NotificationCommandService } from '../service/notification-command';
import { NotificationQueryService } from '../service/notification-query';
import { createNotificationHandler } from './notification-handler';
import { registerNotificationRoutes } from './notification-router';

export const createNotificationController = (
  notificationQueryService: NotificationQueryService,
  notificationCommandService: NotificationCommandService,
  middleware: Middlewares,
) => {
  const { path, router } = createBaseController('/api/v2/notifications');

  const handlers = createNotificationHandler(notificationQueryService, notificationCommandService);

  registerNotificationRoutes(router, middleware, handlers);

  return { path, router };
};

export type NotificationController = ReturnType<typeof createNotificationController>;
