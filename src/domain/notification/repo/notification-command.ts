import { PrismaClient } from '@prisma/client';
import { INotificationCommandRepo } from '../interface/i-notification-command';
import { NotificationProps } from '../entity/notification';
import { BaseRepo } from '../../../shared/base-command-repo';

export const createNotificationCommandRepo = (
  prismaClient: PrismaClient,
): INotificationCommandRepo => {
  const { prisma } = BaseRepo(prismaClient);

  const markAsRead = async (notificationId: string): Promise<void> => {
    await prismaClient.notifications.update({
      where: { id: notificationId },
      data: { isChecked: true },
    });
  };

  const bulkSave = async (bulk: NotificationProps[]): Promise<void> => {
    const data = bulk.map((notification) => ({
      id: notification.id,
      userId: notification.receiverId,
      content: notification.content,
      isChecked: notification.isChecked,
      createdAt: notification.createdAt,
    }));

    await prisma().notifications.createMany({
      data: data,
    });
    return;
  };

  return {
    markAsRead,
    bulkSave,
  };
};

export type NotificationCommandRepo = ReturnType<typeof createNotificationCommandRepo>;
