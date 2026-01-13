import express, { Request, Response, NextFunction } from 'express';
import { IUtils } from '../../shared/i-utils';
import { Middlewares } from '../i-middelwares';
import {
  createCommentReqBodySchema,
  deleteCommentReqParamsSchema,
  getAllCommentsReqParamsSchema,
  updateCommentReqBodySchema,
} from '../requests/comment-request';
import { catchHandler, validate } from './controller-util';
import { CommentQueryService } from '../../application/query/services/comment-query-service';
import { CommentCommandService } from '../../application/command/services/comment-command-service';

export const createCommentController = (
  middlewares: Middlewares,
  commentQueryService: CommentQueryService,
  commentCommandService: CommentCommandService,
  utils: IUtils,
) => {
  const path: string = '/comments';
  const router = express.Router();

  const getAllComments = async (req: Request, res: Response) => {
    const { params } = validate(getAllCommentsReqParamsSchema, req.params);
    const comments = await commentQueryService.getAllComments(params);

    return res.status(200).json(comments);
  };

  const createComment = async (req: Request, res: Response) => {
    const { body } = validate(createCommentReqBodySchema, req.body);
    const comment = await commentCommandService.createComment(body);

    return res.status(201).json(comment);
  };

  const updateComment = async (req: Request, res: Response) => {
    const { params, body } = validate(updateCommentReqBodySchema, { ...req.params, ...req.body });
    const comment = await commentCommandService.updateComment(params.commentId, body);
    return res.status(200).json(comment);
  };

  const deleteComment = async (req: Request, res: Response) => {
    const { params } = validate(deleteCommentReqParamsSchema, req.params);
    await commentCommandService.deleteComment(params.commentId);

    return res.status(204).json();
  };

  router.get('/', catchHandler(getAllComments));
  router.post('/', catchHandler(createComment));
  router.patch('/:commentId', catchHandler(updateComment));
  router.delete('/:commentId', catchHandler(deleteComment));

  return { path, router };
};
