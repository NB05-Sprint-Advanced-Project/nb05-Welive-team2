import { Request, Response } from 'express';
import { validate } from '../../../utils/controller-util';
import {
  createCommentReqBodySchema,
  deleteCommentReqParamsSchema,
  getAllCommentsReqQuerySchema,
  updateCommentReqBodySchema,
} from '../dto/comment-request';
import { CommentCommandService } from '../service/comment-command';
import { CommentQueryService } from '../service/comment-query';

export const createCommentHandlers = (
  commentCommandService: CommentCommandService,
  commentQueryService: CommentQueryService,
) => {
  const getAllComments = async (req: Request, res: Response) => {
    const { query } = validate(getAllCommentsReqQuerySchema, { query: req.query });
    const comments = await commentQueryService.getAllComments(query);

    return res.status(200).json(comments);
  };

  const createComment = async (req: Request, res: Response) => {
    const userId = req.userId as string;

    const { body } = validate(createCommentReqBodySchema, { body: req.body });
    const comment = await commentCommandService.createComment(userId, { ...body });

    return res.status(201).json(comment);
  };

  const updateComment = async (req: Request, res: Response) => {
    const userId = req.userId as string;

    const { params, body } = validate(updateCommentReqBodySchema, {
      params: req.params,
      body: req.body,
    });
    await commentCommandService.updateComment(userId, params.commentId, body);
    return res.status(204).json();
  };

  const deleteComment = async (req: Request, res: Response) => {
    const userId = req.userId as string;
    const requesterRole = req.user?.role as string;
    const { params } = validate(deleteCommentReqParamsSchema, { params: req.params });
    await commentCommandService.deleteComment(userId, requesterRole, params.commentId);

    return res.status(204).json();
  };

  return { getAllComments, createComment, updateComment, deleteComment };
};

export type CommentHandlers = ReturnType<typeof createCommentHandlers>;
