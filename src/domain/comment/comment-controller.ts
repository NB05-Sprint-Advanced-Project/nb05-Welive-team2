import express, { Request, Response, NextFunction } from 'express';
import {
  createCommentReqBodySchema,
  deleteCommentReqParamsSchema,
  getAllCommentsReqParamsSchema,
  updateCommentReqBodySchema,
} from './dto/comment-request';
import { catchHandler, validate } from '../../utils/controller-util';
import { CommentQueryService } from './service/comment-query';
import { CommentCommandService } from './service/comment-command';
import { Middlewares } from '../../shared/interface/i-middlewares';

export const createCommentController = (
  middlewares: Middlewares,
  commentQueryService: CommentQueryService,
  commentCommandService: CommentCommandService,
) => {
  const path: string = '/comments';
  const router = express.Router();

  const getAllComments = async (req: Request, res: Response) => {
    const { params } = validate(getAllCommentsReqParamsSchema, req.params);
    const comments = await commentQueryService.getAllComments(params);

    return res.status(200).json(comments);
  };

  const createComment = async (req: Request, res: Response) => {
    /*
   인증 미들웨어 추가 시 
   const userId = req.user.userId;
    */
    const { body } = validate(createCommentReqBodySchema, req.body);
    // const comment = await commentCommandService.createComment(userId, { ...body });

    // return res.status(201).json(comment);
  };

  const updateComment = async (req: Request, res: Response) => {
    const { params, body } = validate(updateCommentReqBodySchema, { ...req.params, ...req.body });
    await commentCommandService.updateComment(params.commentId, body);
    return res.status(204).json();
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
