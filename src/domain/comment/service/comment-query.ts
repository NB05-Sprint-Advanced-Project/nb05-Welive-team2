import { PageView } from '../../../shared/interface/i-page-view';
import { ICommentQueryRepo } from '../interface/i-comment-query-repo';
import { CommentView } from '../dto/comment-view';
import {
  isTechnicalException,
  TechnicalException,
} from '../../../shared/exception/technical-exception/technical-exception';
import { TechnicalExceptionType } from '../../../shared/exception/technical-exception/exception-info';
import { BusinessException } from '../../../shared/exception/business-exception/business-exception';
import { BusinessExceptionType } from '../../../shared/exception/business-exception/exception-info';

export const createCommentQueryService = (repo: ICommentQueryRepo) => {
  const getAllComments = async (params: {
    page: number;
    limit: number;
    resourceId: string;
    resourceType: string;
  }): Promise<PageView<CommentView>> => {
    try {
      const comments = await repo.findAll(
        params.page,
        params.limit,
        params.resourceId,
        params.resourceType,
      );

      return comments;
    } catch (err) {
      if (isTechnicalException(err)) {
        if (err.type === TechnicalExceptionType.RECORD_NOT_FOUND) {
          throw BusinessException({ type: BusinessExceptionType.REQ_INFO_INVALID_PLEASE_RETRY });
        }
      }
      throw err;
    }
  };

  return { getAllComments };
};

export type CommentQueryService = ReturnType<typeof createCommentQueryService>;
