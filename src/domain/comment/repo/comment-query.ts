import { PrismaClient } from '@prisma/client';
import { ICommentQueryRepo } from '../interface/i-comment-query-repo';
import { CommentView } from '../dto/comment-view';

export const createCommentQueryRepo = (prisma: PrismaClient): ICommentQueryRepo => {
  const findAll = async (page: number, limit: number, resourceId: string, resourceType: string) => {
    const skip = (page - 1) * limit;

    type ResourceType = 'NOTICE' | 'COMPLAINT';

    const fieldMap: Record<ResourceType, string> = {
      NOTICE: 'noticeId',
      COMPLAINT: 'complaintId',
    };

    const field = fieldMap[resourceType as ResourceType];

    const [comments, totalCount] = await Promise.all([
      prisma.comment.findMany({
        where: {
          [field]: resourceId,
        },
        skip: skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          author: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      }),
      prisma.comment.count({
        where: {
          [field]: resourceId,
        },
      }),
    ]);

    const data: CommentView[] = comments.map((comment) => ({
      id: comment.id,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
      content: comment.content,
      author: {
        id: comment.author.id,
        name: comment.author.name,
      },
    }));

    return {
      data,
      totalCount,
      page,
      limit,
      hasNext: totalCount > page * limit,
    };
  };

  return { findAll };
};
