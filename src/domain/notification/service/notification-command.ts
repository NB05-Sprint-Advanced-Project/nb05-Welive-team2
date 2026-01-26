import { readNotificationDTO, viewNotificationsDTO } from '../dto/notification-request';
import { INotificationCommandRepo } from '../interface/i-notification-command';

export const createNotificationCommandService = (
  notificationCommandRepo: INotificationCommandRepo,
) => {
  const markAsRead = async (dto: readNotificationDTO) => {
    await notificationCommandRepo.markAsRead(dto.notificationId);
    return;
  };

  return {
    markAsRead,
  };
};

export type NotificationCommandService = ReturnType<typeof createNotificationCommandService>;
