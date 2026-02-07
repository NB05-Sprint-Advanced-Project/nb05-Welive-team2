/* eslint-disable */
import { Prisma, PrismaClient } from '@prisma/client';
import { INoticeCommandRepo } from '../interface/i-notice-command-repo';
import { BaseRepo } from '../../../shared/base-command-repo';
import { NoticeProps } from '../entity/notice';
import { TechnicalExceptionType } from '../../../shared/exception/technical-exception/exception-info';
import { TechnicalException } from '../../../shared/exception/technical-exception/technical-exception';

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
      const { ...data } = notice;

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
      const lockSql =
        pessimisticLock === 'share' ? Prisma.sql`FOR SHARE OF n` : Prisma.sql`FOR UPDATE OF n`;

      const notices = await prisma().$queryRaw<any[]>(Prisma.sql`
      SELECT
        n.*, 
        e.id            as event_id,
        e."startDate"   as event_startDate,
        e."endDate"     as event_endDate
      FROM "Notices" n
      LEFT JOIN "Events" e ON e."noticeId" = n.id
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

  const create = async (props: NoticeProps, userId: string): Promise<NoticeProps> => {
    // eslint-disable-next-line no-alert, no-console
    const { event, author: _, ...data } = props;

    try {
      const notice = await prisma().notices.create({
        data: {
          ...data,
          userId,
          event: event
            ? {
                create: { ...event },
              }
            : undefined,
        },
        include: {
          author: true,
        },
      });
      const { author: resultAuthor, ...resultData } = notice;
      return {
        ...resultData,
        author: resultAuthor
          ? {
              id: resultAuthor.id,
              name: resultAuthor.name,
            }
          : undefined,
      };
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2003') {
        throw TechnicalException({
          type: TechnicalExceptionType.FOREIGN_KEY_VIOLATION,
          error: err,
        });
      }
      throw err;
    }
  };

  const update = async (props: NoticeProps): Promise<void> => {
    // const { event, apartmentId, author, ...data } = props as any;
    const { event, apartmentId, userId, author, event_startdate, event_enddate, ...data } =
      props as any;

    try {
      await prisma().notices.update({
        where: { id: data.id, version: props.version },
        data: {
          ...data,
          version: { increment: 1 },
          ...(event
            ? {
                event: {
                  upsert: {
                    create: { ...event },
                    update: { ...event },
                  },
                },
              }
            : {}),
        },
      });
      return;
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError) {
        if (err.code === 'P2025') {
          throw TechnicalException({
            type: TechnicalExceptionType.OPTIMISTIC_LOCK_FAILED,
            error: err,
          });
        }
      }
      throw err;
    }
  };

  const deleteNotice = async (noticeId: string): Promise<void> => {
    await prisma().notices.deleteMany({
      where: { id: noticeId },
    });
    return;
  };

  const updateViewsCountBulk = async (props: { noticeId: string; viewsCount: number }[]) => {
    if (props.length === 0) return;

    const noticeIds = props.map((v) => v.noticeId);
    const cases = props.map((v) => Prisma.sql`WHEN ${v.noticeId} THEN ${v.viewsCount}`);
    const query = Prisma.sql`
      UPDATE "Notices"
      SET "viewsCount" = GREATEST("viewsCount", CASE id ${Prisma.join(cases, ' ')} ELSE "viewsCount" END)
      WHERE id IN (${Prisma.join(noticeIds)})
    `;

    await prisma().$executeRaw(query);
  };
  return {
    findById,
    create,
    update,
    deleteNotice,
    updateViewsCountBulk,
  };
};

export type NoticeCommandRepo = ReturnType<typeof createNoticeCommandRepo>;
