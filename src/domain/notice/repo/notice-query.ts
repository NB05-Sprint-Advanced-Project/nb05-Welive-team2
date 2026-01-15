import { NoticeCategory, PrismaClient } from '@prisma/client';
import { INoticeQueryRepo } from '../interface/i-notice-query-repo';
import { NoticesView, NoticeView } from '../dto/notice-view';

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
      viewCount: notice.viewCount,
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
    category: NoticeCategory,
  ): Promise<NoticesView> => {
    // todo :
    // 1. category가 없을 경우 전체 조회
    // 2. searchKeyword 범위 title, contet, author.name

    const where = {
      category,
      title: { contains: searchKeyword },
    };
    const notices = await prismaClient.notices.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      include: {
        author: true,
        comment: true,
      },
    });
    const totalCount = await prismaClient.notices.count({
      where,
    });

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
          viewCount: notice.viewCount,
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

  return { findById, findAll };
};

export type NoticeQueryRepo = ReturnType<typeof createNoticeQueryRepo>;
