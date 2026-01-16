import { BusinessException } from '../../../shared/exception/business-exception/business-exception';
import { BusinessExceptionType } from '../../../shared/exception/business-exception/exception-info';
import { TechnicalExceptionType } from '../../../shared/exception/technical-exception/exception-info';
import { isTechnicalException } from '../../../shared/exception/technical-exception/technical-exception';
import { CommentEntity } from '../comment-entity';
import { ICommentCommandRepo } from '../interface/i-comment-command-repo';

export const createCommentCommandService = (commentCommandRepo: ICommentCommandRepo) => {
  const createComment = async (
    userId: string,
    args: { content: string; resourceId: string; resourceType: 'COMPLAINT' | 'NOTICE' },
  ) => {
    try {
      const { content, resourceId, resourceType } = args;
      const entity = CommentEntity.create({
        content,
        userId,
        resourceId,
        resourceType,
      });
      return await commentCommandRepo.create(entity);
    } catch (err) {
      if (isTechnicalException(err)) {
        if (err.type === TechnicalExceptionType.FOREIGN_KEY_VIOLATION) {
          throw BusinessException({
            type: BusinessExceptionType.REQ_INFO_INVALID_PLEASE_RETRY,
          });
        }
      }
    }
  };
  const updateComment = async (commentId: string, args: { content: string }) => {
    try {
      const beforeContext = await commentCommandRepo.findById(commentId);

      if (!beforeContext) {
        throw null;
      }

      const entity = CommentEntity.update(beforeContext, { content: args.content });
      await commentCommandRepo.update(entity);
    } catch (err) {
      if (isTechnicalException(err)) {
        if (err.type === TechnicalExceptionType.RECORD_NOT_FOUND) {
          throw BusinessException({
            type: BusinessExceptionType.REQ_INFO_INVALID_PLEASE_RETRY,
          });
        }
      }
    }
  };

  const deleteComment = async (commentId: string) => {
    try {
      await commentCommandRepo.delete(commentId);
    } catch (err) {
      if (isTechnicalException(err)) {
        if (err.type === TechnicalExceptionType.RECORD_NOT_FOUND) {
          throw BusinessException({
            type: BusinessExceptionType.DELETED,
          });
        }
      }
    }
  };

  return {
    createComment,
    updateComment,
    deleteComment,
  };
};

export type CommentCommandService = ReturnType<typeof createCommentCommandService>;
