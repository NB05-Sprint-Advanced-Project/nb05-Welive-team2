import { Prisma, PrismaClient } from '@prisma/client';
import { INotificationCommandRepo } from '../interface/i-notification-command';
import { NotificationProps } from '../entity/notification';
import { BaseRepo } from '../../../shared/base-command-repo';
import { TechnicalExceptionType } from '../../../shared/exception/technical-exception/exception-info';
import { TechnicalException } from '../../../shared/exception/technical-exception/technical-exception';
import { getEnv } from '../../../config';
import { NotificationMapper } from '../notification-mapper';

export const createNotificationCommandRepo = (
  prismaClient: PrismaClient,
): INotificationCommandRepo => {
  const { prisma } = BaseRepo(prismaClient);

  const markAsRead = async (notificationId: string): Promise<void> => {
    try {
      await prismaClient.notifications.update({
        where: { id: notificationId },
        data: { isChecked: true },
      });
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
        throw TechnicalException({
          type: TechnicalExceptionType.RECORD_NOT_FOUND,
        });
      }
      throw err;
    }
  };

  const bulkSave = async (notifications: NotificationProps[]): Promise<void> => {
    try {
      const batchSize = getEnv().BULK_NOTIFICATION_SIZE;

      for (let i = 0; i < notifications.length; i += batchSize) {
        const batches = notifications.slice(i, i + batchSize);
        const data = NotificationMapper.createNotificationData(batches);
        await prisma().notifications.createMany({ data });
      }
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
        throw TechnicalException({
          type: TechnicalExceptionType.UNIQUE_VIOLATION_NOTIFICATION,
        });
      }
      throw err;
    }
  };

  const remove = async () => {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    await prisma().notifications.deleteMany({
      where: {
        createdAt: { lte: thirtyDaysAgo },
      },
    });
  };

  return {
    markAsRead,
    bulkSave,
    delete: remove,
  };
};

export type NotificationCommandRepo = ReturnType<typeof createNotificationCommandRepo>;
