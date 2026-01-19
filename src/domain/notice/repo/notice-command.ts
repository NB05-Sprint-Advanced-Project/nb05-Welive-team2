import { Prisma, PrismaClient } from '@prisma/client';
import { INoticeCommandRepo } from '../interface/i-notice-command-repo';
import { BasePrismaClient, BaseRepo } from '../../../shared/base-command-repo';
import { asyncContextStorage } from '../../../utils/async-context-storage-util';
import { NoticeProps } from '../entity/notice';

export const createNoticeCommandRepo = (prismaClient: PrismaClient): INoticeCommandRepo => {
  const { prisma } = BaseRepo(prismaClient);

  const findById = async (
    noticeId: string,
    pessimisticLock?: 'share' | 'exclusive',
  ): Promise<NoticeProps | null> => {
    if (!pessimisticLock) {
      const notice = await prisma().notices.findUnique({
        where: { id: noticeId },
        include: {
          event: true,
        },
      });

      if (!notice) {
        return null;
      }
      const { event, ...data } = notice;

      return {
        ...data,
        event: notice.event
          ? {
              id: notice.event.id,
              startDate: notice.event.startDate,
              endDate: notice.event.endDate,
            }
          : undefined,
      };
    } else {
      const lockSql = pessimisticLock === 'share' ? Prisma.sql`FOR SHARE` : Prisma.sql`FOR UPDATE`;

      const notices = await prisma().$queryRaw<any[]>(Prisma.sql`
    SELECT
      n.*, 
      e.id            AS event_id,
      e."startDate"   AS event_startDate,
      e."endDate"     AS event_endDate
    FROM "Notice" n
    LEFT JOIN "Event" e ON e."noticeId" = n.id
    WHERE n.id = ${noticeId}
    ${lockSql}
  `);
      if (notices.length === 0) {
        return null;
      }
      const { event_id, event_startDate, event_endDate, ...noticeData } = notices[0];
      return {
        ...noticeData,
        event: event_id
          ? {
              id: event_id,
              startDate: event_startDate,
              endDate: event_endDate,
            }
          : undefined,
      };
    }
  };

  const create = async (props: NoticeProps): Promise<NoticeProps> => {
    const { comments, event, ...data } = props;
    const notice = await prisma().notices.create({
      data: {
        ...data,
        event: event
          ? {
              create: { ...event },
            }
          : undefined,
      },
      include: {
        event: true,
      },
    });

    const { event: resultEvent, ...resultData } = notice;
    return {
      ...resultData,
      event: resultEvent
        ? {
            id: resultEvent.id,
            startDate: resultEvent.startDate,
            endDate: resultEvent.endDate,
          }
        : undefined,
    };
  };

  const update = async (props: NoticeProps): Promise<void> => {
    const { comments, event, ...data } = props;
    try {
      await prisma().notices.update({
        where: { id: data.id, version: props.version },
        data: {
          ...data,
          version: { increment: 1 },
          event: event
            ? {
                upsert: {
                  create: {
                    ...event,
                  },
                  update: {
                    ...event,
                  },
                },
              }
            : { delete: true },
        },
      });
      return;
    } catch (err) {
      throw err;
    }
  };

  const deleteNotice = async (noticeId: string): Promise<void> => {
    await prisma().notices.delete({
      where: { id: noticeId },
    });
    return;
  };

  return {
    findById,
    create,
    update,
    deleteNotice,
  };
};

export type NoticeCommandRepo = ReturnType<typeof createNoticeCommandRepo>;
