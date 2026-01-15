import { PageView } from '../../../shared/interface/i-page-view';
import { ICommentQueryRepo } from '../interface/i-comment-query-repo';
import { CommentView } from '../dto/comment-view';

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
