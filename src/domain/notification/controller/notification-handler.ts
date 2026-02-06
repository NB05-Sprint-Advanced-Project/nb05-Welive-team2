import { Request, Response } from 'express';
import { getNotificationsSchema, markNotificationSchema } from '../dto/notification-request';
import { NotificationCommandService } from '../service/notification-command';
import { NotificationQueryService } from '../service/notification-query';
import { ClientManager } from '../../../clients';
import { Role } from '../../user/entity/base-user';
import { validate } from '../../../shared/utils/controller-util';

export const createNotificationHandler = (
  notificationQueryService: NotificationQueryService,
  notificationCommandService: NotificationCommandService,
) => {
  const getNotifications = async (req: Request, res: Response) => {
    const dto = validate(getNotificationsSchema, {
      ...req.query,
      ...req.user,
    });
    const notifications = await notificationQueryService.getNotifications(dto);
    res.status(200).json(notifications);
  };

  const getLiveNotification = async (req: Request, res: Response) => {
    ClientManager.set({
      userId: req.user.userId,
      role: req.user.role as Role,
      apartmentId: req.user.apartmentId,
      connection: res,
    });

    res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    console.log(' SSE client connected', req.user.name, req.user.userId);

    res.write(
      `event: connected\ndata: [${req.user.role}] ${req.user.name}님이 SSE에 연결되었습니다. \n\n`,
    );
  };

  const markAsRead = async (req: Request, res: Response) => {
    const dto = validate(markNotificationSchema, {
      ...req.user,
      ...req.params,
    });
    await notificationCommandService.markAsRead(dto);
    res.status(204).send();
  };

  return {
    getNotifications,
    getLiveNotification,
    markAsRead,
  };
};

export type NotificationHandlers = ReturnType<typeof createNotificationHandler>;
