import e from 'express';
import { INotificationQueryRepo } from '../interface/i-notification-query';
import { viewNotificationsDTO } from '../dto/notification-request';

export const createNotificationQueryService = (notificationQueryRepo: INotificationQueryRepo) => {
  const getNotification = async (userId: string) => {
    return 'test';
  };

  const getNotifications = async (dto: viewNotificationsDTO) => {
    const notifications = await notificationQueryRepo.findManyById({
      userId: dto.userId,
      page: dto.page,
      limit: dto.limit,
    });
    return notifications;
  };

  return {
    getNotification,
    getNotifications,
  };
};

export type NotificationQueryService = ReturnType<typeof createNotificationQueryService>;
