import { BusinessException } from '../../../shared/exceptioins/business-exception/business-exception';
import { BusinessExceptionType } from '../../../shared/exceptioins/business-exception/exception-info';
import { TechnicalExceptionType } from '../../../shared/exceptioins/technical-exception/exception-info';
import { isTechnicalException } from '../../../shared/exceptioins/technical-exception/technical-exception';
import { ICommentCommandRepo } from '../../ports/repos/command/i-comment-command-repo';
import { CommentEntity } from '../entities/comment-entity';

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

    const updateComment = async (commentId: string, args: { content: string }) => {
      try {
        const beforeContext = await commentCommandRepo.findById(commentId);

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
};
export type CommentCommandService = ReturnType<typeof createCommentCommandService>;
