import { Prisma, PrismaClient } from '@prisma/client';
import { CommentProps } from '../../../application/command/entities/comment-entity';
import { TechnicalException } from '../../../shared/exceptioins/technical-exception/technical-exception';
import { TechnicalExceptionType } from '../../../shared/exceptioins/technical-exception/exception-info';

export const createCommentCommandRepo = (prisma: PrismaClient) => {
  const findById = async (commentId: string) => {
    return await prisma.comment.findUnique({
      where: { id: commentId },
    });
  };

  const create = async (entity: CommentProps) => {
    try {
      const comment = await prisma.comment.create({
        data: {
          id: entity.id,
          content: entity.content,
          userId: entity.userId,
          noticeId: entity.noticeId,
          complaintId: entity.complaintId,
          createdAt: entity.createdAt,
          updatedAt: entity.updatedAt,
        },
        include: { author: { select: { id: true, name: true } } },
      });
      return comment;
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError) {
        if (err.code === 'P2003') {
          const fieldName = (err.meta as any)?.field_name;
          const targetConstraints = [
            'Comment_userId_fkey',
            'Comment_noticeId_fkey',
            'Comment_complaintId_fkey',
          ];

          if (targetConstraints.some((c) => fieldName.include(c))) {
            throw TechnicalException({
              type: TechnicalExceptionType.FOREIGN_KEY_VIOLATION,
              meta: err.meta,
            });
          }
        }
      }
    }
  };

  const update = async (entity: CommentProps) => {
    try {
      await prisma.comment.update({
        where: { id: entity.id },
        data: {
          content: entity.content,
          updatedAt: entity.updatedAt,
        },
      });
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError) {
        if (err.code === 'P2025') {
          throw TechnicalException({
            type: TechnicalExceptionType.RECORD_NOT_FOUND,
            meta: err.meta,
          });
        }
      }
    }
  };

  const deleteComment = async (commentId: string) => {
    try {
      await prisma.comment.delete({
        where: { id: commentId },
      });
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError) {
        if (err.code === 'P2025') {
          throw TechnicalException({
            type: TechnicalExceptionType.RECORD_NOT_FOUND,
            meta: err.meta,
          });
        }
      }
    }
  };

  return {
    findById,
    create,
    update,
    delete: deleteComment,
  };
};
