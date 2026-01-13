import { PageView } from '../../../shared/types/page-view';
import { ICommentQueryRepo } from '../../ports/repos/query/i-comment-query-repo';
import { CommentView } from '../views/comment-view';

export const createCommentQueryService = (repo: ICommentQueryRepo) => {
  const getAllComments = async (params: {
    page: number;
    limit: number;
    resourceId: string;
    resourceType: string;
  }): Promise<PageView<CommentView>> => {
    const comments = await repo.findAll(
      params.page,
      params.limit,
      params.resourceId,
      params.resourceType,
    );

    return comments;
  };

  return { getAllComments };
};

export type CommentQueryService = ReturnType<typeof createCommentQueryService>;
