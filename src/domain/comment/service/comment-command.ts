import { ICommentCommandRepo } from '../interface/i-comment-command-repo';
import { CommentEntity } from '../comment-entity';

export const createCommentCommandService = (commentCommandRepo: ICommentCommandRepo) => {
  const createComment = async (
    userId: string,
    args: { content: string; resourceId: string; resourceType: 'COMPLAINT' | 'NOTICE' },
  ) => {
    const { content, resourceId, resourceType } = args;
    const entity = CommentEntity.create({
      content,
      userId,
      resourceId,
      resourceType,
    });
    return await commentCommandRepo.create(entity);
  };

  const updateComment = async (commentId: string, args: { content: string }) => {
    const beforeContext = await commentCommandRepo.findById(commentId);

    const entity = CommentEntity.update(beforeContext, { content: args.content });
    await commentCommandRepo.update(entity);
  };

  const deleteComment = async (commentId: string) => {
    await commentCommandRepo.remove(commentId);
  };

  return {
    createComment,
    updateComment,
    deleteComment,
  };
};

export type CommentCommandService = ReturnType<typeof createCommentCommandService>;
