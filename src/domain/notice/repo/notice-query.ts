import { NoticeCategory, PrismaClient } from '@prisma/client';
import { INoticeQueryRepo } from '../interface/i-notice-query-repo';
import { NoticesView, NoticeView } from '../dto/notice-view';
import { EventView } from '../dto/event-view';

export const createNoticeQueryRepo = (prismaClient: PrismaClient): INoticeQueryRepo => {
  const findById = async (noticeId: string): Promise<NoticeView | null> => {
    const notice = await prismaClient.notices.findUnique({
      where: { id: noticeId },
      include: {
        author: true,
        comment: true,
        event: true,
      },
    });

    if (!notice) {
      return null;
    }

    const commentCount = notice.comment.length;

    return {
      id: notice.id,
      createdAt: notice.createdAt,
      updatedAt: notice.updatedAt,
      title: notice.title,
      content: notice.content,
      category: notice.category,
      isPinned: notice.isPinned,
      viewsCount: notice.viewsCount,
      apartmentId: notice.apartmentId,
      author: {
        id: notice.author.id,
        name: notice.author.name,
      },
      commentCount,
      event: notice.event
        ? {
            id: notice.event.id,
            startDate: notice.event.startDate,
            endDate: notice.event.endDate,
          }
        : null,
    };
  };

  const findAll = async (
    page: number,
    limit: number,
    searchKeyword: string,
    category: NoticeCategory | 'ALL',
    userId: string,
  ): Promise<NoticesView> => {
    const where = {
      category: category === 'ALL' ? undefined : category,
      apartment: {
        UserApartmentLink: {
          some: { userId },
        },
      },
      ...(searchKeyword
        ? {
            OR: [
              { title: { contains: searchKeyword } },
              { content: { contains: searchKeyword } },
              { author: { name: { contains: searchKeyword } } },
            ],
          }
        : {}),
    };
    const [notices, totalCount] = await Promise.all([
      prismaClient.notices.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          author: true,
          comment: true,
        },
        orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
      }),
      prismaClient.notices.count({ where }),
    ]);

    const hasNext = page * limit < totalCount;

    return {
      data: notices.map((notice) => {
        const commentCount = notice.comment.length;
        return {
          id: notice.id,
          createdAt: notice.createdAt,
          updatedAt: notice.updatedAt,
          title: notice.title,
          content: notice.content,
          category: notice.category,
          isPinned: notice.isPinned,
          viewsCount: notice.viewsCount,
          apartmentId: notice.apartmentId,
          author: {
            id: notice.author.id,
            name: notice.author.name,
          },
          commentCount,
        };
      }),
      totalCount,
      page,
      limit,
      hasNext,
    };
  };

  const findEvents = async (
    apartmentId: string,
    year: number,
    month: number,
  ): Promise<EventView[]> => {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 1);
    const notices = await prismaClient.notices.findMany({
      where: {
        apartmentId,
        event: {
          AND: [{ startDate: { lt: endDate } }, { endDate: { gte: startDate } }],
        },
      },
      include: {
        event: true,
      },
    });
    if (notices.length === 0) {
      return [];
    }
    return notices.map((notice) => {
      return {
        id: notice.event!.id,
        startDate: notice.event!.startDate,
        endDate: notice.event!.endDate,
        category: notice.category,
        title: notice.title,
        apartmentId: notice.apartmentId,
        resourceId: notice.id,
        resourceType: 'NOTICE',
      };
    });
  };

  return { findById, findAll, findEvents };
};

export type NoticeQueryRepo = ReturnType<typeof createNoticeQueryRepo>;
