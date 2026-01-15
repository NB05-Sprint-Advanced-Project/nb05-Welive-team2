import { PageView } from '../../../shared/interface/i-page-view';
import { CommentView } from '../dto/comment-view';

export interface ICommentQueryRepo {
  findAll(
    page: number,
    limit: number,
    resourceId: string,
    resourceType: string,
  ): Promise<PageView<CommentView>>;
}
