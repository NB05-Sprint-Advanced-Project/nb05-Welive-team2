import { ICommentsQueryRepo } from '../../ports/repos/query/i-comments-query-repo';
import { CommentsView } from '../views/comments-view';

export const createCommentsQueryService = (repo: ICommentsQueryRepo) => {
  const getAllComments = async (
    page: number,
    limit: number,
    resourceId: string,
    resourceType: string,
  ): Promise<CommentsView[]> => {
    const comments = await repo.findAll(page, limit, resourceId, resourceType);
    return comments;
  };

  return { getAllComments };
};
