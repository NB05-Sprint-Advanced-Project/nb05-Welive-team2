import { NoticeProps } from '../../../application/command/entities/notice/notice-entity';
import { INoticeCommandRepo } from '../../../application/ports/repos/command/i-notice-command-repo';
import { BasePrismaClient } from './base-command-repo';

export const createNoticeCommandRepo = (prismaClient: BasePrismaClient): INoticeCommandRepo => {
  const findById = async (noticeId: string): Promise<NoticeProps | null> => {
    const notice = await prismaClient.notices.findUnique({
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
  };

  const create = async (props: NoticeProps): Promise<NoticeProps> => {
    const { comments, event, ...data } = props;
    const notice = await prismaClient.notices.create({
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
    await prismaClient.notices.update({
      where: { id: data.id },
      data: {
        ...data,
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
  };

  const deleteNotice = async (noticeId: string): Promise<void> => {
    await prismaClient.notices.delete({
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
