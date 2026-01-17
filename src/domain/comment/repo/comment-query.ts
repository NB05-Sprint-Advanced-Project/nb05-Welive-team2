import { Prisma, PrismaClient } from '@prisma/client';
import { ICommentQueryRepo } from '../interface/i-comment-query-repo';
import { CommentView } from '../dto/comment-view';
import { TechnicalException } from '../../../shared/exception/technical-exception/technical-exception';
import { TechnicalExceptionType } from '../../../shared/exception/technical-exception/exception-info';

export const createCommentQueryRepo = (prisma: PrismaClient): ICommentQueryRepo => {
  const findAll = async (page: number, limit: number, resourceId: string, resourceType: string) => {
    try {
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
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError) {
        if (err.code === 'P2003') {
          const fieldName = (err.meta as any)?.field_name;
          const targetConstraints = ['Comment_noticeId_fkey', 'Comment_complaintId_fkey'];

          if (targetConstraints.some((c) => fieldName.includes(c))) {
            throw TechnicalException({
              type: TechnicalExceptionType.FOREIGN_KEY_VIOLATION,
              meta: err.meta,
            });
          }
        }
      }
      throw err;
    }
  };

  return { findAll };
};
