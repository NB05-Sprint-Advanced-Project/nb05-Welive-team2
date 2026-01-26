import { PrismaClient } from '@prisma/client';
import { INotificationCommandRepo } from '../interface/i-notification-command';

export const createNotificationCommandRepo = (
  prismaClient: PrismaClient,
): INotificationCommandRepo => {
  const markAsRead = async (notificationId: string): Promise<void> => {
    await prismaClient.notifications.update({
      where: { id: notificationId },
      data: { isChecked: true },
    });
  };

  return {
    markAsRead,
  };
};

export type NotificationCommandRepo = ReturnType<typeof createNotificationCommandRepo>;
