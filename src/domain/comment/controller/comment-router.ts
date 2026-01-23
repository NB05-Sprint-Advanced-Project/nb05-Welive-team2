import { Router } from 'express';
import { catchHandler } from '../../../utils/controller-util';
import { CommentHandlers } from './comment-handler';
import { Middlewares } from '../../../shared/interface/i-middlewares';

export const registerCommentRouters = (
  router: Router,
  middlewares: Middlewares,
  handlers: CommentHandlers,
) => {
  router.get(
    '/',
    catchHandler(middlewares.auth.authenticate),
    catchHandler(handlers.getAllComments),
  );

  router.post(
    '/',
    catchHandler(middlewares.auth.authenticate),
    catchHandler(handlers.createComment),
  );

  router.patch(
    '/:commentId',
    catchHandler(middlewares.auth.authenticate),
    catchHandler(handlers.updateComment),
  );

  router.delete(
    '/:commentId',
    catchHandler(middlewares.auth.authenticate),
    catchHandler(handlers.deleteComment),
  );
};
