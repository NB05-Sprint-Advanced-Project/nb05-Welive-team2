import { Middlewares } from '../../../shared/interface/i-middlewares';
import { createBaseController } from '../../../utils/controller-util';
import { CommentCommandService } from '../service/comment-command';
import { CommentQueryService } from '../service/comment-query';
import { createCommentHandlers } from './comment-handler';
import { registerCommentRouters } from './comment-router';

export const createCommentController = (
  middlewares: Middlewares,
  commentQueryService: CommentQueryService,
  commentCommandService: CommentCommandService,
) => {
  const { path, router } = createBaseController('/api/v2/comments');

  const handlers = createCommentHandlers(commentCommandService, commentQueryService);

  registerCommentRouters(router, middlewares, handlers);

  return { path, router };
};

export type CommentController = ReturnType<typeof createCommentController>;
