import { INotificationQueryRepo } from '../interface/i-notification-query';
import { viewNotificationsDTO } from '../dto/notification-request';

export const createNotificationQueryService = (notificationQueryRepo: INotificationQueryRepo) => {
  const getNotifications = async (dto: viewNotificationsDTO) => {
    const notifications = await notificationQueryRepo.findManyById({
      userId: dto.userId,
      page: dto.page,
      limit: dto.limit,
    });
    return notifications;
  };

  return {
    getNotifications,
  };
};

export type NotificationQueryService = ReturnType<typeof createNotificationQueryService>;
