import { z } from 'zod';
import { eventSchema } from './event-request';

// get notice
export const getNoticeReqParamsSchema = z.object({
  noticeId: z.string(),
});

// get all notices
export const getAllNoticesReqParamsSchema = z.object({
  page: z.coerce.number().int().default(1),
  limit: z.coerce.number().int().default(10),
  searchKeyword: z.string().default(''),
  category: z
    .enum(['MAINTENANCE', 'URGENT', 'COMMUNITY', 'VOTING', 'BOARD_MEETING', 'ETC', 'ALL'])
    .default('ALL'),
});

// create notice
export const createNoticeReqBodySchema = z.object({
  title: z.string(),
  content: z.string(),
  category: z.enum(['MAINTENANCE', 'URGENT', 'COMMUNITY', 'VOTING', 'BOARD_MEETING', 'ETC']),
  isPinned: z.boolean(),
  apartmentId: z.string(),
  event: eventSchema.optional(),
});

export type CreateNoticeDto = z.infer<typeof createNoticeReqBodySchema>;

// update notice
export const updateNoticeReqParamsSchema = z.object({
  noticeId: z.string(),
});

export const updateNoticeReqBodySchema = z
  .object({
    title: z.string(),
    content: z.string(),
    category: z.enum(['MAINTENANCE', 'URGENT', 'COMMUNITY', 'VOTING', 'BOARD_MEETING', 'ETC']),
    isPinned: z.boolean(),
    event: eventSchema.optional(),
  })
  .partial();

export type UpdateNoticeDto = z.infer<typeof updateNoticeReqBodySchema> &
  z.infer<typeof updateNoticeReqParamsSchema>;

// delete notice
export const deleteNoticeReqParamsSchema = z.object({
  noticeId: z.string(),
});

export type DeleteNoticeDto = z.infer<typeof deleteNoticeReqParamsSchema>;
