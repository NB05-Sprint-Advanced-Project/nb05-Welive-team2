import { PageView } from '../../../../shared/types/page-view';
import { CommentView } from '../../../query/views/comment-view';

export interface ICommentQueryRepo {
  findAll(
    page: number,
    limit: number,
    resourceId: string,
    resourceType: string,
  ): Promise<PageView<CommentView>>;
}
