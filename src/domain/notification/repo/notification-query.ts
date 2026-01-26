import { PrismaClient } from '@prisma/client';
import { INotificationQueryRepo } from '../interface/i-notification-query';
import { NotificationView } from '../dto/view/notification-view';

export const createNotificationQueryRepo = (prismaClient: PrismaClient): INotificationQueryRepo => {
  const findManyById = async (params: {
    userId: string;
    page: number;
    limit: number;
  }): Promise<NotificationView> => {
    const skip = (params.page - 1) * params.limit;
    const where = { userId: params.userId };
    const [notifications, totalCount] = await Promise.all([
      prismaClient.notifications.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: params.limit,
      }),
      prismaClient.notifications.count({ where }),
    ]);
    return {
      data: notifications.map((notification) => {
        return {
          id: notification.id,
          createdAt: notification.createdAt,
          content: notification.content,
          isChecked: notification.isChecked,
        };
      }),

      totalCount,
      page: params.page,
      limit: params.limit,
      hasNext: params.page * params.limit < totalCount,
    };
  };

  return {
    findManyById,
  };
};

export type NotificationQueryRepo = ReturnType<typeof createNotificationQueryRepo>;
