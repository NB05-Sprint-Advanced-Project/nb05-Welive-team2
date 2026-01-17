import { Request, Response } from 'express';
import { Middlewares } from '../../../shared/interface/i-middlewares';
import { validate } from '../../../utils/controller-util';
import {
  createCommentReqBodySchema,
  deleteCommentReqParamsSchema,
  getAllCommentsReqParamsSchema,
  updateCommentReqBodySchema,
} from '../dto/comment-request';
import { CommentCommandService } from '../service/comment-command';
import { CommentQueryService } from '../service/comment-query';

export const createCommentHandlers = (
  middlewares: Middlewares,
  commentCommandService: CommentCommandService,
  commentQueryService: CommentQueryService,
) => {
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
    /*
   인증 미들웨어 추가 시 
   const userId = req.user.userId;
    */
    const { params, body } = validate(updateCommentReqBodySchema, { ...req.params, ...req.body });
    // await commentCommandService.updateComment(userId, params.commentId, body);
    return res.status(204).json();
  };

  const deleteComment = async (req: Request, res: Response) => {
    /*
   인증 미들웨어 추가 시 
   const userId = req.user.userId;
    */
    const { params } = validate(deleteCommentReqParamsSchema, req.params);
    // await commentCommandService.deleteComment(userId, params.commentId);

    return res.status(204).json();
  };

  return { getAllComments, createComment, updateComment, deleteComment };
};

export type CommentHandlers = ReturnType<typeof createCommentHandlers>;
