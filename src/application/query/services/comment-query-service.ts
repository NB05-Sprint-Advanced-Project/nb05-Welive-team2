import { ICommentQueryRepo } from '../../ports/repos/query/i-comment-query-repo';
import { CommentView } from '../views/comment-view';

export const createCommentQueryService = (repo: ICommentQueryRepo) => {
  const getAllComments = async (
    page: number,
    limit: number,
    resourceId: string,
    resourceType: string,
  ): Promise<CommentView[]> => {
    const comments = await repo.findAll(page, limit, resourceId, resourceType);
    return comments;
  };

  return { getAllComments };
};
