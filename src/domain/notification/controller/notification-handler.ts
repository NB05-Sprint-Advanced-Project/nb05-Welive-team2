import { Request, Response } from 'express';
import { validate } from '../../../utils/controller-util';
import { getNotificationsSchema, readNotificationSchema } from '../dto/notification-request';
import { NotificationCommandService } from '../service/notification-command';
import { NotificationQueryService } from '../service/notification-query';
import { ClientManager } from '../../../clients';
import { Role } from '../../user/entity/base-user';

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

  const getNotification = async (req: Request, res: Response) => {
    const result = await notificationQueryService.getNotification(req.user.userId);

    // SSE 연결을 클라이언트 매니저에 저장
    ClientManager.set({
      userId: req.user.userId,
      role: req.user.role as Role,
      connection: res,
    });

    // // 예: src/servers/sse-server.ts 또는 컨트롤러 라우터에 추가
    res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    console.log(' SSE client connected', req.user.userId);

    // 초기 이벤트(선택)
    res.write(`event: connected\ndata: ok\n\n`);

    // setInterval(() => {
    //   const payload = JSON.stringify({ message: 'ping', ts: Date.now(), data: result });
    //   res.write(`event: notification\ndata: ${payload}\n\n`);
    // }, 3000);
  };

  const markAsRead = async (req: Request, res: Response) => {
    const dto = validate(readNotificationSchema, {
      ...req.user,
      ...req.params,
    });
    await notificationCommandService.markAsRead(dto);
    res.status(204).send();
  };

  return {
    getNotifications,
    getNotification,
    markAsRead,
  };
};

export type NotificationHandlers = ReturnType<typeof createNotificationHandler>;
