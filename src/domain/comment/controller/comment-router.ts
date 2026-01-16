import { Router } from 'express';
import { catchHandler } from '../../../utils/controller-util';
import { CommentHandlers } from './comment-handler';

export const registerCommentRouters = (router: Router, handlers: CommentHandlers) => {
  router.get('/', catchHandler(handlers.getAllComments));
  router.post('/', catchHandler(handlers.createComment));
  router.patch('/:commentId', catchHandler(handlers.updateComment));
  router.delete('/:commentId', catchHandler(handlers.deleteComment));
};
