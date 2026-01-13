import { PrismaClient } from '@prisma/client';
import { CommentProps } from '../../../application/command/entities/comment-entity';

export const createCommentCommandRepo = (prisma: PrismaClient) => {
  const findById = async (commentId: string) => {
    return await prisma.comment.findUnique({
      where: { id: commentId },
    });
  };

  const create = async (entity: CommentProps) => {
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
  };

  const update = async (entity: CommentProps) => {
    await prisma.comment.update({
      where: { id: entity.id },
      data: {
        content: entity.content,
        updatedAt: entity.updatedAt,
      },
    });
  };

  const remove = async (commentId: string) => {
    await prisma.comment.delete({
      where: { id: commentId },
    });
  };

  return {
    findById,
    create,
    update,
    remove,
  };
};
