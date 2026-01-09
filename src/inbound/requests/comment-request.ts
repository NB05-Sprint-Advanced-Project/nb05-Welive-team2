import { z } from 'zod';

// query
export const getAllCommentsReqParamsSchema = z.object({
  params: z.object({
    page: z.number(),
    limit: z.number(),
    searchKeyword: z.string().optional(),
    resourceId: z.string(),
    resourceType: z.enum(['NOTICE', 'COMPLAINT']),
  }),
});

// command
export const createCommentReqBodySchema = z.object({
  body: z.object({
    content: z.string().min(1, '내용을 입력해주세요.'),
    resourceId: z.string(),
    resourceType: z.enum(['NOTICE', 'COMPLAINT']),
  }),
});

export const updateCommentReqBodySchema = z.object({
  params: z.object({ commentId: z.string() }),

  body: z.object({
    content: z.string().min(1, '내용을 입력해주세요.'),
  }),
});

export const deleteCommentReqParamsSchema = z.object({
  params: z.object({ commentId: z.string() }),
});

export type GetAllCommentsDto = z.infer<typeof getAllCommentsReqParamsSchema>;

export type CreateCommentDto = z.infer<typeof createCommentReqBodySchema>;

export type UpdateCommentDto = z.infer<typeof updateCommentReqBodySchema>;

export type DeleteCommentDto = z.infer<typeof deleteCommentReqParamsSchema>;
